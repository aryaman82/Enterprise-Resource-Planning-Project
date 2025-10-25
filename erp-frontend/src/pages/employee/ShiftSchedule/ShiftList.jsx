import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const ShiftList = ({ shifts, fetchingShifts, getShiftColors, formatTime, onEdit, onDelete }) => {
  if (fetchingShifts) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading shifts...</div>
      </div>
    );
  }
  if (!shifts.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No shifts found</div>
        <div className="text-sm text-gray-400">Add your first shift to get started</div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {shifts.map((shift, index) => {
        const colors = getShiftColors(shift.shift_code);
        const timeRange = `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`;
        return (
          <div
            key={shift.shift_code || `shift-${index}`}
            className={`p-4 rounded-lg border ${colors.bgColor} ${colors.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`font-medium ${colors.textColor}`}>
                    {shift.shift_name} ({shift.shift_code})
                  </h4>
                </div>
                <p className="text-sm text-gray-600">{timeRange}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(shift.shift_code)}
                  className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                  title="Edit shift"
                >
                  <Edit3 className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onDelete(shift)}
                  className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                  title="Delete shift"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShiftList;
