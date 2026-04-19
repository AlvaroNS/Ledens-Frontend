import React from 'react';
import Carousel from './Carousel.jsx';

export default function Hero({ onOpenLead }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-eyebrow"><span className="dot"></span>Reformas en Málaga · Presupuesto cerrado</span>
          <h1>
            Tu última reforma fue un <span className="hl-pink">desastre.</span><br />
            La siguiente no tiene que serlo.
          </h1>
          <p className="hero-lead">
            Obtén un <span className="hl-soft-pink">presupuesto en 24h</span> y alguien
            trabajando en tu <span className="hl-soft-teal">reforma en 48h</span>.
          </p>
          <p className="hero-sub">
            Presupuesto cerrado, plazos firmados y un único interlocutor de
            principio a fin. Cuéntanos tu proyecto hoy y mañana tenemos equipo
            en tu casa.
          </p>
          <div className="hero-cta-row">
            <button className="btn btn-lg btn-pink" onClick={onOpenLead}>
              <i className="ri-whatsapp-fill"></i> Pide tu presupuesto
            </button>
            <a href="#proceso" className="btn btn-lg btn-outline-light">
              Cómo funciona <i className="ri-arrow-down-line"></i>
            </a>
          </div>
          <div className="hero-trust">
            <span className="hero-trust-item"><i className="ri-shield-check-line"></i> Presupuesto cerrado</span>
            <span className="hero-trust-item"><i className="ri-calendar-check-line"></i> Plazos por contrato</span>
            <span className="hero-trust-item"><i className="ri-user-star-line"></i> Un único interlocutor</span>
          </div>
        </div>
        <Carousel />
      </div>
    </section>
  );
}
