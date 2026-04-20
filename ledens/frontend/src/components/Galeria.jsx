import React, { useState } from 'react';

import imgTilos19 from '../images/Tilos 57-19.webp';
import imgTilos04 from '../images/Tilos 57-04.webp';
import imgTilos23 from '../images/Tilos 57-23.webp';
import img1492    from '../images/IMG_1492.webp';
import img1495    from '../images/IMG_1495.webp';

const CELLS = [
  {
    cat: 'cocinas', tall: true,
    img: imgTilos19,
    r: 'Cocina', l: 'Tilos 57 · 24 m²',
  },
  {
    cat: 'banos', tall: false,
    img: imgTilos04,
    r: 'Baño', l: 'Tilos 57 · 9 m²',
  },
  {
    cat: 'salones', tall: false,
    img: img1495,
    r: 'Salón', l: 'Málaga Centro · 22 m²',
  },
  {
    cat: 'cocinas', tall: false,
    img: img1492,
    r: 'Cocina', l: 'Málaga Centro · 14 m²',
  },
  {
    cat: 'salones', tall: false,
    img: imgTilos23,
    r: 'Terraza', l: 'Tilos 57 · 18 m²',
  },
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
