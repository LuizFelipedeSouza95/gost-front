import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Shield, Users, ClipboardCheck, Shirt, Target, Package, LucideIcon } from 'lucide-react';
import { estatutoService, EstatutoInfo, EstatutoTopic } from '../services/estatuto.service';

// Mapeamento de ícones
const iconMap: Record<string, LucideIcon> = {
  Shield,
  Users,
  ClipboardCheck,
  Shirt,
  Target,
  Package,
};

// Dados padrão caso não haja dados no banco
const defaultTopics: EstatutoTopic[] = [
  {
    id: 'topic1',
    icon: 'Users',
    title: 'TÓPICO I. DISPOSIÇÕES GERAIS E HIERARQUIA',
    description: 'A estrutura oficial e hierarquia dentro da cadeia de comando. Contém o histórico e relações de companheirismo entre membros do time organizacional.',
    content: {
      sections: [
        {
          title: '1. Estrutura de Comando',
          items: [
            { position: 'Comando-Geral', members: '2 efetivos', additional: 'Comandante' },
            { position: 'Subcomando', members: '2 efetivos', additional: 'Posições Estratégicas de Comando Tático' },
            { position: 'Comando de Tático', members: '2 efetivos', additional: 'Baião, Mano, Cardoso/Nunes, Aquino, Frielink' },
            { position: 'Táctico/Membros', members: '5+ efetivos', additional: 'Movimento das Tropas, Cumprimento dos Planos Táticos' },
          ]
        },
        {
          title: '2. Disciplina Tática',
          items: [
            { text: 'A composição de células em campo é ESSENCIAL. Qualquer ação ou sugestão deverá ser tomada via Líder de Célula e esta irá repassar ao 1º Sgt ou 2º Sgt de Briefing.' }
          ]
        }
      ]
    }
  },
  {
    id: 'topic2',
    icon: 'ClipboardCheck',
    title: 'TÓPICO II. INGRESSO E AVALIAÇÃO (Q&A)',
    description: 'O processo de Avaliação e Aprovação para se tornar um membro permanente/recrutável do GOST.',
    content: {
      sections: [
        {
          title: '1. Requisitos Básicos',
          items: [
            { text: 'Conduta: É mandatório que o jogador tenha irreprovável, no regimento de fairplay e liberação de BBs em zona neutra.' },
            { text: 'Comprometimento: Disponibilidade para participar de treinamentos e operações.' }
          ]
        },
        {
          title: '2. Fases de Recrutamento (Q&A)',
          items: [
            { text: 'Seleção: Interesse de 3 semanas nos treinos sem reservamentos.' },
            { text: 'Uniforme: O recruta usará o Padrão PMC Genérico (a caiba permitida e padrão oficial do GOST).' },
            { text: 'Permanência: O processo de Avaliação, e bem como Plenos, são designados por um Membro Permanente.' },
            { text: 'Promoção: O candidato é Promovido via Votação, e então oficial após com aprovação de mais de 50% (Cinquenta por cento).' }
          ]
        }
      ]
    }
  },
  {
    id: 'topic3',
    icon: 'Shield',
    title: 'TÓPICO III. CONDUTA E DISCIPLINA',
    description: 'Ética estrita e avaliação e disciplina do comportamento do GOST.',
    content: {
      sections: [
        {
          title: '1. Padrão de Uniformização (Pós-Q&A)',
          items: [
            { text: 'Baseado no uniforme tático ao mesmo padrão do Líder que está sob os quadros de preparação (Somente até a efetiva reorganização e uniformização, do GOST).' },
            { text: 'Após a padronização dos membros, os quadros de 1º Soldo sob profundização do assunto do Comando do Squad, são manchamento (ou mudança propor) da Cor da Farda de equipamentos prioritários e secundário, definindo para GOST.' }
          ]
        },
        {
          title: '2. Conduta em Campo',
          items: [
            { text: 'Respeito aos adversários e aliados.' },
            { text: 'Fair play obrigatório em todas as situações.' },
            { text: 'Seguir ordens da cadeia de comando.' },
            { text: 'Zelar pela segurança de todos os participantes.' }
          ]
        }
      ]
    }
  },
  {
    id: 'topic4',
    icon: 'Shirt',
    title: 'TÓPICO IV. PADRÕES DE UNIFORMIZAÇÃO (KIT GOST)',
    description: 'Detalhes de regulamentação e padronização do traje (Frig-Goo, Pack e AEGs), e adotado pela equipe Airsoft sempre identificável com uniforme dos permitidos.',
    content: {
      sections: [
        {
          title: 'A. ESTILO PRIMÁRIO (FAMÍLIA APC/I)',
          items: [
            { text: 'Padrão Definido: MULTICAM, WOODLAND, M05(etc).' },
            { text: 'Aplicação: Em termos Técnica/Pessoal-Tático.' }
          ]
        },
        {
          title: 'Observação',
          items: [
            { text: 'A atenção tem variáveis obrigatórias observadas como aluguéis considerados e equipamento.' }
          ]
        }
      ]
    }
  },
  {
    id: 'topic5',
    icon: 'Target',
    title: 'TÓPICO V. PLANEJAMENTO DE MISSÕES (BRIEFING TÁTICO)',
    description: 'Todo Briefing da Unidade especial e no que o C.C.C prosseguirá com o Comando de planejamento.',
    content: {
      sections: [
        {
          title: 'BRIEFING',
          items: [
            { label: 'INIMIGO', text: 'Tropas, Milicianos e Guerrilha em Trânsito Operacional.' },
            { label: 'EXECUÇÃO', text: 'Mover da ADA e Auxiliar um Suprimento Específico de Atendimento de Viagem.' },
            { label: 'LOGÍSTICA', text: 'Transportes de equipamento de Segurança: Máscaras Obrigatórios.' },
            { label: 'COORDENAÇÃO', text: 'Squad Ações em um briefing predito de Trabalho com acompanhamento de Squad.' }
          ]
        }
      ]
    }
  },
  {
    id: 'topic6',
    icon: 'Package',
    title: 'TÓPICO VI. LOGÍSTICA OPERACIONAL E COMPROMISSO',
    description: 'A prevenção de atividades operacional à logística e a manutenção das permissões e contar.',
    content: {
      sections: [
        {
          title: '1. Dias e Horários Oficiais',
          items: [
            { text: 'As atividades e compromissos oficiais do GOST incluem:' },
            { text: 'Jogos oficiais nos domingos, 07h00 às 18h00.' },
            { text: 'Link oficial para Eventos de 07 e 10 de agosto encontrado no calendário.' }
          ]
        },
        {
          title: '2. Cada Solidário: Específica do Agente',
          items: [
            { text: 'Cada Soldado, é organismo de missão, cada um soldado de investimento e compondo todas base de observações e história para quanto o compreenso táticos.' },
            { text: 'A Operação NÃO é obrigatória.' }
          ]
        }
      ]
    }
  }
];

export function TopicSection() {
  const [estatuto, setEstatuto] = useState<EstatutoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEstatuto = async () => {
      try {
        const response = await estatutoService.get();
        if (response.success) {
          setEstatuto(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar estatuto:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEstatuto();
  }, []);

  const topics = estatuto?.conteudo?.topics || defaultTopics;
  const titulo = estatuto?.titulo || 'Estatuto de Conduta e Operação do GOST';
  const descricao = estatuto?.descricao || 'Diretrizes oficiais e regulamentações da equipe';

  const getIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return Shield;
    return iconMap[iconName] || Shield;
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-700 rounded w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-700 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-4">{titulo}</h1>
          <p className="text-gray-400">{descricao}</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {topics.map((topic) => {
            const IconComponent = getIcon(topic.icon);
            return (
              <AccordionItem
                key={topic.id}
                value={topic.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-amber-600/30 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center gap-4 text-left">
                    <IconComponent className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-white">{topic.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{topic.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6 pt-4">
                  {topic.content.sections.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="text-amber-400">{section.title}</h4>
                      {section.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="ml-4 text-gray-300">
                          {item.position && (
                            <div className="flex justify-between py-2 border-b border-gray-700/50">
                              <span>{item.position}</span>
                              <span className="text-gray-400">{item.members}</span>
                            </div>
                          )}
                          {item.text && (
                            <p className="py-1 leading-relaxed">• {item.text}</p>
                          )}
                          {item.label && (
                            <p className="py-1 leading-relaxed">
                              <span className="text-amber-400">{item.label}:</span> {item.text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
