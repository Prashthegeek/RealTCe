const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const { languages } = require('../config/dockerConfig');

const executeCodeInDocker = async (code, language) => {
    console.log("Inside docker part");
    
    const config = languages[language];
    if (!config) throw new Error('Language not supported');

    const command = config.command(code);
    console.log('Executing code in Docker:', command);

    try {
        const container = await docker.createContainer({
            Image: config.image,
            Cmd: ['sh', '-c', command],
            Tty: false,
            AttachStdout: true,
            AttachStderr: true,
            HostConfig: {
                Memory: 100 * 1024 * 1024,  // 100MB memory limit
                MemorySwap: 100 * 1024 * 1024,  // Disable swap
                CpuPeriod: 100000,
                CpuQuota: 50000,  // Limit to 50% CPU
                NetworkMode: 'none',  // Disable network access
                AutoRemove: true,  // Automatically remove container after execution
                PidsLimit: 50,  // Limit number of processes
                SecurityOpt: ['no-new-privileges']  // Prevent privilege escalation
            }
        });

        await container.start();
        console.log('Container started:', container.id);

        const { StatusCode } = await container.wait();
        console.log('Container exited with status code:', StatusCode);

        const [stdout, stderr] = await Promise.all([
            container.logs({ stdout: true, stderr: false }),
            container.logs({ stdout: false, stderr: true })
        ]);

        const output = stdout.toString().replace(/[^\x20-\x7E\n]/g, '').trim();
        const error = stderr.toString().replace(/[^\x20-\x7E\n]/g, '').trim();

        try {
            await container.remove();
        } catch (removeError) {
            console.error('Error removing container:', removeError);
        }

        return StatusCode === 0 
            ? { output: output || 'No output generated' }
            : { error: error || 'Execution failed' };

    } catch (e) {
        console.error("Error running code in Docker:", e);
        return {
            success: false,
            error: `Docker execution error: ${e.message}`
        };
    }
};

module.exports = { executeCodeInDocker };
