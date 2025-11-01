import React from 'react';
import { Package } from 'lucide-react';
import { classNames } from '../../../constants/classNames';
import { colors } from '../../../constants/colors';

const CupTypesEmptyState = ({ searchTerm }) => {
  return (
    <tr>
      <td colSpan="8" className={classNames.table.cell}>
        <div className="flex flex-col items-center justify-center py-12">
          <Package className={`h-12 w-12 ${colors.text.tertiary} mb-4`} />
          <p className={`text-lg font-medium ${colors.text.secondary} mb-2`}>
            {searchTerm ? 'No cup types found' : 'No cup types yet'}
          </p>
          <p className={`text-sm ${colors.text.tertiary} text-center max-w-md`}>
            {searchTerm
              ? `No cup types match "${searchTerm}". Try adjusting your search.`
              : 'Get started by adding your first cup type. Each cup type combines a design with specific dimensions and properties.'}
          </p>
        </div>
      </td>
    </tr>
  );
};

export default CupTypesEmptyState;

