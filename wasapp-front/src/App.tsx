import { useState } from 'react'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { NewGroupDialog } from '@/components/chat/NewGroupDialog'
import { useSocket } from './context/SocketContext'
import { UsernameForm } from './components/auth/UserForm'
import { UsersIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import type { Chat, User } from './types'


export default function App() {
  const { currentUser, connectedUsers, setUsername, messages, createGroup, currentChat, setCurrentChat } = useSocket();
  const [isNewGroupDialogOpen, setIsNewGroupDialogOpen] = useState(false);

  const handleSelectChat = (chat: Chat) => {
    if (chat.id !== currentChat?.id) {
      setCurrentChat(chat);
    }
  };
  const handleCreateGroup = (name: string, participants: User[]) => {
    createGroup(name, participants);
  };

  if (!currentUser) {
    return <UsernameForm onSubmit={setUsername} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white border-r border-gray-200">
        <ChatList
          onSelectChat={handleSelectChat}
        >
          <div className="mb-4">
            <Button className='w-full' variant="outline" onClick={() => setIsNewGroupDialogOpen(true)}>
              <UsersIcon className="size-4" />
              Crear Nuevo Grupo
            </Button>
          </div>
        </ChatList>
      </div>
      <ChatWindow
        messages={currentChat ? messages.get(currentChat.id) || [] : []}
      />
      <NewGroupDialog
        isOpen={isNewGroupDialogOpen}
        onClose={() => setIsNewGroupDialogOpen(false)}
        onCreateGroup={handleCreateGroup}
        users={connectedUsers}
      />
    </div>
  )
}