'use client';

import Link from 'next/link';
import { Search, Database, FileText, BarChart3, Users, Building, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopikItem {
  topik: string;
  topik_uri: string;
}

interface TemaData {
  tema: string;
  topik_list: TopikItem[];
}

export default function BankDataPage() {
  const [temaData, setTemaData] = useState<TemaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemaData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/tema-topik', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        if (result.success) {
          setTemaData(result.data);
        } else {
          setError(result.message || 'Failed to load data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTemaData();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Query Builder Banner Card */}
      <Link href="/query-builder" className="block mb-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <Database className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Query Builder</h2>
            </div>
            <p className="text-blue-100 text-lg mb-4">
              Buat query kustom untuk menganalisis dataset terkait pengawasan dengan mudah
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <span className="text-sm font-medium">Mulai Analisis →</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        </div>
      </Link>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Cari dataset berdasrakan indikator..."
          className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Separator with Text */}
      <div className="flex items-center mb-8">
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
        <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
          atau jelajah berdasarkan topik
        </span>
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {temaData.map((tema, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {tema.tema}
              </h3>
            </div>
            <div className="space-y-2">
              {tema.topik_list.slice(0, 3).map((topik, topikIndex) => (
                <Link
                  key={topikIndex}
                  href={`/topik/${encodeURIComponent(topik.topik_uri)}`}
                  className="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                >
                  • {topik.topik}
                </Link>
              ))}
              {tema.topik_list.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  +{tema.topik_list.length - 3} topik lainnya
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}