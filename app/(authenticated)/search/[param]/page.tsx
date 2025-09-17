'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, FileText, Search } from 'lucide-react';

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

export default function SearchPage() {
  const params = useParams();
  const searchParam = params.param as string;
  
  const [data, setData] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchParam) return;
      
      try {
        const response = await fetch(`http://localhost:8000/api/search?q=${encodeURIComponent(searchParam)}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const result: SearchResponse = await response.json();
        if (result.success) {
          setData(result.data);
          setTotalCount(result.total_count);
        } else {
          setError(result.message || 'Failed to load search results');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParam]);

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
        <div className="mb-6">
          <Link 
            href="/bankdata" 
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Bank Data
          </Link>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link 
          href="/bankdata" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Bank Data
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
            <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hasil Pencarian
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Menampilkan {totalCount} hasil untuk "{decodeURIComponent(searchParam)}"
            </p>
          </div>
        </div>
      </div>

      {/* Search Results Grid */}
      <div className="grid grid-cols-1 gap-6">
        {data.map((item, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {item.indikator}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {item.tema} • {item.topik}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {item.deskripsi || 'Tidak ada deskripsi tersedia'}
              </p>
            </div>

            {/* Footer with Source, Last Update, and Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Sumber:</span>
                  <span>{item.sumber || 'Tidak tersedia'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium mr-2">Update terakhir:</span>
                  <span>{item.lastupdate || 'Tidak tersedia'}</span>
                </div>
              </div>
              
              <Link
                href={`/indikator/${encodeURIComponent(item.indikator_uri)}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Selengkapnya
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Tidak ada hasil ditemukan
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Coba gunakan kata kunci yang berbeda atau lebih spesifik.
          </p>
        </div>
      )}
    </div>
  );
}