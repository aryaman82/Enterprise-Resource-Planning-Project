import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { NavigationbarWithDropdownMultilevelMenu } from './components/Navbar';
import Home from './pages/home';
import Orders from './pages/orders/order';
import Production from './pages/production';
import Inventory from './pages/inventory';
import Employee from './pages/employee/employee';
import Admin from './pages/admin';

function App() {
  return (
    <Router>
      <div className="w-screen min-h-screen bg-gray-50 overflow-x-hidden">
        <NavigationbarWithDropdownMultilevelMenu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/production" element={<Production />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/attendance" element={<Employee />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            className: '',
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '15px',
              lineHeight: '1.5',
            },
            success: {
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#065f46',
                border: '1px solid #d1fae5',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ffffff',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;