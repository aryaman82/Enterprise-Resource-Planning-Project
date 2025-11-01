import React from 'react';
import { classNames } from '../../../constants/classNames';
import { colors } from '../../../constants/colors';
import { t } from '../../../utils/translations';
import DesignTableRow from './DesignTableRow';
import DesignsEmptyState from './DesignsEmptyState';

const DesignsTable = ({ designs, searchTerm, onEdit, onDelete }) => {
  return (
    <div className={classNames.table.container}>
      <div className={classNames.cardHeader}>
        <h3 className={`text-lg font-medium ${colors.text.primary}`}>
          {t('designs.count', { count: designs.length })}
        </h3>
      </div>
      <div className={classNames.table.wrapper}>
        <table className={classNames.table.base}>
          <thead className={classNames.table.header}>
            <tr>
              <th className={classNames.table.headerCell}>
                {t('designs.columns.name')}
              </th>
              <th className={classNames.table.headerCell}>
                {t('designs.columns.fileUrl')}
              </th>
              <th className={classNames.table.headerCell}>
                {t('designs.columns.remarks')}
              </th>
              <th className={classNames.table.headerCell}>
                {t('designs.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className={classNames.table.body}>
            {designs.length > 0 ? (
              designs.map((design) => (
                <DesignTableRow
                  key={design.design_id}
                  design={design}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <DesignsEmptyState searchTerm={searchTerm} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesignsTable;

