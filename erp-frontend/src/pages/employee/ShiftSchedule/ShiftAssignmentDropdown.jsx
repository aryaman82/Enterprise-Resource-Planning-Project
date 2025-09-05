import React, { useState, useRef, useEffect } from 'react';
import { getShiftColors } from './shiftUtils';
import toast from 'react-hot-toast';

const ShiftAssignmentDropdown = ({ 
  currentShift, 
  shiftTypes, 
  onShiftChange, 
  employeeId, 
  day,
  isReadOnly = false,
  cellDateObj,
  directAssignShift = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleShiftSelect = (shiftCode) => {
    // Determine if this is a previous date
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const cellDate = cellDateObj ? new Date(cellDateObj.getFullYear(), cellDateObj.getMonth(), cellDateObj.getDate()) : todayDate;
    const isPast = cellDate < todayDate;
    if (isPast && !directAssignShift) {
      toast((t) => (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">Edit Past Date</span>
          </div>
          <p className="text-sm text-gray-600">
            You are editing a previous date. Are you sure you want to update this shift?
          </p>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              onClick={() => {
                toast.dismiss(t.id);
                onShiftChange(employeeId, day, shiftCode);
                setIsOpen(false);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        style: {
          background: '#fff',
          color: '#000',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          minWidth: '300px',
        },
      });
      setIsOpen(false);
      return;
    }
    onShiftChange(employeeId, day, shiftCode);
    setIsOpen(false);
  };

  const currentColors = getShiftColors(currentShift);
  const isUnassigned = !currentShift;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          if (isReadOnly) return;
          if (directAssignShift) {
            // Direct assign overrides confirmation and dropdown
            handleShiftSelect(directAssignShift);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-xs font-medium transition-opacity ${currentColors.bgColor} ${currentColors.textColor} border ${currentColors.borderColor} ${
          isReadOnly ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
        } ${isUnassigned ? 'bg-transparent text-gray-300 border-transparent hover:bg-gray-100 font-normal' : ''} ${directAssignShift ? 'ring-1 ring-blue-400' : ''}`}
        disabled={isReadOnly}
      >
        {currentShift || String(day)}
      </button>

  {isOpen && !isReadOnly && !directAssignShift && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 min-w-[200px]">
          <div className="grid grid-cols-2 gap-2">
            
            {/* Dynamic shift options */}
            {shiftTypes.map((shift) => {
              const colors = getShiftColors(shift.shift_code);
              return (
                <button
                  key={shift.shift_code}
                  onClick={() => handleShiftSelect(shift.shift_code)}
                  className={`flex items-center justify-center rounded-full border transition-colors group shadow-sm mb-1 w-full h-10 min-w-[80px] max-w-[120px] px-4 ${colors.bgColor} ${colors.textColor} ${colors.borderColor}`}
                >
                  <span className="text-sm font-semibold">{shift.shift_code}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftAssignmentDropdown;
