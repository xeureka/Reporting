type MetricCardProps = {
  label: string;
  value: string | number;
  hint: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <section className="metric-card" aria-label={`${label}: ${value}`}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <small className="metric-hint">{hint}</small>
    </section>
  );
}
