import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Plus, Trash2, Upload, Loader2, Folder } from 'lucide-react';
import { galeriaService, Galeria } from '../services/galeria.service';
import { jogosService, Jogo } from '../services/jogos.service';
import { getUserInfo } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function GallerySection() {
  const [images, setImages] = useState<Galeria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filters = ['Todos', 'Operação', 'Treinamento', 'Equipamento'];
  
  // Extrair álbuns únicos das imagens
  const albums = Array.from(new Set(images.map(img => img.album).filter(Boolean) as string[])).sort();

  useEffect(() => {
    checkAdmin();
    loadImages();
  }, []);

  const checkAdmin = async () => {
    try {
      const user = await getUserInfo();
      setIsAdmin(user?.roles?.includes('admin') || false);
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
    }
  };

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await galeriaService.list();
      if (response.success && response.data) {
        setImages(response.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar imagens:', error);
      toast.error('Erro ao carregar galeria');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromImage = (image: Galeria): string => {
    if (image.categoria) return image.categoria;
    if (image.is_operacao) return 'Operação';
    if (image.jogo?.nome_jogo) return 'Treinamento';
    return 'Equipamento';
  };

  const filteredImages = images.filter(img => {
    // Filtro por categoria
    const categoryMatch = activeFilter === 'Todos' || getCategoryFromImage(img) === activeFilter;
    // Filtro por álbum
    const albumMatch = !activeAlbum || img.album === activeAlbum;
    return categoryMatch && albumMatch;
  });

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await galeriaService.delete(id);
      if (response.success) {
        toast.success('Imagem excluída com sucesso!');
        loadImages();
      }
    } catch (error: any) {
      toast.error('Erro ao excluir imagem: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
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
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-4">Galeria de Operações</h1>
          <p className="text-gray-400">
            Registros das nossas operações, treinamentos e eventos
          </p>
        </div>

        {/* Botão de adicionar (apenas admin) */}
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Foto
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-center gap-4 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setActiveAlbum(null); // Reset album filter when changing category
                }}
                className={`px-6 py-2 rounded-lg transition-all ${
                  activeFilter === filter
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          {/* Album Filter */}
          {albums.length > 0 && (
            <div className="flex justify-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveAlbum(null)}
                className={`px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 ${
                  !activeAlbum
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <Folder className="w-4 h-4" />
                Todos os Álbuns
              </button>
              {albums.map((album) => (
                <button
                  key={album}
                  onClick={() => setActiveAlbum(album)}
                  className={`px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 ${
                    activeAlbum === album
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  {album}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Grid ou Mensagem vazia */}
        {filteredImages.length === 0 ? (
          <Card className="p-12 text-center bg-gray-800/50 border-amber-600/30">
            <p className="text-gray-400 text-lg mb-4">
              {activeFilter === 'Todos'
                ? 'Ainda não há fotos na galeria.'
                : `Não há fotos na categoria "${activeFilter}".`}
            </p>
            {isAdmin && activeFilter === 'Todos' && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Foto
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-lg cursor-pointer aspect-[4/3] bg-gray-800"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.thumbnail_url || image.imagem_url}
                  alt={image.titulo || 'Imagem da galeria'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="mb-2 font-semibold">{image.titulo || 'Sem título'}</h3>
                    {image.descricao && (
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">{image.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-300 flex-wrap">
                      {image.album && (
                        <div className="flex items-center gap-1">
                          <Folder className="w-4 h-4" />
                          <span className="truncate max-w-[150px]">{image.album}</span>
                        </div>
                      )}
                      {image.data_operacao && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(image.data_operacao)}</span>
                        </div>
                      )}
                      {image.jogo?.local_jogo && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[150px]">{image.jogo.local_jogo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-amber-600/90 text-white">
                    {getCategoryFromImage(image)}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(image.id, e)}
                    disabled={deletingId === image.id}
                    className="absolute top-4 left-4 p-2 bg-red-600/90 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Excluir imagem"
                  >
                    {deletingId === image.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {selectedImage !== null && filteredImages[selectedImage] && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            <div className="max-w-5xl w-full">
              <img
                src={filteredImages[selectedImage].imagem_url}
                alt={filteredImages[selectedImage].titulo || 'Imagem da galeria'}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23374151" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="mt-4 text-center text-white">
                <h2 className="text-2xl mb-2">{filteredImages[selectedImage].titulo || 'Sem título'}</h2>
                {filteredImages[selectedImage].descricao && (
                  <p className="text-gray-300 mb-4">{filteredImages[selectedImage].descricao}</p>
                )}
                <div className="flex items-center justify-center gap-6 text-gray-300 flex-wrap">
                  {filteredImages[selectedImage].album && (
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      <span>{filteredImages[selectedImage].album}</span>
                    </div>
                  )}
                  {filteredImages[selectedImage].data_operacao && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(filteredImages[selectedImage].data_operacao)}</span>
                    </div>
                  )}
                  {filteredImages[selectedImage].jogo?.local_jogo && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{filteredImages[selectedImage].jogo?.local_jogo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              loadImages();
            }}
            existingAlbums={albums}
          />
        )}
      </div>
    </div>
  );
}

// Componente de Modal para Upload
function UploadModal({ 
  onClose, 
  onSuccess,
  existingAlbums = []
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  existingAlbums?: string[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Operação');
  const [album, setAlbum] = useState('');
  const [newAlbum, setNewAlbum] = useState('');
  const [useNewAlbum, setUseNewAlbum] = useState(existingAlbums.length === 0);
  const [jogoId, setJogoId] = useState<string>('');
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loadingJogos, setLoadingJogos] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (categoria === 'Treinamento') {
      loadAvailableJogos();
    }
  }, [categoria]);

  useEffect(() => {
    // Se não há álbuns existentes, forçar criação de novo
    if (existingAlbums.length === 0) {
      setUseNewAlbum(true);
    }
  }, [existingAlbums.length]);

  const loadAvailableJogos = async () => {
    try {
      setLoadingJogos(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar jogos scheduled e completed
      const [scheduledResponse, completedResponse] = await Promise.all([
        jogosService.list('scheduled'),
        jogosService.list('completed')
      ]);

      const allJogos: Jogo[] = [
        ...(scheduledResponse.success && scheduledResponse.data ? scheduledResponse.data : []),
        ...(completedResponse.success && completedResponse.data ? completedResponse.data : [])
      ];

      // Filtrar apenas jogos que já passaram ou são hoje
      const availableJogos = allJogos.filter((jogo: Jogo) => {
        if (!jogo.data_jogo) return false;
        
        const dateStr = jogo.data_jogo.split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        const jogoDate = new Date(year, month - 1, day);
        jogoDate.setHours(0, 0, 0, 0);
        
        // Incluir apenas jogos de hoje ou passados (não cancelados)
        return jogoDate <= today && jogo.status !== 'cancelled';
      });

      // Ordenar por data (mais recente primeiro)
      availableJogos.sort((a, b) => {
        if (!a.data_jogo || !b.data_jogo) return 0;
        return new Date(b.data_jogo).getTime() - new Date(a.data_jogo).getTime();
      });

      setJogos(availableJogos);
    } catch (error: any) {
      console.error('Erro ao carregar jogos:', error);
      toast.error('Erro ao carregar jogos disponíveis');
    } finally {
      setLoadingJogos(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 10MB');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validação para Treinamento
    if (categoria === 'Treinamento' && !jogoId) {
      toast.error('Por favor, selecione um treinamento do calendário');
      return;
    }

    // Validação para álbum (obrigatório)
    const finalAlbum = useNewAlbum ? newAlbum.trim() : album;
    if (!finalAlbum) {
      toast.error('Por favor, informe ou selecione um álbum');
      return;
    }

    try {
      setUploading(true);
      await galeriaService.create(file, {
        titulo: titulo || undefined,
        descricao: descricao || undefined,
        categoria: categoria || undefined,
        is_operacao: categoria === 'Operação',
        jogo_id: categoria === 'Treinamento' ? jogoId : undefined,
        album: finalAlbum || undefined,
      });
      toast.success('Foto adicionada com sucesso!');
      onSuccess();
    } catch (error: any) {
      toast.error('Erro ao adicionar foto: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl text-white font-bold">Adicionar Foto à Galeria</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Selecionar Imagem *</label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-amber-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400" />
                      <span className="text-gray-400">Clique para selecionar uma imagem</span>
                      <span className="text-xs text-gray-500">Máximo 10MB</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Título da foto (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Descrição da foto (opcional)"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  setJogoId(''); // Reset jogo selection when changing category
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="Operação">Operação</option>
                <option value="Treinamento">Treinamento</option>
                <option value="Equipamento">Equipamento</option>
              </select>
            </div>

            {/* Seleção de Treinamento */}
            {categoria === 'Treinamento' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Treinamento do Calendário *
                </label>
                {loadingJogos ? (
                  <div className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando treinamentos...
                  </div>
                ) : jogos.length === 0 ? (
                  <div className="w-full px-3 py-2 bg-gray-800 border border-red-700 rounded-lg text-red-400">
                    Nenhum treinamento disponível. Apenas treinamentos do dia ou anteriores podem ser selecionados.
                  </div>
                ) : (
                  <select
                    value={jogoId}
                    onChange={(e) => setJogoId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    required
                  >
                    <option value="">Selecione um treinamento</option>
                    {jogos.map((jogo) => {
                      const dateStr = jogo.data_jogo ? jogo.data_jogo.split('T')[0] : '';
                      const [year, month, day] = dateStr ? dateStr.split('-').map(Number) : [0, 0, 0];
                      const jogoDate = dateStr ? new Date(year, month - 1, day) : null;
                      const formattedDate = jogoDate ? jogoDate.toLocaleDateString('pt-BR') : 'Sem data';
                      
                      return (
                        <option key={jogo.id} value={jogo.id}>
                          {jogo.nome_jogo} - {formattedDate}
                          {jogo.status === 'completed' ? ' (Concluído)' : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}

            {/* Seleção de Álbum */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Álbum *</label>
              <div className="space-y-3">
                {existingAlbums.length > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="existing-album"
                        checked={!useNewAlbum}
                        onChange={() => {
                          setUseNewAlbum(false);
                          setNewAlbum('');
                        }}
                        className="w-4 h-4 text-amber-600"
                      />
                      <label htmlFor="existing-album" className="text-gray-300">
                        Selecionar álbum existente
                      </label>
                    </div>
                    {!useNewAlbum && (
                      <select
                        value={album}
                        onChange={(e) => setAlbum(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="">Selecione um álbum</option>
                        {existingAlbums.map((alb) => (
                          <option key={alb} value={alb}>
                            {alb}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="new-album"
                    checked={useNewAlbum || existingAlbums.length === 0}
                    onChange={() => {
                      setUseNewAlbum(true);
                      setAlbum('');
                    }}
                    className="w-4 h-4 text-amber-600"
                  />
                  <label htmlFor="new-album" className="text-gray-300">
                    {existingAlbums.length === 0 ? 'Criar álbum (nenhum álbum existente)' : 'Criar novo álbum'}
                  </label>
                </div>
                {(useNewAlbum || existingAlbums.length === 0) && (
                  <input
                    type="text"
                    value={newAlbum}
                    onChange={(e) => setNewAlbum(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Nome do novo álbum"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={uploading || !file}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Adicionar Foto
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={uploading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
