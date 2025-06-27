import { useState } from 'react';
import { Box, Input, Button, VStack, FormControl, FormLabel, useToast, Heading } from '@chakra-ui/react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const OtpVerification = () => {

  const [otp, setOtp] = useState('');
  const toast = useToast();
  const location = useLocation();
  const email = location.state?.email;  // Access email from route state , sent as a state using navigate , this email can be used in both handleOtpSubmit and resendotp function

  const baseURL = import.meta.env.VITE_BACKEND_URI || "http://51.20.117.228:5000";  //contains backend ka url , in vite , .env is used with import.meta.env
  const navigate = useNavigate() ; //created an instance of useNavigate with name navigate.

  const handleOtpSubmit = async () => {
    try {
      const response = await axios.post(`${baseURL}/api/auth/verify-otp`, { email, otp }); //backend me directly second argument me data send (in backend accept it using req.body) , frontend to frontend data send, then useLocation ka state used used.
      toast({
        title: 'Account verified!',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Redirect to the success page after verification
      navigate('/successOtp');  // Navigate to success page  , endPoint-> /successOtp (not /verifyOtp/successOtp , since, navigate directly usi route ko target karta hai.)
    } catch (error) {
      toast({
        title: 'OTP Verification failed',
        description: error.response?.data?.message || 'Invalid OTP',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resendOtp = async () => {
    try {
      await axios.post(`${baseURL}/api/auth/resend-otp`, { email });  //backend me directly second argument me data send (in backend accept it using req.body) , frontend to frontend data send, then useLocation ka state used used.
      toast({
        title: 'OTP Resent!',
        description: 'A new OTP has been sent to your email.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to resend OTP',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
      <VStack as="form" spacing={4}>
        <Heading as="h3" size="lg">Verify Your Account</Heading>
        <FormControl id="otp" isRequired>
          <FormLabel>Enter OTP</FormLabel>
          <Input
            name="otp"
            placeholder="Enter the OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </FormControl>
        <Button colorScheme="blue" onClick={handleOtpSubmit}>Verify OTP</Button>
        <Button variant="link" colorScheme="blue" onClick={resendOtp}>Resend OTP</Button>
      </VStack>
    </Box>
  );
};

export default OtpVerification;
