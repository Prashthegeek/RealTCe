module.exports = {
    languages: {
        python: { image: 'python:3.9', command: (code) => `python -c "${code.replace(/"/g, '\\"')}"` },
        javascript: { image: 'node:14', command: (code) => `node -e "${code.replace(/"/g, '\\"')}"` },
        cpp: { image: 'gcc:latest', command: (code) => `bash -c "echo '${code}' | g++ -x c++ -o /tmp/a.out - && /tmp/a.out"` },
        java: { image: 'openjdk:11', command: (code) => `bash -c "echo '${code}' > /tmp/Main.java && javac /tmp/Main.java && java -cp /tmp Main"` },
    },
};
