import React, { useState, useEffect } from 'react';
import { Calendar, User, Tag, ChevronRight, X, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { noticiasService, type Noticia } from '../services/noticias.service';
import { toast } from 'sonner';

export function NoticiasSection() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);
  const [categories, setCategories] = useState<string[]>(['Todas']);

  useEffect(() => {
    loadNoticias();
  }, []);

  const loadNoticias = async () => {
    try {
      setLoading(true);
      // Sempre buscar todas as notícias publicadas, sem filtro de categoria
      const response = await noticiasService.list(undefined, true);
      if (response.success) {
        // Filtrar apenas notícias publicadas
        const noticiasPublicadas = response.data.filter(n => n.publicado === true);
        setNoticias(noticiasPublicadas);
        // Extrair categorias únicas das notícias publicadas
        const uniqueCategories = Array.from(
          new Set(noticiasPublicadas.map(n => n.categoria).filter(Boolean) as string[])
        );
        setCategories(['Todas', ...uniqueCategories.sort()]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar notícias:', error);
      toast.error('Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const filteredNoticias = noticias.filter(n => {
    if (activeCategory === 'Todas') return true;
    // Comparação case-insensitive e trim para evitar problemas de espaços
    const noticiaCategoria = (n.categoria || '').trim();
    const categoriaAtiva = activeCategory.trim();
    return noticiaCategoria.toLowerCase() === categoriaAtiva.toLowerCase();
  });

  // Notícia destacada é APENAS a que tem destaque=true
  const featuredNoticia = filteredNoticias.find(n => n.destaque === true) || null;
  // Todas as outras notícias (incluindo as que não são destaque)
  const regularNoticias = featuredNoticia 
    ? filteredNoticias.filter(n => n.id !== featuredNoticia.id)
    : filteredNoticias;

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

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-white mb-3 sm:mb-4">Notícias e Atualizações</h1>
          <p className="text-sm sm:text-base text-gray-400">
            Fique por dentro das últimas novidades do GOST
          </p>
        </div>

        {/* Featured News */}
        {featuredNoticia && (
          <Card className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border-amber-600/30 mb-6 sm:mb-8 group">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-video md:aspect-auto md:h-full min-h-[200px] sm:min-h-[300px]">
                {featuredNoticia.imagem_url ? (
                  <img
                    src={featuredNoticia.imagem_url}
                    alt={featuredNoticia.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23374151" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500">Sem imagem</span>
                  </div>
                )}
                <Badge className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-amber-600 text-white border-none text-xs sm:text-sm">
                  Destaque
                </Badge>
              </div>
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex gap-2 mb-3 sm:mb-4 flex-wrap">
                  {featuredNoticia.categoria && (
                    <Badge className={`${getCategoryColor(featuredNoticia.categoria)} border text-xs sm:text-sm`}>
                      {featuredNoticia.categoria}
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl text-white mb-3 sm:mb-4">{featuredNoticia.titulo}</h2>
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 line-clamp-3">
                  {featuredNoticia.resumo || featuredNoticia.conteudo.substring(0, 150) + '...'}
                </p>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 flex-wrap">
                  {featuredNoticia.autor_nome && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{featuredNoticia.autor_nome}</span>
                    </div>
                  )}
                  {featuredNoticia.data_publicacao && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDate(featuredNoticia.data_publicacao)}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedNoticia(featuredNoticia)}
                  className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-sm sm:text-base"
                >
                  Ler Mais
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                activeCategory === cat
                  ? 'bg-amber-600 text-white border border-amber-500'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:border-amber-500 hover:text-amber-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {regularNoticias.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {regularNoticias.map((noticia) => (
              <Card
                key={noticia.id}
                className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border-amber-600/30 hover:border-amber-500 transition-colors group cursor-pointer"
                onClick={() => setSelectedNoticia(noticia)}
              >
                <div className="relative aspect-video">
                  {noticia.imagem_url ? (
                    <img
                      src={noticia.imagem_url}
                      alt={noticia.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Sem imagem</span>
                    </div>
                  )}
                  {noticia.categoria && (
                    <Badge className={`absolute top-2 sm:top-4 right-2 sm:right-4 ${getCategoryColor(noticia.categoria)} border text-xs`}>
                      {noticia.categoria}
                    </Badge>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl text-white mb-2 sm:mb-3 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {noticia.titulo}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {noticia.resumo || noticia.conteudo.substring(0, 100) + '...'}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 mb-3 sm:mb-4 flex-wrap">
                    {noticia.autor_nome && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[100px] sm:max-w-none">{noticia.autor_nome}</span>
                      </div>
                    )}
                    {noticia.data_publicacao && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(noticia.data_publicacao)}</span>
                      </div>
                    )}
                  </div>
                  <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors text-xs sm:text-sm">
                    Ler Mais
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Notícia Completa */}
        {selectedNoticia && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-4xl w-full bg-gray-900 rounded-lg border border-gray-700 my-8">
              <div className="relative">
                <button
                  onClick={() => setSelectedNoticia(null)}
                  className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                {selectedNoticia.imagem_url && (
                  <div className="relative aspect-video w-full">
                    <img
                      src={selectedNoticia.imagem_url}
                      alt={selectedNoticia.titulo}
                      className="w-full h-full object-cover rounded-t-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23374151" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                )}
                <div className="p-6 sm:p-8">
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {selectedNoticia.categoria && (
                      <Badge className={`${getCategoryColor(selectedNoticia.categoria)} border`}>
                        {selectedNoticia.categoria}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl text-white mb-4">{selectedNoticia.titulo}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap">
                    {selectedNoticia.autor_nome && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{selectedNoticia.autor_nome}</span>
                      </div>
                    )}
                    {selectedNoticia.data_publicacao && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedNoticia.data_publicacao)}</span>
                      </div>
                    )}
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedNoticia.conteudo}
                    </p>
                  </div>
                  {selectedNoticia.tags && selectedNoticia.tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {selectedNoticia.tags.map((tag, index) => (
                        <Badge key={index} className="bg-gray-700 text-gray-300 border-gray-600">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
