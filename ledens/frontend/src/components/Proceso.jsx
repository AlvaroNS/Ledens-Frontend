import React from 'react';

const STEPS = [
  { dot: 'd1', n: 1, tag: 'Hora 0 · HOY', title: 'Cuéntanos tu proyecto',
    body: 'Por WhatsApp, por teléfono o desde este formulario. Te escuchamos, te decimos si podemos ayudarte y agendamos visita. Sin compromiso.' },
  { dot: 'd2', n: 2, tag: 'En 24 horas', title: 'Visita técnica y presupuesto cerrado',
    body: 'Vamos a ver el espacio, medimos, diseñamos contigo y te entregamos un presupuesto cerrado. Lo que firmamos es lo que pagas.' },
  { dot: 'd3', n: 3, tag: 'En 48 horas', title: 'Equipo trabajando en tu casa',
    body: 'En cuanto firmas, el equipo está en tu reforma. Un único jefe de obra de principio a fin y fotos semanales del avance.' },
  { dot: 'd4', n: 4, tag: 'Entrega', title: 'Tu espacio, transformado',
    body: 'En la fecha acordada. Sin sustos en la factura final, sin perseguir a nadie, con garantía de 2 años sobre toda la obra.' },
];

export default function Proceso() {
  return (
    <section className="band proc-band" id="proceso">
      <div className="band-inner">
        <div className="eyebrow-row">CÓMO FUNCIONA</div>
        <h2 className="section-title">De "quiero reformar" a <em>"alguien ya está trabajando"</em><br />en menos de 48 horas.</h2>
        <p className="section-sub">Cuatro pasos, ningún intermediario, cero sorpresas. Tú decides cómo quieres tu espacio; nosotros hacemos el resto.</p>

        <div className="proc-grid">
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={i} className="step">
                <div className={`step-dot ${s.dot}`}>{s.n}</div>
                <div className="step-body">
                  <div className="tag">{s.tag}</div>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <aside className="proc-card">
            <div className="proc-card-row">
              <i className="ri-whatsapp-line"></i>
              <div>
                <div className="t">Respondemos en menos de 1h</div>
                <div className="s">Lunes a sábado · 9:00 – 20:00</div>
              </div>
            </div>
            <div className="proc-card-row">
              <i className="ri-map-pin-line"></i>
              <div>
                <div className="t">Trabajamos en toda Málaga</div>
                <div className="s">Capital, Costa del Sol y Axarquía</div>
              </div>
            </div>
            <div className="proc-card-row">
              <i className="ri-shield-check-line"></i>
              <div>
                <div className="t">Garantía de 2 años</div>
                <div className="s">Sobre materiales y mano de obra</div>
              </div>
            </div>
            <div className="proc-card-cta">
              <div>
                <div className="big">24h → 48h</div>
                <div className="sm">del "quiero reformar" a la primera herramienta</div>
              </div>
              <i className="ri-arrow-right-line" style={{ fontSize: 28 }}></i>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
