import { 
    Box, 
    useToast, 
    VStack, 
    HStack, 
    Button, 
    Select, 
    Icon, 
    Textarea  // Added Textarea for user input
  } from '@chakra-ui/react';
  import { useEffect, useState, useRef } from 'react';
  import { useNavigate, useParams } from 'react-router-dom';
  import { io } from 'socket.io-client';
  import MonacoEditor from '@monaco-editor/react'; // Import Monaco Editor
  import axios from 'axios';
  import { LogOut } from 'lucide-react';  // used in leave room icon
  
  let socket; // Declare socket variable outside the useEffect
  
  const languages = [
      { label: 'Python', value: 'python' },
      { label: 'JavaScript', value: 'javascript' },
      { label: 'C++', value: 'cpp' },
      { label: 'Java', value: 'java' },
  ];
  
  const Room = () => {
    console.log("hello world")
      const { roomId } = useParams();
      const toast = useToast();
      const user = JSON.parse(localStorage.getItem('user')); // Retrieve user info
      const token = localStorage.getItem('token'); // Retrieve token (no need for JSON.parse)
      const [code, setCode] = useState(''); // State for storing code
      const [users, setUsers] = useState([]); // State for tracking users in the room
      const [output, setOutput] = useState(''); // State for storing output
      const [language, setLanguage] = useState(languages[1].value);  // Default to JavaScript
      const [userInput, setUserInput] = useState('');  // New state for input data
      const hasWelcomed = useRef(false); // Ref to track if the welcome toast has been shown
  
      const navigate = useNavigate(); // Navigation hook
  
      // Welcome message effect
      useEffect(() => {
          if (user && !hasWelcomed.current) {
              toast({
                  title: `Welcome, ${user.name}!`,
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
              });
              hasWelcomed.current = true;
          }
      }, [user, toast]);
  
      // Room join and code handling effect (runs once on mount)
      useEffect(() => {
          socket = io('http://localhost:5000'); 
          socket.emit('joinRoom', { roomId, user });
  
          // Code updates (on first connect and subsequent changes)
          socket.on('prevCode', (xyz) => setCode(xyz));  
          socket.on('codeUpdate', (xyz) => setCode(xyz));  
  
          // Language updates (on first connect and subsequent changes)
          socket.on('prevLang', (xyz) => {
              setLanguage(xyz || languages[1].value);
          });
          socket.on('langUpdate', (xyz) => setLanguage(xyz));
  
          // Output updates (initial and on changes)
          socket.on('prevOutput', (xyz) => setOutput(xyz));
          socket.on('outputUpdate', (xyz) => setOutput(xyz));
  
          // Update connected users list
          socket.on('userListUpdate', (userList) => setUsers(userList));
  
          socket.on('userLeft', (message) => {
              toast({
                  title: `${message}`,
                  bgColor: 'purple.500',
                  color: 'white',
                  duration: 3000,
                  isClosable: true
              });
          });
  
          return () => {
              // Clean up listeners on unmount
              socket.off('prevCode');
              socket.off('codeUpdate');
              socket.off('prevLang');
              socket.off('langUpdate');
              socket.off('prevOutput');
              socket.off('outputUpdate');
              socket.off('userListUpdate');
              socket.off('userLeft');
              socket.disconnect();
          };
      }, []);
  
      // Handle code changes in the editor
      const handleCodeChange = (value) => {
          setCode(() => {
              const updatedCode = value;
              socket.emit('codeUpdate', { roomId, code: updatedCode });
              return updatedCode;
          });
      };
  
      // Handle language change
      const handleLangChange = (e) => {      
          const value = e.target.value;
          setLanguage(value);
          socket.emit('langUpdate', { roomId, language: value });
      };
  
      // Function to execute code (sends code, language, and user input)
      const handleExecuteCode = async () => {
          try {
              console.log("Language selected:", language);
              console.log("Languages array:", languages);
  
              const response = await axios.post('http://localhost:5000/api/execute', { 
                  code, 
                  language, 
                  user,
                  input: userInput  // Pass the user-defined input
              });
  
              const answer = response.data.output;  
              setOutput(answer);
  
              // Emit output update to server
              socket.emit('outputUpdate', { roomId, output: answer });
          } catch (error) {
              const errorMessage = error.message || 'Code execution failed';
              console.error('Error executing code:', errorMessage);
              setOutput(errorMessage);
              socket.emit('outputUpdate', { roomId, output: errorMessage });
          }
      };
  
      // Leave room function
      const handleLeaveRoom = () => {
          try {
              socket.emit('leaveRoom', { roomId, user });
              toast({
                  title: "Room Left",
                  description: `You have left the room ${roomId}`,
                  status: "info",
                  duration: 3000,
                  isClosable: true
              });
              navigate('/main');
          } catch (error) {
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
                          theme='vs'
                          options={{
                              automaticLayout: true,
                              fontSize: 21,
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              lineHeight: 24
                          }}
                      />
                  </Box>
  
                  {/* Input Box */}
                  <Box
                      bg="white"
                      p={4}
                      borderRadius="lg"
                      shadow="sm"
                  >
                      <Box mb={2} fontWeight="bold" color="gray.700">Input</Box>
                      <Textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Enter input here..."
                          size="sm"
                          fontFamily="mono"
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
                      position="relative"
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
  
                      {/* Leave Room Button */}
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
  