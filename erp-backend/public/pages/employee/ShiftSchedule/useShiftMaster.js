import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getAllShifts } from '../../../api/shift.api';
import { fetchEmployees } from '../../../api/employee.api';
import { getShiftScheduleForMonth, saveShiftSchedule, updateShiftAssignment } from '../../../api/shiftSchedule.api';
import toast from 'react-hot-toast';

export const useShiftMaster = (currentDate) => {
  const [employees, setEmployees] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees and shift types in parallel
        const [employeesResponse, shiftsResponse] = await Promise.all([
          fetchEmployees(),
          getAllShifts()
        ]);
        
        setEmployees(employeesResponse);
        setShiftTypes(shiftsResponse.shifts || []);
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch schedule data when month changes
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const scheduleResponse = await getShiftScheduleForMonth(year, month);
        setScheduleData(scheduleResponse.data || {});
      } catch (error) {
        console.error('Error fetching schedule data:', error);
        // Don't show error toast for schedule data as it might not exist yet
        setScheduleData({});
      }
    };

    if (currentDate) {
      fetchScheduleData();
    }
  }, [currentDate]);

  const updateShift = async (employeeId, day, shiftCode) => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const scheduleKey = `${employeeId}_${format(currentDate, 'yyyy-MM')}_${day}`;
      
      // Update local state immediately for better UX
      setScheduleData(prev => ({
        ...prev,
        [scheduleKey]: shiftCode
      }));

      // Update on server
      const date = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
      await updateShiftAssignment(employeeId, date, shiftCode);
      
      toast.success('Shift updated successfully');
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error('Failed to update shift');
      
      // Revert local state on error
      const scheduleKey = `${employeeId}_${format(currentDate, 'yyyy-MM')}_${day}`;
      setScheduleData(prev => {
        const newState = { ...prev };
        delete newState[scheduleKey];
        return newState;
      });
    }
  };

  const saveSchedule = async () => {
    try {
      setIsSaving(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      await saveShiftSchedule({
        year,
        month,
        scheduleData
      });
      
      toast.success('Schedule saved successfully');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    employees,
    shiftTypes,
    scheduleData,
    loading,
    isSaving,
    updateShift,
    saveSchedule
  };
};
