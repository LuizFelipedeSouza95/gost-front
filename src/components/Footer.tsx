import React, { useEffect, useState } from 'react';
import { Shield, Mail, Instagram, MessageCircle } from 'lucide-react';
import { equipeService } from '../services/equipe.service';
import type { EquipeInfo } from '../services/equipe.service';

export function Footer() {
  const [equipe, setEquipe] = useState(null as EquipeInfo | null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const loadEquipe = async () => {
      try {
        const response = await equipeService.get();
        if (response.success) {
          setEquipe(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da equipe:', error);
      }
    };

    loadEquipe();
  }, []);

  // Reset logo error quando a URL da logo mudar
  useEffect(() => {
    if (equipe?.logo_url) {
      setLogoError(false);
    }
  }, [equipe?.logo_url]);

  const nomeEquipe = equipe?.nome || '';
  const significadoNome = equipe?.significado_nome || '';
  const logoUrl = equipe?.logo_url;
  const emailEquipe = equipe?.email || '';
  const descricaoEquipe = equipe?.descricao || '';

  // URLs das redes sociais - usa dados da equipe ou valores padrão
  const instagramUrl = equipe?.instagram_url || '';
  const whatsappUrl = equipe?.whatsapp_url || '';

  // Função para navegar para uma seção
  const handleNavigate = (section: string) => {
    window.dispatchEvent(new CustomEvent('changeSection', { detail: section }));
  };

  return (
    <footer className="bg-gray-900 border-t border-amber-600/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo and description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={nomeEquipe}
                  className="w-10 h-10 object-contain rounded flex-shrink-0"
                  style={{ maxWidth: '40px', maxHeight: '40px' }}
                  onError={() => {
                    console.error('Erro ao carregar logo:', logoUrl);
                    setLogoError(true);
                  }}
                  onLoad={() => {
                    setLogoError(false);
                  }}
                />
              ) : (
                <Shield className="w-8 h-8 text-amber-500 flex-shrink-0" />
              )}
              <div>
                <h3 className="text-amber-500 tracking-wider">{nomeEquipe}</h3>
                <p className="text-xs text-gray-400">{significadoNome}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              {descricaoEquipe}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => handleNavigate('estatuto')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Estatuto
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('calendario')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Calendário
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('membros')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Membros
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('galeria')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Galeria
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('recrutamento')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Recrutamento
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">Contato</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${emailEquipe}`} className="hover:text-amber-400 transition-colors">
                  {emailEquipe}
                </a>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                    <span>Instagram</span>
                  </a>
                )}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {nomeEquipe} - {significadoNome}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
