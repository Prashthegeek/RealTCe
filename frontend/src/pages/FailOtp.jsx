// src/pages/FailOtp.jsx

import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const FailOtp = () => {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      height="100vh"
      px={4} // Add horizontal padding for small screens
      bgGradient="linear(to-r, red.100, red.300)" // Optional: Background gradient
    >
      <Box
        bg="white"
        borderRadius="md"
        boxShadow="lg"
        p={8}
        textAlign="center"
        width={{ base: '100%', sm: '400px' }} // Responsive width
      >
        <Heading mb={4} color="red.500">Verification Failed!</Heading>
        <Text fontSize="lg" mb={6}>
          The OTP you entered is invalid or has expired. Please try again.
        </Text>
        <Link to="/verifyOtp"> 
          <Button colorScheme="blue" width="full">Go back to Resend OTP</Button>
        </Link>
      </Box>
    </Flex>
  );
};

export default FailOtp;
