import type { ReactNode } from 'react';

type StatusMessageProps = {
  children: ReactNode;
  variant?: 'success' | 'error';
};

export function StatusMessage({ children, variant = 'success' }: StatusMessageProps) {
  return (
    <div
      className={`status-message status-message-${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {children}
    </div>
  );
}
