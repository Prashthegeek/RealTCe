import { 
    Box, 
    useToast, 
    VStack, 
    HStack, 
    Button, 
    Select, 
    Icon, 
    Textarea,
    Flex,
    Heading
  } from '@chakra-ui/react';
  import { useEffect, useState, useRef } from 'react';
  import { useNavigate, useParams } from 'react-router-dom';
  import { io } from 'socket.io-client';
  import MonacoEditor from '@monaco-editor/react';
  import axios from 'axios';
  import { LogOut } from 'lucide-react';
  
  let socket;
  
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
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const [code, setCode] = useState('');
      const [users, setUsers] = useState([]);
      const [output, setOutput] = useState('');
      const [language, setLanguage] = useState(languages[1].value);
      const [userInput, setUserInput] = useState('');
      const hasWelcomed = useRef(false);
  
      const navigate = useNavigate();
  
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
  
      useEffect(() => {
          socket = io('http://localhost:5000'); 
          socket.emit('joinRoom', { roomId, user });
  
          socket.on('prevCode', (xyz) => setCode(xyz));  
          socket.on('codeUpdate', (xyz) => setCode(xyz));  
  
          socket.on('prevLang', (xyz) => {
              setLanguage(xyz || languages[1].value);
          });
          socket.on('langUpdate', (xyz) => setLanguage(xyz));
  
          socket.on('prevOutput', (xyz) => setOutput(xyz));
          socket.on('outputUpdate', (xyz) => setOutput(xyz));
  
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
  
      const handleCodeChange = (value) => {
          setCode(() => {
              const updatedCode = value;
              socket.emit('codeUpdate', { roomId, code: updatedCode });
              return updatedCode;
          });
      };
  
      const handleLangChange = (e) => {      
          const value = e.target.value;
          setLanguage(value);
          socket.emit('langUpdate', { roomId, language: value });
      };
  
      const handleExecuteCode = async () => {
          try {
              console.log("Language selected:", language);
              console.log("Languages array:", languages);
  
              const response = await axios.post('http://localhost:5000/api/execute', { 
                  code, 
                  language, 
                  user,
                  input: userInput
              });
  
              const answer = response.data.output;  
              setOutput(answer);
  
              socket.emit('outputUpdate', { roomId, output: answer });
          } catch (error) {
              const errorMessage = error.message || 'Code execution failed';
              console.error('Error executing code:', errorMessage);
              setOutput(errorMessage);
              socket.emit('outputUpdate', { roomId, output: errorMessage });
          }
      };
  
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
          <Flex direction={{ base: "column", lg: "row" }} height="100vh" bg="gray.50">
              {/* Left Sidebar */}
              <VStack 
                  width={{ base: "100%", lg: "250px" }} 
                  bg="white" 
                  p={6} 
                  spacing={6}
                  borderRight="1px" 
                  borderColor="gray.200"
                  shadow="sm"
                  h={{ base: "auto", lg: "100vh" }}
                  flexShrink={0}
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
                  
                  {/* Leave Room Button - moved to sidebar */}
                  <Button 
                      colorScheme="red" 
                      variant="outline"
                      leftIcon={<Icon as={LogOut} />}
                      onClick={handleLeaveRoom}
                      mt="auto"
                      width="full"
                  >
                      Leave Room
                  </Button>
              </VStack>
  
              {/* Main content (editor) */}
              <Flex 
                  flex="1"
                  direction="column"
                  p={4}
                  h="100vh"
                  overflow="hidden"
              >
                  <HStack spacing={4} mb={4}>
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
  
                  {/* Main flex container for editor and IO panels */}
                  <Flex 
                      flex="1"
                      direction={{ base: "column", xl: "row" }}
                      gap={4}
                      overflow="hidden"
                  >
                      {/* Editor container */}
                      <Box 
                          flex="1" 
                          bg="white" 
                          borderRadius="lg" 
                          shadow="sm"
                          overflow="hidden"
                          minH={{ base: "50vh", xl: "auto" }}
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
  
                      {/* Right panel for input/output */}
                      <VStack 
                          width={{ base: "100%", xl: "350px" }}
                          spacing={4}
                          align="stretch"
                          flexShrink={0}
                      >
                          {/* Input Box */}
                          <Box
                              bg="white"
                              p={4}
                              borderRadius="lg"
                              shadow="sm"
                              height={{ base: "150px", xl: "45%" }}
                              display="flex"
                              flexDirection="column"
                          >
                              <Heading size="sm" mb={2} color="gray.700">Input</Heading>
                              <Textarea
                                  value={userInput}
                                  onChange={(e) => setUserInput(e.target.value)}
                                  placeholder="Enter input here..."
                                  size="sm"
                                  fontFamily="mono"
                                  flex="1"
                                  resize="none"
                              />
                          </Box>
  
                          {/* Output Box */}
                          <Box
                              bg="white"
                              p={4}
                              borderRadius="lg"
                              shadow="sm"
                              height={{ base: "250px", xl: "55%" }}
                              overflowY="auto"
                              display="flex"
                              flexDirection="column"
                          >
                              <Heading size="sm" mb={2} color="gray.700">Output</Heading>
                              <Box
                                  as="pre"
                                  p={3}
                                  bg="gray.50"
                                  borderRadius="md"
                                  fontSize="sm"
                                  fontFamily="mono"
                                  whiteSpace="pre-wrap"
                                  wordBreak="break-word"
                                  flex="1"
                                  overflow="auto"
                              >
                                  {typeof output === 'object' ? JSON.stringify(output, null, 2) : output}
                              </Box>
                          </Box>
                      </VStack>
                  </Flex>
              </Flex>
          </Flex>
      );
  };
  
  export default Room;