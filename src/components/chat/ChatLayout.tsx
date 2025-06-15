
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { ChatMessage, Message } from './ChatMessage';
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// NOTE: The API key is hardcoded here for your convenience to get started.
// In a real-world application, you should use a more secure method to handle API keys.
const API_KEY = '16bdfcfe49msh0788eebea784213p156e1ajsnbb09b53501d7';

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "As-salamu alaykum! I am your AI Muslim assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('hadith');
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
      const response = await fetch('https://ai-islamic-chatbot-quran-hadith-fiqh-fatwa-halal-q-a.p.rapidapi.com/chat?noqueue=1', {
        method: 'POST',
        headers: {
          'X-Rapidapi-Key': API_KEY,
          'X-Rapidapi-Host': 'ai-islamic-chatbot-quran-hadith-fiqh-fatwa-halal-q-a.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newUserMessage.content,
          category: category,
          language: 'en'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'API request failed');
      }

      const data = await response.json();
      const responseContent = data.result?.response?.message || "Sorry, I couldn't get a proper response from the assistant.";
      const aiResponse: Message = { role: 'assistant', content: responseContent };
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
          <Select value={category} onValueChange={setCategory} disabled={isLoading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hadith">Hadith</SelectItem>
              <SelectItem value="quran">Quran</SelectItem>
              <SelectItem value="fiqh">Fiqh</SelectItem>
              <SelectItem value="fatwa">Fatwa</SelectItem>
              <SelectItem value="halal-haram">Halal/Haram</SelectItem>
            </SelectContent>
          </Select>
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
