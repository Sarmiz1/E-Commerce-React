import { useState, useRef } from "react";

export const CheckSvg = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Spinner = ({ s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="ob-spin">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".2" />
    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity=".75" />
  </svg>
);

export function FF({ label, error, optional, hint, children }) {
  return (
    <div>
      {label && <label className={`ob-label${optional ? " ob-label-opt" : ""}`}>{label}</label>}
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, lineHeight: 1.5 }}>{hint}</p>}
      {error && <p className="ob-error">{error}</p>}
    </div>
  );
}

export function ChipGroup({ options, value = [], onChange, role }) {
  const sel = role === "buyer" ? "buyer-selected" : "seller-selected";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" className={`ob-chip${on ? ` ${sel}` : ""}`}
            onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}>
            {on && <CheckSvg />}{o}
          </button>
        );
      })}
    </div>
  );
}

export function UploadZone({ label, hint, value, onChange, role, aspect }) {
  const ref = useRef(null);
  const [over, setOver] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const handle = (f) => { 
    if (!f?.type.startsWith("image/")) return; 
    const url = URL.createObjectURL(f); 
    setPreview(url); 
    onChange?.(f, url); 
  };
  return (
    <div className={`ob-drop${role === "buyer" ? " buyer" : ""}${over ? " over" : ""}`}
      style={{ minHeight: aspect === "banner" ? 100 : 80, display: "flex", alignItems: "center", justifyContent: "center" }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handle(e.target.files[0])} />
      {preview ? (
        <div style={{ position: "relative", width: "100%", height: aspect === "banner" ? 96 : 76 }}>
          <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
          <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); onChange?.(null, null); }}
            style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,.65)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>✕</button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "18px 16px" }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{aspect === "logo" ? "🖼" : aspect === "banner" ? "🏞" : aspect === "avatar" ? "👤" : "📁"}</div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 2 }}>{label}</p>
          <p style={{ fontSize: 11, color: "var(--text-3)" }}>{hint || "PNG or JPG · Drag or click"}</p>
        </div>
      )}
    </div>
  );
}

export function StepActions({ role, isSubmitting, onSkip, label = "Save & Continue" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8, borderTop: "1px solid var(--border)", marginTop: 4 }}>
      <button type="submit" className={`ob-btn-primary ${role}`} disabled={isSubmitting}>
        {isSubmitting ? <><Spinner s={13} /> Saving…</> : <>{label} →</>}
      </button>
      {onSkip && <button type="button" className="ob-btn-skip" onClick={onSkip}>Skip for now</button>}
    </div>
  );
}
