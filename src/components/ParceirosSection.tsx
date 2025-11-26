import React, { useState, useEffect } from 'react';
import { Handshake, Star, Phone, Mail, Globe, Loader2, X, Send, MessageCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { parceirosService, type Parceiro } from '../services/parceiros.service';
import { toast } from 'sonner';
import { n8nService } from '../services/n8n.service';

export function ParceirosSection() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    loadParceiros();
  }, []);

  const loadParceiros = async () => {
    try {
      setLoading(true);
      const response = await parceirosService.list();
      if (response.success) {
        setParceiros(response.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar parceiros:', error);
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tipo?: string | null) => {
    if (!tipo) return 'bg-gray-600/20 text-gray-400 border-gray-500/50';
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('platina')) return 'bg-cyan-600/20 text-cyan-400 border-cyan-500/50';
    if (tipoLower.includes('ouro')) return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50';
    if (tipoLower.includes('prata')) return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    return 'bg-gray-600/20 text-gray-400 border-gray-500/50';
  };

  // Separar parceiros por tipo (parceiros comerciais e patrocinadores)
  const parceirosComerciais = parceiros.filter(p => !p.tipo || !p.tipo.toLowerCase().includes('patrocinador'));
  const patrocinadores = parceiros.filter(p => p.tipo && p.tipo.toLowerCase().includes('patrocinador'));

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
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-amber-600/20 rounded-full border-2 border-amber-500/50">
              <Handshake className="w-8 h-8 sm:w-12 sm:h-12 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-white mb-3 sm:mb-4">Parceiros e Patrocinadores</h1>
          <p className="text-sm sm:text-base text-gray-400">Empresas que apoiam o GOST e oferecem benefícios exclusivos</p>
        </div>

        {/* Partners */}
        {parceirosComerciais.length > 0 && (
          <>
            <h2 className="text-xl sm:text-2xl text-white mb-4 sm:mb-6">Parceiros Comerciais</h2>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {parceirosComerciais.map((parceiro) => (
                <Card key={parceiro.id} className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      {parceiro.logo_url && (
                        <img 
                          src={parceiro.logo_url} 
                          alt={parceiro.nome}
                          className="h-12 mb-2 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="text-lg sm:text-xl text-white mb-1">{parceiro.nome}</h3>
                      {parceiro.tipo && (
                        <p className="text-xs sm:text-sm text-gray-400">{parceiro.tipo}</p>
                      )}
                    </div>
                    {parceiro.tipo && (
                      <Badge className={`${getTierColor(parceiro.tipo)} ml-2 flex-shrink-0`}>
                        {parceiro.tipo}
                      </Badge>
                    )}
                  </div>

                  {parceiro.descricao && (
                    <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">{parceiro.descricao}</p>
                  )}

                  <div className="pt-3 sm:pt-4 border-t border-gray-700 space-y-2">
                    {parceiro.telefone && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{parceiro.telefone}</span>
                      </div>
                    )}
                    {parceiro.email && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <a href={`mailto:${parceiro.email}`} className="hover:text-amber-400 transition-colors truncate">
                          {parceiro.email}
                        </a>
                      </div>
                    )}
                    {parceiro.website && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <a 
                          href={parceiro.website.startsWith('http') ? parceiro.website : `https://${parceiro.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-amber-400 transition-colors truncate"
                        >
                          {parceiro.website}
                        </a>
                      </div>
                    )}
                    {parceiro.endereco && (
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-400">
                        <span className="flex-shrink-0">📍</span>
                        <span>{parceiro.endereco}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Sponsors */}
        {patrocinadores.length > 0 && (
          <Card className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
            <h2 className="text-xl sm:text-2xl text-white mb-4 sm:mb-6">Patrocinadores</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {patrocinadores.map((patrocinador) => (
                <div key={patrocinador.id} className="text-center p-4 sm:p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                  {patrocinador.logo_url ? (
                    <img 
                      src={patrocinador.logo_url} 
                      alt={patrocinador.nome}
                      className="h-16 mx-auto mb-3 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-4xl sm:text-5xl mb-3">🤝</div>
                  )}
                  <h3 className="text-white mb-2 text-sm sm:text-base">{patrocinador.nome}</h3>
                  {patrocinador.descricao && (
                    <p className="text-xs sm:text-sm text-gray-400">{patrocinador.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-500/50 text-center">
          <h3 className="text-xl sm:text-2xl text-white mb-2 sm:mb-3">Quer se tornar um parceiro?</h3>
          <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">
            Entre em contato conosco para discutir oportunidades de parceria e patrocínio
          </p>
          <Button
            onClick={() => setShowContactModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Falar com Nossa Equipe
          </Button>
        </Card>
      </div>

      {/* Modal de Contato */}
      {showContactModal && (
        <ContatoParceiroModal
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}

// Componente Modal de Contato para Parcerias
function ContatoParceiroModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sending, setSending] = useState(false);

  const maskPhoneBR = (value: string) => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (!ddd) return '';
    if (rest.length > 5) {
      if (digits.length === 11) {
        const p1 = rest.slice(0, 5);
        const p2 = rest.slice(5, 9);
        return `(${ddd}) ${p1}${p2 ? '-' + p2 : ''}`;
      }
    }
    const p1 = rest.slice(0, 4);
    const p2 = rest.slice(4, 8);
    return `(${ddd}) ${p1}${p2 ? '-' + p2 : ''}`;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhoneBR(e.target.value);
    setWhatsapp(masked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !email.trim() || !descricao.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSending(true);
      
      // Enviar email via n8n para a equipe
      n8nService.enviarEmailParceria({
        tipo: 'mensagem_parceria',
        contato: {
          nome: nome.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || undefined,
          descricao: descricao.trim(),
        },
      }).catch((error) => {
        console.warn('Erro ao enviar email de parceria:', error);
      });
      
      // Criar link do WhatsApp com a mensagem formatada (opcional, como backup)
      const mensagem = `Olá! Meu nome é ${nome.trim()}.\n\nEmail: ${email.trim()}\n${whatsapp ? `WhatsApp: ${whatsapp.trim()}\n` : ''}\nMensagem:\n${descricao.trim()}`;
      const whatsappLink = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;
      
      // Abrir WhatsApp como backup
      window.open(whatsappLink, '_blank');
      
      toast.success('Mensagem enviada com sucesso! A equipe entrará em contato em breve.');
      
      // Limpar formulário
      setNome('');
      setEmail('');
      setWhatsapp('');
      setDescricao('');
      
      // Fechar modal após um delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      toast.error('Erro ao enviar mensagem: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="bg-gray-900 border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl text-white font-bold">
              Entre em Contato
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nome *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Descrição da Proposta *</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Conte-nos sobre sua proposta de parceria..."
                rows={6}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={sending}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={sending}
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
