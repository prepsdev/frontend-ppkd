'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Database, FileText, MapPin, Building, TrendingUp, BarChart3, Table } from 'lucide-react';
import FilterPanel, { FilterState } from './components/FilterPanel';
import DataTable from './components/DataTable';
import ChartView from './components/ChartView';

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
  const [filters, setFilters] = useState<FilterState>({
    tahun: [],
    regional: [],
    provinsi: [],
    kota: [],
    fieldName: []
  });
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');

  // Filter data based on current filters (excluding Indonesia national data from display)
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Always exclude Indonesia national data from regular display
      if (item.regional === 'Nasional' && item.provinsi === 'Indonesia') return false;
      
      if (filters.tahun.length > 0 && !filters.tahun.includes(item.tahun)) return false;
      if (filters.regional.length > 0 && !filters.regional.includes(item.regional)) return false;
      if (filters.provinsi.length > 0 && !filters.provinsi.includes(item.provinsi)) return false;
      if (filters.kota.length > 0 && !filters.kota.includes(item.kota)) return false;
      if (filters.fieldName.length > 0 && !filters.fieldName.includes(item.fieldName)) return false;
      return true;
    });
  }, [data, filters]);

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

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold mb-1">
                {filteredData.length}
              </p>
              <p className="text-blue-100 text-sm font-medium">Total Data Points</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <Database className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold mb-1">
                {new Set(filteredData.map(item => item.provinsi)).size}
              </p>
              <p className="text-emerald-100 text-sm font-medium">Provinsi</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <MapPin className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold mb-1">
                {data.length > 0 ? `${Math.min(...data.map(item => item.tahun))} - ${Math.max(...data.map(item => item.tahun))}` : '-'}
              </p>
              <p className="text-purple-100 text-sm font-medium">Tahun Tersedia</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Filter Panel */}
        <div className="lg:w-80 lg:flex-shrink-0">
          <FilterPanel data={data} onFilterChange={setFilters} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('table')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'table'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <Table className="w-4 h-4 mr-2" />
                    Tabel Data
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'chart'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Grafik
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'table' ? (
            <DataTable data={filteredData} />
          ) : (
            <ChartView data={filteredData} fullData={data} />
          )}
        </div>
      </div>
    </div>
  );
}