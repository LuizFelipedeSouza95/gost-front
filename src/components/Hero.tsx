import React, { useEffect, useState } from 'react';
import { Shield, Users, Calendar, FileText, Image, UserPlus } from 'lucide-react';
import { equipeService, EquipeInfo } from '../services/equipe.service';
import { getUserInfo, isAuthenticated } from '../utils/auth';
import { getBackendUrl } from '../config/urls';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

export function Hero({ setActiveSection }: HeroProps) {
  const [equipeInfo, setEquipeInfo] = useState<EquipeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  useEffect(() => {
    const loadEquipeInfo = async () => {
      try {
        const response = await equipeService.get();
        if (response.success) {
          setEquipeInfo(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar informações da equipe:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        setIsLoggedIn(authenticated);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsLoggedIn(false);
      }
    };

    loadEquipeInfo();
    checkAuth();

    // Escutar eventos de autenticação
    const handleAuthSuccess = () => {
      setIsLoggedIn(true);
    };

    window.addEventListener('auth-success', handleAuthSuccess);
    return () => {
      window.removeEventListener('auth-success', handleAuthSuccess);
    };
  }, []);

  const handleGoogleLogin = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsLoadingLogin(true);
    try {
      const backendUrl = getBackendUrl();
      const authUrl = `${backendUrl}/api/auth/google`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setIsLoadingLogin(false);
    }
  };

  const features = [
    {
      icon: FileText,
      title: 'Estatuto',
      description: 'Condutas e operações do GOST',
      action: () => setActiveSection('estatuto'),
    },
    {
      icon: Calendar,
      title: 'Calendário',
      description: 'Próximos jogos e eventos',
      action: () => setActiveSection('calendario'),
    },
    {
      icon: Users,
      title: 'Membros',
      description: 'Hierarquia e cadeia de comando',
      action: () => setActiveSection('membros'),
    },
    {
      icon: Image,
      title: 'Galeria',
      description: 'Fotos de operações e eventos',
      action: () => setActiveSection('galeria'),
    },
    {
      icon: UserPlus,
      title: 'Recrutamento',
      description: 'Junte-se à nossa equipe',
      action: () => setActiveSection('recrutamento'),
    },
  ];

  return (
    <div className="pt-10">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="flex justify-center">
              <img
                src={equipeInfo?.logo_url || "/path_gost.svg"}
                alt={equipeInfo?.nome || "imagem da equipe"}
                className="w-40 h-40 sm:w-50 sm:h-50 object-contain"
                style={{ maxWidth: '300px', maxHeight: '300px' }}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (!img.src.endsWith("/path_gost.svg")) {
                    img.src = "/path_gost.svg";
                  }
                }}
              />
            </div>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-24 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-96 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full max-w-2xl mx-auto"></div>
              </div>
            ) : (
              <>
                <h1 className="text-5xl md:text-6xl mb-4 text-white tracking-wider">
                  {equipeInfo?.nome || 'GOST'}
                </h1>
                {equipeInfo?.significado_nome && (
                  <p className="text-xl text-amber-400 mb-2">{equipeInfo.significado_nome}</p>
                )}
                {equipeInfo?.descricao && (
                  <p className="text-gray-400 max-w-2xl mx-auto mb-6">
                    {equipeInfo.descricao}
                  </p>
                )}
                {!isLoggedIn && (
                  <div className="mt-6">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoadingLogin}
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4285F4] hover:bg-[#357ae8] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingLogin ? (
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
                          Entrar com Google
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={feature.action}
                className="group p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-amber-600/30 hover:border-amber-500 hover:bg-gray-800/70 transition-all duration-300"
              >
                <feature.icon className="w-10 h-10 text-amber-500 mb-3 group-hover:scale-110 transition-transform mx-auto" />
                <h3 className="text-white mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-400 text-xs text-center">{feature.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4 bg-gray-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl text-white mb-6">Nossa Missão</h2>
          <p className="text-gray-300 leading-relaxed">
            O GOST é uma equipe de airsoft comprometida com os mais altos padrões de profissionalismo,
            trabalho em equipe e conduta ética. Seguimos um estatuto rigoroso que garante a segurança,
            disciplina e diversão responsável em todas as nossas operações.
          </p>
        </div>
      </section>
    </div>
  );
}
