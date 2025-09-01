import React, { useState } from 'react';
import AttendanceFilters from './components/AttendanceFilters';
import AttendanceTable from './components/AttendanceTable';
import FlaggedEmployeesTable from './components/FlaggedEmployeesTable';
import { sampleAttendanceData, flaggedAttendanceData, filterAttendanceData } from './data/attendanceData';

const Attendance = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [shiftFilter, setShiftFilter] = useState('All');
    const [loading, setLoading] = useState(false);

    // Filter attendance data (by search + shift)
    const filteredAttendanceData = filterAttendanceData(sampleAttendanceData, searchTerm, undefined, shiftFilter);

    const handleRefresh = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* Filters and Actions Bar */}
            <AttendanceFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                shiftFilter={shiftFilter}
                setShiftFilter={setShiftFilter}
                loading={loading}
                handleRefresh={handleRefresh}
            />

            {/* Flagged Employees */}
            <FlaggedEmployeesTable data={flaggedAttendanceData} />


            {/* Employee Attendance List */}
            <AttendanceTable
                attendanceData={filteredAttendanceData}
                loading={loading}
                onRefresh={handleRefresh}
            />
        </div>
    );
};

export default Attendance;
