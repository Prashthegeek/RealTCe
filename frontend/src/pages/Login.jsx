import { useState } from 'react';
import {
  Box, Input, Button, InputGroup, InputRightElement, useToast, Heading, VStack, FormControl, FormLabel, Text, Link,
  Image,
  Flex
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import googleIcon from "../assets/google-icon.png"; //image of Google iconis  is in  the  assets folder 


const Login = () => {
  const baseURL = import.meta.env.VITE_Base_url  || "http://51.20.117.228:5000" ; // Use .env in frontend (Vite)
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate(); // Initialize useNavigate

  
  //for signup with google(oAuth)
  const handleGoogleSignIn = () => {
    // Redirect to the backend's Google OAuth endpoint
    window.location.href = "http://51.20.117.228:5000/api/auth/google";
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    // Check if fields are empty and show toast warnings
    if (!email || !password) {
      toast({
        title: 'Warning',
        description: 'Fields cannot be empty',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(`${baseURL}/api/auth/login`, formData);
      // Store token and user data in local storage
      // console.log(response)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast({
        title: 'Login successful!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to main page using navigate
      navigate('/main'); // Adjust the route to your main page
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, teal.500, blue.500)"
      color="white"
    >
      <Box
        maxW="lg"
        p={8}
        borderRadius="lg"
        bg="white"
        color="gray.800"
        width="100%"
        maxWidth="480px"
        textAlign="center"
        boxShadow="lg"
      >
        <Heading as="h2" size="lg" mb={6}>Welcome Back</Heading>
        <Text fontSize="md" mb={6}>Log in to your account to continue</Text>
        <VStack spacing={4} as="form">
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup size="md">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button type="button" colorScheme="blue" size="lg" width="full" mt={4} onClick={handleSubmit}>
            Log In
          </Button>
        </VStack>

        {/*Google auth */}
        
          {/*Google auth */}
          <Button
              onClick={handleGoogleSignIn}
              bg="white"
              color="gray.700"
              border="1px solid #ddd"
              boxShadow="md"
              borderRadius="full"
              py={3}
              px={5}
              mt={5}
              fontSize="lg"
              fontWeight="medium"
              transition="all 0.3s"
              _hover={{
                bg: "gray.100",
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              _active={{
                bg: "gray.200",
                transform: "scale(0.98)",
                boxShadow: "sm",
              }}
              leftIcon={<Image src={googleIcon} boxSize="24px" />}
            >
              <Flex align="center">
                <Text ml={2}>Sign in with Google</Text>
              </Flex>
            </Button>


        {/*link to signup */}
        <Text mt={4}>
          Don't have an account?{' '}
          <Link color="teal.500" onClick={() => navigate('/signup')}>Sign up</Link>
        </Text>
      </Box>
    </Box>
  );
};

export default Login;
