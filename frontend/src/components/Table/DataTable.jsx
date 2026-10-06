import React from 'react'
import { SkeletonRow } from '../Loading/Spinner'
import { Inbox } from 'lucide-react'

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  onRowClick,
  className = ''
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Inbox className="w-10 h-10 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your filters or search term</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-slate-50/80 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
