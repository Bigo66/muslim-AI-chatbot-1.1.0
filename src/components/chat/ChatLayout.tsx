
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { ChatMessage, Message } from './ChatMessage';
import { ApiKeyDialog } from './ApiKeyDialog';
import { useToast } from "@/hooks/use-toast";

const RAPID_API_KEY_STORAGE = 'rapidApiKey';

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem(RAPID_API_KEY_STORAGE);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setIsApiKeyDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleApiKeySubmit = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem(RAPID_API_KEY_STORAGE, newApiKey);
    setIsApiKeyDialogOpen(false);
    toast({
      title: "API Key Saved",
      description: "Your RapidAPI key has been securely saved.",
    });
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
      toast({
        title: "API Key Required",
        description: "Please enter your RapidAPI key to start chatting.",
        variant: "destructive",
      });
      return;
    }

    const newUserMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://unlimited-gpt-4.p.rapidapi.com/chat/completions', {
        method: 'POST',
        headers: {
          'X-Rapidapi-Key': apiKey,
          'X-Rapidapi-Host': 'unlimited-gpt-4.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-2024-05-13',
          messages: [...messages, newUserMessage].map(({ role, content }) => ({ role, content })),
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
          <h1 className="text-xl font-bold">AI Chatbot</h1>
          <p className="text-sm text-muted-foreground">Powered by RapidAPI</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsApiKeyDialogOpen(true)}>
          Update API Key
        </Button>
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
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>

      <ApiKeyDialog
        open={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
        onApiKeySubmit={handleApiKeySubmit}
      />
    </div>
  );
}
