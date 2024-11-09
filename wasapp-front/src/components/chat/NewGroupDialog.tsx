import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User } from '@/types';
import { Separator } from '../ui/separator';
import { LoaderCircleIcon } from 'lucide-react';
import { Label } from '../ui/label';

interface NewGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, participants: User[]) => void;
  users: User[];
}

export const NewGroupDialog: React.FC<NewGroupDialogProps> = ({ isOpen, onClose, onCreateGroup, users }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleCreateGroup = () => {
    if (groupName && selectedUsers.length > 0) {
      onCreateGroup(groupName, selectedUsers);
      setGroupName('');
      setSelectedUsers([]);
      onClose();
    }
  };

  const toggleUser = (user: User) => {
    setSelectedUsers(prev =>
      prev.some(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Grupo</DialogTitle>
          <DialogDescription>Crea un grupo privado para compartir mensajes con otros usuarios</DialogDescription>
        </DialogHeader>
        <Separator />
        <Label>Nombre del grupo</Label>
        <Input
          placeholder="Los de la nasa"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <p className='font-semibold'>Selecciona los usuarios que deben participar en el grupo:</p>
        <ScrollArea className="h-[200px]">
          {
            users.length === 0 && (
              <div className="flex items-center  text-gray-500">
                Esperando a que otros usuarios se conecten
                <LoaderCircleIcon className="size-4 mt-0.5 ml-2 animate-spin" />
              </div>
            )
          }
          {users.map(user => (
            <div key={user.id} className="flex items-center space-x-2 mb-2">
              <Checkbox
                id={`user-${user.id}`}
                checked={selectedUsers.some(u => u.id === user.id)}
                onCheckedChange={() => toggleUser(user)}
              />
              <label htmlFor={`user-${user.id}`}>{user.name}</label>
            </div>
          ))}
        </ScrollArea>
        <Button disabled={groupName.trim().length === 0 || selectedUsers.length === 0} onClick={handleCreateGroup}>Crear Grupo</Button>
      </DialogContent>
    </Dialog>
  );
};