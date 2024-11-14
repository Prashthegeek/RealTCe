const { executeCodeInDocker } = require('../services/dockerService');

const executeCode = async (req, res) => {
    const { code, language } = req.body;
    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' });
    }

    try {
        const result = await executeCodeInDocker(code, language);
    
        if (result.error) {
            // Send only the error as a response
            res.status(400).json({ error: result.error });
        } else {
            // Send only the output as a response
            res.status(200).json({ output: result.output });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
    
};

module.exports = { executeCode };
