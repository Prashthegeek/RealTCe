
        const timeout = setTimeout(() => {
            console.error('Execution timed out after 5 seconds');
            process.exit(1);
        }, 5000);
        try {
            fmnafjak
        } catch (error) {
            console.error(error);
        } finally {
            clearTimeout(timeout);
        }
    