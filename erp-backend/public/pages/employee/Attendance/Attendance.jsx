import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AttendanceTable from './components/AttendanceTable';
import FlaggedEmployeesTable from './components/FlaggedEmployeesTable';
import { flaggedAttendanceData } from './data/attendanceData';
import { getAttendanceForShift } from '../../../api/attendance.api';
// Removed ShiftInstanceChips in favor of inline filters
import AttendanceHeader from './components/AttendanceHeader';
import { getAllShifts } from '../../../api/shift.api';

const Attendance = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [shiftCode, setShiftCode] = useState('');
    const [mode, setMode] = useState('current'); // 'current' | 'byDate'
    // const [currentOptions, setCurrentOptions] = useState([]); // {shift_code,date}
    // const [recentInstances, setRecentInstances] = useState([]); // kept for future use if needed
    const [shiftOptions, setShiftOptions] = useState([]);
    const [showImport, setShowImport] = useState(false);
    const [importFrom, setImportFrom] = useState('');
    const [importTo, setImportTo] = useState('');

    const loadCurrent = async () => {
        // Default: D for 05:00-17:00, otherwise N; use today's date
        setLoading(true); setError(null);
        try {
            const now = new Date();
            const hours = now.getHours();
            const defaultShift = hours >= 5 && hours < 17 ? 'D' : 'N';
            const todayISO = new Date().toISOString().split('T')[0];

            setShiftCode(defaultShift);
            setSelectedDate(todayISO);

            const attend = await getAttendanceForShift({ date: todayISO, shift_code: defaultShift });
            setAttendanceRows(attend.data.map(r => ({
                id: r.emp_code,
                name: r.name || r.emp_code,
                clockIn: r.clock_in ? new Date(r.clock_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
                clockOut: r.clock_out ? new Date(r.clock_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
                status: r.status,
                shift: r.shift_code,
                notes: ''
            })));
        } catch (e) {
            console.error(e);
            setError(e.message);
            setAttendanceRows([]);
        } finally {
            setLoading(false);
        }
    };

    const loadByDateShift = async () => {
        if (!selectedDate || !shiftCode) return;
        setLoading(true); setError(null);
        try {
            const attend = await getAttendanceForShift({ date: selectedDate, shift_code: shiftCode });
            setAttendanceRows(attend.data.map(r => ({
                id: r.emp_code,
                name: r.name || r.emp_code,
                clockIn: r.clock_in ? new Date(r.clock_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
                clockOut: r.clock_out ? new Date(r.clock_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
                status: r.status,
                shift: r.shift_code,
                notes: ''
            })));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mode === 'current') {
            loadCurrent();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    useEffect(() => {
        if (mode === 'byDate' && shiftCode && selectedDate) {
            loadByDateShift();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, shiftCode, selectedDate]);

    // Fetch shift options once
    useEffect(() => {
        (async () => {
            try {
                const res = await getAllShifts();
                // Backend returns { success, shifts: [...] }
                setShiftOptions(Array.isArray(res.shifts) ? res.shifts : []);
            } catch (e) {
                console.error('Failed to load shifts:', e.message);
                setShiftOptions([]);
            }
        })();
    }, []);

    const filteredAttendanceData = attendanceRows;

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

    const handleImport = async () => {
        if (!importFrom || !importTo) {
            toast.error('Please select both From and To dates');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/punch-sync/range', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: importFrom, to: importTo }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Import failed');
            const { fetched = 0, inserted = 0, skipped = 0 } = data;
            toast.success(
                (
                    <div className="text-sm">
                        <div className="font-semibold text-gray-900">Import Complete</div>
                        <div className="mt-1 text-gray-700">Inserted Rows: <span className="font-medium">{inserted}</span></div>
                        <div className="text-gray-700">Skipped: <span className="font-medium">{skipped}</span></div>
                        <div className="text-gray-700">Fetched: <span className="font-medium">{fetched}</span></div>
                    </div>
                )
            );
            setShowImport(false);
            // Refresh grid for current view
            if (mode === 'current') await loadCurrent(); else await loadByDateShift();
        } catch (e) {
            toast.error(`Import failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className="space-y-6">
                        {/* Minimal header with refresh */}
                        <AttendanceHeader
                            title="Attendance"
                            selectedDate={selectedDate}
                            setSelectedDate={(d) => { setSelectedDate(d); setMode('byDate'); }}
                            shiftCode={shiftCode}
                            setShiftCode={(c) => { setShiftCode(c); setMode('byDate'); }}
                            shiftOptions={shiftOptions}
                            loading={loading}
                            onOpenImport={() => setShowImport(true)}
                            onRefresh={handleRefresh}
                        />

                        {/* Removed chip selector; filters above control the view */}

            {/* Flagged Employees */}
            <FlaggedEmployeesTable data={flaggedAttendanceData} />


            {/* Employee Attendance List */}
            <AttendanceTable
                attendanceData={filteredAttendanceData}
                loading={loading}
                error={error}
                onRefresh={mode === 'current' ? loadCurrent : loadByDateShift}
            />
        </div>
    {showImport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                    <div className="text-lg font-semibold mb-4">Import Punch Data</div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">From</label>
                            <input type="date" value={importFrom} onChange={(e)=>setImportFrom(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">To</label>
                            <input type="date" value={importTo} onChange={(e)=>setImportTo(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button onClick={()=>setShowImport(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                        <button onClick={handleImport} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Import</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default Attendance;
