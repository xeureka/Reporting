import type { ReactNode } from 'react';

type ToolbarProps = {
  children: ReactNode;
  label?: string;
};

export function Toolbar({ children, label = 'Page actions' }: ToolbarProps) {
  return (
    <div className="toolbar" role="toolbar" aria-label={label}>
      {children}
    </div>
  );
}

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented-control" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? 'active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
