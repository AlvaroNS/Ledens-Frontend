import React, { useState } from 'react';

export default function LeadModal({ onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo enviar el mensaje');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Pide tu presupuesto</h3>
        <p>Te contactamos en menos de 1 hora (lunes a sábado, 9:00 – 20:00).</p>
        {status === 'success' ? (
          <>
            <div className="modal-success">¡Gracias! Tu solicitud ha sido recibida. Te llamamos pronto.</div>
            <div className="modal-actions">
              <button className="btn btn-md btn-blue" onClick={onClose}>Cerrar</button>
            </div>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            {status === 'error' && <div className="modal-error">{errorMsg}</div>}
            <label htmlFor="lm-name">Nombre</label>
            <input id="lm-name" name="name" required value={form.name} onChange={onChange} />
            <label htmlFor="lm-phone">Teléfono</label>
            <input id="lm-phone" name="phone" type="tel" required value={form.phone} onChange={onChange} />
            <label htmlFor="lm-email">Email</label>
            <input id="lm-email" name="email" type="email" value={form.email} onChange={onChange} />
            <label htmlFor="lm-msg">Cuéntanos tu reforma</label>
            <textarea id="lm-msg" name="message" value={form.message} onChange={onChange} placeholder="Cocina, baño, salón… Superficie aproximada y zona." />
            <div className="modal-actions">
              <button type="button" className="btn btn-md btn-outline" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-md btn-pink" disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
