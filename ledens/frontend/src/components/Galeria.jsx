import React, { useState } from 'react';

const CELLS = [
  { cat: 'cocinas', tall: true,  img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', r: 'Cocina', l: 'Nueva Andalucía · 22 m²' },
  { cat: 'banos',   tall: false, img: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80',  r: 'Baño',   l: 'Limonar · 6 m²' },
  { cat: 'salones', tall: false, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',  r: 'Salón',  l: 'Pedregalejo · 26 m²' },
  { cat: 'cocinas', tall: false, img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80',  r: 'Cocina', l: 'Centro · 18 m²' },
  { cat: 'salones', tall: false, img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',  r: 'Salón',  l: 'Teatinos · 24 m²' },
];

const TABS = [
  { k: 'todos',   label: 'Todos' },
  { k: 'cocinas', label: 'Cocinas' },
  { k: 'banos',   label: 'Baños' },
  { k: 'salones', label: 'Salones' },
];

export default function Galeria() {
  const [filter, setFilter] = useState('todos');

  return (
    <section className="band gallery-band" id="galeria">
      <div className="band-inner">
        <div className="eyebrow-row">PROYECTOS REALES · MÁLAGA</div>
        <h2 className="section-title">Cocinas, baños y salones <em>hechos para vivirse.</em></h2>
        <p className="section-sub">Minimalistas, cálidos, mediterráneos. Reformas que duran y que respiran luz — todas entregadas en plazo y en presupuesto.</p>

        <div className="gallery-tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.k}
              className={filter === t.k ? 'active' : ''}
              onClick={() => setFilter(t.k)}
            >{t.label}</button>
          ))}
        </div>

        <div className="gallery-grid">
          {CELLS.map((c, i) => {
            const visible = filter === 'todos' || c.cat === filter;
            return (
              <div
                key={i}
                className={`cell${c.tall ? ' tall' : ''}`}
                style={{
                  backgroundImage: `url('${c.img}')`,
                  display: visible ? '' : 'none',
                }}
              >
                <div className="cell-caption">
                  <div className="r">{c.r}</div>
                  <div className="l">{c.l}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
