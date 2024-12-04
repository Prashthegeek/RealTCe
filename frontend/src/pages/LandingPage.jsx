import React from 'react';
import { Box, Button, Heading, Text, VStack, Flex, Grid, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { IoCodeSlash, IoTerminal, IoShareSocial, IoRocketSharp, IoLogIn } from 'react-icons/io5';

// Motion component creation
const MotionBox = motion.create(Box);
const MotionVStack = motion.create(VStack);

// Language Icons Component
const LanguageIcon = ({ language, icon }) => (
  <Flex 
    direction="column" 
    align="center" 
    bg="whiteAlpha.200" 
    p={4} 
    borderRadius="xl" 
    transition="all 0.3s ease"
    _hover={{
      transform: 'scale(1.05)',
      bg: 'whiteAlpha.300',
      boxShadow: 'lg'
    }}
  >
    {icon}
    <Text mt={2} fontWeight="bold" color="whiteAlpha.900">{language}</Text>
  </Flex>
);

const LandingPage = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.600, purple.600)',
    'linear(to-br, blue.800, purple.800)'
  );

  return (
    <Box 
      bg="black"
      bgGradient={bgGradient}
      color="white"
      minH="100vh" 
      display="flex" 
      flexDirection="column" 
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="hidden"
      px={{ base: 4, md: 8 }}
    >
      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
        textAlign="center"
        maxW="container.xl"
        mt={{ base: 8, md: 10 }}
      >
        <Heading 
          as="h1" 
          size={{ base: '2xl', md: '3xl' }} 
          mb={6}
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          Real-Time Collaborative Code Editor
        </Heading>
        <Text fontSize={{ base: 'lg', md: 'xl' }} mb={8} color="whiteAlpha.800">
          Code together, in real-time. Seamless collaboration across multiple programming languages.
        </Text>

        {/* CTA Buttons */}
        <Flex justify="center" gap={4} mb={12}>
          <Button
            colorScheme="cyan"
            size="lg"
            rightIcon={<IoRocketSharp />}
            onClick={() => window.location.href = '/Signup'}
            _hover={{
              transform: 'scale(1.05)',
              boxShadow: 'xl'
            }}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            colorScheme="white"
            size="lg"
            leftIcon={<IoLogIn />}
            onClick={() => window.location.href = '/login'}
            _hover={{
              bg: 'whiteAlpha.200'
            }}
          >
            Login
          </Button>
        </Flex>
      </MotionBox>

      {/* Supported Languages */}
      <MotionBox
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        w="full"
        maxW="container.xl"
        mb={16}
      >
        <Heading 
          textAlign="center" 
          size="xl" 
          mb={8}
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          Supported Languages
        </Heading>
        <Grid 
          templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          gap={6}
          justifyContent="center"
        >
          <LanguageIcon 
            language="JavaScript" 
            icon={<IoCodeSlash size={48} color="#F0DB4F" />} 
          />
          <LanguageIcon 
            language="Python" 
            icon={<IoTerminal size={48} color="#4B8BBE" />} 
          />
          <LanguageIcon 
            language="C++" 
            icon={<IoCodeSlash size={48} color="#044F88" />} 
          />
          <LanguageIcon 
            language="Java" 
            icon={<IoTerminal size={48} color="#f89820" />} 
          />
        </Grid>
      </MotionBox>

      {/* Key Features */}
      <MotionVStack
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        spacing={8}
        maxW="container.xl"
        w="full"
        mb={16}
      >
        <Heading 
          size="xl" 
          textAlign="center"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          Key Features
        </Heading>
        <Grid 
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={6}
          w="full"
        >
          <Flex 
            direction="column" 
            align="center" 
            bg="whiteAlpha.200" 
            p={6} 
            borderRadius="xl"
            textAlign="center"
          >
            <IoShareSocial size={48} color="#63b3ed" />
            <Text fontWeight="bold" mt={4} mb={2}>Real-Time Collaboration</Text>
            <Text color="whiteAlpha.700">
              Collaborate seamlessly with multiple developers in a shared coding environment.
            </Text>
          </Flex>
          <Flex 
            direction="column" 
            align="center" 
            bg="whiteAlpha.200" 
            p={6} 
            borderRadius="xl"
            textAlign="center"
          >
            <IoCodeSlash size={48} color="#4fd1c5" />
            <Text fontWeight="bold" mt={4} mb={2}>Multi-Language Support</Text>
            <Text color="whiteAlpha.700">
              Code in JavaScript, Python, C++, Java, and more with syntax highlighting.
            </Text>
          </Flex>
          <Flex 
            direction="column" 
            align="center" 
            bg="whiteAlpha.200" 
            p={6} 
            borderRadius="xl"
            textAlign="center"
          >
            <IoTerminal size={48} color="#e53e3e" />
            <Text fontWeight="bold" mt={4} mb={2}>Instant Code Sharing</Text>
            <Text color="whiteAlpha.700">
              Share code snippets, collaborate on projects, and learn together in real-time.
            </Text>
          </Flex>
        </Grid>
      </MotionVStack>

      {/* Footer */}
      <Box 
        textAlign="center" 
        mt={12} 
        py={6} 
        w="full"
        borderTop="1px solid"
        borderColor="whiteAlpha.300"
      >
        <Text fontSize="sm" color="whiteAlpha.600">
          &copy; {new Date().getFullYear()} CodeSync. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default LandingPage;