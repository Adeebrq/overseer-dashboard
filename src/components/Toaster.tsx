import { dismiss, pause, resume, useToasts } from '../lib/toast'

/** Bottom-right toast stack. Mounted once in App; use `toast()` from src/lib/toast.ts to show one. */
export default function Toaster() {
  const toasts = useToasts()
  return (
    <section className="toaster" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.tone}${t.leaving ? ' is-leaving' : ''}`}
          role={t.tone === 'error' ? 'alert' : 'status'}
          aria-live={t.tone === 'error' ? 'assertive' : 'polite'}
          onPointerEnter={() => pause(t.id)}
          onPointerLeave={() => resume(t.id)}
          onFocus={() => pause(t.id)}
          onBlur={() => resume(t.id)}
        >
          <span className="toast__icon" aria-hidden="true">
            <svg viewBox="0 0 10 10">
              <path
                d={t.tone === 'success' ? 'M2 5.2 4.1 7.3 8 2.8' : 'M3 3l4 4M7 3 3 7'}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="toast__body">
            <span className="toast__title">{t.title}</span>
            {t.description && <span className="toast__desc">{t.description}</span>}
          </span>
          {t.action && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                t.action?.run()
                dismiss(t.id)
              }}
            >
              {t.action.label}
            </button>
          )}
          <button className="icon-btn toast__close" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
            <svg viewBox="0 0 10 10" aria-hidden="true">
              <path d="M3 3l4 4M7 3 3 7" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </section>
  )
}
