import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UsernameFormProps {
  onSubmit: (username: string) => void;
}

export const UsernameForm: React.FC<UsernameFormProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [isPending, startTransition] = useTransition();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      startTransition(() => onSubmit(username.trim()));
    }
  };
  return (
    <div className="h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-blue-200 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl text-blue-500 font-bold mb-4 text-center">👋Bienvenido a WasApp</h1>
        <p className="text-sm text-blue-800 font-semibold mb-4 italic ">Un baby Whatsapp hecho con amor para una prueba técnica 👀</p>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Ingresa tu nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-100 mb-4"
            minLength={3}
            required
          />
          <Button disabled={isPending} type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
            Comenzar a chatear
          </Button>
        </form>
      </div>
    </div>
  );
};