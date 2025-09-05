import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Edit3 } from 'lucide-react';
import { addMonths, format } from 'date-fns';
import EditShiftMasterModal from './EditShiftMasterModal';
import ShiftAssignmentDropdown from './ShiftAssignmentDropdown';
import { useShiftMaster } from './useShiftMaster';
import { getShiftColors } from './shiftUtils';
import SelectFillToolbar from './SelectFillToolbar';

const ShiftSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [directAssignShift, setDirectAssignShift] = useState(''); // when set, clicking a cell assigns this shift directly
  
  const {
    employees,
    shiftTypes,
    scheduleData,
  loading,
  updateShift
  } = useShiftMaster(currentDate);

  const currentMonthDisplay = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const getShiftStyle = (shiftCode) => {
    const colors = getShiftColors(shiftCode);
    return `${colors.bgColor} ${colors.textColor} border ${colors.borderColor}`;
  };

  const toggleDirectAssign = (code) => setDirectAssignShift(prev => (prev === code ? '' : code));

  const navigateMonth = (direction) => {
    if (direction === 'next') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (direction === 'prev') {
      setCurrentDate(addMonths(currentDate, -1));
    }
  };

  // Removed manual save; updates are auto-saved on selection

  const handleEditShiftMaster = () => {
    setIsEditModalOpen(true);
  };

  const handleExport = () => {
    console.log('Export shift schedule');
  };

  // Generate array for actual days in current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading shift schedule...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-900">{currentMonthDisplay}</h2>
            {/* Read Only label removed as per user request */}
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

  <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            <Download className="h-4 w-4 text-gray-600" />
            <span>Export</span>
          </button>
          <button
            onClick={handleEditShiftMaster}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Shift Master</span>
          </button>
        </div>
      </div>

      {/* Shift Legend */}
      <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
          <span className="text-sm text-gray-600">OFF: Day Off</span>
        </div>
        {shiftTypes.map(shift => {
          const colors = getShiftColors(shift.shift_code);
          return (
            <div key={shift.shift_code} className="flex items-center space-x-2">
              <div className={`w-4 h-4 ${colors.bgColor} ${colors.borderColor} rounded`}></div>
              <span className="text-sm text-gray-600">
                {shift.shift_code}: {shift.shift_name}
              </span>
            </div>
          );
        })}
      </div>

      <SelectFillToolbar
        shiftTypes={shiftTypes}
        directAssignShift={directAssignShift}
        onSelectShift={toggleDirectAssign}
        headerOffset={80}
      />

      {/* Shift Schedule Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-60 sticky left-0 z-20 bg-gray-50 border-r border-gray-200">
                  Employee
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee, index) => (
                <tr key={employee.emp_code || employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className={`px-6 py-4 whitespace-nowrap w-60 sticky left-0 z-10 border-r border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {(employee.emp_name || employee.name).split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{employee.emp_name || employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.emp_code || employee.id}</div>
                      </div>
                    </div>
                  </td>
                  {days.map((day) => {
                    const scheduleKey = `${employee.emp_code || employee.id}_${format(currentDate, 'yyyy-MM')}_${day}`;
                    const shiftCode = scheduleData[scheduleKey] || '';
                    const cellDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    return (
                      <td key={day} className="px-1 py-4 text-center w-12">
                        <div className="flex justify-center">
                          <ShiftAssignmentDropdown
                            currentShift={shiftCode}
                            shiftTypes={shiftTypes}
                            onShiftChange={updateShift}
                            employeeId={employee.emp_code || employee.id}
                            day={day}
                            isReadOnly={false}
                            cellDateObj={cellDateObj}
                            directAssignShift={directAssignShift}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Shift Master Modal */}
      <EditShiftMasterModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default ShiftSchedule;
