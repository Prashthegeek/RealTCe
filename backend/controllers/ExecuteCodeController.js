const { executeCodeInDocker } = require('../services/dockerService');

const executeCode = async (req, res) => {
    
    const { code, language } = req.body;
    if (!code || !language) {
        console.log("language and code is not correct")
        return res.status(400).json({ error: 'Code and language are required' });
    }

    try {
        const result = await executeCodeInDocker(code, language);
    
        if (result.error) {   
            res.status(200).json({ output: result.error });
        } else {  //when got result.output
            // Send only the output as a response
            res.status(200).json({ output: result.output });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
    
};

module.exports = { executeCode };
