import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, Message, Chat } from '@/types';

interface SocketContextType {
  socket: Socket | null;
  currentUser: User | null;
  connectedUsers: User[];
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat) => void;
  setUsername: (username: string) => void;
  updateUsername: (newName: string) => void;

  messages: Map<string, Message[]>;
  sendPrivateMessage: (to: string, content: string) => void;
  deleteMessage: (messageId: string, chatId: string) => void;

  groups: Chat[];
  createGroup: (name: string, participants: User[]) => void;
  sendGroupMessage: (groupId: string, content: string) => void;
}

const STORAGE_KEY = 'wasap-username';

const SocketContext = createContext<SocketContextType>({
  socket: null,
  currentUser: null,
  connectedUsers: [],
  currentChat: null,
  setCurrentChat: () => { },
  messages: new Map(),
  sendPrivateMessage: () => { },
  deleteMessage: () => { },
  setUsername: () => { },
  updateUsername: () => { },
  groups: [],
  createGroup: () => { },
  sendGroupMessage: () => { },
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [groups, setGroups] = useState<Chat[]>([]);

  const initializeSocket = (username?: string) => {
    const newSocket = io('http://localhost:3000', {
      query: username ? { username } : undefined
    });
    setSocket(newSocket);

    newSocket.on('self:info', (user: User) => {
      setCurrentUser(user);
      if (user.name) {
        localStorage.setItem('wasap-username', user.name);
      }
    });
    newSocket.on('users:list', (users: User[]) => {
      setConnectedUsers(users.filter(user => user.id !== newSocket.id));
    });
    newSocket.on('message:received', ({ content, from, timestamp, messageId }) => {
      setMessages(prev => {
        const newMessages = new Map(prev);
        const existingMessages = newMessages.get(from) || [];
        newMessages.set(from, [...existingMessages, {
          id: messageId,
          senderId: from,
          content,
          timestamp,
          deleted: false,
        }]);
        return newMessages;
      });
    });

    newSocket.on('message:sent', ({ content, to, timestamp, messageId }) => {
      setMessages(prev => {
        const newMessages = new Map(prev);
        const existingMessages = newMessages.get(to) || [];
        newMessages.set(to, [...existingMessages, {
          id: messageId,
          senderId: newSocket.id || '',
          content,
          timestamp,
          deleted: false,
        }]);
        return newMessages;
      });
    });

    newSocket.on("group:created", (group: Chat) => {
      setGroups(prev => [...prev, group]);
    })
    newSocket.on('message:group:received', ({ groupId, content, from, timestamp, messageId }) => {
      setMessages(prev => {
        const newMessages = new Map(prev);
        const existingMessages = newMessages.get(groupId) || [];
        newMessages.set(groupId, [...existingMessages, {
          id: messageId,
          senderId: from,
          content,
          timestamp,
          deleted: false,
        }]);
        return newMessages;
      });
    });

    newSocket.on('user:nameUpdated', ({ userId, newName }) => {
      setConnectedUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, name: newName }
            : user
        )
      );

      setCurrentChat(prev => {
        if (prev?.type === 'private' && prev.participants[0].id === userId) {
          return {
            ...prev,
            name: newName,
            participants: [{ ...prev.participants[0], name: newName }]
          };
        }
        return prev;
      });
    });

    newSocket.on('group:userUpdated', ({ userId, newName }) => {
      setGroups(prev =>
        prev.map(group => ({
          ...group,
          participants: group.participants.map(p =>
            p.id === userId ? { ...p, name: newName } : p
          )
        }))
      );
    });
    newSocket.on('message:deleted', ({ messageId, chatId }) => {
      setMessages(prev => {
        const newMessages = new Map(prev);
        const chatMessages = newMessages.get(chatId) || [];
        const updatedMessages = chatMessages.map(msg =>
          msg.id === messageId ? { ...msg, deleted: true } : msg
        );
        newMessages.set(chatId, updatedMessages);
        return newMessages;
      });
    });
    return newSocket;
  }

  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEY);
    let currentSocket: Socket | null = null;
    if (savedUsername) {
      currentSocket = initializeSocket(savedUsername);
    }
    return () => {
      currentSocket?.close();
    };
  }, []);

  const setUsername = (username: string) => {
    initializeSocket(username);
  };

  const sendPrivateMessage = (to: string, content: string) => {
    if (socket && currentUser) {
      socket.emit('message:private', { to, content });
    }
  };

  const createGroup = (name: string, participants: User[]) => {
    if (socket) {
      socket.emit('group:create', {
        name,
        participants: participants.map(p => p.id)
      });
    }
  };

  const sendGroupMessage = (groupId: string, content: string) => {
    if (socket) {
      socket.emit('message:group', { groupId, content });
    }
  };

  const updateUsername = (newName: string) => {
    if (socket && currentUser) {
      socket.emit('user:updateName', newName);
      localStorage.setItem(STORAGE_KEY, newName);
    }
  }

  const deleteMessage = (messageId: string, chatId: string) => {
    if (socket) {
      socket.emit('message:delete', { messageId, chatId });
    }
  }

  return (
    <SocketContext.Provider value={{
      socket,
      currentUser,
      connectedUsers,
      messages,
      setUsername,
      setCurrentChat,
      currentChat,
      sendPrivateMessage,
      deleteMessage,
      groups,
      createGroup,
      updateUsername,
      sendGroupMessage,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);