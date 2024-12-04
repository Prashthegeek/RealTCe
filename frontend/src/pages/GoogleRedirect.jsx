import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Spinner, Text, VStack, Heading, Center, Container } from '@chakra-ui/react';

const GoogleRedirection = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Extract the query parameters from the URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const id = params.get('id');
    const name = params.get('name');
    const email = params.get('email');

    if (token && id && name && email) {
      // Store the token in localStorage
      localStorage.setItem('token', token);

      // Create a user object and store it in localStorage
      const user = { id, name, email };
      localStorage.setItem('user', JSON.stringify(user));

      // Set state to show loading message before redirect
      setIsRedirecting(true);

      // Navigate to /main page after a slight delay
      setTimeout(() => {
        navigate('/main');
      }, 1500); // 1.5 second delay (adjust as needed)
    } else {
      console.error('Missing required parameters');
    }
  }, [navigate]);

  return (
    <Container maxW="lg" centerContent>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        p={5}
        bg="gray.50"
        borderRadius="md"
        boxShadow="lg"
      >
        <VStack spacing={5}>
          <Heading as="h1" size="xl" color="teal.500">
            Google Authentication
          </Heading>
          <Text fontSize="lg" color="gray.600">
            You're being redirected...
          </Text>
          {isRedirecting ? (
            <Spinner size="xl" color="teal.500" />
          ) : (
            <Text fontSize="sm" color="gray.500">
              Please wait while we process your login information.
            </Text>
          )}
        </VStack>
      </Box>
    </Container>
  );
};

export default GoogleRedirection;
