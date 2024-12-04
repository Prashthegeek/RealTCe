// import { Box, useToast, VStack, HStack, Button,  Select } from '@chakra-ui/react';
// import { useEffect, useState, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import MonacoEditor from '@monaco-editor/react'; // Import Monaco Editor
// import axios from 'axios';

// const socket = io('http://localhost:5000');


// const languages = [  //array of objects
//     { label: 'Python', value: 'python' },
//     { label: 'JavaScript', value: 'javascript' },
//     { label: 'C++', value: 'cpp' },
//     { label: 'Java', value: 'java' },
// ];

// const Room = () => {
//     const { roomId } = useParams();
//     const toast = useToast();
//     const user = JSON.parse(localStorage.getItem('user')); // Retrieve user info
//     const [code, setCode] = useState(''); // State for storing code
//     const [users, setUsers] = useState([]); // State for tracking users in the room
//     const [output, setOutput] = useState(''); // State for storing output
//     const [language, setLanguage] = useState(languages[1].value)  //by default with js
//     const hasWelcomed = useRef(false); // Ref to track if the welcome toast has been shown
    

//     // Welcome message effect
//     useEffect(() => {
//         if (user && !hasWelcomed.current) {
//             toast({
//                 title: `Welcome, ${user.name}!`,
//                 status: 'info',
//                 duration: 3000,
//                 isClosable: true,
//             });
//             hasWelcomed.current = true; // Set the ref to true after showing the toast
//         }
//     }, [user, toast]); // Added toast to the dependency array

//     // Room join and code handling effect (triggered only once on mount)
//     useEffect(() => {
//         socket.emit('joinRoom', { roomId, user });

//         const handleCodeUpdate = (currentCode) => {
//             setCode(currentCode);
//         };

//         const handleUserListUpdate = (userList) => {
//             setUsers(userList);
//         };

//         socket.on('codeUpdate', handleCodeUpdate);
//         socket.on('userListUpdate', handleUserListUpdate);

//         return () => {
//             // Clean up the listeners
//             socket.off('codeUpdate', handleCodeUpdate);
//             socket.off('userListUpdate', handleUserListUpdate);
//         };
//     }, []); // Empty dependency array to ensure this effect runs only once on mount

//     // Handle code input change
//     const handleCodeChange = (value) => {
//         setCode(value);
//         socket.emit('codeUpdate', { roomId, code: value });
//     };

//     //func to handle execute

// // Function to execute code
// const handleExecuteCode = async () => {
//     try {
//         const response = await axios.post('http://localhost:5000/api/execute', { code, language });

//         // Check if response contains output or error and update accordingly
//         const output = response.data.output || response.data.error || 'No output generated';

//         // Update the output in the UI
//         setOutput(output);
//     } catch (error) {
//         // Handle any network or server errors
//         const errorMessage = error.response?.data?.error || 'Code execution failed';
        
//         console.error('Error executing code:', errorMessage);
        
//         // Update the output with the error message
//         setOutput(errorMessage);
//     }





// };

//     return (
//         <Box display="flex" height="100vh" padding={4}>
//             <VStack width="20%" bg="gray.100" p={4} spacing={4}>
//                 <Box>
//                     <strong>Room ID:</strong> {roomId}
//                     <Button onClick={() => navigator.clipboard.writeText(roomId)}>Copy Room ID</Button>
//                 </Box>

//                 {/* Display list of users */}
//                 <Box>
//                     <strong>Users in Room:</strong>
//                     <ul>
//                         {users.map((userName, index) => (
//                             <li key={index}>{userName}</li>
//                         ))}
//                     </ul>
//                 </Box>
//             </VStack>

//             {/*for language selection */}

//             <Select
//                 placeholder="Select Language"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//                 mb={4}
//             >
//                 {languages.map((lang) => (
//                     <option key={lang.value} value={lang.value}>
//                         {lang.label}
//                     </option>
//                 ))}
//             </Select>


//             <VStack flex="1" bg="white" p={4} spacing={4}>
//                 <HStack justifyContent="space-between" width="full">
//                     <h2>Code Collaboration Area</h2>
//                     <Button onClick={handleExecuteCode} colorScheme="teal">Execute Code</Button>
//                 </HStack>

//                 <Box height="80%" width="100%" borderRadius="md">
//                     <MonacoEditor
//                         height="100%"
//                         language="javascript" // Change to the desired language
//                         value={code}
//                         onChange={handleCodeChange}
//                         options={{
//                             automaticLayout: true,
//                         }}
//                     />
//                 </Box>

//                 <Box width="100%" bg="gray.100" p={4} borderRadius="md">
//                     <strong>Output</strong>
//                     <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
//                         {typeof output === 'object' ? JSON.stringify(output, null, 2) : output}
//                     </pre>
//                 </Box>
//             </VStack>
//         </Box>
//     );
// };


// export default Room;

import { Box, useToast, VStack, HStack, Button, Select } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react'; // Import Monaco Editor
import axios from 'axios';


const socket = io('http://localhost:5000'); //io('https://rtct.onrender.com') //request for connection to server is sent for the first time from this line, this is the initiator of communication



const languages = [  //array of objects
    { label: 'Python', value: 'python' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'C++', value: 'cpp' },
    { label: 'Java', value: 'java' },
];

const Room = () => {
    const { roomId } = useParams();
    const toast = useToast();
    const user = JSON.parse(localStorage.getItem('user')); // Retrieve user info
    const [code, setCode] = useState(''); // State for storing code
    const [users, setUsers] = useState([]); // State for tracking users in the room
    const [output, setOutput] = useState(''); // State for storing output
    const [language, setLanguage] = useState(languages[1].value)  //by default with js
    const hasWelcomed = useRef(false); // Ref to track if the welcome toast has been shown
    

    
    // Welcome message effect
    useEffect(() => {
        if (user && !hasWelcomed.current) {
            toast({
                title: `Welcome, ${user.name}!`,
                status: 'info',
                duration: 3000,
                isClosable: true,
            });
            hasWelcomed.current = true; // Set the ref to true after showing the toast, so phir se re-render nhi hoga
        }
    }, [user, toast]); // Added toast to the dependency array

    // Room join and code handling effect (triggered only once on mount)
    useEffect(() => {


        socket.emit('joinRoom', { roomId, user });

        // const handleCodeUpdate = (currentCode) => {
        //     setCode(currentCode);
        // };

        // const handleUserListUpdate = (userList) => {
        //     setUsers(userList);
        // };
        
        //code part updation(first time user connect + when code updated)
        socket.on('prevCode', (xyz) => setCode(xyz));  
        socket.on('codeUpdate', (xyz) => setCode(xyz));  

        //langugage part updation(first time user connect + when language updated)
        socket.on('prevLang' , (xyz)  => setLanguage(xyz)) ;
        socket.on('langUpdate' , (xyz) => setLanguage(xyz));

        //output part (1.first time user joined    2. when output changed)
        socket.on('prevOutput' , (xyz)=> setOutput(xyz));
        socket.on('outputUpdate' , (xyz) =>setOutput(xyz));


        socket.on('userListUpdate', (userList) => setUsers(userList));

        

        return () => {
            // Clean up the listeners
            socket.off('prevCode');
            socket.off('codeUpdate');
            

            socket.off('prevLang');
            socket.off('langUpdate');


            socket.off('prevOutput');
            socket.off('outputUpdate');

            socket.off('userListUpdate');

            socket.disconnect() ;  //to stop sending further requests to the server if component unmounts
        };
    }, []); // Empty dependency array to ensure this effect runs only once on mount

    // Handle code input change
    const handleCodeChange = (value) => {
        setCode(value);
        socket.emit('codeUpdate', { roomId, code: value });
    };

    //handle language change
    const handleLangChange = (e) =>{
        const newLanguage = e.target.value; // Get the selected language
        setLanguage(newLanguage); // Update state
        socket.emit('langUpdate', { roomId, language: newLanguage }); // Emit the updated language
    }

// Function to execute code
const handleExecuteCode = async () => {
    try {
        const response = await axios.post('https://rtct.onrender.com/api/execute', { code, language });

        // Check if response contains output or error and update accordingly
        const output = response.data.output || response.data.error || 'No output generated';

        // Update the output in the UI
        setOutput(output);

        //send the output to the server(server me iss room ke liye output store)
        socket.emit('outputUpdate' , {roomId, output}) ;
    } catch (error) {
        // Handle any network or server errors
        const errorMessage = error.response?.data?.error || 'Code execution failed';
        
        console.error('Error executing code:', errorMessage);
        
        // Update the output with the error message
        setOutput(errorMessage);

        //send the erroMessage to the server(server me iss room ke liye output store)
        socket.emit('outputUpdate' , {roomId, errorMessage}) ;
    }
};

    return (
        <Box display="flex" height="100vh" bg="gray.50">
            {/* Sidebar */}
            <VStack 
                width="250px" 
                bg="white" 
                p={6} 
                spacing={6}
                borderRight="1px" 
                borderColor="gray.200"
                shadow="sm"
            >
                <Box width="full">
                    <Box mb={2} fontWeight="bold" color="gray.700">Room ID</Box>
                    <HStack spacing={2}>
                        <Box 
                            p={2} 
                            bg="gray.100" 
                            borderRadius="md" 
                            fontSize="sm"
                            flex="1"
                        >
                            {roomId}
                        </Box>
                        <Button 
                            size="sm" 
                            colorScheme="blue"
                            onClick={() => navigator.clipboard.writeText(roomId)}
                        >
                            Copy
                        </Button>
                    </HStack>
                </Box>

                <Box width="full">
                    <Box mb={2} fontWeight="bold" color="gray.700">Connected Users</Box>
                    <VStack 
                        align="stretch" 
                        spacing={2}
                        maxH="200px"
                        overflowY="auto"
                        width="full"
                    >
                        {users.map((userName, index) => (
                            <Box 
                                key={index}
                                p={2}
                                bg="gray.50"
                                borderRadius="md"
                                fontSize="sm"
                            >
                                {userName}
                            </Box>
                        ))}
                    </VStack>
                </Box>
            </VStack>

            {/* Main Content */}
            <VStack flex="1" p={6} spacing={6} align="stretch">
                <HStack spacing={4}>
                    <Select
                        value={language}
                        onChange={handleLangChange}
                        width="200px"
                        bg="white"
                        shadow="sm"
                    >
                        {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </Select>
                    <Button 
                        onClick={handleExecuteCode} 
                        colorScheme="green"
                        shadow="sm"
                        px={8}
                    >
                        Run Code
                    </Button>
                </HStack>

                {/* Editor */}
                <Box 
                    flex="1" 
                    bg="white" 
                    borderRadius="lg" 
                    shadow="sm"
                    overflow="hidden"
                >
                    <MonacoEditor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={handleCodeChange}
                        theme='vs' // Set the dark theme
                   
                        options={{
                            automaticLayout: true,
                            fontSize: 21,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            lineHeight: 24 // Adjusted line height for readability
                        }}

                    />
                </Box>

                {/* Output */}
                <Box
                    bg="white"
                    p={4}
                    borderRadius="lg"
                    shadow="sm"
                    height="200px"
                    overflowY="auto"
                >
                    <Box mb={2} fontWeight="bold" color="gray.700">Output</Box>
                    <Box
                        as="pre"
                        p={3}
                        bg="gray.50"
                        borderRadius="md"
                        fontSize="sm"
                        fontFamily="mono"
                        whiteSpace="pre-wrap"
                        wordBreak="break-word"
                    >
                        {typeof output === 'object' ? JSON.stringify(output, null, 2) : output}
                    </Box>
                </Box>
            </VStack>
        </Box>
    );
};

export default Room;