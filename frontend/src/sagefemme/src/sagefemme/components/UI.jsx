import React from 'react';

export function Modal({ title, onClose, children, footer, large }) {
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`mx${large ? ' mxl' : ''}`}>
        <div className="m-hdr">
          <span className="m-title">{title}</span>
          <button className="btn btn-g btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">{children}</div>
        {footer && <div className="m-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Loading() {
  return <div className="ld"><div className="spin" /></div>;
}

export function Empty({ icon = '📭', text = 'Aucun résultat' }) {
  return (
    <div className="empty">
      <div className="ei">{icon}</div>
      <div className="et">{text}</div>
    </div>
  );
}

export function Alert({ type = 'info', children }) {
  return <div className={`al al-${type}`}>{children}</div>;
}

export function Avatar({ nom, prenom, size = 30 }) {
  return (
    <div className="av" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {nom?.[0]}{prenom?.[0]}
    </div>
  );
}

export function Badge({ type = 'pk', children }) {
  return <span className={`b b-${type}`}>{children}</span>;
}

export function ProgressBar({ value, max = 100, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="pb">
      <div className="pb-f" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function StatCard({ label, value, sub, color = 'pk' }) {
  return (
    <div className={`sc ${color}`}>
      <div className="lbl">{label}</div>
      <div className="val">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export function InfoBox({ children }) {
  return <div className="info-box"><span>ℹ️</span><span>{children}</span></div>;
}

export function useToast() {
  const [msg, setMsg] = React.useState('');
  const [type, setType] = React.useState('ok');
  const show = (message, t = 'ok') => {
    setMsg(message); setType(t);
    setTimeout(() => setMsg(''), 3500);
  };
  const Toast = msg ? <Alert type={type}>{msg}</Alert> : null;
  return { show, Toast };
}
