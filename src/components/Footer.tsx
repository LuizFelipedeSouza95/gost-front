import React from 'react';
import { Shield, Mail, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-amber-600/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo and description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-amber-500" />
              <div>
                <h3 className="text-amber-500 tracking-wider">GOST</h3>
                <p className="text-xs text-gray-400">Airsoft Team</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Equipe tática de airsoft dedicada à excelência operacional e espírito de equipe.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-amber-400 transition-colors">Estatuto</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Calendário</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Membros</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Galeria</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Recrutamento</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">Contato</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:contato@gost.com" className="hover:text-amber-400 transition-colors">
                  contato@gost.com
                </a>
              </div>
              <div className="flex gap-4 mt-4">
                <a href="#" className="hover:text-amber-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© 2025 GOST - Ghost Operations Special Team. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
