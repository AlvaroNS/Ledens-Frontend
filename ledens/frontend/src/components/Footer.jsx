import React from 'react';
import { Link } from 'react-router-dom';
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
          <h5>Servicios</h5>
          <Link to="/servicios/albanileria">Albañilería</Link>
          <Link to="/servicios/electricidad">Electricidad</Link>
          <Link to="/servicios/fontaneria">Fontanería</Link>
          <Link to="/servicios/climatizacion">Climatización</Link>
          <Link to="/servicios/pladur">Pladur</Link>
          <Link to="/servicios/carpinteria">Carpintería</Link>
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
