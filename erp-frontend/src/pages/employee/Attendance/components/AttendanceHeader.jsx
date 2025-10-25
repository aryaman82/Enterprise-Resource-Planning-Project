import React from 'react';

const AttendanceHeader = ({
  title = 'Attendance',
  selectedDate,
  setSelectedDate,
  shiftCode,
  setShiftCode,
  shiftOptions = [],
  loading = false,
  onOpenImport,
  onRefresh,
}) => {
  const formatTime = (t) => {
    if (!t) return null;
    if (typeof t === 'string') {
      // Expecting 'HH:MM:SS' or 'HH:MM'
      return t.slice(0,5);
    }
    try {
      const d = new Date(t);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return String(t);
    }
  };

  const getLabel = (s) => {
    const code = s.shift_code || s.code || s.id;
    const name = s.shift_name || s.name || '';
    const start = formatTime(s.start_time);
    const end = formatTime(s.end_time);
    const timePart = start && end ? ` (${start}-${end})` : '';
    return `${code}${name ? ` — ${name}` : ''}${timePart}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
      <div>
        <div className="text-lg font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">Showing: {shiftCode || '-'} @ {selectedDate}</div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <select
          value={shiftCode}
          onChange={(e) => setShiftCode(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Select shift</option>
          {shiftOptions.map((s) => (
            <option key={s.shift_code || s.code || s.id} value={s.shift_code || s.code || s.id}>
              {getLabel(s)}
            </option>
          ))}
        </select>
        <button
          onClick={onOpenImport}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Data Import
        </button>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceHeader;
