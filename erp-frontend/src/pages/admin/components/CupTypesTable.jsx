import React from 'react';
import { classNames } from '../../../constants/classNames';
import { colors } from '../../../constants/colors';
import CupTypeTableRow from './CupTypeTableRow';
import CupTypesEmptyState from './CupTypesEmptyState';

const CupTypesTable = ({ cupTypes, searchTerm, onEdit, onDelete }) => {
  return (
    <div className={classNames.table.container}>
      <div className={classNames.cardHeader}>
        <h3 className={`text-lg font-medium ${colors.text.primary}`}>
          {cupTypes.length} cup type{cupTypes.length !== 1 ? 's' : ''}
        </h3>
      </div>
      <div className={classNames.table.wrapper}>
        <table className={classNames.table.base}>
          <thead className={classNames.table.header}>
            <tr>
              <th className={classNames.table.headerCell}>
                Label ID
              </th>
              <th className={classNames.table.headerCell}>
                Label
              </th>
              <th className={classNames.table.headerCell}>
                Design
              </th>
              <th className={classNames.table.headerCell}>
                Type
              </th>
              <th className={classNames.table.headerCell}>
                Diameter (cm)
              </th>
              <th className={classNames.table.headerCell}>
                Volume (ml)
              </th>
              <th className={classNames.table.headerCell}>
                Weight (kg)
              </th>
              <th className={classNames.table.headerCell}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={classNames.table.body}>
            {cupTypes.length > 0 ? (
              cupTypes.map((cupType) => (
                <CupTypeTableRow
                  key={cupType.label_id}
                  cupType={cupType}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <CupTypesEmptyState searchTerm={searchTerm} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CupTypesTable;

