import React from 'react';
import { Loader2 } from 'lucide-react';
import { classNames } from '../../../constants/classNames';

const CupTypesLoadingState = () => {
  return (
    <div className={classNames.table.container}>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading cup types...</span>
      </div>
    </div>
  );
};

export default CupTypesLoadingState;

