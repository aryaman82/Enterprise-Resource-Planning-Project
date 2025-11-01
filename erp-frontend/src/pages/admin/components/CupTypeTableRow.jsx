import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { classNames } from '../../../constants/classNames';
import { colors } from '../../../constants/colors';

const CupTypeTableRow = ({ cupType, onEdit, onDelete }) => {
  return (
    <tr className={classNames.table.row}>
      <td className={classNames.table.cell}>
        <span className="font-mono text-sm">{cupType.label_id}</span>
      </td>
      <td className={classNames.table.cell}>
        <span className="font-medium">{cupType.label}</span>
      </td>
      <td className={classNames.table.cell}>
        {cupType.design_name || (
          <span className={`text-sm ${colors.text.tertiary}`}>No design</span>
        )}
      </td>
      <td className={classNames.table.cell}>
        {cupType.type || (
          <span className={`text-sm ${colors.text.tertiary}`}>—</span>
        )}
      </td>
      <td className={classNames.table.cell}>
        {cupType.diameter ? Number(cupType.diameter).toFixed(2) : '—'}
      </td>
      <td className={classNames.table.cell}>
        {cupType.volume ? Number(cupType.volume).toFixed(2) : '—'}
      </td>
      <td className={classNames.table.cell}>
        {cupType.weight ? `${Number(cupType.weight).toFixed(2)}` : '—'}
      </td>
      <td className={classNames.table.cell}>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(cupType.label_id)}
            className={`p-2 rounded-lg ${colors.text.secondary} hover:bg-gray-100 transition-colors`}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(cupType.label_id)}
            className={`p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CupTypeTableRow;

