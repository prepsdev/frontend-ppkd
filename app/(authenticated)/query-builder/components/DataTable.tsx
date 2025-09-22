'use client';

import { useMemo } from 'react';
import { Database } from 'lucide-react';

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

interface DataTableProps {
  data: MultiIndikatorData[];
}

export default function DataTable({ data }: DataTableProps) {
  // Group data by provinsi and kota separately
  const groupedData = useMemo(() => {
    const groups: { [key: string]: { provinsi: string; kota: string | null; items: MultiIndikatorData[] } } = {};
    
    data.forEach(item => {
      const key = `${item.provinsi}-${item.kota || 'null'}`;
      if (!groups[key]) {
        groups[key] = {
          provinsi: item.provinsi,
          kota: item.kota || null,
          items: []
        };
      }
      groups[key].items.push(item);
    });
    
    return groups;
  }, [data]);

  // Get unique years and fieldKeys for column headers
  const uniqueYears = useMemo(() => 
    [...new Set(data.map(item => item.tahun))].sort(), 
    [data]
  );
  
  const uniqueFieldKeys = useMemo(() => 
    [...new Set(data.map(item => `${item.fieldName} (${item.indikator})`))], 
    [data]
  );

  // Check if we have kota data to show kota column
  const hasKotaData = data.some(item => item.kota && item.kota.trim() !== '');

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <Database className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Tidak ada data tersedia
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Silakan sesuaikan filter untuk melihat data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Legend */}
      {uniqueFieldKeys.length > 1 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-3">
            {uniqueFieldKeys.map((fieldKey, index) => (
              <div key={fieldKey} className="flex items-center">
                <div 
                  className={`w-3 h-3 rounded-full mr-2 ${
                    index % 6 === 0 ? 'bg-blue-500' :
                    index % 6 === 1 ? 'bg-green-500' :
                    index % 6 === 2 ? 'bg-yellow-500' :
                    index % 6 === 3 ? 'bg-red-500' :
                    index % 6 === 4 ? 'bg-purple-500' : 'bg-pink-500'
                  }`}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{fieldKey}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                Provinsi
              </th>
              {hasKotaData && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                  Kota/Kabupaten
                </th>
              )}
              {uniqueYears.map(year => (
                <th key={year} colSpan={uniqueFieldKeys.length} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                  {year}
                </th>
              ))}
            </tr>
            {uniqueFieldKeys.length > 1 && (
              <tr>
                <th className="px-6 py-2 border-r border-gray-200 dark:border-gray-700"></th>
                {hasKotaData && (
                  <th className="px-6 py-2 border-r border-gray-200 dark:border-gray-700"></th>
                )}
                {uniqueYears.map(year => 
                  uniqueFieldKeys.map((fieldKey, index) => (
                    <th key={`${year}-${fieldKey}`} className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                      <div 
                        className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          index % 6 === 0 ? 'bg-blue-500' :
                          index % 6 === 1 ? 'bg-green-500' :
                          index % 6 === 2 ? 'bg-yellow-500' :
                          index % 6 === 3 ? 'bg-red-500' :
                          index % 6 === 4 ? 'bg-purple-500' : 'bg-pink-500'
                        }`}
                      />
                      {fieldKey}
                    </th>
                  ))
                )}
              </tr>
            )}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(groupedData).map(([key, group]) => (
              <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                  {group.provinsi}
                </td>
                {hasKotaData && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                    {group.kota || '-'}
                  </td>
                )}
                {uniqueYears.map(year => 
                  uniqueFieldKeys.map(fieldKey => {
                    const item = group.items.find(i => i.tahun === year && `${i.fieldName} (${i.indikator})` === fieldKey);
                    return (
                      <td key={`${year}-${fieldKey}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center border-r border-gray-200 dark:border-gray-700">
                        {item ? `${item.dataValue}` : '-'}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}