import React from 'react';
import logo from '../assets/logo-ledens-isotype.png';

export default function Header({ onOpenLead }) {
  return (
    <header className="hdr">
      <div className="hdr-inner">
        <div className="hdr-left">
          <a className="logo" href="#">
            <img src={logo} alt="Ledens" />
            <span className="logo-word">Ledens</span>
          </a>
          <div className="logo-sep"></div>
          <span className="logo-tag">Reformas inteligentes</span>
        </div>
        <nav className="nav">
          <a href="#compromisos">SERVICIOS <i className="ri-arrow-down-s-line chev"></i></a>
          <a href="#galeria">PROYECTOS</a>
          <a href="#proceso">CÓMO FUNCIONA</a>
          <a href="#testimonios">CASOS DE ÉXITO</a>
          <a href="#faq">QUIENES SOMOS</a>
        </nav>
        <div className="hdr-ctas">
          <button className="btn btn-sm btn-outline">INICIA SESIÓN</button>
          <button className="btn btn-sm btn-blue" onClick={onOpenLead}>REGISTRATE</button>
        </div>
      </div>
    </header>
  );
}
