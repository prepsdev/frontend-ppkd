'use client';

import Link from 'next/link';
import Swal from 'sweetalert2';

export default function DashboardPage() {
  const handleDevelopmentAlert = () => {
    Swal.fire({
      title: 'Informasi',
      text: 'Masih dalam proses pengembangan, harap menunggu!',
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6'
    });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard
      </h1>
      
      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Data Card */}
        <Link href="/bankdata" className="group">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
              Bank Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              Kelola dan akses data perbankan
            </p>
          </div>
        </Link>

        {/* Development Card */}
        <div 
          onClick={handleDevelopmentAlert}
          className="group cursor-pointer"
        >
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
              Fitur Lainnya
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              Fitur tambahan dalam pengembangan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}