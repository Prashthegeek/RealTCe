module.exports = {
    languages: {
        python: { 
            image: 'python:3.9-slim', 
            command: (code) => `python -c "${code.replace(/"/g, '\\"')}"` 
        },
        javascript: { 
            image: 'node:14-slim', 
            command: (code) => `node -e "${code.replace(/"/g, '\\"')}"` 
        },
        cpp: {
            image: 'gcc:latest',
            command: (code) => {
                // Escape special characters properly
                const escapedCode = code
                    .replace(/\\/g, '\\\\')
                    .replace(/'/g, "'\\''")
                    .replace(/"/g, '\\"');
                
                return `bash -c 'echo "${escapedCode}" > /tmp/code.cpp && g++ /tmp/code.cpp -o /tmp/a.out && /tmp/a.out'`;
            }
        },
        java: { 
            image: 'openjdk:11-slim', 
            command: (code) => `bash -c "echo '${code.replace(/'/g, "'\\''")
                .replace(/"/g, '\\"')}' > /tmp/Main.java && javac /tmp/Main.java && java -cp /tmp Main"` 
        },
    },
};