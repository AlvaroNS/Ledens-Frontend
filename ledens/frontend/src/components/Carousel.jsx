import React, { useEffect, useRef, useState } from 'react';

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    room: 'Cocina', loc: 'Cocina abierta · La Malagueta', size: '18 m²',
    meta: ['4 semanas', 'Llave en mano'],
  },
  {
    img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=80',
    room: 'Baño', loc: 'Baño principal · El Palo', size: '7 m²',
    meta: ['3 semanas', 'Microcemento'],
  },
  {
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80',
    room: 'Salón', loc: 'Salón comedor · Pedregalejo', size: '24 m²',
    meta: ['5 semanas', 'Roble natural'],
  },
  {
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80',
    room: 'Cocina', loc: 'Cocina con isla · Centro Histórico', size: '22 m²',
    meta: ['6 semanas', 'Mármol travertino'],
  },
  {
    img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
    room: 'Baño', loc: 'Baño en suite · Teatinos', size: '9 m²',
    meta: ['3,5 semanas', 'Ducha de obra'],
  },
  {
    img: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1400&q=80',
    room: 'Salón', loc: 'Salón luminoso · Churriana', size: '28 m²',
    meta: ['5 semanas', 'Cal mineral'],
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
