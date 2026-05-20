import React, { useState, useEffect, useCallback, useRef } from 'react';
import logo from '../assets/logo-ledens-isotype.png';

/* ── Constants ───────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'ledens.cookieConsent.v1';

const CATEGORIES = [
  {
    id: 'necessary',
    title: 'Técnicas',
    locked: true,
    desc: 'Imprescindibles para que la web funcione: sesión, seguridad, balanceo de carga. No identifican a una persona concreta.',
    count: 4,
  },
  {
    id: 'preferences',
    title: 'Preferencias',
    locked: false,
    desc: 'Recuerdan tus elecciones (idioma, ciudad de búsqueda, último presupuesto consultado) para no volver a preguntártelo.',
    count: 3,
  },
  {
    id: 'analytics',
    title: 'Analíticas',
    locked: false,
    desc: 'Nos ayudan a entender qué páginas funcionan y dónde se atascan los visitantes. Siempre con datos agregados.',
    count: 5,
  },
  {
    id: 'marketing',
    title: 'Marketing',
    locked: false,
    desc: 'Permiten medir la eficacia de nuestras campañas y mostrarte anuncios relevantes en otras webs y redes sociales.',
    count: 6,
  },
];

/* ── Storage helpers ─────────────────────────────────────────────────────── */
function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function savePrefs(prefs) {
  const payload = { ...prefs, savedAt: new Date().toISOString() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* noop */ }
  document.dispatchEvent(new CustomEvent('ledens:cookieconsent', { detail: payload }));
  return payload;
}

function allTrue() {
  return Object.fromEntries(CATEGORIES.map(c => [c.id, true]));
}

function allFalseExceptNecessary() {
  return Object.fromEntries(CATEGORIES.map(c => [c.id, !!c.locked]));
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function CookieConsent() {
  const stored = loadPrefs();

  const [open, setOpen]     = useState(false);
  const [view, setView]     = useState('summary'); // 'summary' | 'details'
  const [reopen, setReopen] = useState(!!stored);

  // Per-category toggle state (only non-locked categories matter)
  const initialToggles = () =>
    Object.fromEntries(
      CATEGORIES.filter(c => !c.locked).map(c => [c.id, !!(stored && stored[c.id])])
    );
  const [toggles, setToggles] = useState(initialToggles);

  const titleText = open
    ? view === 'details'
      ? 'Elige tus preferencias'
      : stored
        ? 'Actualiza tus preferencias'
        : 'Tú decides qué cookies usamos'
    : '';

  /* Handlers */
  const handleOpen = useCallback(() => {
    const s = loadPrefs();
    setToggles(Object.fromEntries(
      CATEGORIES.filter(c => !c.locked).map(c => [c.id, !!(s && s[c.id])])
    ));
    setView('summary');
    setOpen(true);
    document.documentElement.style.overflow = 'hidden';
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    document.documentElement.style.overflow = '';
    setReopen(true);
  }, []);

  const handleAccept = useCallback(() => {
    savePrefs(allTrue());
    handleClose();
  }, [handleClose]);

  const handleReject = useCallback(() => {
    savePrefs(allFalseExceptNecessary());
    handleClose();
  }, [handleClose]);

  const handleSave = useCallback(() => {
    const prefs = Object.fromEntries(
      CATEGORIES.map(c => [c.id, c.locked ? true : (toggles[c.id] || false)])
    );
    savePrefs(prefs);
    handleClose();
  }, [toggles, handleClose]);

  const handleToggle = useCallback((id) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleBackdropClick = useCallback(() => {
    if (loadPrefs()) handleClose();
  }, [handleClose]);

  /* Keyboard */
  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape' && loadPrefs()) handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  /* Expose window.LedensCookies API */
  useEffect(() => {
    window.LedensCookies = {
      open:  handleOpen,
      close: handleClose,
      get:   loadPrefs,
      reset: () => {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
        setReopen(false);
        handleOpen();
      },
    };
    return () => { /* keep the API alive; do not clear on unmount */ };
  }, [handleOpen, handleClose]);

  /* Auto-open on first visit */
  useEffect(() => {
    if (!loadPrefs()) {
      const t = setTimeout(handleOpen, 450);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const policyPath = '/cookies';

  return (
    <>
      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <div
        className="cc-root"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cc-title"
        data-open={open ? 'true' : undefined}
      >
        {/* Backdrop */}
        <div className="cc-backdrop" onClick={handleBackdropClick} />

        {/* Card */}
        <div className="cc-card" data-view={view}>

          {/* Head */}
          <div className="cc-head">
            <div className="cc-mark" aria-hidden="true">
              <img src={logo} alt="" />
            </div>
            <div className="cc-titles">
              <div className="cc-eyebrow">Privacidad &amp; cookies</div>
              <h2 id="cc-title">{titleText}</h2>
            </div>
            <button
              className="cc-back"
              type="button"
              aria-label="Volver"
              onClick={() => setView('summary')}
            >
              <i className="ri-arrow-left-line" />
            </button>
          </div>

          {/* ── Summary view ─────────────────────────────────────────── */}
          <div className="cc-summary">
            <div className="cc-body">
              <p>
                Usamos <strong>cookies propias y de terceros</strong> para que la web funcione,
                recordar tus preferencias, medir cómo la usas y, si tú lo aceptas, mostrarte
                campañas más relevantes.
              </p>
              <p>
                Puedes <strong>aceptar todas</strong>, <strong>rechazarlas todas</strong> (salvo
                las imprescindibles) o <strong>elegir tú</strong> qué categorías activar.
                Cambiarás de opinión cuando quieras desde el icono inferior izquierdo o desde la{' '}
                <a href={policyPath} className="cc-more">
                  Política de cookies <i className="ri-arrow-right-up-line" />
                </a>.
              </p>
            </div>
            <div className="cc-actions">
              <button className="cc-btn cc-btn-ghost" type="button" onClick={handleReject}>
                Rechazar todas
              </button>
              <button
                className="cc-btn cc-btn-outline"
                type="button"
                onClick={() => setView('details')}
              >
                Personalizar
              </button>
              <button className="cc-btn cc-btn-primary" type="button" onClick={handleAccept}>
                Aceptar todas
              </button>
            </div>
          </div>

          {/* ── Details view ─────────────────────────────────────────── */}
          <div className="cc-details">
            {CATEGORIES.map(cat => (
              <div className="cc-row" key={cat.id}>
                <div>
                  <h3>
                    {cat.title}
                    {cat.locked && <span className="cc-locked">Siempre activas</span>}
                  </h3>
                  <p>{cat.desc}</p>
                  <span className="cc-count">
                    {cat.count} cookie{cat.count === 1 ? '' : 's'}
                  </span>
                </div>
                <div
                  className="cc-toggle"
                  role="switch"
                  aria-checked={cat.locked ? 'true' : String(!!toggles[cat.id])}
                  aria-label={cat.title}
                  data-cat={cat.id}
                  data-on={cat.locked ? 'true' : String(!!toggles[cat.id])}
                  data-locked={cat.locked ? 'true' : 'false'}
                  tabIndex={cat.locked ? -1 : 0}
                  onClick={() => !cat.locked && handleToggle(cat.id)}
                  onKeyDown={e => {
                    if (!cat.locked && (e.key === ' ' || e.key === 'Enter')) {
                      e.preventDefault();
                      handleToggle(cat.id);
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Details footer */}
          <div className="cc-details-foot">
            <span className="cc-foot-note">
              Tus preferencias se guardan durante 12 meses. Detalles en la{' '}
              <a href={policyPath}>Política de cookies</a>.
            </span>
            <button className="cc-btn cc-btn-outline" type="button" onClick={handleReject}>
              Solo imprescindibles
            </button>
            <button className="cc-btn cc-btn-primary" type="button" onClick={handleSave}>
              Guardar mis preferencias
            </button>
          </div>
        </div>
      </div>

      {/* ── Reopen pill ────────────────────────────────────────────────── */}
      <button
        className="cc-reopen"
        type="button"
        aria-label="Configuración de cookies"
        data-show={reopen ? 'true' : 'false'}
        onClick={handleOpen}
      >
        <i className="ri-shield-user-line" />
      </button>
    </>
  );
}
