import type { ReactNode } from 'react';

type PageProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function Page({ title, subtitle, children, actions }: PageProps) {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {actions}
      </header>
      <div className="divider" />
      <div className="page-body">{children}</div>
    </div>
  );
}
