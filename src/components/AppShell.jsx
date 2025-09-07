import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Home, 
  Building2, 
  Calendar, 
  User, 
  Menu, 
  X,
  Coins
} from 'lucide-react';

const AppShell = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Businesses', href: '/businesses', icon: Building2 },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-gray-800 border-r border-gray-700">
            <div className="flex items-center flex-shrink-0 px-4">
              <Coins className="w-8 h-8 text-purple-500" />
              <h1 className="ml-2 text-xl font-bold text-white">LocalToken</h1>
            </div>
            <nav className="mt-8 flex-grow">
              <div className="px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive(item.href)
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                    >
                      <Icon className="mr-3 h-6 w-6" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="relative flex flex-col max-w-xs w-full bg-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center px-4 py-4">
            <Coins className="w-8 h-8 text-purple-500" />
            <h1 className="ml-2 text-xl font-bold text-white">LocalToken</h1>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${
                    isActive(item.href)
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <Icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-4 bg-gray-800 border-b border-gray-700 lg:px-6">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;