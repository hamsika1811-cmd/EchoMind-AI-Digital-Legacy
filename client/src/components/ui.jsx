import React from "react";

export function Button({ as: As = "button", variant = "primary", size = "md", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  const variants = {
    primary: "bg-primary text-white hover:bg-secondary shadow-soft",
    accent: "bg-accent text-primary hover:brightness-95 shadow-soft",
    outline: "border border-primary/20 text-primary hover:bg-primary/5",
    ghost: "text-primary hover:bg-primary/5",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <As className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </As>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-soft ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    gold: "bg-accent/15 text-accent",
    indigo: "bg-primary/10 text-primary",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
      <input
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-ink placeholder:text-muted focus-ring transition-colors ${
          error ? "border-red-400" : "border-slate-200 focus:border-primary"
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
      <textarea
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-ink placeholder:text-muted focus-ring transition-colors ${
          error ? "border-red-400" : "border-slate-200 focus:border-primary"
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Select({ label, className = "", children, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
      <select
        className={`w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-ink focus-ring focus:border-primary bg-white ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-in">
      {icon && <div className="mb-4 text-primary/40">{icon}</div>}
      <h3 className="text-lg font-semibold text-ink mb-1.5">{title}</h3>
      {description && <p className="text-sm text-muted max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-soft w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink focus-ring rounded-lg p-1" aria-label="Close">
            ✕
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

let toastId = 0;
const toastListeners = new Set();

export function pushToast(message, tone = "success") {
  const id = ++toastId;
  toastListeners.forEach((fn) => fn({ id, message, tone }));
}

export function ToastHost() {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    const handler = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3200);
    };
    toastListeners.add(handler);
    return () => toastListeners.delete(handler);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[calc(100%-2.5rem)] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-in rounded-xl px-4 py-3 text-sm font-medium shadow-soft text-white ${
            t.tone === "error" ? "bg-red-600" : t.tone === "info" ? "bg-primary" : "bg-emerald-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-muted">{description}</p>
    </Modal>
  );
}
