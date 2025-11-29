import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Plus, Trash2, Upload, Loader2, Folder, ChevronDown, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { galeriaService, Galeria } from '../services/galeria.service';
import { jogosService, Jogo } from '../services/jogos.service';
import { getUserInfo } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ConfirmDialog } from './ui/confirm-dialog';
import { azureBlobService } from '../services/azure-blob.service';

export function GallerySection() {
  const [images, setImages] = useState<Galeria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; imagemUrl?: string } | null>(null);

  const filters = ['Todos', 'Operação', 'Treinamento', 'Equipamento'];
  
  const getCategoryFromImage = (image: Galeria): string => {
    if (image.categoria) return image.categoria;
    if (image.is_operacao) return 'Operação';
    if (image.jogo?.nome_jogo) return 'Treinamento';
    return 'Equipamento';
  };

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

  // Agrupar imagens por álbum (usando useMemo para recalcular quando images ou activeFilter mudarem)
  const { albums, noAlbum } = React.useMemo(() => {
    const albumsMap = new Map<string, Galeria[]>();
    const noAlbumArray: Galeria[] = [];

    images.forEach((image) => {
      // Aplicar filtro de categoria
      const categoryMatch = activeFilter === 'Todos' || getCategoryFromImage(image) === activeFilter;
      if (!categoryMatch) return;

      if (image.album) {
        if (!albumsMap.has(image.album)) {
          albumsMap.set(image.album, []);
        }
        albumsMap.get(image.album)!.push(image);
      } else {
        noAlbumArray.push(image);
      }
    });

    const albumsArray = Array.from(albumsMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return { albums: albumsArray, noAlbum: noAlbumArray };
  }, [images, activeFilter]);

  // Obter imagens do álbum selecionado
  const albumImages = React.useMemo(() => {
    if (!selectedAlbum) return [];
    if (selectedAlbum === '__NO_ALBUM__') {
      return noAlbum;
    }
    return albums.find(([name]) => name === selectedAlbum)?.[1] || [];
  }, [selectedAlbum, albums, noAlbum]);

  // Obter todas as imagens filtradas para o lightbox
  const getAllFilteredImages = (): Galeria[] => {
    return images.filter(img => {
      const categoryMatch = activeFilter === 'Todos' || getCategoryFromImage(img) === activeFilter;
      return categoryMatch;
    });
  };

  const openLightbox = (image: Galeria) => {
    // Se estiver vendo um álbum específico, usar apenas as imagens desse álbum
    const imagesForLightbox = selectedAlbum ? albumImages : getAllFilteredImages();
    const index = imagesForLightbox.findIndex(img => img.id === image.id);
    setSelectedImage(index >= 0 ? index : null);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      const imagesForLightbox = selectedAlbum ? albumImages : getAllFilteredImages();
      setSelectedImage((selectedImage + 1) % imagesForLightbox.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      const imagesForLightbox = selectedAlbum ? albumImages : getAllFilteredImages();
      setSelectedImage((selectedImage - 1 + imagesForLightbox.length) % imagesForLightbox.length);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const image = images.find(img => img.id === id);
    setConfirmDelete({ id, imagemUrl: image?.imagem_url });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;

    try {
      setDeletingId(confirmDelete.id);
      const response = await galeriaService.delete(confirmDelete.id, confirmDelete.imagemUrl);
      if (response.success) {
        toast.success('Imagem excluída com sucesso!');
        await loadImages();
        // Se estava vendo um álbum e não há mais imagens, voltar para a lista
        if (selectedAlbum && albumImages.length === 1) {
          setSelectedAlbum(null);
        }
      }
    } catch (error: any) {
      toast.error('Erro ao excluir imagem: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
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

        {/* Se um álbum está selecionado, mostrar as fotos do álbum */}
        {selectedAlbum ? (
          <AlbumView
            albumName={selectedAlbum}
            images={albumImages}
            onBack={() => setSelectedAlbum(null)}
            onImageClick={openLightbox}
            onDelete={handleDeleteClick}
            deletingId={deletingId}
            isAdmin={isAdmin}
            getCategoryFromImage={getCategoryFromImage}
            formatDate={formatDate}
          />
        ) : (
          <>
            {/* Filters */}
            <div className="mb-8">
              <div className="flex justify-center gap-4 flex-wrap">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setSelectedAlbum(null);
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
            </div>

            {/* Cards de Álbuns */}
            {albums.length === 0 && noAlbum.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Cards de Álbuns */}
                {albums.map(([albumName, albumImages]) => {
                  // Pegar a primeira imagem como thumbnail
                  const thumbnail = albumImages[0];
                  return (
                    <Card
                      key={albumName}
                      className="bg-gray-800/50 border-amber-600/30 overflow-hidden cursor-pointer hover:border-amber-500 transition-all hover:scale-105"
                      onClick={() => setSelectedAlbum(albumName)}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-900">
                        {thumbnail ? (
                          <img
                            src={thumbnail.thumbnail_url || thumbnail.imagem_url}
                            alt={albumName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <Folder className="w-16 h-16 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Folder className="w-5 h-5 text-amber-400" />
                            <h3 className="text-xl text-white font-bold truncate">{albumName}</h3>
                          </div>
                          <p className="text-sm text-gray-300">
                            {albumImages.length} {albumImages.length === 1 ? 'foto' : 'fotos'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {/* Card para imagens sem álbum */}
                {noAlbum.length > 0 && (
                  <Card
                    className="bg-gray-800/50 border-amber-600/30 overflow-hidden cursor-pointer hover:border-amber-500 transition-all hover:scale-105"
                    onClick={() => setSelectedAlbum('__NO_ALBUM__')}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-900">
                      {noAlbum[0] ? (
                        <img
                          src={noAlbum[0].thumbnail_url || noAlbum[0].imagem_url}
                          alt="Sem Álbum"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <ImageIcon className="w-16 h-16 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                          <h3 className="text-xl text-white font-bold">Sem Álbum</h3>
                        </div>
                        <p className="text-sm text-gray-300">
                          {noAlbum.length} {noAlbum.length === 1 ? 'foto' : 'fotos'}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmDialog
          open={confirmDelete !== null}
          title="Excluir Imagem"
          message="Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita."
          type="delete"
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
          loading={deletingId === confirmDelete?.id}
        />

        {/* Lightbox */}
        {selectedImage !== null && (() => {
          // Se estiver vendo um álbum específico, usar apenas as imagens desse álbum
          const imagesForLightbox = selectedAlbum ? albumImages : getAllFilteredImages();
          const currentImage = imagesForLightbox[selectedImage];
          if (!currentImage) return null;
          
          return (
            <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {imagesForLightbox.length > 1 && (
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
                  src={currentImage.imagem_url}
                  alt={currentImage.titulo || 'Imagem da galeria'}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23374151" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="mt-4 text-center text-white">
                  <h2 className="text-2xl mb-2">{currentImage.titulo || 'Sem título'}</h2>
                  {currentImage.descricao && (
                    <p className="text-gray-300 mb-4">{currentImage.descricao}</p>
                  )}
                  <div className="flex items-center justify-center gap-6 text-gray-300 flex-wrap">
                    {currentImage.album && (
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        <span>{currentImage.album}</span>
                      </div>
                    )}
                    {currentImage.data_operacao && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(currentImage.data_operacao)}</span>
                      </div>
                    )}
                    {currentImage.jogo?.local_jogo && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{currentImage.jogo?.local_jogo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              loadImages();
            }}
            existingAlbums={albums.map(([name]) => name)}
          />
        )}
      </div>
    </div>
  );
}

// Componente para visualizar um álbum específico
function AlbumView({
  albumName,
  images,
  onBack,
  onImageClick,
  onDelete,
  deletingId,
  isAdmin,
  getCategoryFromImage,
  formatDate,
}: {
  albumName: string;
  images: Galeria[];
  onBack: () => void;
  onImageClick: (image: Galeria) => void;
  onDelete: (id: string, e: React.MouseEvent) => void | Promise<void>;
  deletingId: string | null;
  isAdmin: boolean;
  getCategoryFromImage: (image: Galeria) => string;
  formatDate: (dateString: string) => string;
}) {
  const displayName = albumName === '__NO_ALBUM__' ? 'Sem Álbum' : albumName;

  return (
    <div>
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl text-white font-bold">{displayName}</h2>
          <p className="text-gray-400 mt-1">
            {images.length} {images.length === 1 ? 'foto' : 'fotos'}
          </p>
        </div>
      </div>

      {/* Grid de fotos */}
      {images.length === 0 ? (
        <Card className="p-12 text-center bg-gray-800/50 border-amber-600/30">
          <p className="text-gray-400 text-lg">Este álbum não possui fotos.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg cursor-pointer aspect-[4/3] bg-gray-800"
              onClick={() => onImageClick(image)}
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
            </div>
          ))}
        </div>
      )}
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
  const [files, setFiles] = useState<File[]>([]);
  const [capaFile, setCapaFile] = useState<File | null>(null);
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

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length === 0) return;

    // Validar todos os arquivos
    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} excede 10MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setFiles(validFiles);
    }
  };

  const handleCapaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setCapaFile(selectedFile);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Por favor, selecione pelo menos uma imagem');
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
      
      // Normalizar nome do álbum para usar como pasta no Blob Storage
      const normalizedAlbumFolder = finalAlbum 
        ? azureBlobService.normalizeAlbumName(finalAlbum)
        : 'galeria';
      
      // Upload da capa primeiro, se houver
      let capaUrl: string | undefined;
      if (capaFile) {
        capaUrl = await azureBlobService.uploadImage(capaFile, normalizedAlbumFolder);
      }

      // Upload de todas as fotos
      const uploadPromises = files.map(async (file: File, index: number) => {
        // Se não houver capa e esta for a primeira foto, usar como capa
        const isFirstPhoto = index === 0 && !capaFile;
        const imagemUrl = await azureBlobService.uploadImage(file, normalizedAlbumFolder);
        
        // Para a primeira foto, usar a capa como thumbnail se houver, senão usar a própria imagem
        const thumbnailUrl = index === 0 && (capaUrl || isFirstPhoto) ? (capaUrl || imagemUrl) : undefined;
        
        return galeriaService.create(file, {
          titulo: index === 0 ? titulo || undefined : undefined,
          descricao: index === 0 ? descricao || undefined : undefined,
          categoria: categoria || undefined,
          is_operacao: categoria === 'Operação',
          jogo_id: categoria === 'Treinamento' ? jogoId : undefined,
          album: finalAlbum || undefined,
          thumbnail_url: thumbnailUrl,
        });
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} foto(s) adicionada(s) com sucesso!`);
      onSuccess();
    } catch (error: any) {
      toast.error('Erro ao adicionar fotos: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <Card className="bg-gray-900 border-gray-700 w-full max-w-[95vw] h-[55vh] flex flex-col overflow-hidden md:w-[50vw] md:h-[60vh] my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-2 sm:p-3 flex-shrink-0 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs sm:text-sm md:text-base text-white font-bold truncate flex-1 pr-2">Adicionar Fotos ao Álbum</h2>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex-shrink-0 px-2 py-1 h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4" style={{ maxHeight: 'calc(55vh - 60px)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Selecionar Fotos *</label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-amber-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFilesChange}
                  className="hidden"
                  id="files-upload"
                  multiple
                  required
                />
                <label
                  htmlFor="files-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-400 text-sm">Clique para selecionar uma ou mais imagens</span>
                  <span className="text-xs text-gray-500">Máximo 10MB por imagem</span>
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-2 text-sm text-gray-400">
                  {files.length} foto(s) selecionada(s)
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Capa do Álbum (Opcional)</label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-amber-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCapaChange}
                  className="hidden"
                  id="capa-upload"
                />
                <label
                  htmlFor="capa-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-400 text-xs">Clique para selecionar a capa</span>
                  {capaFile && (
                    <span className="text-xs text-amber-500">{capaFile.name}</span>
                  )}
                  {!capaFile && (
                    <span className="text-xs text-gray-500">Se não selecionar, a primeira foto será usada como capa</span>
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

            <div className="flex flex-row gap-2 pt-4 justify-end">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                size="sm"
                className="px-3 py-1 text-xs whitespace-nowrap"
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={uploading || files.length === 0}
                size="sm"
                className="px-3 py-1 text-xs whitespace-nowrap bg-amber-600 hover:bg-amber-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Adicionar {files.length > 0 ? `${files.length} ` : ''}Foto(s)
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
