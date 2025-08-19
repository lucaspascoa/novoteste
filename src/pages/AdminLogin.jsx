import React, { useState } from 'react';
import { Staff } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, ArrowLeft, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminLogin() {
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
      const users = await Staff.filter({ username: username, status: 'active' });
      
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
      window.location.href = createPageUrl('AdminDashboard');
      
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-slate-200/60">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Área Restrita
                </CardTitle>
                <p className="text-slate-600">Acesso exclusivo para funcionários da empresa.</p>
                <p className="text-sm text-slate-500">Se você é cliente, por favor volte para a página principal.</p>
              </div>
            </CardHeader>
            
            <CardContent>
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
                    className="bg-white border-slate-200 focus:border-blue-500"
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
                      className="bg-white border-slate-200 focus:border-blue-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500 hover:bg-slate-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                 <Link to={createPageUrl("Store")}>
                    <Button variant="link" className="text-slate-600">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para a Loja
                    </Button>
                 </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}