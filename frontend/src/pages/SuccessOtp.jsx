// src/pages/SuccessOtp.jsx

import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const SuccessOtp = () => {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      height="100vh"
      px={4} // Add horizontal padding for small screens
      bgGradient="linear(to-r, green.100, green.300)" // Optional: Background gradient
    >
      <Box
        bg="white"
        borderRadius="md"
        boxShadow="lg"
        p={8}
        textAlign="center"
        width={{ base: '100%', sm: '400px' }} // Responsive width
      >
        <Heading mb={4} color="green.500">Success!</Heading>
        <Text fontSize="lg" mb={6}>
          Your account has been successfully verified.
        </Text>
        <Link to="/login">
          <Button colorScheme="blue" width="full">Go to Login</Button>
        </Link>
      </Box>
    </Flex>
  );
};

export default SuccessOtp;
