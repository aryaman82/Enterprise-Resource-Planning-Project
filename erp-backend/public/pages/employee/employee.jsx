import React, { useState } from 'react';
import { Users } from 'lucide-react';
import EmployeeDetails from './EmployeeDetails/EmployeeDetails';
import Attendance from './Attendance/Attendance';
import ShiftSchedule from './ShiftSchedule/ShiftSchedule';
import WorkTime from './WorkTime/WorkTime';

const Employee = () => {
  const [activeTab, setActiveTab] = useState('Employee Details');

  const tabs = ['Employee Details', 'Attendance', 'Shift Schedule', 'Work Time'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Employee Details':
        return <EmployeeDetails />;
      case 'Attendance':
        return <Attendance />;
      case 'Shift Schedule':
        return <ShiftSchedule />;
      case 'Work Time':
        return <WorkTime />;
      default:
        return <EmployeeDetails />;
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            {/* Employee Icon */}
            <div className="flex-shrink-0">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            
            {/* Page Title and Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
              <p className="text-gray-600 mt-1">Manage all employee-related activities and information.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg border-l border-r border-t border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600'
                  } px-4 py-4 text-sm font-medium transition-all duration-200 border-b-2 border-transparent focus:outline-none whitespace-nowrap bg-transparent hover:bg-transparent`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg border-l border-r border-b border-gray-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Employee;
