import React, { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { EditUsernameDialog } from './EditUsernameDialog';
import { Input } from '@/components/ui/input';
import { PencilIcon } from 'lucide-react';
import type { Chat } from "@/types";

interface ChatListProps {
  onSelectChat: (chat: Chat) => void;
  children?: React.ReactNode;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, children }) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { connectedUsers, currentUser, updateUsername, currentChat, groups } = useSocket();
  const chats: Chat[] = [
    ...connectedUsers.map(user => ({
      id: user.id,
      name: user.name,
      participants: [user],
      type: 'private' as const
    })),
    ...groups
  ];
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <ScrollArea className="h-screen">
      <div className=' p-2 bg-blue-50'>
        <p className='flex flex-col font-bold text-lg '>
          Bienvenido 👋
          <span className='italic font-semibold text-2xl'>{currentUser?.name}
            <Button title='Editar nombre' className=' hover:bg-blue-200 ml-2 rounded-lg' size={'icon'} variant={'ghost'} onClick={() => setIsEditingUsername(true)}>
              <PencilIcon className="size-8" />
              <span className='sr-only'>Editar nombre de usuario</span>
            </Button>
          </span>
        </p>
      </div>
      <Separator className="bg-blue-100" />
      <h2 className=" pt-4 pl-2 text-2xl font-bold">Chats</h2>
      <div>
      </div>
      <div className='p-2'>
        {children}
        <Input
          placeholder="Buscar usuarios o grupos..."
          className=" mb-4"
          type='search'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className=" flex flex-col">
        {
          filteredChats.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              {connectedUsers.length === 0
                ? "Esperando a que otros usuarios se conecten..."
                : "No se encontraron usuarios"}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <Button
                key={chat.id}
                variant={"outline"}
                className={`w-full justify-start px-4 py-6 hover:bg-blue-200 rounded-lg 
                    ${currentChat?.id === chat.id ? 'bg-blue-100' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <Avatar className="size-8 mr-2">
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${chat.name}`} />
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                <span className='text-lg'>{chat.name}</span>
              </Button>
            )
            )
          )
        }
      </div>
      <EditUsernameDialog
        isOpen={isEditingUsername}
        onClose={() => setIsEditingUsername(false)}
        currentName={currentUser?.name || ''}
        onUpdate={updateUsername}
      />
    </ScrollArea>
  );
};