import React from "react";
import {
  HelpCircle,
  Shield,
  Users,
  Zap,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Card } from "./ui/card";

export function FAQSection() {
  const faqCategories = [
    {
      id: "iniciantes",
      title: "Para Iniciantes",
      icon: HelpCircle,
      questions: [
        {
          q: "O que é airsoft?",
          a: "Airsoft é um esporte tático de simulação militar que utiliza réplicas de armas de fogo que disparam pequenas esferas plásticas (BBs). É praticado em campos específicos com regras de segurança rigorosas.",
        },
        {
          q: "Quanto custa começar no airsoft?",
          a: "O investimento inicial varia entre R$ 1.500 a R$ 3.000, incluindo réplica básica, proteção ocular, uniforme simples e acessórios essenciais. É possível começar com equipamento mais simples e ir evoluindo.",
        },
        {
          q: "Preciso ter experiência militar?",
          a: "Não! Airsoft é aberto a todos. Oferecemos treinamento completo para iniciantes, ensinando desde regras básicas até táticas avançadas.",
        },
        {
          q: "É perigoso?",
          a: "Quando praticado com os equipamentos de proteção adequados e seguindo as regras de segurança, o airsoft é muito seguro. A proteção ocular é obrigatória em todos os momentos.",
        },
      ],
    },
    {
      id: "seguranca",
      title: "Segurança",
      icon: Shield,
      questions: [
        {
          q: "Quais equipamentos de proteção são obrigatórios?",
          a: "Proteção ocular (óculos ou máscara balística) é OBRIGATÓRIA. Recomendamos também proteção facial, luvas, joelheiras e cotoveleiras.",
        },
        {
          q: "Qual o limite de FPS permitido?",
          a: "Réplicas de assalto: máximo 400 FPS. Atiradores designados: máximo 450 FPS com distância mínima de engajamento de 30m. Snipers: máximo 500 FPS com MED de 50m.",
        },
        {
          q: "O que fazer em caso de acidente?",
          a: "Todos os jogos contam com equipe médica de prontidão. Em caso de qualquer acidente, sinalize imediatamente e aguarde assistência. Temos kit de primeiros socorros em todos os eventos.",
        },
      ],
    },
    {
      id: "equipamento",
      title: "Equipamento",
      icon: Package,
      questions: [
        {
          q: "Qual a melhor réplica para começar?",
          a: "Recomendamos um rifle de assalto elétrico (AEG) como M4 ou AK47. São versáteis, confiáveis e têm peças de reposição fáceis de encontrar.",
        },
        {
          q: "Preciso comprar uniforme específico?",
          a: "Para treinar conosco, não há exigência no período Q&A. Após aprovação, o padrão GOST é Multicam ou similar. Ajudamos novos membros na aquisição.",
        },
        {
          q: "Como fazer manutenção da réplica?",
          a: "Limpeza após cada uso, lubrificação regular das partes móveis, e manutenção preventiva a cada 3 meses. Oferecemos workshops de manutenção.",
        },
      ],
    },
    {
      id: "recrutamento",
      title: "Recrutamento GOST",
      icon: Users,
      questions: [
        {
          q: "Como entrar para o GOST?",
          a: "Preencha o formulário de recrutamento, participe de 3 semanas de avaliação (Q&A), e seja aprovado por mais de 50% dos membros permanentes em votação.",
        },
        {
          q: "Qual a idade mínima?",
          a: "Mínimo de 18 anos. Menores podem participar com autorização dos pais em eventos específicos.",
        },
        {
          q: "Preciso ter equipamento completo para me candidatar?",
          a: "Não necessariamente. Avaliamos comprometimento, atitude e fit cultural. Podemos ajudar com empréstimos iniciais.",
        },
        {
          q: "Há mensalidade ou taxas?",
          a: "Não cobramos mensalidade. Cada membro paga apenas sua participação nos jogos/eventos que escolher participar.",
        },
      ],
    },
    {
      id: "jogos",
      title: "Jogos e Eventos",
      icon: Zap,
      questions: [
        {
          q: "Com que frequência vocês jogam?",
          a: "Jogos oficiais todos os domingos, das 7h às 18h. Também realizamos eventos especiais mensalmente.",
        },
        {
          q: "Posso levar convidados?",
          a: "Sim! Convidados são bem-vindos. Eles passam por briefing de segurança e podem alugar equipamento se necessário.",
        },
        {
          q: "Como funciona o sistema de pontuação?",
          a: "Pontos são ganhos por: eliminações, assistências, objetivos cumpridos, e participação. Consulte a seção de Ranking para detalhes.",
        },
      ],
    },
    {
      id: "regras",
      title: "Regras",
      icon: AlertTriangle,
      questions: [
        {
          q: "O que é fair play?",
          a: "Fair play é honestidade. Quando atingido, você deve reconhecer e sair do jogo. Não há juízes em todos os lugares, confiamos na honra de cada jogador.",
        },
        {
          q: "O que são zonas de segurança?",
          a: "Áreas onde NUNCA se pode atirar ou estar com réplica carregada. Inclui áreas de respawn, base e zonas neutras.",
        },
        {
          q: "Posso usar pirotecnia?",
          a: "Apenas granadas de airsoft aprovadas. Pirotecnia real é estritamente proibida.",
        },
      ],
    },
  ];

  const glossary = [
    {
      term: "AEG",
      definition:
        "Automatic Electric Gun - Réplica elétrica automática",
    },
    {
      term: "BB",
      definition: "Esfera plástica de 6mm usada como munição",
    },
    {
      term: "CQB",
      definition:
        "Close Quarters Battle - Combate em áreas fechadas",
    },
    {
      term: "FPS",
      definition: "Feet Per Second - Velocidade de saída do BB",
    },
    {
      term: "HopUp",
      definition:
        "Sistema que dá efeito no BB para maior alcance",
    },
    {
      term: "MED",
      definition:
        "Minimum Engagement Distance - Distância mínima de engajamento",
    },
    {
      term: "ROF",
      definition: "Rate of Fire - Taxa de disparo",
    },
    {
      term: "Respawn",
      definition:
        "Ponto onde jogadores eliminados retornam ao jogo",
    },
  ];

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-600/20 rounded-full border-2 border-amber-500/50">
              <HelpCircle className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          <h1 className="text-4xl text-white mb-4">
            FAQ - Perguntas Frequentes
          </h1>
          <p className="text-gray-400">
            Tudo o que você precisa saber sobre airsoft e o GOST
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6 mb-12">
          {faqCategories.map((category) => (
            <Card
              key={category.id}
              className="p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <category.icon className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl text-white">
                  {category.title}
                </h2>
              </div>
              <Accordion type="single" collapsible>
                {category.questions.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b border-gray-700"
                  >
                    <AccordionTrigger className="text-left text-white hover:text-amber-400 py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ))}
        </div>

        {/* Glossary */}
        <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
          <h2 className="text-2xl text-white mb-6">
            Glossário de Termos
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {glossary.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
              >
                <h3 className="text-amber-400 mb-1">
                  {item.term}
                </h3>
                <p className="text-sm text-gray-300">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact */}
        <div className="mt-8 p-6 bg-blue-600/10 border border-blue-500/30 rounded-lg text-center">
          <p className="text-blue-400 mb-2">
            Não encontrou sua resposta?
          </p>
          <p className="text-gray-300 text-sm">
            Entre em contato conosco através do email:{" "}
            <a
              href="mailto:contato@gost.com"
              className="text-amber-400 hover:underline"
            >
              contato@gost.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}