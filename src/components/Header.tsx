import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Shield, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { isAuthenticated, getUserInfo, logout } from '../utils/auth';
import { equipeService } from '../services/equipe.service';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

interface UserData {
  name?: string;
  picture?: string;
  email?: string;
  roles?: string[];
}

export function Header({ activeSection, setActiveSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [equipeNome, setEquipeNome] = useState<string>('GOST');
  const [equipeSignificado, setEquipeSignificado] = useState<string>('Airsoft Team');

  const mainMenuItems = [
    // { id: 'login', label: 'Login' },
    { id: 'estatuto', label: 'Estatuto' },

    { id: 'calendario', label: 'Calendário' },
  ];

  const moreMenuItems = [
    { id: 'inicio', label: 'Início' },

    { id: 'galeria', label: 'Galeria' },
    { id: 'membros', label: 'Membros' },
    { id: 'agenda', label: 'Agenda' },
    // { id: 'noticias', label: 'Notícias' },
    // { id: 'faq', label: 'FAQ' },
    // { id: 'treinamento', label: 'Treinamento' },
    // { id: 'parceiros', label: 'Parceiros' },
    // { id: 'mapa', label: 'Mapa' },
    { id: 'recrutamento', label: 'Recrutamento' },
  ];

  const allMenuItems = [...mainMenuItems, ...moreMenuItems];

  const loadEquipeData = async () => {
    try {
      const response = await equipeService.get();
      if (response.success && response.data) {
        if (response.data.nome) {
          setEquipeNome(response.data.nome);
        }
        if (response.data.significado_nome) {
          setEquipeSignificado(response.data.significado_nome);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da equipe:', error);
    }
  };

  useEffect(() => {
    loadEquipeData();
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        setIsLoggedIn(authenticated);

        if (authenticated) {
          const userData = await getUserInfo();
          if (userData) {
            setUserData(userData);
            setIsAdmin(userData.roles?.includes('admin') || false);
            setImageError(false);
          } else {
            setUserData(null);
            setImageError(false);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkAuth();

    const handleAuthSuccess = async (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.userData) {
        const userData = customEvent.detail.userData;
        setUserData(userData);
        setIsAdmin(userData.roles?.includes('admin') || false);
        setIsLoggedIn(true);
        setImageError(false);
      } else {
        await checkAuth();
      }
    };

    // Fechar dropdown ao clicar fora
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Verifica se o clique foi fora do dropdown e do botão que abre o dropdown
      if (userDropdownOpen && !target.closest('[data-user-dropdown]') && !target.closest('[data-user-button]')) {
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener('auth-success', handleAuthSuccess);
    window.addEventListener('click', handleClickOutside);
    const interval = setInterval(checkAuth, 30000);

    return () => {
      window.removeEventListener('auth-success', handleAuthSuccess);
      window.removeEventListener('click', handleClickOutside);
      clearInterval(interval);
    };
  }, [userDropdownOpen]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-amber-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {isLoggedIn && userData ? (
            <div className="relative" data-user-dropdown>
              <button
                data-user-button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {userData.picture && !imageError ? (
                  <img
                    src={userData.picture}
                    alt={userData.name || 'Usuário'}
                    className="w-10 h-10 rounded-full border-2 border-amber-500/50 object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-amber-500/50 bg-gray-700 flex items-center justify-center">
                    <User className="w-6 h-6 text-amber-500" />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <h1 className="text-amber-500 tracking-wider text-sm font-medium">
                    {userData.name || 'Usuário'}
                  </h1>
                  <p className="text-xs text-gray-400">{userData.email}</p>
                </div>
              </button>

              {userDropdownOpen && (
                <>
                  {createPortal(
                    <div
                      className="fixed inset-0 z-[45]"
                      onClick={() => setUserDropdownOpen(false)}
                    />,
                    document.body
                  )}
                  <div 
                    data-user-dropdown
                    className="absolute top-full left-0 mt-2 w-56 bg-gray-800 border border-amber-600/30 rounded-lg shadow-xl z-[60] py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm text-white font-medium">{userData.name || 'Usuário'}</p>
                      <p className="text-xs text-gray-400 truncate">{userData.email}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveSection('configuracoes');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center cursor-pointer" onClick={() => setActiveSection('inicio')}>
              <img src="/path_gost.svg" alt={equipeNome} className="w-16 h-16 text-amber-500" />
              <div>
                <h1 className="text-amber-500 tracking-wider">{equipeNome}</h1>
                <p className="text-xs text-gray-400">{equipeSignificado}</p>
              </div>
            </div>
          )}

          <nav className="hidden lg:flex items-center gap-6">
            {mainMenuItems
              .filter(item => item.id !== 'login')
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`transition-colors ${activeSection === item.id
                    ? 'text-amber-500'
                    : 'text-gray-300 hover:text-amber-400'
                    }`}
                >
                  {item.label}
                </button>
              ))}

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors"
              >
                Mais
                <ChevronDown className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <>
                  {createPortal(
                    <div
                      className="fixed inset-0 z-[45]"
                      onClick={() => setDropdownOpen(false)}
                    />,
                    document.body
                  )}
                  <div 
                    className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-amber-600/30 rounded-lg shadow-xl z-[60] py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {moreMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 transition-colors ${activeSection === item.id
                          ? 'bg-amber-600/20 text-amber-500'
                          : 'text-gray-300 hover:bg-gray-700'
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="lg:hidden flex items-center gap-3">
            <button
              className="text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          {createPortal(
            <div
              className="fixed inset-0 bg-black/50 z-[45] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />,
            document.body
          )}
          <div 
            className="lg:hidden bg-gray-800 border-t border-amber-600/30 max-h-[80vh] overflow-y-auto relative z-[60]"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="px-4 py-4 space-y-2">
            {allMenuItems
              .filter(item => item.id !== 'login')
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded transition-colors ${activeSection === item.id
                    ? 'bg-amber-600/20 text-amber-500'
                    : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            {isLoggedIn && isAdmin && (
              <button
                onClick={() => {
                  setActiveSection('configuracoes');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded transition-colors text-gray-300 hover:bg-gray-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurações
              </button>
            )}
            {isLoggedIn && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded transition-colors text-red-400 hover:bg-red-900/20 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            )}
          </nav>
          </div>
        </>
      )}
    </header>
  );
}
