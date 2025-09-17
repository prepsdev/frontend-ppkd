'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Database, FileText, MapPin, Building, TrendingUp } from 'lucide-react';

interface IndikatorDetailData {
  id: number;
  tema: string;
  topik: string;
  topik_uri: string;
  indikator: string;
  indikator_uri: string;
  regional: string;
  provinsi: string;
  kota: string;
  fieldName: string;
  dataValue: string;
  satuan: string;
  sumber: string;
  lastupdate: string;
  deskripsi: string;
  tahun: number;
}

export default function IndikatorPage() {
  const params = useParams();
  const indikatorUri = params.id as string;
  
  const [data, setData] = useState<IndikatorDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndikatorData = async () => {
      if (!indikatorUri) return;
      
      try {
        const response = await fetch(`http://localhost:8000/api/indikator/${encodeURIComponent(indikatorUri)}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to load data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchIndikatorData();
  }, [indikatorUri]);

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

  const firstItem = data[0];
  if (!firstItem) {
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
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Tidak ada data tersedia
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Belum ada data untuk indikator ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link 
          href={`/topik/${encodeURIComponent(firstItem.topik_uri)}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke {firstItem.topik}
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {firstItem.indikator}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {firstItem.tema} • {firstItem.topik}
            </p>
          </div>
        </div>
        
        {/* Description */}
        {firstItem.deskripsi && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
              {firstItem.deskripsi}
            </p>
          </div>
        )}
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sumber</span>
          </div>
          <p className="text-gray-900 dark:text-white font-medium">
            {firstItem.sumber || 'Tidak tersedia'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Update Terakhir</span>
          </div>
          <p className="text-gray-900 dark:text-white font-medium">
            {firstItem.lastupdate || 'Tidak tersedia'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Regional</span>
          </div>
          <p className="text-gray-900 dark:text-white font-medium">
            {firstItem.regional}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Detail
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tahun
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provinsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nilai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Satuan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.tahun}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.provinsi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.kota || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.fieldName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.dataValue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.satuan || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Data Points</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {new Set(data.map(item => item.provinsi)).size}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Provinsi</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.max(...data.map(item => item.tahun)) - Math.min(...data.map(item => item.tahun)) + 1}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Rentang Tahun</p>
        </div>
      </div>
    </div>
  );
}