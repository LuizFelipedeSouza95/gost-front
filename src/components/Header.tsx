import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { isAuthenticated, getUserInfo, logout } from '../utils/auth';

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

  const mainMenuItems = [
    { id: 'login', label: 'Login' },
    { id: 'inicio', label: 'Início' },
    { id: 'estatuto', label: 'Estatuto' },
    { id: 'membros', label: 'Membros' },
    { id: 'calendario', label: 'Calendário' },
  ];

  const moreMenuItems = [
    { id: 'galeria', label: 'Galeria' },
    { id: 'noticias', label: 'Notícias' },
    { id: 'faq', label: 'FAQ' },
    // { id: 'treinamento', label: 'Treinamento' },
    { id: 'parceiros', label: 'Parceiros' },
    { id: 'mapa', label: 'Mapa' },
    { id: 'recrutamento', label: 'Recrutamento' },
  ];

  const allMenuItems = [...mainMenuItems, ...moreMenuItems];

  useEffect(() => {
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

    window.addEventListener('auth-success', handleAuthSuccess);
    const interval = setInterval(checkAuth, 30000);

    return () => {
      window.removeEventListener('auth-success', handleAuthSuccess);
      clearInterval(interval);
    };
  }, []);

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
            <div className="relative">
              <button
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
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 border border-amber-600/30 rounded-lg shadow-xl z-20 py-2">
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
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection('inicio')}>
              <img src="/path_gost.svg" alt="GOST" className="w-10 h-10 text-amber-500" />
              <div>
                <h1 className="text-amber-500 tracking-wider">GOST</h1>
                <p className="text-xs text-gray-400">Airsoft Team</p>
              </div>
            </div>
          )}

          <nav className="hidden lg:flex items-center gap-6">
            {mainMenuItems
              .filter(item => {
                if (!isLoggedIn) {
                  return item.id === 'login' || item.id === 'inicio';
                }
                return item.id !== 'login';
              })
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
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-amber-600/30 rounded-lg shadow-xl z-20 py-2">
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
        <div className="lg:hidden bg-gray-800 border-t border-amber-600/30 max-h-[80vh] overflow-y-auto">
          <nav className="px-4 py-4 space-y-2">
            {allMenuItems
              .filter(item => {
                if (!isLoggedIn) {
                  return item.id === 'login' || item.id === 'inicio';
                }
                return item.id !== 'login';
              })
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
      )}
    </header>
  );
}
