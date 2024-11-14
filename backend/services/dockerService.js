const Docker = require('dockerode');
const docker = new Docker();
const { languages } = require('../config/dockerConfig');

const executeCodeInDocker = async (code, language) => {
    const config = languages[language];
    if (!config) throw new Error('Language not supported');

    const command = config.command(code);
    console.log('Executing code in Docker:', command);

    try {
        // Create a container with specific options to capture error output
        const container = await docker.createContainer({
            Image: config.image,
            Cmd: ['sh', '-c', command],
            Tty: false,
            AttachStdout: true,
            AttachStderr: true,
            // Add specific environment variables if needed
            Env: ['PYTHONUNBUFFERED=1'], // Example for Python
        });

        console.log('Container created:', container.id);

        // Start the container
        await container.start();
        console.log('Container started:', container.id);

        // Get container info to check for early failures
        const containerInfo = await container.inspect();
        
        // Wait for the container to finish execution
        const { StatusCode } = await container.wait();
        console.log('Container exited with status code:', StatusCode);

        // Get separate stdout and stderr streams
        const stdoutStream = await container.logs({
            stdout: true,
            stderr: false,
            follow: false,
        });

        const stderrStream = await container.logs({
            stdout: false,
            stderr: true,
            follow: false,
        });

        // Convert streams to strings and clean them
        const stdout = stdoutStream
            .toString('utf-8')
            .replace(/[^\x20-\x7E\n]/g, '')
            .trim();

        const stderr = stderrStream
            .toString('utf-8')
            .replace(/[^\x20-\x7E\n]/g, '')
            .trim();

        // Clean up the container
        await container.remove();

        if (StatusCode === 0) {
            // Successful execution, return only the output
            return {
                output: stdout || 'No output generated from the container',
            };
        } else {
            // Error in execution, return only the error
            const errorMessage = formatErrorMessage(language, stderr, stdout);
            return {
                error: errorMessage
            };
        }
        
    } catch (e) {
        console.error("Error running code in Docker:", e.message);
        return {
            success: false,
            output: null,
            error: `Docker execution error: ${e.message}`
        };
    }
};

// Helper function to format error messages based on language
const formatErrorMessage = (language, stderr, stdout) => {
    switch (language.toLowerCase()) {
        case 'python':
            // Extract Python traceback
            const pythonError = stderr.split('\n').filter(line => 
                line.includes('Error:') || line.includes('Exception:')
            ).join('\n');
            return pythonError || stderr;

        case 'javascript':
        case 'node':
            // Format Node.js errors
            const nodeError = stderr.match(/(?:Error:|^)[^\n]*/);
            return nodeError ? nodeError[0] : stderr;

        case 'java':
            // Extract Java compilation/runtime errors
            const javaError = stderr.split('\n').filter(line =>
                line.includes('error:') || line.includes('Exception')
            ).join('\n');
            return javaError || stderr;

        default:
            // Default error handling
            return stderr || 'Unknown error occurred';
    }
};

module.exports = { executeCodeInDocker };