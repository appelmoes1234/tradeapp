type StatusCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'good' | 'warn' | 'danger' | 'neutral';
};

export function StatusCard({ label, value, detail, tone = 'neutral' }: StatusCardProps) {
  return (
    <section className={`status-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </section>
  );
}
