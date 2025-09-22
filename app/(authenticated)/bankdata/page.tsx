'use client';

import Link from 'next/link';
import { Search, Database, FileText, BarChart3, Users, Building, CreditCard, ExternalLink } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface TopikItem {
  topik: string;
  topik_uri: string;
}

interface TemaData {
  tema: string;
  topik_list: TopikItem[];
}

interface SearchResult {
  indikator: string;
  indikator_uri: string;
  deskripsi: string;
  sumber: string;
  lastupdate: string;
  tema: string;
  topik: string;
  topik_uri: string;
}

interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  total_count: number;
  showing_count: number;
  has_more: boolean;
}

export default function BankDataPage() {
  const [temaData, setTemaData] = useState<TemaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Search functionality
  const performSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/search?q=${encodeURIComponent(query)}&limit=4`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const result: SearchResponse = await response.json();
      if (result.success) {
        setSearchResults(result.data);
        setSearchTotalCount(result.total_count);
        setShowSearchResults(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSearchFocus = () => {
    if (searchQuery.length >= 3 && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Memuat data tema dan topik...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Mohon tunggu sebentar</p>
          </div>
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
          placeholder="Cari dataset berdasarkan indikator..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                {searchResults.map((result, index) => (
                  <Link
                    key={index}
                    href={`/indikator/${encodeURIComponent(result.indikator_uri)}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {result.indikator}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {result.tema} • {result.topik}
                        </p>
                        {result.deskripsi && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                            {result.deskripsi}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
                
                {/* Show More Link */}
                {searchTotalCount > 4 && (
                  <Link
                    href={`/search/${encodeURIComponent(searchQuery)}`}
                    className="block p-4 text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                  >
                    Tampilkan semua pencarian dengan keyword "{searchQuery}"
                  </Link>
                )}
              </>
            ) : searchQuery.length >= 3 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Tidak ada hasil ditemukan untuk "{searchQuery}"
              </div>
            ) : null}
          </div>
        )}
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
        {temaData.length === 0 ? (
          // Skeleton loading for cards
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          ))
        ) : (
          temaData.map((tema, index) => (
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
          ))
        )}
      </div>
    </div>
  );
}