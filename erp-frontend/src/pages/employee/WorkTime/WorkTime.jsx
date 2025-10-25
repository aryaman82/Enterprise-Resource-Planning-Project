import React from 'react';
import { Clock } from 'lucide-react';

const WorkTime = () => {
  return (
    <div className="text-center py-12">
      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Work Time</h3>
      <p className="text-gray-600">Work time tracking features will be available soon.</p>
    </div>
  );
};

export default WorkTime;
