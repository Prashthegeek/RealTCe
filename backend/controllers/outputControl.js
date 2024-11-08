
const { NodeVM } = require('vm2');

// Endpoint to execute code
exports.execute = async(req,res)=>{
    const { code } = req.body;

    // Set up the sandbox environment using vm2
    const vm = new NodeVM({
        timeout: 1000, // Execution timeout in milliseconds
        sandbox: {}, // Empty sandbox for isolation
    });

    try {
        // Run the code in the sandbox
        const result = vm.run(code);
        // console.log(String(result));  /has the actual output in string format
        res.json({ output: JSON.stringify(result) }); // when did this, then axios will no automatically convert the json string into object in the client side,it will leave it in json string format only, so, waha par parse karna 
    } catch (error) {
        // Handle errors from the code execution
        res.json({ output: `Error: ${error.message}` });
    }
}

