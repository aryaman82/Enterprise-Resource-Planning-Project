import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Plus, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import AddEmployeeModal from './AddEmployeeModal';
import { fetchEmployees, getEmployee, deleteEmployee, deleteEmployeeForce, addEmployee, getEmployeeDependencies } from '../../../api/employee.api'; // ✅ Import API
import Papa from 'papaparse';

const EmployeeDetails = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Load employees from backend on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmployees(); // ✅ API call
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees');
      setEmployees([]);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit employee
  const handleEdit = async (employeeId) => {
    try {
      const employee = await getEmployee(employeeId);
      setEditingEmployee(employee);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching employee for edit:', error);
      toast.error('Failed to load employee data for editing');
    }
  };

  // Handle delete employee with toast notifications
  const handleDelete = async (employeeId) => {
    // Find employee name for confirmation
    const employee = employees.find(emp => emp.emp_code === employeeId);
    const employeeName = employee?.name || 'this employee';

    // Show confirmation toast
    toast((t) => (
      <div className="flex flex-col text-gray-900" style={{ maxWidth: 420 }}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">Delete Employee</h4>
          <button aria-label="Close" onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <p className="text-[13px] text-gray-700 mb-4">
          Are you sure you want to delete <span className="font-medium">{employeeName}</span>? This action cannot be undone.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(employeeId, employeeName);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: { background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    });
  };

  // Confirm and execute delete
  const confirmDelete = async (employeeId, employeeName) => {
    try {
      // First, check dependencies to avoid generating a 409 and duplicate messages
      const deps = await getEmployeeDependencies(employeeId);
      const hasDeps = (deps?.shiftSchedules || 0) > 0 || (deps?.otApprovals || 0) > 0;

      if (hasDeps) {
        // Show hard-delete confirmation directly
        toast((t) => (
          <div className="flex flex-col text-gray-900" style={{ maxWidth: 440 }}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Delete Blocked</h4>
              <button aria-label="Close" onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <p className="text-[13px] text-gray-700 mb-1">This employee has linked records and cannot be deleted directly.</p>
            <p className="text-[12px] text-gray-500 mb-2">Shift schedules: {deps.shiftSchedules}, OT approvals: {deps.otApprovals}</p>
            <p className="text-[12px] text-red-700 mb-4">Hard delete will also remove these related records for <span className="font-medium">{employeeName}</span>. This cannot be undone.</p>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  const loadingToast = toast.loading('Hard deleting employee...');
                  try {
                    await deleteEmployeeForce(employeeId);
                    toast.dismiss(loadingToast);
                    toast.success(`${employeeName} was hard-deleted`, { icon: '⚠️' });
                    await loadEmployees();
                  } catch (e) {
                    toast.dismiss(loadingToast);
                    toast.error(e?.message || 'Hard delete failed');
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Hard Delete
              </button>
              <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        ), { duration: Infinity, style: { background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } });
        return;
      }

      // No dependencies: proceed with normal delete
      const loadingToast = toast.loading('Deleting employee...');
      await deleteEmployee(employeeId);
      toast.dismiss(loadingToast);
      toast.success(`${employeeName} has been deleted successfully`, { icon: '🗑️' });
      await loadEmployees();
    } catch (error) {
      const msg = error?.payload?.message || error?.message || 'Failed to delete employee. Please try again.';
      toast.error(msg);
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      'emp_code',
      'name',
      'role',
      'email',
      'contact',
      'joining_date',
      'address',
    ];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Trigger file picker
  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Normalize keys of a parsed row
  const normalizeRow = (row) => {
    const out = {};
    Object.keys(row || {}).forEach((k) => {
      const key = (k || '').trim().toLowerCase();
      out[key] = typeof row[k] === 'string' ? row[k].trim() : row[k];
    });
    return out;
  };

  // Validate and shape a row into employee payload
  const shapeEmployee = (row) => {
    const r = normalizeRow(row);
    const emp = {
      emp_code: r.emp_code || '',
      name: r.name || '',
      role: r.role || '',
      email: r.email || '',
      contact: r.contact || '',
      joining_date: r.joining_date || '',
      address: r.address || '',
    };

    // joining_date must be YYYY-MM-DD or empty
    if (emp.joining_date) {
      const iso = /^\d{4}-\d{2}-\d{2}$/;
      if (!iso.test(emp.joining_date)) {
        throw new Error(`Invalid joining_date '${emp.joining_date}'. Use YYYY-MM-DD.`);
      }
    }

    // Required fields
    if (!emp.emp_code || !emp.name) {
      throw new Error('Missing required fields (emp_code, name)');
    }

    return emp;
  };

  // Handle file selection and import
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    // reset file input so selecting the same file again still triggers change
    e.target.value = '';
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = Array.isArray(results.data) ? results.data : [];
        if (rows.length === 0) {
          toast('No rows found in file. Ensure the header row exists.', { icon: 'ℹ️' });
          return;
        }

        const importToast = toast.loading('Validating and importing employees...');

        let success = 0;
        let failed = 0;
        const errors = [];

        // Validate and import sequentially to avoid overloading the API
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          try {
            const emp = shapeEmployee(row);
            await addEmployee(emp);
            success += 1;
          } catch (err) {
            failed += 1;
            const msg = err?.message || 'Unknown error';
            errors.push(`Row ${i + 2}: ${msg}`); // +2 to account for header row (1) and zero-index
          }
        }

        toast.dismiss(importToast);
        if (success > 0) {
          toast.success(`Imported ${success} employee${success !== 1 ? 's' : ''}${failed ? `, ${failed} failed` : ''}.`);
          // Refresh table
          await loadEmployees();
        }
        if (failed > 0) {
          // Show a compact error toast; for long details, log to console
          const first = errors.slice(0, 5).join('\n');
          toast.error(`Some rows failed. Top issues:\n${first}${errors.length > 5 ? `\n...and ${errors.length - 5} more` : ''}`);
          // Also log full list for debugging
          console.error('Import errors:', errors);
        }
      },
      error: (err) => {
        toast.error(`Failed to parse file: ${err.message || err}`);
      },
    });
  };

  // Filter employees based on search term
  const filteredEmployees = Array.isArray(employees)
    ? employees.filter((employee) =>
        employee &&
        (
          (employee.name && employee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (employee.role && employee.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (employee.emp_code && employee.emp_code.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          Loading employees...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <div className="text-red-800">{error}</div>
          <button
            onClick={loadEmployees}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Search & Actions */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Import */}
                <button
                  onClick={handleImportClick}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
                  title="Download CSV template"
                >
                  Template
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Employee
                </button>
                {/* Hidden file input for CSV */}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Employee List ({filteredEmployees.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joining Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.emp_code} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Unknown')}&background=e5e7eb&color=6b7280`}
                                alt={employee.name || 'Unknown'}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{employee.emp_code || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{employee.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.role || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.contact || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(employee.emp_code)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150"
                              title="Edit Employee"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(employee.emp_code)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                              title="Delete Employee"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm
                          ? 'No employees found matching your search.'
                          : 'No employees found. Add some employees to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refreshEmployees={loadEmployees}
      />

      {/* Edit Employee Modal */}
      <AddEmployeeModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        refreshEmployees={loadEmployees}
        mode="edit"
        initialData={editingEmployee}
      />
    </div>
  );
};

export default EmployeeDetails;
