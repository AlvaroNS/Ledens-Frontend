import React from 'react';

const ITEMS = [
  { num: <em>24h</em>, label: <>Presupuesto cerrado<br />desde tu primera llamada</> },
  { num: <em>48h</em>, label: <>Equipo trabajando<br />en tu reforma</> },
  { num: '0€',         label: <>Extras no pactados<br />en ningún proyecto</> },
  { num: '1',          label: <>Interlocutor único<br />de principio a fin</> },
];

export default function PromiseStrip() {
  return (
    <div className="promise">
      <div className="promise-inner">
        {ITEMS.map((it, i) => (
          <div key={i} className="promise-item">
            <div>
              <div className="promise-num">{it.num}</div>
              <div className="promise-label">{it.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
