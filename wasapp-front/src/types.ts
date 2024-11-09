export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  deleted: boolean;
}

export interface Chat {
  id: string;
  name: string;
  participants: User[];
  type: 'group' | 'private';
}