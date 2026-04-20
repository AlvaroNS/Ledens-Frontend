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
