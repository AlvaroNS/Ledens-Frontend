import React, { useEffect, useRef, useState } from 'react';

import imgTilos19 from '../images/Tilos 57-19.webp';
import imgTilos05 from '../images/Tilos 57-05.webp';
import imgTilos02 from '../images/Tilos 57-02.webp';
import imgTilos17 from '../images/Tilos 57-17.webp';
import img1478    from '../images/IMG_1478.webp';
import img1641    from '../images/IMG_1641.webp';

// Tilos 57-19 is the hero image — it goes first (idx = 0).
const SLIDES = [
  {
    img:  imgTilos19,
    room: 'Cocina',
    loc:  'Cocina con isla · Tilos 57',
    size: '24 m²',
    meta: ['8 semanas', 'Llave en mano'],
  },
  {
    img:  imgTilos05,
    room: 'Baño',
    loc:  'Baño doble · Tilos 57',
    size: '9 m²',
    meta: ['3 semanas', 'Ducha de obra'],
  },
  {
    img:  img1478,
    room: 'Terraza',
    loc:  'Terraza · Málaga Centro',
    size: '22 m²',
    meta: ['5 semanas', 'Suelo de roble'],
  },
  {
    img:  imgTilos02,
    room: 'Baño',
    loc:  'Baño principal · Tilos 57',
    size: '7 m²',
    meta: ['3 semanas', 'Microcemento'],
  },
  {
    img:  imgTilos17,
    room: 'Cocina',
    loc:  'Cocina con isla · Tilos 57',
    size: '22 m²',
    meta: ['6 semanas', 'Mármol Calacatta'],
  },
  {
    img:  img1641,
    room: 'Dormitorio',
    loc:  'Dormitorio principal · Málaga Centro',
    size: '14 m²',
    meta: ['4 semanas', 'Tarima de roble'],
  },
];

export default function Carousel() {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const total = SLIDES.length;

  const restart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % total), 5000);
  };

  useEffect(() => {
    restart();
    return () => timerRef.current && clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (i) => { setIdx((i + total) % total); restart(); };
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  const onEnter = () => timerRef.current && clearInterval(timerRef.current);
  const onLeave = () => restart();

  return (
    <div
      className="carousel"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label="Galería de reformas Ledens"
    >
      <div className="carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {SLIDES.map((s, i) => (
          <div key={i} className="slide" style={{ backgroundImage: `url('${s.img}')` }}>
            <div className="slide-caption">
              <div>
                <div className="room">{s.room}</div>
                <div className="loc">{s.loc} <span>· {s.size}</span></div>
              </div>
              <div className="slide-meta">
                {s.meta.map((m, j) => <span key={j}>{m}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-ctrl carousel-prev" aria-label="Anterior" onClick={prev}>
        <i className="ri-arrow-left-s-line"></i>
      </button>
      <button className="carousel-ctrl carousel-next" aria-label="Siguiente" onClick={next}>
        <i className="ri-arrow-right-s-line"></i>
      </button>
      <div className="carousel-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={i === idx ? 'active' : ''}
            aria-label={`Ir a slide ${i + 1}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
