type EmptyStateProps = {
  message: string;
  description?: string;
};

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      {description && <small>{description}</small>}
    </div>
  );
}
