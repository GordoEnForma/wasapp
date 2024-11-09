import { useSocket } from '@/context/SocketContext';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from 'lucide-react'
import { ChatInput } from './ChatInput';
import type { Message, } from '@/types';
import { useEffect, useRef } from 'react';

interface ChatWindowProps {
  messages: Message[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
}) => {
  const { connectedUsers, deleteMessage, currentChat, currentUser } = useSocket();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleDeleteMessage = (messageId: string) => {
    if (!currentChat) return;
    deleteMessage(messageId, currentChat?.id || '');
  };
  const getSenderName = (senderId: string) => {
    if (senderId === currentUser?.id) return currentUser.name;
    const sender = connectedUsers.find(u => u.id === senderId);
    return sender?.name || currentChat?.name || 'Usuario';
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages])

  if (!currentChat || !currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          {!currentChat
            ? 'Selecciona un chat para comenzar a conversar'
            : 'Esperando conexión...'}
        </p>
      </div>
    );
  }
  const participantsName = currentChat?.participants.map(p => getSenderName(p as unknown as string)) || [];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex flex-col  justify-between p-4 border-b border-gray-200 bg-white">
        <div className='flex items-center gap-x-4'>
          <Avatar className="size-12">
            <AvatarImage src={``} />
            <AvatarFallback className='bg-red-300 text-xl font-semibold'>{currentChat?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col justify-between'>
            <h1 className="text-2xl font-bold">{currentChat?.name || 'Selecciona un chat'}</h1>
            {
              participantsName.length > 1 && <p className="text-gray-500 text-lg">{participantsName.join(', ')}</p>
            }
          </div>

        </div>
      </div>
      <ScrollArea className='flex-1 p-4' ref={scrollAreaRef}>
        {/* <div id="messages-scroll-area" className='px-4' > */}
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser?.id;
          return (
            <div
              key={message.id}
              className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-center gap-x-4 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                }`}>
                {!isCurrentUser && (
                  <Avatar className="size-12">
                    <AvatarImage src={``} />
                    <AvatarFallback className='bg-red-300 text-xl font-semibold'>{getSenderName(message.senderId).slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 ${isCurrentUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                    }`}
                >
                  <p className={`${isCurrentUser ? 'hidden' : 'text-black font-semibold'}`}>{getSenderName(message.senderId)}</p>
                  <p className={message.deleted ? `italic ${isCurrentUser ? 'text-white' : 'text-gray-500'} ` : ''}>
                    {message.deleted ? '[Mensaje eliminado]' : message.content}
                  </p>
                  <span className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    } block mt-1`}>
                    {message.timestamp}
                  </span>
                </div>
                {isCurrentUser && !message.deleted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMessage(message.id)}
                    className='hover:bg-red-200'
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        }
        )}
        <div ref={messagesEndRef}></div>
      </ScrollArea>
      <div className="p-4 border-t border-gray-200 bg-white">
        <ChatInput />
      </div>
    </div>
  );
};