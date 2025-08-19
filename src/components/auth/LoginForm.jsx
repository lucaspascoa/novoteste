import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginForm({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const users = await User.filter({ username: username, status: 'active' });
      
      if (users.length === 0) {
        setError('Usuário não encontrado ou inativo.');
        setIsLoading(false);
        return;
      }

      const user = users[0];
      
      if (user.password !== password) {
        setError('Senha incorreta.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      onLoginSuccess(user);
      
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Ocorreu um erro ao tentar fazer login.');
    }
    
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onCancel}
       >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
        >
            <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={onCancel}><X className="w-5 h-5"/></Button>
            <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Acesso Restrito</h2>
                    <p className="text-slate-500">Faça login para continuar</p>
                </div>
            
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Digite seu usuário"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
            </div>
        </motion.div>
       </motion.div>
    </AnimatePresence>
  );
}
