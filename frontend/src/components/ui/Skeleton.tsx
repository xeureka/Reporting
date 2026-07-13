type SkeletonProps = {
  height?: number | string;
  className?: string;
};

export function Skeleton({ height = 260, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ height }}
      aria-label="Loading"
      role="status"
    />
  );
}
