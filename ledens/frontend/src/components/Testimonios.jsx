import React from 'react';

const TESTIS = [
  {
    av: '', initials: 'MC',
    quote: '"Llamé un martes, el jueves ya tenía al equipo en casa. El presupuesto no se movió ni un euro y entregaron una semana antes de lo prometido."',
    name: 'María Contreras', meta: 'Cocina · La Malagueta · 2026',
  },
  {
    av: 'p', initials: 'JM',
    quote: '"Después de dos reformas horribles, ya no me fiaba de nadie. Con Ledens por primera vez sentí que había alguien al mando. Un solo interlocutor, todo muy claro."',
    name: 'Javier Martín', meta: 'Reforma integral · Pedregalejo · 2025',
  },
  {
    av: 't', initials: 'LR',
    quote: '"El detalle que más agradecí: las fotos semanales. Trabajo fuera de Málaga y podía ver cómo iba mi baño sin tener que llamar a nadie. Impecable."',
    name: 'Laura Ruiz', meta: 'Baño en suite · Teatinos · 2026',
  },
];

export default function Testimonios() {
  return (
    <section className="band testis-band" id="testimonios">
      <div className="band-inner">
        <div className="eyebrow-row">LO DICEN ELLOS</div>
        <h2 className="section-title">La opinión que <em>más importa.</em></h2>
        <p className="section-sub">Clientes reales, reformas reales. Sin actores, sin stock, sin "hasta aquí estaba contento".</p>
        <div className="testis">
          {TESTIS.map((t, i) => (
            <div key={i} className="testi">
              <div className="stars">★ ★ ★ ★ ★</div>
              <blockquote>{t.quote}</blockquote>
              <div className="testi-author">
                <div className={`testi-av ${t.av}`}>{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-meta">{t.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
