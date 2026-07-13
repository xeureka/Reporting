import type { ReactNode } from 'react';

type TableColumn<T extends { id: string }> = {
  label: string;
  render: (row: T) => ReactNode;
};

type TableProps<T extends { id: string }> = {
  rows: T[];
  columns: TableColumn<T>[];
  emptyMessage?: string;
  caption?: string;
};

export function Table<T extends { id: string }>({
  rows,
  columns,
  emptyMessage,
  caption,
}: TableProps<T>) {
  if (rows.length === 0 && emptyMessage) {
    return <p className="table-empty">{emptyMessage}</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.label}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
