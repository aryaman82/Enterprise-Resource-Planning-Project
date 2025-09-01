// Sample attendance data for the attendance module
export const sampleAttendanceData = [
  {
    id: '39488846',
    name: 'Bagus Fikri',
    clockIn: '10:02 AM',
    clockOut: '07:00 PM',
    overtime: '2h 12m',
    status: 'Present',
  shift: 'Shift A',
    notes: 'Discussed mutual value proposition...',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bagus'
  },
  {
    id: '34534543',
    name: 'Ihdzain',
    clockIn: '09:30 AM',
    clockOut: '07:12 PM',
    overtime: '-',
    status: 'Present',
  shift: 'Shift A',
    notes: 'Tynisha is already lined up for th...',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ihdzain'
  },
  {
    id: '82747837',
    name: 'Mufli Hidayat',
    clockIn: '09:24 AM',
    clockOut: '05:00 PM',
    overtime: '-',
    status: 'Left for the day',
  shift: 'Shift B',
    notes: 'Marci is already doing some gre...',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mufli'
  },
  {
    id: '39488844',
    name: 'Fauzan Ardiansyah',
    clockIn: '08:56 AM',
    clockOut: '05:01 PM',
    overtime: '-',
    status: 'Absent',
  shift: 'Shift C',
    notes: 'Tynisha is already lined up for th...',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fauzan'
  },
  {
    id: '93884744',
    name: 'Raihan Fikri',
    clockIn: '08:56 AM',
    clockOut: '07:00 PM',
    overtime: '1h 05m',
    status: 'Present',
  shift: 'Shift B',
    notes: 'Discussed mutual value proposi...',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raihan'
  }
];

// Utility functions for attendance calculations
export const calculateAttendanceSummary = (attendanceData) => {
  return {
    total: attendanceData.length,
    present: attendanceData.filter(emp => emp.status === 'Present').length,
    absent: attendanceData.filter(emp => emp.status === 'Absent').length,
    leftEarly: attendanceData.filter(emp => emp.status === 'Left for the day').length
  };
};

export const filterAttendanceData = (data, searchTerm = '', statusFilter = 'All', shiftFilter = 'All') => {
  return data.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.id.includes(searchTerm) ||
                         employee.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
    const matchesShift = shiftFilter === 'All' || employee.shift === shiftFilter;
    
    return matchesSearch && matchesStatus && matchesShift;
  });
};

// Flagged employees sample
export const flaggedAttendanceData = [
  {
    id: '39488846',
    name: 'Bagus Fikri',
    reason: 'Late clock-in',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bagus'
  },
  {
    id: '39488844',
    name: 'Fauzan Ardiansyah',
    reason: 'Forgot to clock-out',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fauzan'
  }
];
