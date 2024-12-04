import { Box, Button, Input, VStack, Heading, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigation hook

const MainPage = () => {
  const [roomId, setRoomId] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState('');
  const toast = useToast();
  const navigate = useNavigate(); // Initialize navigate

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCreatedRoomId(newRoomId);

    toast({
      title: 'Room Created!',
      description: `Room ID: ${newRoomId} has been created and copied to your clipboard.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    navigator.clipboard.writeText(newRoomId);

    // Navigate to the room page with the newly created room ID
    navigate(`/room/${newRoomId}`);  //dynamic route , since, value part after / ,so need to handle it using Route path="/room/:roomId in routes part in app.jsx
  };

  const handleEnterRoom = () => {
    if (!roomId) {
      toast({
        title: 'Room ID Required',
        description: 'Please enter a room ID to join.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Navigate to the room page with the entered room ID
    navigate(`/room/${roomId}`);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgGradient="linear(to-r, blue.400, purple.400)">
      <VStack spacing={6} p={8} bg="white" boxShadow="lg" borderRadius="md">
        <Heading size="lg" mb={4}>Welcome to Code Collaboration</Heading>

        <Input
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          size="md"
        />
        <Button colorScheme="blue" onClick={handleEnterRoom}>
          Enter Room
        </Button>

        <Button colorScheme="green" onClick={handleCreateRoom}>
          Create a Room
        </Button>

        {createdRoomId && (
          <Box>
            <Heading size="md" mt={4}>Room ID: {createdRoomId}</Heading>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default MainPage;
