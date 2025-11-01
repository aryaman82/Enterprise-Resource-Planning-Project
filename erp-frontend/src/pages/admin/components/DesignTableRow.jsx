import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { classNames } from '../../../constants/classNames';
import { colors } from '../../../constants/colors';
import { t } from '../../../utils/translations';

const DesignTableRow = ({ design, onEdit, onDelete }) => {
  return (
    <tr className={classNames.table.row}>
      <td className={classNames.table.cell}>
        <div className={`text-sm font-medium ${colors.text.primary}`}>{design.name}</div>
        <div className={`text-sm ${colors.text.tertiary}`}>{t('designs.columns.id')}: {design.design_id}</div>
      </td>
      <td className={`${classNames.table.cell} ${colors.text.primary} max-w-xs truncate`}>
        {design.file_url ? (
          <a
            href={design.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${colors.text.blue.base} hover:underline`}
          >
            {design.file_url}
          </a>
        ) : (
          t('common.notAvailable')
        )}
      </td>
      <td className={`${classNames.table.cell} ${colors.text.primary} max-w-xs truncate`} title={design.remarks || ''}>
        {design.remarks || t('common.notAvailable')}
      </td>
      <td className={`${classNames.table.cell} text-sm font-medium`}>
        <div className={classNames.spacing.buttonGroup}>
          <button
            onClick={() => onEdit(design.design_id)}
            className={classNames.button.iconEdit}
            title={t('designs.actions.edit')}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(design.design_id)}
            className={classNames.button.iconDelete}
            title={t('designs.actions.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DesignTableRow;

