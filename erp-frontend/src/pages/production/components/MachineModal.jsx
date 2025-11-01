import React, { useState, useEffect } from 'react';
import { X, Settings, Hash, Calendar, Gauge, User } from 'lucide-react';

const MachineModal = ({ isOpen, onClose, onSave, machine = null, departmentId, departments = [] }) => {
  const [formData, setFormData] = useState({
    department_id: departmentId || '',
    name: '',
    machine_code: '',
    machine_type: '',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    installation_date: '',
    capacity_per_hour: '',
    status: 'idle',
    remarks: ''
  });

  useEffect(() => {
    if (machine) {
      setFormData({
        department_id: machine.department_id || departmentId || '',
        name: machine.name || '',
        machine_code: machine.machine_code || '',
        machine_type: machine.machine_type || '',
        manufacturer: machine.manufacturer || '',
        model_number: machine.model_number || '',
        serial_number: machine.serial_number || '',
        installation_date: machine.installation_date || '',
        capacity_per_hour: machine.capacity_per_hour || '',
        status: machine.status || 'idle',
        remarks: machine.remarks || ''
      });
    } else {
      setFormData({
        department_id: departmentId || '',
        name: '',
        machine_code: '',
        machine_type: '',
        manufacturer: '',
        model_number: '',
        serial_number: '',
        installation_date: '',
        capacity_per_hour: '',
        status: 'idle',
        remarks: ''
      });
    }
  }, [machine, departmentId, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      capacity_per_hour: formData.capacity_per_hour ? parseInt(formData.capacity_per_hour) : null,
      department_id: parseInt(formData.department_id)
    };
    onSave(submitData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {machine ? 'Edit Machine' : 'Add Machine'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Department and Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4" />
                <span>Department *</span>
              </label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!!departmentId}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Settings className="h-4 w-4" />
                <span>Machine Name *</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Machine 1"
              />
            </div>
          </div>

          {/* Machine Code and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Hash className="h-4 w-4" />
                <span>Machine Code</span>
              </label>
              <input
                type="text"
                value={formData.machine_code}
                onChange={(e) => setFormData({ ...formData, machine_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., MACH-001"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Machine Type
              </label>
              <input
                type="text"
                value={formData.machine_type}
                onChange={(e) => setFormData({ ...formData, machine_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Forming, Printing"
              />
            </div>
          </div>

          {/* Manufacturer and Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Manufacturer name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Model Number
              </label>
              <input
                type="text"
                value={formData.model_number}
                onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Model number"
              />
            </div>
          </div>

          {/* Serial Number and Installation Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Serial number"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4" />
                <span>Installation Date</span>
              </label>
              <input
                type="date"
                value={formData.installation_date}
                onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Capacity and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Gauge className="h-4 w-4" />
                <span>Capacity per Hour</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity_per_hour}
                onChange={(e) => setFormData({ ...formData, capacity_per_hour: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Units per hour"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="idle">Idle</option>
                <option value="running">Running</option>
                <option value="maintenance">Maintenance</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {machine ? 'Update Machine' : 'Add Machine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineModal;

