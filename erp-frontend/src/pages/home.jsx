import React from 'react';
import { Link } from 'react-router-dom';
import {
    Factory,
    ClipboardList,
    Package,
    User,
} from 'lucide-react';

// Navigation cards
const navigationCards = [
    {
        title: 'Orders',
        description: 'Complete log of customer orders and shipments',
        icon: ClipboardList,
        href: '/orders',
        bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
        hoverColor: 'hover:from-green-600 hover:to-green-700',
        iconBg: 'bg-white/20',
    },
    {
        title: 'Production',
        description: 'View and manage all production activities',
        icon: Factory,
        href: '/production',
        bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
        hoverColor: 'hover:from-blue-600 hover:to-blue-700',
        iconBg: 'bg-white/20',
    },

    {
        title: 'Inventory',
        description: 'Manage stock levels and inventory items',
        icon: Package,
        href: '/inventory',
        bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
        hoverColor: 'hover:from-purple-600 hover:to-purple-700',
        iconBg: 'bg-white/20',
    },
    {
        title: 'Admin',
        description: 'System administration and user management',
        icon: User,
        href: '/admin',
        bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
        hoverColor: 'hover:from-orange-600 hover:to-orange-700',
        iconBg: 'bg-white/20',
    },
];

const Home = () => {
    return (
        <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
            {/* Welcome Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome to Almed ERP System
                        </h1>
                        <p className="text-xl text-gray-600">
                            Your comprehensive business management solution
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Cards Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Navigate to Modules</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {navigationCards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={index}
                                    to={card.href}
                                    className={`${card.bgColor} ${card.hoverColor} rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-white overflow-hidden group`}
                                >
                                    <div className="p-6">
                                        {/* Icon */}
                                        <div className={`${card.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-white">
                                            {card.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-white/90 text-sm leading-relaxed">
                                            {card.description}
                                        </p>

                                        {/* Arrow indicator */}
                                        <div className="mt-4 flex items-center text-white/80 group-hover:text-white transition-colors duration-200">
                                            <span className="text-sm font-medium mr-2">Go to {card.title}</span>
                                            <svg
                                                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                        <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">New order created</p>
                                    <p className="text-sm text-gray-500">Order #ORD-2024-001 for customer ABC Corp</p>
                                </div>
                                <span className="text-xs text-gray-400">2 minutes ago</span>
                            </div>
                        </div>

                        <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Inventory updated</p>
                                    <p className="text-sm text-gray-500">Stock level changed for Product XYZ</p>
                                </div>
                                <span className="text-xs text-gray-400">15 minutes ago</span>
                            </div>
                        </div>

                        <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Transaction processed</p>
                                    <p className="text-sm text-gray-500">Payment received for Order #ORD-2024-002</p>
                                </div>
                                <span className="text-xs text-gray-400">1 hour ago</span>
                            </div>
                        </div>

                        <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Admin access granted</p>
                                    <p className="text-sm text-gray-500">New admin user John Doe added</p>
                                </div>
                                <span className="text-xs text-gray-400">2 hours ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
