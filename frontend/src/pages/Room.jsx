import { Box, useToast, VStack, HStack, Button, Select,Icon } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react'; // Import Monaco Editor
import axios from 'axios';
import { LogOut } from 'lucide-react';  //used in leave room icon



let socket; // Declare socket variable outside the useEffect


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
    const token = localStorage.getItem('token'); // Retrieve token (no need for JSON.parse)
    const [code, setCode] = useState(''); // State for storing code
    const [users, setUsers] = useState([]); // State for tracking users in the room
    const [output, setOutput] = useState(''); // State for storing output
    const [language, setLanguage] = useState(languages[1].value)  //by default with js
    const hasWelcomed = useRef(false); // Ref to track if the welcome toast has been shown
    
    const navigate = useNavigate(); // Add navigation hook
    
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

        socket = io('http://13.61.241.125:5000'); 

        socket.emit('joinRoom', { roomId, user });

        //code part updation(first time user connect + when code updated)
        socket.on('prevCode', (xyz) => setCode(xyz));  
        socket.on('codeUpdate', (xyz) => setCode(xyz));  

        //langugage part updation(first time user connect + when language updated)
        socket.on('prevLang', (xyz) => {
            // Ensure the language is valid or set it to 'javascript' if not
            setLanguage(xyz || languages[1].value); // Default to 'javascript' if no lang is received from server
        });
    
        socket.on('langUpdate' , (xyz) => setLanguage(xyz)) ;

        //output part (1.first time user joined    2. when output changed)
        socket.on('prevOutput' , (xyz)=> setOutput(xyz));
        socket.on('outputUpdate' , (xyz) =>setOutput(xyz));


        socket.on('userListUpdate', (userList) => setUsers(userList));

        socket.on('userLeft', (message) => {
            toast({
                title: `${message}`,
                bgColor: 'purple.500', // Use Chakra's color tokens
                color: 'white', // Ensure text is readable
                duration: 3000,
                isClosable: true
            });
        })

        return () => {
            // Clean up the listeners
            socket.off('prevCode');
            socket.off('codeUpdate');
            

            socket.off('prevLang');
            socket.off('langUpdate');


            socket.off('prevOutput');
            socket.off('outputUpdate');

            socket.off('userListUpdate');

            socket.off('userLeft');

            socket.disconnect() ;  //to stop sending further requests (emit parts ) to the server if component unmounts
        };
    }, []); // Empty dependency array to ensure this effect runs only once on mount

    // Handle code input change
    const handleCodeChange = (value) => {
        setCode((prevCode) => {
            const updatedCode = value;
            socket.emit('codeUpdate', { roomId, code: updatedCode });
            return updatedCode;
        });
    };
    

    //handle language change
    const handleLangChange = (e) => {      
        const value = e.target.value; // Correct way to get value from Select
        setLanguage(value); // Update state
        socket.emit('langUpdate', { roomId, language: value }); // Emit the updated language
    }
// Function to execute code
const handleExecuteCode = async () => {
    try {
        console.log("language selected is ", language);
        console.log("Languages array:", languages);

        const response = await axios.post('http://13.61.241.125:5000/api/execute', { code, language ,user}) //user to check authorization

        // console.log("the output is",response)    //response is an object has data object inside which contians output field

        const answer = response.data.output;  //this output stores both the output(code code written) and error(incorrect code written) 
        setOutput(answer);

        //send the output to the server(server me iss room ke liye output store)
        socket.emit('outputUpdate' , {roomId, output:answer}) ;  
    } catch (error) {

        // Handle any network or server errors
        const errorMessage = error.message || 'Code execution failed';
        
        console.error('Error executing code:', errorMessage);
        
        // Update the output with the error message
        setOutput(errorMessage);

        //send the erroMessage to the server(server me iss room ke liye output store)
        socket.emit('outputUpdate' , {roomId, errorMessage}) ;
    }
};

//leave the room
const handleLeaveRoom = () => {
    try {
        // Emit leave room event to server
        socket.emit('leaveRoom', { roomId, user });

        // Show a toast notification
        toast({
            title: "Room Left",
            description: `You have left the room ${roomId}`,
            status: "info",
            duration: 3000,
            isClosable: true
        });

        // Navigate back to the main page
        navigate('/main');
    } catch (error) {
        // Handle any potential errors
        toast({
            title: "Error",
            description: "Failed to leave the room",
            status: "error",
            duration: 3000,
            isClosable: true
        });
        console.error('Error leaving room:', error);
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


                    {/* Leave Room Button - Bottom Left */}
                    <Box 
                        position="absolute" 
                        bottom={4} 
                        left={4}
                        zIndex={10}
                    >
                        <Button 
                            colorScheme="red" 
                            variant="outline"
                            leftIcon={<Icon as={LogOut} />}
                            onClick={handleLeaveRoom}
                        >
                            Leave Room
                        </Button>
                    </Box>
                </Box>
            </VStack>
        </Box>
    );
};

export default Room;
