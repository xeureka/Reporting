import type { ReactNode } from 'react';

import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import { StatusMessage } from './StatusMessage';

type QueryFeedbackProps = {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  skeletonHeight?: number | string;
};

export function QueryFeedback({
  isLoading,
  isError,
  error,
  isEmpty = false,
  emptyMessage = 'No data available.',
  children,
  skeletonHeight,
}: QueryFeedbackProps) {
  if (isLoading) {
    return (
      <div className="query-loading">
        <Skeleton height={skeletonHeight} />
      </div>
    );
  }

  if (isError) {
    return (
      <StatusMessage variant="error">
        {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
      </StatusMessage>
    );
  }

  if (isEmpty) return <EmptyState message={emptyMessage} />;

  return <>{children}</>;
}
