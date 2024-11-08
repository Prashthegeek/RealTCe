
        const timeout = setTimeout(() => {
            console.error('Execution timed out after 5 seconds');
            process.exit(1);
        }, 5000);
        try {
            console.log("hello world");;
        } catch (error) {
            console.error(error);
        } finally {
            clearTimeout(timeout);
        }
    