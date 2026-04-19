import React from 'react';

const PILARES = [
  {
    color: 'blue', icon: 'ri-file-list-3-line',
    title: 'Presupuesto cerrado en 24h',
    body: 'El precio que acordamos es el que pagas. Lo cerramos en menos de 24 horas desde tu primera llamada y lo firmamos antes de empezar.',
    tag: { icon: 'ri-check-line', text: 'Por contrato' },
  },
  {
    color: 'pink', icon: 'ri-tools-line',
    title: 'Alguien trabajando en 48h',
    body: 'En cuanto firmas, nuestro equipo empieza. Sin semanas de espera, sin "la próxima". 48 horas desde la firma hasta la primera herramienta.',
    tag: { icon: 'ri-flashlight-line', text: 'Inicio garantizado' },
  },
  {
    color: 'teal', icon: 'ri-smartphone-line',
    title: 'Control en tiempo real',
    body: 'Fotos semanales de la obra, estado del proyecto y presupuesto actualizado. Sabes qué pasa en tu casa sin tener que llamar a nadie.',
    tag: { icon: 'ri-eye-line', text: 'App Ledens' },
  },
];

export default function Compromisos() {
  return (
    <section className="band pilares-band" id="compromisos">
      <div className="band-inner">
        <div className="eyebrow-row">NUESTROS COMPROMISOS</div>
        <h2 className="section-title">Tres promesas que <em>firmamos contigo</em><br />antes de tocar una sola pared.</h2>
        <p className="section-sub">Sin letra pequeña, sin "esto no estaba incluido". Si lo firmamos, lo cumplimos — o corre de nuestra cuenta.</p>
        <div className="pilares">
          {PILARES.map((p, i) => (
            <article key={i} className="pilar">
              <div className={`pilar-ico ${p.color}`}><i className={p.icon}></i></div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <span className={`pilar-tag ${p.color}`}><i className={p.tag.icon}></i> {p.tag.text}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
