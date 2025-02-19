import { useState } from 'react';
import {Box, Input, Button, InputGroup, InputRightElement, useToast, Heading, VStack, FormControl, FormLabel,Flex,Image} from '@chakra-ui/react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom' ;

import { Link as RouterLink } from 'react-router-dom'; // RouterLink for navigation ,RouterLink from react-router-dom is used for routing.
import { Link, Text } from '@chakra-ui/react'; // Chakra UI Link (for syling)


import googleIcon from "../assets/google-icon.png"; //image of Google iconis  is in  the  assets folder 

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
  const baseURL = import.meta.env.VITE_Base_url || "http://51.20.117.228:5000";  //to use .env in frontend (in vite) , import.meta.env is used, backend me process.env used


  //for signup with google(oAuth)
  const handleGoogleSignIn = () => {
    // Redirect to the backend's Google OAuth endpoint
    window.location.href = "http://51.20.117.228:5000/api/auth/google";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));  //name,password,email etc is part of object ,so using spread operator ensures all other fields are not changed and only the required field is getting updated
  };



  const handleSubmit = async (e) => {
    e.preventDefault();  //to stop default feature of form submission(like url attachment +  refreshing)
    const { name, email, password, confirmPassword } = formData;  //destructuring

    // Check for empty fields
    if (!name || !email || !password || !confirmPassword) {
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
      await axios.post(`${baseURL}/api/auth/signup`, { name, email, password });  
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
        <VStack spacing={4} as="form">
          <FormControl id="name" isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="new-password" 
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
              autoComplete="new-password" 
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
                autoComplete="new-password" 
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
                type={showConfirmPassword ? "text" : "password"} //type refers to the view of the input 
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password" 
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button type="button" colorScheme="blue" size="lg" width="full" mt={4} onClick={handleSubmit} > 
            Sign Up
          </Button>

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
