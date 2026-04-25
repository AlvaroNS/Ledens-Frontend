import React from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react';
import logo from '../assets/logo-ledens-isotype.png';

// Clerk components must only be rendered inside <ClerkProvider>.
// When the publishable key is missing (build without env var), we fall back to
// plain static buttons so the site stays fully visible.
const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export default function Header() {
  const services = [
    'Demolición',
    'Fontanería',
    'Electricidad',
    'Climatización',
    'Albañilería',
    'Pladur',
    'Carpintería',
    'Alicatado',
  ];
  const successCases = [
    'Santa Marta',
    'Pasaje Pezuela',
    'Martinez de la Rosa',
    'Paseo de Los Tilos',
    'Avenida de la Paloma',
  ];

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
          <div className="nav-item nav-item-dropdown">
            <a href="#compromisos">SERVICIOS <i className="ri-arrow-down-s-line chev"></i></a>
            <div className="nav-menu" aria-label="Servicios">
              {services.map((service) => (
                <a key={service} href="#compromisos" className="nav-menu-link">{service}</a>
              ))}
            </div>
          </div>
          <a href="#galeria">PROYECTOS</a>
          <a href="#proceso">CÓMO FUNCIONA</a>
          <div className="nav-item nav-item-dropdown">
            <a href="#testimonios">CASOS DE ÉXITO <i className="ri-arrow-down-s-line chev"></i></a>
            <div className="nav-menu nav-menu-success" aria-label="Casos de éxito">
              {successCases.map((successCase) => (
                <a key={successCase} href="#testimonios" className="nav-menu-link">{successCase}</a>
              ))}
            </div>
          </div>
          <a href="#faq">QUIENES SOMOS</a>
        </nav>
        <div className="hdr-ctas">
          {CLERK_ENABLED ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button type="button" className="btn btn-sm btn-outline">INICIA SESIÓN</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button type="button" className="btn btn-sm btn-blue">REGÍSTRATE</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-sm btn-outline">INICIA SESIÓN</button>
              <button type="button" className="btn btn-sm btn-blue">REGÍSTRATE</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
