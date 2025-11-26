import React from 'react';
import { Calendar, User, Tag, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
// import { ImageWithFallback } from './figma/ImageWithFallback';

export function NoticiasSection() {
  const news = [
    {
      id: 1,
      title: 'GOST Vence Campeonato Regional de Airsoft 2025',
      excerpt: 'Equipe conquistou o primeiro lugar após intensas batalhas táticas durante todo o fim de semana.',
      content: 'Em um fim de semana memorável, o GOST demonstrou superioridade tática e trabalho em equipe impecável...',
      image: 'https://images.unsplash.com/photo-1759701546980-1211be084c70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waHklMjBhd2FyZCUyMHdpbm5lcnxlbnwxfHx8fDE3NjM0MjAxMzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Admin GOST',
      date: '15 de Setembro, 2025',
      category: 'Conquistas',
      featured: true
    },
    {
      id: 2,
      title: 'Novo Campo de Treinamento Inaugurado',
      excerpt: 'GOST agora conta com campo exclusivo para treinamentos táticos avançados.',
      content: 'A equipe inaugurou seu próprio campo de treinamento com estruturas CQB e áreas abertas...',
      image: 'https://images.unsplash.com/photo-1561449805-b12504b2bd9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMHRyYWluaW5nJTIwY291cnNlfGVufDF8fHx8MTc2MzQ2NzIzMnww&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Silva',
      date: '10 de Setembro, 2025',
      category: 'Infraestrutura',
      featured: false
    },
    {
      id: 3,
      title: 'Parceria com Lojas Especializadas Traz Descontos',
      excerpt: 'Membros GOST agora têm descontos exclusivos em equipamentos táticos.',
      content: 'Através de novas parcerias estratégicas, conseguimos descontos de até 15% em equipamentos...',
      image: 'https://images.unsplash.com/photo-1666873584465-7639d1c9e1f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWN0aWNhbCUyMGdlYXIlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzYzNDUwNzk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Costa',
      date: '5 de Setembro, 2025',
      category: 'Parcerias',
      featured: false
    },
    {
      id: 4,
      title: 'Treinamento Noturno: Novas Táticas Implementadas',
      excerpt: 'Equipe adota novas estratégias para operações noturnas com tecnologia NVG.',
      content: 'O último treinamento noturno introduziu novas táticas de infiltração e combate com visão noturna...',
      image: 'https://images.unsplash.com/photo-1759167625071-069dc252702f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMG5pZ2h0JTIwb3BlcmF0aW9uc3xlbnwxfHx8fDE3NjM0NjY4NzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Cardoso',
      date: '1 de Setembro, 2025',
      category: 'Treinamento',
      featured: false
    },
    {
      id: 5,
      title: 'Recrutamento Aberto: Buscamos Novos Operadores',
      excerpt: 'GOST abre vagas para jogadores comprometidos e disciplinados.',
      content: 'Estamos em busca de novos membros que compartilhem nossos valores de excelência...',
      image: 'https://images.unsplash.com/photo-1567093322503-341d262ad8f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtd29yayUyMHBhcnRuZXJzaGlwfGVufDF8fHx8MTc2MzQ2NzIzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Admin GOST',
      date: '28 de Agosto, 2025',
      category: 'Recrutamento',
      featured: false
    },
    {
      id: 6,
      title: 'Dicas de Manutenção: Cuide Bem de Sua Réplica',
      excerpt: 'Guia completo para manter suas réplicas em perfeito estado.',
      content: 'Aprenda as melhores práticas de limpeza e manutenção preventiva para suas réplicas...',
      image: 'https://images.unsplash.com/photo-1662699947585-6e91a43f33df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWN0aWNhbCUyMHdlYXBvbnMlMjBnZWFyfGVufDF8fHx8MTc2MzQ2NzIzMnww&ixlib=rb-4.1.0&q=80&w=1080',
      author: 'Baião',
      date: '25 de Agosto, 2025',
      category: 'Tutoriais',
      featured: false
    },
  ];

  const categories = ['Todas', 'Conquistas', 'Treinamento', 'Parcerias', 'Infraestrutura', 'Recrutamento', 'Tutoriais'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Conquistas':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50';
      case 'Treinamento':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/50';
      case 'Parcerias':
        return 'bg-green-600/20 text-green-400 border-green-500/50';
      case 'Infraestrutura':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/50';
      case 'Recrutamento':
        return 'bg-red-600/20 text-red-400 border-red-500/50';
      case 'Tutoriais':
        return 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-4">Notícias e Atualizações</h1>
          <p className="text-gray-400">
            Fique por dentro das últimas novidades do GOST
          </p>
        </div>

        {/* Featured News */}
        {news.filter(n => n.featured).map((article) => (
          <Card key={article.id} className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border-amber-600/30 mb-8">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-video md:aspect-auto">
                {/* <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                /> */}
                <Badge className="absolute top-4 left-4 bg-amber-600 text-white border-none">
                  Destaque
                </Badge>
              </div>
              <div className="p-8">
                <div className="flex gap-2 mb-4">
                  <Badge className={`${getCategoryColor(article.category)} border`}>
                    {article.category}
                  </Badge>
                </div>
                <h2 className="text-3xl text-white mb-4">{article.title}</h2>
                <p className="text-gray-300 mb-6">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{article.date}</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors">
                  Ler Mais
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:border-amber-500 hover:text-amber-400 transition-colors text-sm"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.filter(n => !n.featured).map((article) => (
            <Card key={article.id} className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border-amber-600/30 hover:border-amber-500 transition-colors group">
              <div className="relative aspect-video">
                {/* <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                /> */}
                <Badge className={`absolute top-4 right-4 ${getCategoryColor(article.category)} border`}>
                  {article.category}
                </Badge>
              </div>
              <div className="p-6">
                <h3 className="text-xl text-white mb-3 group-hover:text-amber-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{article.date}</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-sm">
                  Ler Mais
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
