import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SERVICIOS_BY_SLUG, SERVICE_IMAGES } from '../data/servicios.js';
import Footer from './Footer.jsx';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/** Render a title array: plain strings and {em:'...'} objects → React nodes */
function renderTitle(parts) {
  return parts.map((part, i) =>
    typeof part === 'string' ? part : <em key={i}>{part.em}</em>
  );
}

/** Lazy-load a service image from SERVICE_IMAGES and return the resolved URL */
function useServiceImage(key) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (!key) return;
    const loader = SERVICE_IMAGES[key];
    if (loader) loader().then(m => setSrc(m.default)).catch(() => {});
  }, [key]);
  return src;
}

/* ── Static "how we work" steps (same for all services) ─────────────────── */
const STEPS = [
  { n: '01', t: 'Cuéntanos qué necesitas',
    p: 'Por WhatsApp, teléfono o email. Te respondemos en menos de 1 hora en horario laboral.' },
  { n: '02', t: 'Visita técnica gratis',
    p: 'Vamos a verlo, medimos y te explicamos opciones. Sin compromiso ni presión de venta.' },
  { n: '03', t: 'Presupuesto cerrado en 24h',
    p: 'Te lo enviamos firmado por escrito. Lo que firmas es lo que pagas, sin extras escondidos.' },
  { n: '04', t: 'Equipo trabajando en 48h',
    p: 'En cuanto firmas, técnico en tu casa con uniforme Ledens y materiales en mano.' },
];

/* ── Sub-components ───────────────────────────────────────────────────────── */

function CaseCard({ caso }) {
  const imgSrc = useServiceImage(caso.imgKey);
  return (
    <article className="case">
      <div
        className="case-img"
        style={imgSrc ? { backgroundImage: `url(${imgSrc})` } : {}}
      />
      <div className="case-body">
        <div className="case-tag">{caso.tag}</div>
        <h3>{caso.title}</h3>
        <p>{caso.body}</p>
      </div>
    </article>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */

export default function ServicioPage({ onOpenLead }) {
  const { slug } = useParams();
  const svc = SERVICIOS_BY_SLUG[slug];

  const heroImg  = useServiceImage(svc?.hero?.imgKey);

  if (!svc) {
    return (
      <div style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>Servicio no encontrado</h2>
        <Link to="/" style={{ color: 'var(--ledens-blue)' }}>← Volver al inicio</Link>
      </div>
    );
  }

  const { hero, bullets, casos, cta, name, icon } = svc;

  return (
    <>
      {/* ── 01 · Hero ─────────────────────────────────────────────────────── */}
      <section
        className="svc-hero"
        style={heroImg ? { '--bg-img': `url(${heroImg})` } : {}}
      >
        <div className="svc-hero-inner">
          <div className="svc-crumbs">
            <Link to="/">Inicio</Link>
            <span>/</span>
            Servicios
            <span>/</span>
            {name}
          </div>

          <span className="svc-eyebrow">
            <i className={icon}></i> {hero.eyebrow}
          </span>

          <h1>{renderTitle(hero.title)}</h1>

          <p className="svc-lead">{hero.lead}</p>

          <div className="svc-hero-ctas">
            <button className="btn btn-lg btn-pink" onClick={onOpenLead}>
              <i className="ri-whatsapp-fill"></i> Pide tu presupuesto
            </button>
            <a className="btn btn-lg btn-outline-light" href="#casos">
              Ver casos reales
            </a>
          </div>
        </div>
      </section>

      {/* ── 02 · Qué hacemos ──────────────────────────────────────────────── */}
      <section className="band svc-band-white">
        <div className="band-inner">
          <div className="split">
            <div>
              <div className="eyebrow-row">QUÉ HACEMOS EN {name.toUpperCase()}</div>
              <h2 className="section-title">
                Todo lo que necesitas en <em>{name.toLowerCase()}</em>,<br />
                con un solo equipo.
              </h2>
              <p className="section-sub">
                Nuestro equipo propio cubre desde la pequeña reparación hasta la reforma
                integral. Misma persona de inicio a fin, mismo presupuesto.
              </p>
              <div className="svc-bullets">
                {bullets.map((b, i) => (
                  <div key={i} className="svc-bullet">
                    <i className="ri-checkbox-circle-line"></i>
                    <div>
                      <div className="svc-bullet-t">{b.t}</div>
                      <div className="svc-bullet-s">{b.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="split-img"
              style={heroImg ? { backgroundImage: `url(${heroImg})` } : {}}
            />
          </div>
        </div>
      </section>

      {/* ── 03 · Casos reales ─────────────────────────────────────────────── */}
      <section className="band svc-band-muted" id="casos">
        <div className="band-inner">
          <div className="eyebrow-row">CASOS REALES · MÁLAGA</div>
          <h2 className="section-title">
            Trabajos de {name.toLowerCase()} <em>recientes.</em>
          </h2>
          <p className="section-sub">
            Selección de proyectos de los últimos meses. Todos entregados en plazo y en
            presupuesto cerrado.
          </p>
          <div className="cases">
            {casos.map((c, i) => <CaseCard key={i} caso={c} />)}
          </div>
        </div>
      </section>

      {/* ── 04 · Cómo trabajamos ──────────────────────────────────────────── */}
      <section className="band svc-band-white">
        <div className="band-inner">
          <div className="eyebrow-row">CÓMO TRABAJAMOS</div>
          <h2 className="section-title">
            De tu llamada al técnico en casa, <em>en 48 horas.</em>
          </h2>
          <div className="mini-steps">
            {STEPS.map(s => (
              <div key={s.n} className="mini-step">
                <div className="mini-step-n">{s.n}</div>
                <h4>{s.t}</h4>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 · CTA band ─────────────────────────────────────────────────── */}
      <section className="svc-cta-band">
        <div className="band-inner">
          <h2>{renderTitle(cta.title)}</h2>
          <p>{cta.subtitle}</p>
          <div className="cta-row">
            <button className="btn btn-lg btn-pink" onClick={onOpenLead}>
              <i className="ri-whatsapp-fill"></i> Pide tu presupuesto
            </button>
            <a className="btn btn-lg btn-outline-light" href="tel:+34952000000">
              <i className="ri-phone-line"></i> 952 00 00 00
            </a>
          </div>
          <div className="cta-note">
            Respuesta en menos de 1h · Visita gratis · Trabajamos en toda Málaga
          </div>
        </div>
      </section>

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
