import { useState } from 'react';
import {Box, Input, Button, InputGroup, InputRightElement, useToast, Heading, VStack, FormControl, FormLabel} from '@chakra-ui/react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom' ;

import { Link as RouterLink } from 'react-router-dom'; // RouterLink for navigation ,RouterLink from react-router-dom is used for routing.
import { Link, Text } from '@chakra-ui/react'; // Chakra UI Link (for syling)

const Signup = () => {


  const navigate = useNavigate();  // Add this line at the beginning of your component

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();
  const baseURL = import.meta.env.VITE_Base_url;  //to use .env in frontend (in vite) , import.meta.env is used, backend me process.env used

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    // Check for empty fields
    if (!name || !email || !password || !confirmPassword) {
      console.log("Empty field detected"); // Debugging line
      toast({
        title: 'All fields are required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return; // Exit the function early
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(`${baseURL}/api/auth/signup`, { name, email, password });  //to use short url's without adding localhost:5000 at start, I did changes in vite.config.js
      //if status is good(200) , then this will execute , else catch block me go 
      toast({
        title: 'Signup successful!',
        description: 'Check your email for OTP.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
        // Pass email via state when navigating to the OTP verification page after successful signup
        navigate('/verifyOtp', { state: { email } });  //it disregards the current URL path and goes directly to localhost:5173/verifyOtp.    
      
    } catch (error) {  // when something went wrong , then just after axios line, this will run
      toast({
        title: 'Signup failed',
        description: error.response?.data?.message || 'Something went wrong', //message we received from the backend.
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
      bgGradient="linear(to-r, blue.500, purple.500)"
      backgroundSize="cover"
      backgroundPosition="center"
      color="white"
    >
      <Box
        maxW="lg"
        p={8}
        borderRadius="lg"
        shadow="lg"
        bg="white"
        color="gray.800"
        width="100%"
        maxWidth="480px"
        mx="auto"
        textAlign="center"
        boxShadow="lg"
      >
        <Heading as="h2" size="lg" mb={6}>
          Create Your Account
        </Heading>
        <Text fontSize="md" mb={6}>
          Join us today to start collaborating!
        </Text>
        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl id="name" isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>

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

          <FormControl id="confirmPassword" isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup size="md">
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button type="submit" colorScheme="blue" size="lg" width="full" mt={4}>
            Sign Up
          </Button>

           {/* Add login link below the signup button */}
           <Text mt={4}>
            Already have an account?{" "}
            <Link as={RouterLink} to="/login" color="blue.500">
              Login
            </Link>
          </Text>

        </VStack>
      </Box>
    </Box>
  );
};

export default Signup;
