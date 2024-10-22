import { Box, useToast, VStack, HStack, Button } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react'; // Import Monaco Editor

const socket = io('http://localhost:5000');

const Room = () => {
    const { roomId } = useParams();
    const toast = useToast();
    const user = JSON.parse(localStorage.getItem('user')); // Retrieve user info
    const [code, setCode] = useState(''); // State for storing code
    const [users, setUsers] = useState([]); // State for tracking users in the room
    const [output, setOutput] = useState(''); // State for storing output
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
            hasWelcomed.current = true; // Set the ref to true after showing the toast
        }
    }, [user, toast]); // Added toast to the dependency array

    // Room join and code handling effect (triggered only once on mount)
    useEffect(() => {
        socket.emit('joinRoom', { roomId, user });

        const handleCodeUpdate = (currentCode) => {
            setCode(currentCode);
        };

        const handleUserListUpdate = (userList) => {
            setUsers(userList);
        };

        socket.on('codeUpdate', handleCodeUpdate);
        socket.on('userListUpdate', handleUserListUpdate);

        return () => {
            // Clean up the listeners
            socket.off('codeUpdate', handleCodeUpdate);
            socket.off('userListUpdate', handleUserListUpdate);
        };
    }, []); // Empty dependency array to ensure this effect runs only once on mount

    // Handle code input change
    const handleCodeChange = (value) => {
        setCode(value);
        socket.emit('codeUpdate', { roomId, code: value });
    };

    // Function to execute code
    const handleExecuteCode = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const result = await response.json();
            setOutput(result.output); // Update the output state with the result
        } catch (error) {
            console.error('Error executing code:', error);
        }
    };

    return (
        <Box display="flex" height="100vh" padding={4}>
            <VStack width="20%" bg="gray.100" p={4} spacing={4}>
                <Box>
                    <strong>Room ID:</strong> {roomId}
                    <Button onClick={() => navigator.clipboard.writeText(roomId)}>Copy Room ID</Button>
                </Box>

                {/* Display list of users */}
                <Box>
                    <strong>Users in Room:</strong>
                    <ul>
                        {users.map((userName, index) => (
                            <li key={index}>{userName}</li>
                        ))}
                    </ul>
                </Box>
            </VStack>

            <VStack flex="1" bg="white" p={4} spacing={4}>
                <HStack justifyContent="space-between" width="full">
                    <h2>Code Collaboration Area</h2>
                    <Button onClick={handleExecuteCode} colorScheme="teal">Execute Code</Button>
                </HStack>

                <Box height="80%" width="100%" borderRadius="md">
                    <MonacoEditor
                        height="100%"
                        language="javascript" // Change to the desired language
                        value={code}
                        onChange={handleCodeChange}
                        options={{
                            automaticLayout: true,
                        }}
                    />
                </Box>

                <Box width="100%" bg="gray.100" p={4} borderRadius="md">
                    <strong>Output:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{output}</pre>
                </Box>
            </VStack>
        </Box>
    );
};

export default Room;
