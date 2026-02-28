import React from 'react';
import { useSelector } from 'react-redux';
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';

function Header({ onMenuClick }) {
  const { user } = useSelector((state) => state.auth);

  const greetings = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
      >
        <FiMenu size={22} />
      </button>

      {/* Greeting */}
      <div className="hidden sm:block">
        <p className="text-gray-500 text-sm">{greetings()}, <span className="font-semibold text-gray-800">{user?.name}</span></p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-64">
        <FiSearch className="text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search patients, appointments..."
          className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1"
        />
      </div>

      {/* Notification */}
      <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100">
        <FiBell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* User Avatar */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
