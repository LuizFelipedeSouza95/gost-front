import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { getUserInfo, clearUserCache } from '../utils/auth';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface LoginProps {
    setActiveSection?: (section: string) => void;
}

export function Login({ setActiveSection }: LoginProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Verifica se o usuário acabou de fazer login (após redirect do Google)
    useEffect(() => {
        // Limpa qualquer query parameter da URL imediatamente
        if (window.location.search) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }

        // Verifica se o usuário está autenticado após o redirect
        const checkAuthAfterRedirect = async () => {
            // Aguarda um pouco para garantir que a sessão foi salva no backend
            await new Promise(resolve => setTimeout(resolve, 300));
            
            try {
                const userData = await getUserInfo();
                if (userData) {
                    console.log('✅ Login realizado com sucesso! Dados do usuário:', userData);
                    
                    // Dispara evento customizado para atualizar o Header
                    window.dispatchEvent(new CustomEvent('auth-success', { 
                        detail: { userData }
                    }));
                    
                    // Redireciona para a página inicial após login bem-sucedido
                    if (setActiveSection) {
                        setActiveSection('inicio');
                    }
                }
            } catch (e) {
                console.error('❌ Erro ao verificar autenticação:', e);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAfterRedirect();
    }, [setActiveSection]);

    const handleGoogleLogin = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        // console.log('handleGoogleLogin chamado');
        // console.log('API_BASE_URL:', API_BASE_URL);
        
        setIsLoading(true);
        try {
            const authUrl = `${API_BASE_URL}/api/auth/google`;
            // console.log('Redirecionando para:', authUrl);
            
            // Redireciona para a rota de autenticação Google do backend
            window.location.href = authUrl;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-16 px-4 min-h-screen">
            <div className="max-w-md mx-auto">
                {/* Logo e Título */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img src="/path_gost.svg" alt="GOST" style={{ width: '200px', height: '200px' }} />
                    </div>
                    <h1 className="text-4xl mb-2 text-white tracking-wider">GOST</h1>
                    <p className="text-amber-400 mb-1">Ghost Operations Special Team</p>
                    <p className="text-gray-400 text-sm">Acesso Restrito</p>
                </div>

                {/* Card de Login */}
                <Card className="bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-white mb-2">Bem-vindo</CardTitle>
                        <CardDescription className="text-gray-400">
                            Faça login para acessar a área restrita do GOST
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // console.log('Botão clicado!');
                                handleGoogleLogin(e);
                            }}
                            disabled={isLoading}
                            type="button"
                            className="w-full font-medium py-6 h-auto text-white hover:opacity-90 transition-opacity cursor-pointer rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: isLoading ? '#9CA3AF' : '#4285F4' }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Conectando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continuar com Google
                                </>
                            )}
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}