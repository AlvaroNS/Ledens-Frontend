import React, { useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import PromiseStrip from './components/PromiseStrip.jsx';
import Compromisos from './components/Compromisos.jsx';
import Proceso from './components/Proceso.jsx';
import Galeria from './components/Galeria.jsx';
import Testimonios from './components/Testimonios.jsx';
import Faq from './components/Faq.jsx';
import Cta from './components/Cta.jsx';
import Footer from './components/Footer.jsx';
import LeadModal from './components/LeadModal.jsx';

export default function App() {
  const [leadOpen, setLeadOpen] = useState(false);
  const openLead = () => setLeadOpen(true);
  const closeLead = () => setLeadOpen(false);

  return (
    <>
      <Header onOpenLead={openLead} />
      <Hero onOpenLead={openLead} />
      <PromiseStrip />
      <Compromisos />
      <Proceso />
      <Galeria />
      <Testimonios />
      <Faq />
      <Cta onOpenLead={openLead} />
      <Footer />
      <a className="wa-float" href="https://wa.me/34952000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <i className="ri-whatsapp-fill"></i>
      </a>
      {leadOpen && <LeadModal onClose={closeLead} />}
    </>
  );
}
