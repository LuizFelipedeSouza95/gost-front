import React, { useEffect, useState } from 'react';
import { Shield, Users, Calendar, FileText, Image, UserPlus } from 'lucide-react';
import { equipeService, EquipeInfo } from '../services/equipe.service';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

export function Hero({ setActiveSection }: HeroProps) {
  const [equipeInfo, setEquipeInfo] = useState<EquipeInfo | null>(null);
  const [loading, setLoading] = useState(true);

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

    loadEquipeInfo();
  }, []);

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
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    {equipeInfo.descricao}
                  </p>
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
