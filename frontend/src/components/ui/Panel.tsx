import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function Panel({ title, children, className = '', action }: PanelProps) {
  return (
    <section className={`panel ${className}`.trim()}>
      <header>
        <h2>{title}</h2>
        {action}
      </header>
      <div className="panel-content">{children}</div>
    </section>
  );
}
