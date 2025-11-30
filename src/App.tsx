import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Login } from './components/Login';
import { TopicSection } from './components/TopicSection';
import { Calendar } from './components/CalendarSection';
import { MembersSection } from './components/MembersSection';
import { GallerySection } from './components/GallerySection';
import { RecruitmentSection } from './components/RecruitmentSection';
import { RecruitmentAdminSection } from './components/RecruitmentAdminSection';
// import { RankingSection } from './components/RankingSection';
// import { HistoricoSection } from './components/HistoricoSection';
// import { ArsenalSection } from './components/ArsenalSection';
import { NoticiasSection } from './components/NoticiasSection';
// import { ConquistasSection } from './components/ConquistasSection';
import { FAQSection } from './components/FAQSection';
// import { PlacarSection } from './components/PlacarSection';
import { TreinamentoSection } from './components/TreinamentoSection';
import { ParceirosSection } from './components/ParceirosSection';
// import { MapaSection } from './components/MapaSection';
import { ConfiguracoesSection } from './components/ConfiguracoesSection';
import { AgendaSection } from './components/AgendaSection';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeSection, setActiveSection] = useState('inicio');

  React.useEffect(() => {
    const handleSectionChange = (e: CustomEvent) => {
      setActiveSection(e.detail);
    };
    window.addEventListener('changeSection' as any, handleSectionChange as EventListener);
    return () => {
      window.removeEventListener('changeSection' as any, handleSectionChange as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />

      {activeSection === 'inicio' && <Hero setActiveSection={setActiveSection} />}
      {activeSection === 'login' && <Login setActiveSection={setActiveSection} />}
      {activeSection === 'estatuto' && <TopicSection />}
      {activeSection === 'calendario' && <Calendar />}
      {activeSection === 'membros' && <MembersSection />}
      {activeSection === 'galeria' && <GallerySection />}
      {/* {activeSection === 'ranking' && <RankingSection />} */}
      {/* {activeSection === 'historico' && <HistoricoSection />} */}
      {/* {activeSection === 'arsenal' && <ArsenalSection />} */}
      {activeSection === 'noticias' && <NoticiasSection />}
      {/* {activeSection === 'conquistas' && <ConquistasSection />} */}
      {activeSection === 'faq' && <FAQSection />}
      {/* {activeSection === 'placar' && <PlacarSection />} */}
      {activeSection === 'treinamento' && <TreinamentoSection />}
      {activeSection === 'parceiros' && <ParceirosSection />}
      {/* {activeSection === 'mapa' && <MapaSection />} */}
      {activeSection === 'recrutamento' && <RecruitmentSection />}
      {activeSection === 'recrutamento-admin' && <RecruitmentAdminSection />}
      {activeSection === 'agenda' && <AgendaSection />}
      {activeSection === 'configuracoes' && <ConfiguracoesSection />}

      <Footer />

      <Toaster />
    </div>
  );
}
