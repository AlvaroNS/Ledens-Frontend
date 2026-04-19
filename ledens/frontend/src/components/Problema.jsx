import React from 'react';

const PROBLEMS = [
  {
    emoji: '💸',
    title: 'Presupuestos que se disparan',
    quote:
      '"Me dijeron 20.000€ y acabé pagando 35.000€. Cada semana había un extra que no estaba previsto."',
  },
  {
    emoji: '📅',
    title: 'Plazos que nadie cumple',
    quote:
      '"Iban a ser 2 meses. Fueron 5. Estuve viviendo en casa de mis padres con mis hijos."',
  },
  {
    emoji: '🤷',
    title: 'Nadie se responsabiliza',
    quote:
      '"El fontanero culpaba al albañil, el albañil al electricista. Y yo en medio llamando a todos sin resultado."',
  },
  {
    emoji: '⏳',
    title: 'Te dan largas para empezar',
    quote:
      '"O te dicen que en 3 meses pueden hacerlo, o te mandan presupuesto y desaparecen. Imposible arrancar."',
  },
];

export default function Problema() {
  return (
    <section className="band problema-band" id="problema">
      <div className="band-inner">
        <div className="eyebrow-row">EL PROBLEMA</div>
        <h2 className="section-title">
          Lo que todos hemos vivido<br />con las <em>reformas.</em>
        </h2>
        <p className="section-sub">
          Estos son los 4 miedos que más escuchamos antes de contratar una
          reforma. Si te suenan, estás en el sitio correcto.
        </p>

        <div className="problema-grid">
          {PROBLEMS.map((p, i) => (
            <article key={i} className="problema-card">
              <div className="problema-emoji" aria-hidden="true">{p.emoji}</div>
              <h3>{p.title}</h3>
              <blockquote>{p.quote}</blockquote>
              <div className="problema-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>
            </article>
          ))}
        </div>

        <div className="problema-closing">
          Si esto te suena, <strong>Ledens existe exactamente para resolverlo.</strong>
        </div>
      </div>
    </section>
  );
}
