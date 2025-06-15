
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { ChatMessage, Message } from './ChatMessage';
import { useToast } from "@/hooks/use-toast";

// NOTE: The API key is hardcoded here for your convenience to get started.
// In a real-world application, you should use a more secure method to handle API keys.
const API_KEY = '16bdfcfe49msh0788eebea784213p156e1ajsnbb09b53501d7';

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "As-salamu alaykum! I am your AI Muslim assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !API_KEY) return;

    const newUserMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemMessage = {
        role: 'system',
        content: 'You are an AI Muslim chatbot. Your purpose is to provide information and answer questions based on Islamic teachings from the Quran and the Sunnah. Always be respectful, knowledgeable, and cite sources when possible. If a question is outside the scope of Islamic knowledge, state that you are specialized in that area.'
      };
      
      const apiMessages = [
        systemMessage,
        ...messages,
        newUserMessage
      ];

      const response = await fetch('https://unlimited-gpt-4.p.rapidapi.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-Rapidapi-Host': 'unlimited-gpt-4.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-2024-05-13',
          messages: apiMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'API request failed');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message;
      setMessages((prev) => [...prev, aiResponse]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${errorMessage}` }]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <header className="p-4 border-b flex justify-between items-center bg-card">
        <div>
          <h1 className="text-xl font-bold">AI Muslim Chatbot</h1>
          <p className="text-sm text-muted-foreground">Your guide to Islamic knowledge</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{ role: 'assistant', content: '' }} isLoading={true} />}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t bg-card">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading || !API_KEY}
          />
          <Button type="submit" disabled={isLoading || !input.trim() || !API_KEY}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
