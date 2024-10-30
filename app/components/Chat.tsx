import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  Grid,
  Avatar,
  Icon,
  Center,
} from '@chakra-ui/react';
import { Send, User, MessageSquare, FileText, Shirt, Mail, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';

const ChatMessage = ({ message }: { message: { role: string; content: string } }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <Flex 
      w="full" 
      py={3}
      justify={isAssistant ? "flex-start" : "flex-end"}
    >
      <Flex
        maxW="70%"
        align="start"
        bg={isAssistant ? undefined : 'brand.900'}
        color={isAssistant ? 'inherit' : 'white'}
        px={4}
        py={3}
        borderRadius="lg"
      >
        {/* {isAssistant && (
          // <Avatar 
          //   icon={<Icon as={MessageSquare} />}
          //   bg="brand.900"
          //   color="white"
          //   mr={3}
          //   size="sm"
          // />
        )} */}
        <Text>{message.content}</Text>
      </Flex>
    </Flex>
  );
};

const TypingIndicator = () => (
  <Flex align="center" mt={2}>
    <Text fontSize="xl" color="gray.500">•</Text>
    {[0, 1].map((index) => (
      <Text
        key={index}
        fontSize="xl"
        color="gray.500"
        animation={`typing-indicator 1.4s infinite ease-in-out ${index * 0.2}s`}
        ml={1}
      >
        •
      </Text>
    ))}
  </Flex>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function DatingAssistantPage() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();
  const botId = params?.id as string;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);


  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {

      setConversation(prev => [...prev, { role: 'user', content: input }]);
      const currentInput = input;
      setInput('');
      setIsLoading(true);

      const encodedInput = encodeURIComponent(currentInput);
      const eventSource = new EventSource(`/api/chat?message=${encodedInput}&token=${user?.token}&botId=${botId}`);

      let assistantResponse = '';

      eventSource.onmessage = (event) => {
        try {
          setIsLoading(false);
          const data = JSON.parse(event.data);
          if (data.content === "[DONE]") {
            eventSource.close();
          } else {
            assistantResponse += data.content;
            setConversation(prev => {
              const newConv = [...prev];
              if (newConv[newConv.length - 1]?.role === 'assistant') {
                newConv[newConv.length - 1].content = assistantResponse;
              } else {
                newConv.push({ role: 'assistant', content: assistantResponse.trim() });
              }
              return newConv;
            });
          }
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
        alert("Connection Error: Failed to connect to the server. Please try again.");
      };

    } catch (error) {
      console.error('Error getting advice:', error);
      alert("Error: An error occurred while getting advice. Please try again.");
    }
  };

  return (
    <Flex direction="column" h="92vh" bg="white">
      <Box flex={1} overflowY="auto" px={4} py={6}>
        {conversation.length === 0 ? (
          <VStack align="stretch" maxW="3xl" mx="auto" w="full" h="full" justifyContent="center">
            <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4} color="gray.700">
              {getGreeting()}, {userName}
            </Text>
          </VStack>
        ) : (
          <VStack align="stretch" maxW="3xl" mx="auto" w="full">
            {conversation.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <Flex justify="flex-start">
                <TypingIndicator />
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>
      <Box borderTop="1px" borderColor="gray.200" p={4} bg="white">
        <Flex as="form" onSubmit={handleSubmit} maxW="3xl" mx="auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Ask me for any dating advice..."
            mr={2}
            disabled={isLoading}
            size="lg"
            borderRadius="full"
          />
          <Button
            type="submit"
            color="black"
            border="2px solid"
            borderColor="black"
            disabled={isLoading}
            size="lg"
            borderRadius="full"
          >
            <Send size={20} />
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}