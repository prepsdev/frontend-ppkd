'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Database, ArrowLeft, BarChart3, Table, ChevronDown, ChevronRight, X, Check, FileText } from 'lucide-react';
import Link from 'next/link';
import FilterPanel, { FilterState } from './components/FilterPanel';
import DataTable from './components/DataTable';
import ChartView from './components/ChartView';

interface TopikItem {
  topik: string;
  topik_uri: string;
}

interface TemaData {
  tema: string;
  topik_list: TopikItem[];
}

interface IndikatorData {
  indikator: string;
  indikator_uri: string;
  deskripsi: string;
  sumber: string;
  lastupdate: string;
}

interface SelectedIndikator {
  indikator: string;
  indikator_uri: string;
  deskripsi: string;
  sumber: string;
  tema: string;
  topik: string;
  topik_uri: string;
}

interface MultiIndikatorData {
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

export default function QueryBuilderPage() {
  const [temaData, setTemaData] = useState<TemaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemaData, setFilteredTemaData] = useState<TemaData[]>([]);
  
  // Accordion states
  const [expandedTemas, setExpandedTemas] = useState<Set<string>>(new Set());
  const [topikIndikators, setTopikIndikators] = useState<Map<string, IndikatorData[]>>(new Map());
  const [loadingTopiks, setLoadingTopiks] = useState<Set<string>>(new Set());
  
  // Selection states
  const [selectedIndikators, setSelectedIndikators] = useState<SelectedIndikator[]>([]);
  
  // Analysis view states
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
  const [analysisData, setAnalysisData] = useState<MultiIndikatorData[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    tahun: [],
    regional: [],
    provinsi: [],
    kota: [],
    fieldName: [],
    indikator: []
  });
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter analysis data based on current filters
  const filteredAnalysisData = useMemo(() => {
    return analysisData.filter(item => {
      // Always exclude Indonesia national data from regular display
      if (item.regional === 'Nasional' && item.provinsi === 'Indonesia') return false;
      
      if (filters.tahun.length > 0 && !filters.tahun.includes(item.tahun)) return false;
      if (filters.regional.length > 0 && !filters.regional.includes(item.regional)) return false;
      if (filters.provinsi.length > 0 && !filters.provinsi.includes(item.provinsi)) return false;
      if (filters.kota.length > 0 && !filters.kota.includes(item.kota)) return false;
      if (filters.fieldName.length > 0 && !filters.fieldName.includes(item.fieldName)) return false;
      if (filters.indikator.length > 0 && !filters.indikator.includes(item.indikator)) return false;
      return true;
    });
  }, [analysisData, filters]);

  // Fetch tema data on component mount
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
          setFilteredTemaData(result.data);
          // Pre-load all indikators for search functionality
          await preloadAllIndikators(result.data);
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

  // Pre-load all indikators for better search functionality
  const preloadAllIndikators = async (temas: TemaData[]) => {
    const promises: Promise<void>[] = [];
    
    temas.forEach(tema => {
      tema.topik_list.forEach(topik => {
        promises.push(fetchTopikIndikators(topik.topik_uri));
      });
    });

    await Promise.all(promises);
  };

  // Handle search functionality - now searches through all data including indikators
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      filterData(query);
    }, 300);
  };

  const filterData = (query: string) => {
    if (!query.trim()) {
      setFilteredTemaData(temaData);
      return;
    }

    const filtered = temaData.map(tema => {
      // Filter topik based on search query and indikator content
      const filteredTopiks = tema.topik_list.filter(topik => {
        // Check if topik or tema matches
        const topikMatches = topik.topik.toLowerCase().includes(query.toLowerCase()) ||
                           tema.tema.toLowerCase().includes(query.toLowerCase());
        
        // Check if any indikator in this topik matches
        const indikators = topikIndikators.get(topik.topik_uri) || [];
        const indikatorMatches = indikators.some(indikator => 
          indikator.indikator.toLowerCase().includes(query.toLowerCase())
        );
        
        return topikMatches || indikatorMatches;
      });

      return {
        ...tema,
        topik_list: filteredTopiks
      };
    }).filter(tema => 
      tema.tema.toLowerCase().includes(query.toLowerCase()) || 
      tema.topik_list.length > 0
    );

    setFilteredTemaData(filtered);
  };

  // Handle tema accordion toggle
  const toggleTema = async (tema: string) => {
    const newExpanded = new Set(expandedTemas);
    
    if (newExpanded.has(tema)) {
      newExpanded.delete(tema);
    } else {
      newExpanded.add(tema);
    }
    
    setExpandedTemas(newExpanded);
  };

  // Fetch indikators for a specific topik
  const fetchTopikIndikators = async (topikUri: string) => {
    if (topikIndikators.has(topikUri) || loadingTopiks.has(topikUri)) {
      return;
    }

    setLoadingTopiks(prev => new Set(prev).add(topikUri));

    try {
      const response = await fetch(`http://localhost:8000/api/topik/${encodeURIComponent(topikUri)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topik data');
      }

      const result = await response.json();
      if (result.success) {
        setTopikIndikators(prev => new Map(prev).set(topikUri, result.data));
      }
    } catch (err) {
      console.error('Error fetching topik indikators:', err);
    } finally {
      setLoadingTopiks(prev => {
        const newSet = new Set(prev);
        newSet.delete(topikUri);
        return newSet;
      });
    }
  };

  // Handle indikator selection
  const toggleIndikatorSelection = (indikator: IndikatorData, tema: string, topik: TopikItem) => {
    const selectedItem: SelectedIndikator = {
      indikator: indikator.indikator,
      indikator_uri: indikator.indikator_uri,
      deskripsi: indikator.deskripsi,
      sumber: indikator.sumber,
      tema,
      topik: topik.topik,
      topik_uri: topik.topik_uri
    };

    const isSelected = selectedIndikators.some(item => item.indikator_uri === indikator.indikator_uri);
    
    if (isSelected) {
      setSelectedIndikators(prev => prev.filter(item => item.indikator_uri !== indikator.indikator_uri));
    } else {
      setSelectedIndikators(prev => [...prev, selectedItem]);
    }
  };

  // Remove selected indikator
  const removeSelectedIndikator = (indikatorUri: string) => {
    setSelectedIndikators(prev => prev.filter(item => item.indikator_uri !== indikatorUri));
  };

  // Check if indikator is selected
  const isIndikatorSelected = (indikatorUri: string) => {
    return selectedIndikators.some(item => item.indikator_uri === indikatorUri);
  };

  // Fetch analysis data for selected indikators
  const fetchAnalysisData = async () => {
    if (selectedIndikators.length === 0) return;

    setAnalysisLoading(true);
    try {
      const allData: MultiIndikatorData[] = [];
      
      for (const indikator of selectedIndikators) {
        const response = await fetch(`http://localhost:8000/api/indikator/${encodeURIComponent(indikator.indikator_uri)}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Transform data to match MultiIndikatorData interface
            const transformedData = result.data.map((item: any, index: number) => ({
              id: index,
              tema: indikator.tema,
              topik: indikator.topik,
              topik_uri: indikator.topik_uri,
              indikator: indikator.indikator,
              indikator_uri: indikator.indikator_uri,
              regional: item.regional || '',
              provinsi: item.provinsi || '',
              kota: item.kota || '',
              fieldName: item.fieldName || '',
              dataValue: item.dataValue || '',
              satuan: item.satuan || '',
              sumber: indikator.sumber,
              lastupdate: item.lastupdate || '',
              deskripsi: indikator.deskripsi,
              tahun: item.tahun || 0
            }));
            allData.push(...transformedData);
          }
        }
      }
      
      setAnalysisData(allData);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Fetch analysis data when entering analysis view
  useEffect(() => {
    if (showAnalysis && selectedIndikators.length > 0) {
      fetchAnalysisData();
    }
  }, [showAnalysis, selectedIndikators]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Handle start analysis
  const handleStartAnalysis = () => {
    setShowAnalysis(true);
  };

  // Handle back to selection
  const handleBackToSelection = () => {
    setShowAnalysis(false);
  };

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

  // Analysis View
  if (showAnalysis) {
    return (
      <div className="px-4 py-6 sm:px-0">
        {/* Back Navigation */}
        <div className="mb-6">
          <button
            onClick={() => setShowAnalysis(false)}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Pemilihan Indikator
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Database className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analisis Multi-Indikator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Analisis {selectedIndikators.length} indikator terpilih
          </p>
        </div>

        {/* Selected Indicators Summary */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Indikator yang Dianalisis:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedIndikators.map((item, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                {item.indikator}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel 
              data={analysisData} 
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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
                      Tabel
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

            {/* Content */}
            {analysisLoading ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Memuat data analisis...</p>
              </div>
            ) : (
              <>
                {activeTab === 'table' ? (
                  <DataTable data={filteredAnalysisData} />
                ) : (
                  <ChartView data={filteredAnalysisData} fullData={analysisData} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Selection View
  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Database className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Query Builder</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Pilih indikator yang ingin Anda analisis dengan mudah
        </p>
      </div>

      {/* Single Card Layout */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
          
          {/* Left Content - Tema & Indikator List */}
          <div className="border-2 border-blue-200 dark:border-blue-800 rounded-l-xl lg:rounded-r-none rounded-r-xl">
            {/* Search Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pilih Indikator
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari tema, topik, atau indikator..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Tema List */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredTemaData.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada hasil ditemukan untuk "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTemaData.map((tema, index) => (
                    <div key={index} className="p-4">
                      {/* Tema Header */}
                      <button
                        onClick={() => toggleTema(tema.tema)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <span className="font-medium text-gray-900 dark:text-white text-left">
                            {tema.tema}
                          </span>
                        </div>
                        {expandedTemas.has(tema.tema) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {/* Topik & Indikator List */}
                      {expandedTemas.has(tema.tema) && (
                        <div className="mt-3 ml-8 space-y-2">
                          {tema.topik_list.map((topik, topikIndex) => {
                            const indikators = topikIndikators.get(topik.topik_uri) || [];
                            const isLoading = loadingTopiks.has(topik.topik_uri);
                            
                            return (
                              <div key={topikIndex} className="border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                                <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  {topik.topik}
                                </div>
                                
                                {isLoading ? (
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                    Loading indikators...
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {indikators.map((indikator, indikatorIndex) => (
                                      <label
                                        key={indikatorIndex}
                                        className="flex items-start p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors duration-200"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isIndikatorSelected(indikator.indikator_uri)}
                                          onChange={() => toggleIndikatorSelection(indikator, tema.tema, topik)}
                                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3 flex-1">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {indikator.indikator}
                                          </div>
                                          {indikator.deskripsi && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                              {indikator.deskripsi}
                                            </div>
                                          )}
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Selected Indikators */}
          <div className="border-2 border-green-200 dark:border-green-800 rounded-r-xl lg:rounded-l-none rounded-l-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Indikator Terpilih
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                    {selectedIndikators.length} dipilih
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Items */}
            <div className="max-h-[600px] overflow-y-auto">
              {selectedIndikators.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Belum ada indikator dipilih
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pilih indikator dari daftar di sebelah kiri untuk memulai analisis
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {selectedIndikators.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              {item.tema} • {item.topik}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {item.indikator}
                          </h4>
                          {item.deskripsi && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeSelectedIndikator(item.indikator_uri)}
                          className="ml-3 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                        >
                          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedIndikators.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleStartAnalysis}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Mulai Analisis ({selectedIndikators.length} indikator)
                  </button>
                  <button
                    onClick={() => setSelectedIndikators([])}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors duration-200"
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}