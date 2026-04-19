import React from 'react';
import logo from '../assets/logo-ledens-isotype.png';

export default function Footer() {
  return (
    <footer>
      <div className="foot-inner">
        <div>
          <div className="foot-logo">
            <img src={logo} alt="Ledens" />
            <span className="w">Ledens</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', maxWidth: 360, margin: 0 }}>
            Proptech malagueña que identifica buenas oportunidades de inversión inmobiliaria y ejecuta reformas con presupuesto cerrado y plazos por contrato.
          </p>
        </div>
        <div className="foot-col">
          <h5>Reformas</h5>
          <a href="#">Cocinas</a>
          <a href="#">Baños</a>
          <a href="#">Reforma integral</a>
          <a href="#">Pisos de inversión</a>
        </div>
        <div className="foot-col">
          <h5>Empresa</h5>
          <a href="#">Quiénes somos</a>
          <a href="#">Casos de éxito</a>
          <a href="#">Inversión</a>
          <a href="#">Contacto</a>
        </div>
        <div className="foot-col">
          <h5>Legal</h5>
          <a href="#">Aviso legal</a>
          <a href="#">Privacidad</a>
          <a href="#">Cookies</a>
        </div>
      </div>
      <div className="foot-bottom">
        <div>© {new Date().getFullYear()} Ledens · Reformas inteligentes · Málaga, España</div>
        <div>952 00 00 00 · hola@ledens.es</div>
      </div>
    </footer>
  );
}
