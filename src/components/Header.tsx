import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import NewEntryModal from './modals/NewEntryModal';
const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'daily':
        return 'Daily Time Entries';
      case 'weekly':
        return 'Weekly Time Entries';
      case 'monthly':
        return 'Monthly Time Entries';
      case 'reports':
        return 'Time Reports';
      default:
        return 'Time Entries';
    }
  };
  return <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          {getPageTitle()}
        </h1>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <PlusIcon className="h-4 w-4 mr-1" />
          New Entry
        </button>
      </div>
      <NewEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>;
};
export default Header;