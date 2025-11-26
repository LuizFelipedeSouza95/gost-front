import React from 'react';
import { Handshake, Star, Phone, Mail } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export function ParceirosSection() {
  const partners = [
    {
      name: 'Airsoft Brasil Store',
      category: 'Loja de Equipamentos',
      discount: '15%',
      description: 'Maior variedade de réplicas e acessórios do Brasil',
      benefits: ['Desconto em todas as réplicas', 'Frete grátis acima de R$ 500', 'Atendimento prioritário'],
      contact: { phone: '(11) 98765-4321', email: 'contato@airsoftbrasil.com.br' },
      tier: 'Ouro'
    },
    {
      name: 'Tática Militar',
      category: 'Uniformes e Equipamentos',
      discount: '10%',
      description: 'Uniformes táticos de alta qualidade',
      benefits: ['Desconto em uniformes', 'Customização gratuita', 'Consultoria de equipamento'],
      contact: { phone: '(11) 91234-5678', email: 'vendas@taticamilitar.com.br' },
      tier: 'Prata'
    },
    {
      name: 'Armory Shop',
      category: 'Peças e Upgrades',
      discount: '12%',
      description: 'Especializada em upgrades e manutenção',
      benefits: ['Desconto em peças', 'Manutenção com preço especial', 'Consultoria técnica'],
      contact: { phone: '(11) 99876-5432', email: 'suporte@armoryshop.com.br' },
      tier: 'Ouro'
    },
    {
      name: 'Campo Tático Alpha',
      category: 'Campo de Airsoft',
      discount: '20%',
      description: 'Campo profissional com estrutura completa',
      benefits: ['Desconto em mensalidade', 'Acesso prioritário', 'Vestiário exclusivo'],
      contact: { phone: '(11) 94567-8901', email: 'reservas@campoalpha.com.br' },
      tier: 'Platina'
    },
  ];

  const sponsors = [
    { name: 'Tech Optics', logo: '🔭', contribution: 'Equipamentos ópticos' },
    { name: 'PowerBB', logo: '⚡', contribution: 'Munição oficial' },
    { name: 'TacGear Pro', logo: '🎒', contribution: 'Mochilas e coletes' },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platina': return 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50';
      case 'Ouro': return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50';
      case 'Prata': return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-600/20 rounded-full border-2 border-amber-500/50">
              <Handshake className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          <h1 className="text-4xl text-white mb-4">Parceiros e Patrocinadores</h1>
          <p className="text-gray-400">Empresas que apoiam o GOST e oferecem benefícios exclusivos</p>
        </div>

        {/* Partners */}
        <h2 className="text-2xl text-white mb-6">Parceiros Comerciais</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {partners.map((partner, i) => (
            <Card key={i} className="p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl text-white mb-1">{partner.name}</h3>
                  <p className="text-sm text-gray-400">{partner.category}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className={getTierColor(partner.tier)}>{partner.tier}</Badge>
                  <Badge className="bg-green-600/20 text-green-400 border-green-500/50">
                    {partner.discount} OFF
                  </Badge>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">{partner.description}</p>

              <div className="mb-4">
                <h4 className="text-white text-sm mb-2">Benefícios:</h4>
                <ul className="space-y-1">
                  {partner.benefits.map((benefit, j) => (
                    <li key={j} className="text-sm text-gray-400 flex items-start gap-2">
                      <Star className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-700 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{partner.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${partner.contact.email}`} className="hover:text-amber-400 transition-colors">
                    {partner.contact.email}
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Sponsors */}
        <Card className="p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
          <h2 className="text-2xl text-white mb-6">Patrocinadores</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sponsors.map((sponsor, i) => (
              <div key={i} className="text-center p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="text-5xl mb-3">{sponsor.logo}</div>
                <h3 className="text-white mb-2">{sponsor.name}</h3>
                <p className="text-sm text-gray-400">{sponsor.contribution}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-500/50 text-center">
          <h3 className="text-2xl text-white mb-3">Quer se tornar um parceiro?</h3>
          <p className="text-gray-300 mb-4">
            Entre em contato conosco para discutir oportunidades de parceria e patrocínio
          </p>
          <a
            href="mailto:parcerias@gost.com"
            className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            Falar com Nossa Equipe
          </a>
        </Card>
      </div>
    </div>
  );
}
