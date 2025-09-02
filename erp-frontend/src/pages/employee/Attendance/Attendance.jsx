import React, { useState } from 'react';
import toast from 'react-hot-toast';
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

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/punch-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ forceBackfillDays: 7 }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Sync failed');
            }
            const { fetched = 0, inserted = 0, skipped = 0 } = data;
            toast.success(
                (
                    <div className="text-sm">
                        <div className="font-semibold text-gray-900">Sync Complete</div>
                        <div className="mt-1 text-gray-700">Inserted Rows: <span className="font-medium">{inserted}</span></div>
                        <div className="text-gray-700">Skipped: <span className="font-medium">{skipped}</span></div>
                        <div className="text-gray-700">Fetched: <span className="font-medium">{fetched}</span></div>
                    </div>
                )
            );
        } catch (err) {
            toast.error(`Sync failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
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
