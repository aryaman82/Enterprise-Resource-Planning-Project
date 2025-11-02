import React from 'react';
import { Activity, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';

const MachineStatusPanel = ({ machineId, machineName, status, currentProduction }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'running':
        return {
          icon: <Activity className="h-5 w-5 text-green-600 animate-pulse" />,
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          label: 'Running'
        };
      case 'idle':
        return {
          icon: <Clock className="h-5 w-5 text-gray-600" />,
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          label: 'Idle'
        };
      case 'maintenance':
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          label: 'Maintenance'
        };
      case 'error':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          label: 'Error'
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-600" />,
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className={`p-4 rounded-lg border-2 ${statusConfig.bgColor} ${statusConfig.borderColor || 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {statusConfig.icon}
          <h3 className="font-semibold text-gray-900">{machineName}</h3>
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded ${statusConfig.textColor} ${statusConfig.bgColor}`}>
          {statusConfig.label}
        </span>
      </div>

      {currentProduction && status === 'running' && (
        <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Current Order:</span>
            <span className="font-semibold text-gray-900">{currentProduction.orderNumber}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress:</span>
            <span className="font-semibold text-gray-900">
              {currentProduction.completed}/{currentProduction.quantity} units
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentProduction.completed / currentProduction.quantity) * 100}%`
              }}
            />
          </div>
          {currentProduction.operator && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Operator:</span>
              <span className="font-semibold text-gray-900">{currentProduction.operator}</span>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <p className="text-sm text-red-800">
            ⚠️ Machine requires attention. Please check error logs.
          </p>
        </div>
      )}

      {status === 'maintenance' && (
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <p className="text-sm text-yellow-800">
            🔧 Scheduled maintenance in progress.
          </p>
        </div>
      )}
    </div>
  );
};

export default MachineStatusPanel;

