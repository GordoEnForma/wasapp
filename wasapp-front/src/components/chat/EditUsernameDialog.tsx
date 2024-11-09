import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EditUsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onUpdate: (newName: string) => void;
}

export const EditUsernameDialog: React.FC<EditUsernameDialogProps> = ({
  isOpen,
  onClose,
  currentName,
  onUpdate
}) => {
  const [newName, setNewName] = useState(currentName);

  const handleUpdate = () => {
    if (newName.trim() && newName !== currentName) {
      onUpdate(newName.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='p-8'>
        <DialogHeader>
          <DialogTitle>Editar nombre de usuario</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500 ">
          Este nombre se mostrará en la lista de participantes
        </p>
        <p className="text-sm font-bold text-red-500 mb-4">
          ASÍ QUE PIENSALO BIEN!!!
        </p>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nuevo nombre"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleUpdate();
            }
          }}

        />
        <Button disabled={newName.length === 0 || newName === currentName} onClick={handleUpdate}>Actualizar</Button>
      </DialogContent>
    </Dialog>
  );
};