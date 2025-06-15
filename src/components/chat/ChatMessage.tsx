
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Moon, User } from 'lucide-react';
import { BeatLoader } from 'react-spinners';

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export function ChatMessage({ message, isLoading }: { message: Message; isLoading?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-muted flex items-center justify-center">
          <AvatarFallback>
            <Moon className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg p-3 text-sm break-words',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isLoading ? <BeatLoader size={8} color="currentColor" /> : message.content}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 bg-muted flex items-center justify-center">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
