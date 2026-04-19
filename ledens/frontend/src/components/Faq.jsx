import React from 'react';

const FAQS = [
  { open: true,  q: '¿De verdad tengo un presupuesto cerrado en 24 horas?',
    a: 'Sí. Si nos escribes hoy antes de las 18h, mañana tienes la visita y el presupuesto cerrado en tu email. Lo que firmas es lo que pagas — sin letra pequeña.' },
  { q: '¿Qué entra exactamente en "trabajando en 48h"?',
    a: 'Desde el momento en que firmas el presupuesto, en 48 horas tenemos al equipo en tu casa empezando la obra: retirada, protección de suelos, primeros derribos y preparación de instalaciones.' },
  { q: '¿Qué pasa si aparecen imprevistos durante la obra?',
    a: 'En Ledens los imprevistos los asumimos nosotros. Visitamos el espacio, hacemos catas si hace falta y cerramos un precio con holgura técnica. Si aparece algo nuevo, lo resolvemos sin tocar tu factura.' },
  { q: '¿En qué zonas de Málaga trabajáis?',
    a: 'Málaga capital, Costa del Sol (Marbella, Fuengirola, Benalmádena, Torremolinos) y toda la Axarquía. Si tu piso está en otra zona, pregúntanos: normalmente podemos llegar.' },
  { q: '¿Qué garantía tengo sobre la reforma?',
    a: '2 años de garantía por escrito sobre materiales y mano de obra. Y 1 interlocutor único durante toda la vida de la obra — no nos desaparecemos al entregar las llaves.' },
  { q: '¿Cuánto cuesta reformar una cocina o un baño en Málaga?',
    a: 'Una cocina integral parte de 9.500€ y un baño desde 4.800€, siempre con presupuesto cerrado. La cifra exacta depende de superficie, calidades e instalaciones — por eso la visita es gratis.' },
];

export default function Faq() {
  return (
    <section className="band faq-band" id="faq">
      <div className="band-inner">
        <div className="faq-grid">
          <div>
            <div className="eyebrow-row">PREGUNTAS FRECUENTES</div>
            <h2 className="section-title">Lo que <em>siempre</em> nos preguntan.</h2>
            <p className="section-sub">Si no encuentras tu respuesta aquí, escríbenos por WhatsApp. Respondemos en menos de una hora.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <details key={i} className="q" open={f.open || undefined}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
