import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Problema from './components/Problema.jsx';
import PromiseStrip from './components/PromiseStrip.jsx';
import Compromisos from './components/Compromisos.jsx';
import Proceso from './components/Proceso.jsx';
import Galeria from './components/Galeria.jsx';
import Testimonios from './components/Testimonios.jsx';
import Faq from './components/Faq.jsx';
import Cta from './components/Cta.jsx';
import Footer from './components/Footer.jsx';
import LeadModal from './components/LeadModal.jsx';
import AuthPage from './components/AuthPage.jsx';
import SsoCallback from './components/SsoCallback.jsx';
import ServicioPage from './components/ServicioPage.jsx';

/* The full landing page */
function LandingPage({ onOpenLead }) {
  return (
    <>
      <Hero onOpenLead={onOpenLead} />
      <Problema />
      <PromiseStrip />
      <Compromisos />
      <Proceso />
      <Galeria />
      <Testimonios />
      <Faq />
      <Cta onOpenLead={onOpenLead} />
      <Footer />
      <a
        className="wa-float"
        href="https://wa.me/34952000000"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <i className="ri-whatsapp-fill"></i>
      </a>
    </>
  );
}

export default function App() {
  const [leadOpen, setLeadOpen] = useState(false);
  const openLead  = () => setLeadOpen(true);
  const closeLead = () => setLeadOpen(false);

  return (
    <>
      {/* Header is shown on every route except /sso-callback */}
      <Routes>
        <Route path="/sso-callback" element={<SsoCallback />} />
        <Route
          path="*"
          element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<LandingPage onOpenLead={openLead} />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/servicios/:slug" element={<ServicioPage onOpenLead={openLead} />} />
                {/* Fallback: anything unknown → landing */}
                <Route path="*" element={<LandingPage onOpenLead={openLead} />} />
              </Routes>
              {leadOpen && <LeadModal onClose={closeLead} />}
            </>
          }
        />
      </Routes>
    </>
  );
}
