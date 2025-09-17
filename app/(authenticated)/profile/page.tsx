"use client";

import { useEffect, useState } from "react";

interface User {
  username: string;
  nama_gelar: string;
  namaunit: string;
  name: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </h1>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                Username
              </label>
              <p className="text-gray-900 dark:text-white">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                Full Name
              </label>
              <p className="text-gray-900 dark:text-white">{user.name || "Not provided"}</p>
            </div>
            {user.nama_gelar && (
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Title
                </label>
                <p className="text-gray-900 dark:text-white">{user.nama_gelar}</p>
              </div>
            )}
            {user.namaunit && (
              <div>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Unit/Department
                </label>
                <p className="text-gray-900 dark:text-white">{user.namaunit}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}