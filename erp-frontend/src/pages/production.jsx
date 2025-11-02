import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Factory, Plus, Settings } from 'lucide-react';
import ProductionPlanningBoard from './production/components/ProductionPlanningBoard';
import ProductionScheduleModal from './production/components/ProductionScheduleModal';
import DepartmentModal from './production/components/DepartmentModal';
import DepartmentDetailsModal from './production/components/DepartmentDetailsModal';
import MachineModal from './production/components/MachineModal';
import { fetchDepartments, addDepartment, updateDepartment, deleteDepartment } from '../api/department.api';
import { fetchMachines, addMachine, updateMachine } from '../api/machine.api';
import { updateOrderStatus } from '../api/order.api';
import { fetchProductionSchedules, addProductionSchedule, updateProductionSchedule as updateProductionScheduleAPI } from '../api/productionSchedule.api';
import toast from 'react-hot-toast';

const Production = () => {
  const [departments, setDepartments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isDepartmentDetailsModalOpen, setIsDepartmentDetailsModalOpen] = useState(false);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [editingMachine, setEditingMachine] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const departmentsData = await fetchDepartments();
      const activeDepartments = departmentsData.filter(d => d.is_active !== false);
      setDepartments(activeDepartments);

      // Auto-select first department if available and none selected
      setSelectedDepartmentId(prev => {
        if (!prev && activeDepartments.length > 0) {
          return activeDepartments[0].department_id;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load departments on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update machines and auto-select when department changes
  useEffect(() => {
    if (!selectedDepartmentId) {
      setMachines([]);
      setSelectedMachineId(null);
      return;
    }

    const loadDepartmentMachines = async () => {
      try {
        const machinesData = await fetchMachines(selectedDepartmentId);
        setMachines(machinesData);
        
        // Auto-select first machine if available and none selected
        setSelectedMachineId(prev => {
          if (machinesData.length > 0 && !prev) {
            return machinesData[0].machine_id;
          } else if (machinesData.length === 0) {
            return null;
          }
          return prev;
        });
      } catch (error) {
        console.error('Error loading machines:', error);
        toast.error('Failed to load machines');
      }
    };

    loadDepartmentMachines();
  }, [selectedDepartmentId]);

  // Load schedules when machine changes
  useEffect(() => {
    const loadSchedules = async () => {
      if (selectedMachineId) {
        try {
          const schedulesData = await fetchProductionSchedules(selectedMachineId);
          setSchedules(schedulesData);
        } catch (error) {
          console.error('Error loading schedules:', error);
          toast.error('Failed to load production schedules');
          setSchedules([]);
        }
      } else {
        setSchedules([]);
      }
    };
    
    loadSchedules();
  }, [selectedMachineId]);

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setIsDepartmentModalOpen(true);
  };

  const handleViewDepartment = (department) => {
    setViewingDepartment(department);
    setIsDepartmentDetailsModalOpen(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setIsDepartmentModalOpen(true);
  };

  const handleDeleteDepartment = async (department) => {
    try {
      await deleteDepartment(department.department_id);
      toast.success(`Department "${department.name}" deleted successfully`);
      await loadData();
      // Clear selection if deleted department was selected
      if (selectedDepartmentId === department.department_id) {
        setSelectedDepartmentId(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete department');
    }
  };

  const handleSaveDepartment = useCallback(async (departmentData) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.department_id, departmentData);
        toast.success('Department updated successfully');
      } else {
        await addDepartment(departmentData);
        toast.success('Department added successfully');
      }
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save department');
    }
  }, [editingDepartment, loadData]);

  const handleAddMachine = () => {
    if (!selectedDepartmentId) {
      toast.error('Please select a department first');
      return;
    }
    setEditingMachine(null);
    setIsMachineModalOpen(true);
  };

  const handleSaveMachine = useCallback(async (machineData) => {
    try {
      if (editingMachine) {
        await updateMachine(editingMachine.machine_id, machineData);
        toast.success('Machine updated successfully');
      } else {
        await addMachine(machineData);
        toast.success('Machine added successfully');
      }
      // Reload machines for the selected department
      if (selectedDepartmentId) {
        const machinesData = await fetchMachines(selectedDepartmentId);
        setMachines(machinesData);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save machine');
    }
  }, [editingMachine, selectedDepartmentId]);

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = useCallback(async (scheduleData) => {
    try {
      const previousSchedule = editingSchedule;
      const previousStatus = previousSchedule?.status;
      const newStatus = scheduleData.status;

      let savedSchedule;
      
      // Save to backend
      if (editingSchedule && editingSchedule.id) {
        // Update existing schedule
        savedSchedule = await updateProductionScheduleAPI(editingSchedule.id, scheduleData);
        setSchedules(prev => prev.map(s => 
          s.id === editingSchedule.id ? savedSchedule : s
        ));
        toast.success('Schedule updated successfully');
      } else {
        // Create new schedule
        savedSchedule = await addProductionSchedule(scheduleData);
        setSchedules(prev => [...prev, savedSchedule]);
        toast.success('Schedule added successfully');
      }

      // Sync order status based on production status changes
      if (savedSchedule.orderId || scheduleData.orderId) {
        const orderId = savedSchedule.orderId || scheduleData.orderId;
        let orderStatusToSet = null;

        // Only update order status if production status changed to a relevant status
        if (newStatus === 'in-progress' && previousStatus !== 'in-progress') {
          // Set order to "In Production" when production starts
          orderStatusToSet = 'In Production';
        } else if (newStatus === 'completed' && previousStatus !== 'completed') {
          // Set order to "Ready for Dispatch" when production completes
          orderStatusToSet = 'Ready for Dispatch';
        }

        // Update order status if needed
        if (orderStatusToSet) {
          try {
            await updateOrderStatus(orderId, orderStatusToSet);
            // Don't show toast for automatic status updates to avoid noise
          } catch (error) {
            console.error('Error updating order status:', error);
            // Silent fail - don't disrupt the user experience
          }
        }
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error(error.message || 'Failed to save schedule');
    }
  }, [editingSchedule]);

  const handleEditSchedule = useCallback((schedule) => {
    setEditingSchedule(schedule);
    setIsScheduleModalOpen(true);
  }, []);

  const handleUpdateSchedule = useCallback(async (scheduleId, updates) => {
    try {
      // Update in backend
      const updatedSchedule = await updateProductionScheduleAPI(scheduleId, updates);
      
      // Update in state
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? updatedSchedule : s
      ));
    } catch (error) {
      console.error('Error updating schedule:', error);
      // Still update state for UI responsiveness, but log error
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, ...updates } : s
      ));
    }
  }, []);

  const handleCloseDepartmentModal = useCallback(() => {
    setIsDepartmentModalOpen(false);
    setEditingDepartment(null);
  }, []);

  const handleCloseDepartmentDetailsModal = useCallback(() => {
    setIsDepartmentDetailsModalOpen(false);
    setViewingDepartment(null);
  }, []);

  const handleCloseMachineModal = useCallback(() => {
    setIsMachineModalOpen(false);
    setEditingMachine(null);
  }, []);

  const handleCloseScheduleModal = useCallback(() => {
    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
  }, []);


  const selectedDepartment = useMemo(
    () => departments.find(d => d.department_id === selectedDepartmentId),
    [departments, selectedDepartmentId]
  );

  const departmentMachines = useMemo(
    () => machines.filter(m => m.department_id === selectedDepartmentId),
    [machines, selectedDepartmentId]
  );

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Departments Row */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Departments</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="overflow-x-auto">
              <div className="flex items-center space-x-3 min-w-max py-2">
                {departments.map(dept => (
                  <div
                    key={dept.department_id}
                    className="relative group"
                  >
                    <button
                      onClick={() => setSelectedDepartmentId(dept.department_id)}
                      onDoubleClick={() => handleViewDepartment(dept)}
                      className={`px-6 py-4 rounded-lg font-semibold text-base whitespace-nowrap transition-all min-w-[140px] flex items-center justify-between space-x-2 ${
                        selectedDepartmentId === dept.department_id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <span>{dept.name}</span>
                    </button>
                  </div>
                ))}
                <div className="border-l-2 border-gray-300 h-12 mx-2"></div>
                <button
                  onClick={handleAddDepartment}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-base whitespace-nowrap min-w-[180px] shadow-md border-2 border-green-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Department</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Machines Row */}
        {selectedDepartmentId && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Machines {selectedDepartment && `- ${selectedDepartment.name}`}
            </h2>
            {departmentMachines.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="overflow-x-auto">
                  <div className="flex items-center space-x-3 min-w-max py-2">
                    {departmentMachines.map(machine => (
                      <button
                        key={machine.machine_id}
                        onClick={() => setSelectedMachineId(machine.machine_id)}
                        className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-semibold text-base whitespace-nowrap transition-all min-w-[160px] ${
                          selectedMachineId === machine.machine_id
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <Settings className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span>{machine.name}</span>
                          {machine.machine_code && (
                            <span className="text-xs opacity-75 font-normal">({machine.machine_code})</span>
                          )}
                        </div>
                      </button>
                    ))}
                    <div className="border-l-2 border-gray-300 h-12 mx-2"></div>
                    <button
                      onClick={handleAddMachine}
                      className="flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-base whitespace-nowrap min-w-[180px] shadow-md border-2 border-green-700"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Machine</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No machines found for this department</p>
                <button
                  onClick={handleAddMachine}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Machine
                </button>
              </div>
            )}
          </div>
        )}

        {/* Planning Board */}
        {selectedMachineId ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ProductionPlanningBoard
              machineId={selectedMachineId}
              onAddSchedule={handleAddSchedule}
              schedules={schedules}
              onEditSchedule={handleEditSchedule}
              onUpdateSchedule={handleUpdateSchedule}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Factory className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {selectedDepartmentId 
                ? 'Please select a machine to view its production schedule'
                : 'Please select a department to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <DepartmentModal
        isOpen={isDepartmentModalOpen}
        onClose={handleCloseDepartmentModal}
        onSave={handleSaveDepartment}
        department={editingDepartment}
      />

      <DepartmentDetailsModal
        isOpen={isDepartmentDetailsModalOpen}
        onClose={handleCloseDepartmentDetailsModal}
        department={viewingDepartment}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
      />

      <MachineModal
        isOpen={isMachineModalOpen}
        onClose={handleCloseMachineModal}
        onSave={handleSaveMachine}
        machine={editingMachine}
        departmentId={selectedDepartmentId}
        departments={departments}
      />

      <ProductionScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={handleCloseScheduleModal}
        onSave={handleSaveSchedule}
        schedule={editingSchedule}
        machineId={selectedMachineId}
        existingSchedules={schedules}
      />
    </div>
  );
};

export default Production;
