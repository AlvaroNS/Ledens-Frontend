import React from 'react';

export default function Cta({ onOpenLead }) {
  return (
    <section className="cta-band">
      <div className="cta-inner">
        <h2>¿Empezamos tu reforma <em>esta semana?</em></h2>
        <p>Cuéntanos tu proyecto en 2 minutos. Mañana tienes presupuesto cerrado y pasado tenemos equipo en tu casa. Sin compromiso, sin sorpresas.</p>
        <div className="cta-row">
          <button className="btn btn-lg btn-pink" onClick={onOpenLead}>
            <i className="ri-whatsapp-fill"></i> Escríbenos por WhatsApp
          </button>
          <a href="tel:+34952000000" className="btn btn-lg btn-outline-light">
            <i className="ri-phone-line"></i> Llámanos al 952 00 00 00
          </a>
        </div>
        <div className="cta-note">Respuesta en menos de 1h · Visita y presupuesto gratis · Trabajamos en toda Málaga</div>
      </div>
    </section>
  );
}
