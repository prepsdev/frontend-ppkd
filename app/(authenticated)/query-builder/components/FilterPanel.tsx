'use client';

import { useState, useEffect, useMemo } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

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

export interface FilterState {
  tahun: number[];
  regional: string[];
  provinsi: string[];
  kota: string[];
  fieldName: string[];
  indikator: string[];
}

interface FilterPanelProps {
  data: MultiIndikatorData[];
  onFilterChange: (filters: FilterState) => void;
}

export default function FilterPanel({ data, onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    tahun: [],
    regional: [],
    provinsi: [],
    kota: [],
    fieldName: [],
    indikator: []
  });

  const [expandedSections, setExpandedSections] = useState({
    tahun: true,
    regional: true,
    provinsi: true,
    kota: true,
    fieldName: true,
    indikator: true
  });

  // Get unique values for each filter
  const uniqueValues = useMemo(() => {
    const tahun = [...new Set(data.map(item => item.tahun))].sort((a, b) => b - a);
    // Exclude 'Nasional' from regional filter options (Indonesia data will be handled by Garis Tren)
    const regional = [...new Set(data.map(item => item.regional).filter(r => r !== 'Nasional'))].sort();
    
    // Filter provinsi based on selected regional
    const availableProvinsi = filters.regional.length > 0 
      ? data.filter(item => filters.regional.includes(item.regional))
      : data;
    const provinsi = [...new Set(availableProvinsi.map(item => item.provinsi))].sort();
    
    // Filter kota based on selected provinsi (and exclude null/empty values)
    const availableKota = filters.provinsi.length > 0 
      ? data.filter(item => filters.provinsi.includes(item.provinsi))
      : data;
    const kota = [...new Set(availableKota.map(item => item.kota).filter(k => k && k.trim() !== ''))].sort();
    
    const fieldName = [...new Set(data.map(item => item.fieldName))].sort();
    const indikator = [...new Set(data.map(item => item.indikator))].sort();

    return { tahun, regional, provinsi, kota, fieldName, indikator };
  }, [data, filters.regional, filters.provinsi]);

  // Update filters and notify parent
  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string | number, checked: boolean) => {
    const newFilters = { ...filters };
    
    if (checked) {
      (newFilters[filterType] as any[]).push(value);
    } else {
      newFilters[filterType] = (newFilters[filterType] as any[]).filter(item => item !== value);
    }

    // Clear dependent filters when parent filter changes
    if (filterType === 'regional') {
      newFilters.provinsi = [];
      newFilters.kota = [];
    } else if (filterType === 'provinsi') {
      newFilters.kota = [];
    }

    updateFilters(newFilters);
  };

  // Get count of active filters
  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0);
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      tahun: [],
      regional: [],
      provinsi: [],
      kota: [],
      fieldName: [],
      indikator: []
    };
    updateFilters(emptyFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderFilterSection = (title: string, filterType: keyof FilterState, values: (string | number)[]) => {
    if (values.length === 0) return null;

    const isExpanded = expandedSections[filterType];
    const activeCount = filters[filterType].length;

    return (
      <div key={filterType} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <button
          onClick={() => toggleSection(filterType)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <div className="flex items-center">
            <span className="font-medium text-gray-900 dark:text-white">{title}</span>
            {activeCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
            <div className="space-y-2">
              {values.map(value => (
                <label key={value} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters[filterType].includes(value as any)}
                    onChange={(e) => handleFilterChange(filterType, value, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Data</h3>
          </div>
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
        </div>
        {getActiveFilterCount() > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getActiveFilterCount()} filter(s) active
          </p>
        )}
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {renderFilterSection('Indikator', 'indikator', uniqueValues.indikator)}
        {renderFilterSection('Tahun', 'tahun', uniqueValues.tahun)}
        {renderFilterSection('Regional', 'regional', uniqueValues.regional)}
        {uniqueValues.provinsi.length > 0 && renderFilterSection('Provinsi', 'provinsi', uniqueValues.provinsi)}
        {uniqueValues.kota.length > 0 && renderFilterSection('Kota/Kabupaten', 'kota', uniqueValues.kota)}
        {renderFilterSection('Kolom Data', 'fieldName', uniqueValues.fieldName)}
      </div>
    </div>
  );
}