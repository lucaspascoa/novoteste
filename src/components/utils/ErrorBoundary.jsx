import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios de erro
    console.error("ErrorBoundary pegou um erro:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback.
      return (
        <div className="flex items-center justify-center p-8">
            <Card className="max-w-lg w-full bg-red-50 border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-red-800">
                        <AlertTriangle className="w-6 h-6" />
                        <span>Ocorreu um Erro</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-red-700">
                        Houve um problema ao carregar esta parte da página. Nossa equipe foi notificada.
                    </p>
                    <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md overflow-auto">
                      <strong>Detalhes do Erro:</strong> {this.state.error?.message}
                    </p>
                    <Button 
                      onClick={() => window.location.reload()}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2"/>
                      Recarregar a Página
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
