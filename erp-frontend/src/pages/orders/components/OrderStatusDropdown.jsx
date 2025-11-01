import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Button,
} from '@material-tailwind/react';
import { ORDER_STATUSES, getStatusColor } from '../utils/orderUtils';

const OrderStatusDropdown = ({ currentStatus, statusColor, onStatusChange }) => {
    return (
        <Menu placement="bottom-start">
            <MenuHandler>
                <Button
                    size="sm"
                    variant="filled"
                    className={`px-3 py-1 text-xs font-semibold rounded-full normal-case ${statusColor} hover:opacity-90 focus:ring-2 focus:ring-blue-500 flex items-center gap-1`}
                >
                    {currentStatus}
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </MenuHandler>
            <MenuList className="min-w-[180px] bg-white shadow-lg">
                {ORDER_STATUSES.map((status) => {
                    const statusColorClass = getStatusColor(status);
                    const isSelected = status === currentStatus;
                    return (
                        <MenuItem
                            key={status}
                            onClick={() => {
                                if (status !== currentStatus) {
                                    onStatusChange(status);
                                }
                            }}
                            className={`
                                flex items-center gap-2 p-2
                                ${isSelected ? 'bg-blue-50 font-semibold' : 'bg-white text-gray-700'}
                                hover:bg-gray-100 
                                focus:bg-gray-100
                                active:bg-gray-100
                            `}
                        >
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColorClass}`}>
                                {status}
                            </span>
                            {isSelected && (
                                <span className="ml-auto text-blue-600 text-xs">✓</span>
                            )}
                        </MenuItem>
                    );
                })}
            </MenuList>
        </Menu>
    );
};

export default OrderStatusDropdown;

