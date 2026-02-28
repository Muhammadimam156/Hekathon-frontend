import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-[120px] font-black text-primary-200 leading-none select-none">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h1>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <FiArrowLeft size={16} /> Go Back
          </button>
          <Link to="/" className="btn-primary">
            <FiHome size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
