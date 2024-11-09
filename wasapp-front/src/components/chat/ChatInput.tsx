import { useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { SendIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"



export const ChatInput = () => {
  const { currentChat, sendPrivateMessage, sendGroupMessage } = useSocket();
  const [newMessage, setNewMessage] = useState('');

  const onSendMessage = (content: string) => {
    if (currentChat) {
      if (currentChat.type === 'private') {
        sendPrivateMessage(currentChat.id, content);
      } else {
        sendGroupMessage(currentChat.id, content);
      }
    }
  };
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (<div className="flex items-center">
    <Input
      placeholder="Escribe un mensaje..."
      className="flex-1 mr-2"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
    />
    <Button className='bg-blue-400 hover:bg-blue-500' onClick={handleSendMessage}>
      <SendIcon className="size-4 mr-0.5 mt-1" />
      Enviar
    </Button>
  </div>
  )

}