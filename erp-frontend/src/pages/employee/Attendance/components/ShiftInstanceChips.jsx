import React from 'react';

// Displays selectable chips for shift instances (current + previous)
export default function ShiftInstanceChips({ instances = [], selected, onSelect }) {
  if (!instances || instances.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {instances.map((inst, idx) => {
        const key = `${inst.shift_code}@${inst.date}`;
        const active = selected && selected.shift_code === inst.shift_code && selected.date === inst.date;
        const badge = inst.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700';
        const cls = active ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300';
        return (
          <button
            key={`${key}-${idx}`}
            onClick={() => onSelect(inst)}
            className={`px-3 py-1 rounded-full text-sm border border-gray-300 ${badge} ${cls}`}
            title={`${inst.shift_code} • ${inst.date} • mapped: ${inst.mapped_count}`}
          >
            <span className="font-medium">{inst.shift_code}</span>
            <span className="ml-2 text-gray-600">{inst.date}</span>
            {inst.is_active && <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full align-middle" />}
          </button>
        );
      })}
    </div>
  );
}
