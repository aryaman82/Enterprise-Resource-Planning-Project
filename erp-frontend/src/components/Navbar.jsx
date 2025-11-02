import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  ClipboardList,
  User,
  Users,
  Menu,
  X,
  Factory,
} from "lucide-react";

const navigationItems = [
  { name: "Home", icon: Home, href: "/", active: true },
  { name: "Orders", icon: ClipboardList, href: "/orders", active: false },
  { name: "Production", icon: Factory, href: "/production", active: false },
  { name: "Inventory", icon: Package, href: "/inventory", active: false },
  { name: "Employee", icon: Users, href: "/attendance", active: false },
];

const adminItem = { name: "Admin", icon: User, href: "/admin", active: false };

export function NavigationbarWithDropdownMultilevelMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation(); // Get current location to determine active nav item

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm w-screen">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-none">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Almed</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${isActive
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600"
                      } px-4 py-4 text-sm font-medium flex items-center space-x-2 transition-all duration-200 border-b-2 border-transparent`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Admin - Right Side */}
          <div className="hidden md:flex items-center">
            <Link
              to={adminItem.href}
              className={`${location.pathname === adminItem.href
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600"
                } px-4 py-4 text-sm font-medium flex items-center space-x-2 transition-all duration-200 border-b-2 border-transparent`}
            >
              <User className="h-5 w-5" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)} // Close mobile menu on click
                  className={`${isActive
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    } block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {/* Admin in mobile menu */}
            <Link
              to={adminItem.href}
              onClick={() => setMobileMenuOpen(false)} // Close mobile menu on click
              className={`${location.pathname === adminItem.href
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                } block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3`}
            >
              <User className="h-5 w-5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}