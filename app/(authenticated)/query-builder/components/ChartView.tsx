'use client';

import { useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
// import HighchartsTreemap from 'highcharts/modules/treemap';
// import HighchartsExporting from 'highcharts/modules/exporting';
// import HighchartsExportData from 'highcharts/modules/export-data';
import { BarChart3, LineChart, PieChart, TrendingUp, Settings, Grid3X3, Group, TrendingDown } from 'lucide-react';

// Initialize modules
if (typeof Highcharts === 'object') {
  // HighchartsTreemap(Highcharts);
  // HighchartsExporting(Highcharts);
  // HighchartsExportData(Highcharts);
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

interface ChartViewProps {
  data: MultiIndikatorData[];
  fullData: MultiIndikatorData[];
}

type ChartType = 'column' | 'line' | 'pie' | 'combo';
type GroupByType = 'tahun' | 'wilayah';

export default function ChartView({ data, fullData }: ChartViewProps) {
  const [chartType, setChartType] = useState<ChartType>('column');
  const [groupBy, setGroupBy] = useState<GroupByType>('tahun');
  const [showGarisTren, setShowGarisTren] = useState<boolean>(false);

  // Define a distinct color palette for better visual distinction
  const colorPalette = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#F43F5E', // Rose
    '#14B8A6', // Teal
  ];

  // Get Indonesia national data for trend line
  const indonesiaData = useMemo(() => {
    return fullData.filter(item => 
      item.regional === 'Nasional' && item.provinsi === 'Indonesia'
    );
  }, [fullData]);

  // Function to get color for series with variations for additional series
  const getSeriesColor = (index: number): string => {
    const baseColorIndex = index % colorPalette.length;
    const baseColor = colorPalette[baseColorIndex];
    
    // If we have more than 12 series, create variations by adjusting opacity or brightness
    if (index >= colorPalette.length) {
      const variation = Math.floor(index / colorPalette.length);
      // Create variations by adjusting the opacity or using lighter/darker shades
      if (variation === 1) {
        // Make it 70% opacity for the second set
        return baseColor + 'B3'; // B3 = 70% opacity in hex
      } else if (variation === 2) {
        // Make it 50% opacity for the third set
        return baseColor + '80'; // 80 = 50% opacity in hex
      } else {
        // For further variations, cycle through different opacities
        const opacities = ['66', '4D', '33']; // 40%, 30%, 20%
        const opacityIndex = (variation - 3) % opacities.length;
        return baseColor + opacities[opacityIndex];
      }
    }
    
    return baseColor;
  };

  // Process chart data based on groupBy mode
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const uniqueIndikators = [...new Set(data.map(item => item.indikator))];
    const fieldNames = [...new Set(data.map(item => item.fieldName))];
    
    // Use filtered data for regular chart display (Indonesia data already excluded in parent component)
    const filteredData = data;
    
    // Group by fieldName, location and year (no longer separate by indikator)
    const fieldData = new Map<string, Map<string, { [year: number]: number }>>();
    
    filteredData.forEach(item => {
      const location = item.kota ? `${item.provinsi} - ${item.kota}` : item.provinsi;
      const fieldKey = `${item.fieldName} (${item.indikator})`;
      
      if (!fieldData.has(fieldKey)) {
        fieldData.set(fieldKey, new Map());
      }
      
      const locationData = fieldData.get(fieldKey)!;
      if (!locationData.has(location)) {
        locationData.set(location, {});
      }
      
      const numValue = parseFloat(item.dataValue.replace(/[^\d.-]/g, '')) || 0;
      locationData.get(location)![item.tahun] = numValue;
    });

    const years = [...new Set(filteredData.map(item => item.tahun))].sort();
    const locations = [...new Set(filteredData.map(item => 
      item.kota ? `${item.provinsi} - ${item.kota}` : item.provinsi
    ))].sort();
    const availableFieldNames = [...fieldData.keys()];

    // Process data based on groupBy mode
    let processedData: any = {};
    
    switch (groupBy) {
      case 'tahun':
        // x-axis = years, legend = fieldName-location combinations
        processedData = {
          categories: years.map(String),
          xAxisTitle: 'Tahun',
          series: []
        };
        
        let tahunSeriesIndex = 0;
        availableFieldNames.forEach(fieldName => {
          const locationData = fieldData.get(fieldName);
          if (!locationData) return;
          
          locations.forEach(location => {
            const yearData = locationData.get(location);
            if (!yearData) return;
            
            const seriesData = years.map(year => yearData[year] || null);
            const hasData = seriesData.some(value => value !== null && value > 0);
            
            if (hasData) {
              processedData.series.push({
                name: `${fieldName} - ${location}`,
                data: seriesData,
                color: getSeriesColor(tahunSeriesIndex)
              });
              tahunSeriesIndex++;
            }
          });
        });
        break;
        
      case 'wilayah':
        // x-axis = locations, legend = fieldName-year combinations
        processedData = {
          categories: locations,
          xAxisTitle: 'Wilayah',
          series: []
        };
        
        let wilayahSeriesIndex = 0;
        availableFieldNames.forEach(fieldName => {
          const locationData = fieldData.get(fieldName);
          if (!locationData) return;
          
          years.forEach(year => {
            const seriesData: (number | null)[] = [];
            
            locations.forEach(location => {
              const yearData = locationData.get(location);
              const value = yearData?.[year] || null;
              seriesData.push(value);
            });
            
            const hasData = seriesData.some(value => value !== null && value > 0);
            if (hasData) {
              processedData.series.push({
                name: `${fieldName} - ${year}`,
                data: seriesData,
                color: getSeriesColor(wilayahSeriesIndex)
              });
              wilayahSeriesIndex++;
            }
          });
        });
        break;
    }

    // Check if Indonesia national data is available in fullData
    const hasIndonesiaData = fullData.some(item => 
      item.regional === 'Nasional' && item.provinsi === 'Indonesia'
    );

    return {
      fieldNames: availableFieldNames,
      years,
      locations,
      fieldData,
      uniqueIndikators,
      satuan: filteredData[0]?.satuan || '',
      processedData,
      hasIndonesiaData
    };
  }, [data, fullData, groupBy]);

  const getChartOptions = (): Highcharts.Options => {
    if (!chartData) return {};

    const { years, locations, fieldData, fieldNames, uniqueIndikators, satuan, processedData, hasIndonesiaData } = chartData;

    // Common export menu configuration
    const exportingConfig = {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            'viewFullscreen',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            'separator',
            'downloadCSV',
            'downloadXLS'
          ]
        }
      }
    };

    const chartTitle = `Multi-Indikator: ${uniqueIndikators.join(', ')}`;

    // Get Indonesia trend data if showGarisTren is enabled
    const getIndonesiaTrendData = () => {
      if (!showGarisTren || !hasIndonesiaData || chartType !== 'column') return null;
      
      const indonesiaData = fullData.filter(item => 
        item.regional === 'Nasional' && item.provinsi === 'Indonesia'
      );
      
      if (indonesiaData.length === 0) return null;
      
      // Group Indonesia data by fieldName and year
      const indonesiaFieldData = new Map<string, { [year: number]: number }>();
      
      indonesiaData.forEach(item => {
        const fieldKey = `${item.fieldName} (${item.indikator})`;
        
        if (!indonesiaFieldData.has(fieldKey)) {
          indonesiaFieldData.set(fieldKey, {});
        }
        
        const numValue = parseFloat(item.dataValue.replace(/[^\d.-]/g, '')) || 0;
        indonesiaFieldData.get(fieldKey)![item.tahun] = numValue;
      });
      
      // Create trend series based on groupBy mode
      const trendSeries: any[] = [];
      
      if (groupBy === 'tahun') {
        // For tahun mode, create one trend line per fieldName
        fieldNames.forEach(fieldName => {
          const yearData = indonesiaFieldData.get(fieldName);
          if (yearData) {
            const trendData = years.map(year => yearData[year] || null);
            const hasData = trendData.some(value => value !== null && value > 0);
            if (hasData) {
              trendSeries.push({
                name: `Tren Nasional - ${fieldName}`,
                type: 'line',
                data: trendData,
                color: '#FF6B6B',
                dashStyle: 'Dash',
                marker: { enabled: true, symbol: 'diamond' },
                lineWidth: 2
              });
            }
          }
        });
      }
      
      return trendSeries;
    };

    switch (chartType) {
      case 'column':
        const columnTrendData = getIndonesiaTrendData();
        const columnSeries = [...processedData.series.map((s: any) => ({ ...s, type: 'column' }))];
        if (columnTrendData) {
          columnSeries.push(...columnTrendData);
        }
        
        return {
          chart: { type: 'column' },
          title: { text: chartTitle },
          xAxis: { 
            categories: processedData.categories,
            title: { text: processedData.xAxisTitle }
          },
          yAxis: { 
            title: { text: `Nilai (${satuan})` }
          },
          series: columnSeries,
          plotOptions: {
            column: {
              dataLabels: { enabled: false }
            }
          },
          exporting: exportingConfig
        };

      case 'line':
        const lineTrendData = getIndonesiaTrendData();
        const lineSeries = [...processedData.series.map((s: any) => ({ ...s, type: 'line' }))];
        if (lineTrendData) {
          lineSeries.push(...lineTrendData);
        }
        
        return {
          chart: { type: 'line' },
          title: { text: chartTitle },
          xAxis: { 
            categories: processedData.categories,
            title: { text: processedData.xAxisTitle }
          },
          yAxis: { 
            title: { text: `Nilai (${satuan})` }
          },
          series: lineSeries,
          plotOptions: {
            line: {
              dataLabels: { enabled: false },
              marker: { enabled: true }
            }
          },
          exporting: exportingConfig
        };

      case 'pie':
        // For pie chart, use latest year data and combine all fieldNames
        const latestYear = Math.max(...years);
        const pieData: { name: string; y: number; color?: string }[] = [];
        let pieIndex = 0;
        
        fieldNames.forEach(fieldName => {
          const locationData = fieldData.get(fieldName);
          if (!locationData) return;
          
          locations.forEach(location => {
            const yearData = locationData.get(location);
            const value = yearData?.[latestYear] || 0;
            if (value > 0) {
              pieData.push({
                name: `${fieldName} - ${location}`,
                y: value,
                color: getSeriesColor(pieIndex)
              });
              pieIndex++;
            }
          });
        });

        return {
          chart: { type: 'pie' },
          title: { text: `${chartTitle} (${latestYear})` },
          series: [{
            name: 'Nilai',
            type: 'pie',
            data: pieData
          }],
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
              }
            }
          },
          exporting: exportingConfig
        };

      case 'combo':
        // For combo chart, calculate average for each category based on current groupBy mode
        let comboAvgData: (number | null)[] = [];
        let comboCategories: string[] = [];
        let comboColumnSeries: any[] = [];
        
        // Use first few series from processedData for columns
        comboColumnSeries = processedData.series.slice(0, Math.min(5, processedData.series.length)).map((s: any) => ({ 
          ...s, 
          type: 'column' as const 
        }));
        
        comboCategories = processedData.categories;
        
        // Calculate average of the displayed series for each category
        comboAvgData = processedData.categories.map((category: string, categoryIndex: number) => {
          const valuesForThisCategory: number[] = [];
          
          // Only use the first few series (the ones being displayed as columns)
          comboColumnSeries.forEach(series => {
            const value = series.data[categoryIndex];
            if (value !== undefined && value !== null && !isNaN(value)) {
              valuesForThisCategory.push(value);
            }
          });
          
          return valuesForThisCategory.length > 0 
            ? valuesForThisCategory.reduce((a, b) => a + b, 0) / valuesForThisCategory.length 
            : null;
        });

        return {
          chart: { type: 'line' },
          title: { text: chartTitle },
          xAxis: { 
            categories: comboCategories,
            title: { text: processedData.xAxisTitle }
          },
          yAxis: { 
            title: { text: `Nilai (${satuan})` }
          },
          series: [
            ...comboColumnSeries,
            {
              name: `Rata-rata (${groupBy === 'tahun' ? 'per Tahun' : groupBy === 'wilayah' ? 'per Wilayah' : 'per Indikator'})`,
              type: 'line' as const,
              data: comboAvgData,
              marker: { 
                enabled: true,
                symbol: 'diamond',
                radius: 6
              },
              color: '#FF6B6B',
              lineWidth: 3,
              dashStyle: 'Dash'
            }
          ],
          plotOptions: {
            column: {
              dataLabels: { enabled: false }
            },
            line: {
              dataLabels: { enabled: false }
            }
          },
          exporting: exportingConfig
        };

      default:
        return {};
    }
  };

  // Chart type options
  const chartTypeOptions = [
    { value: 'column', label: 'Column Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'combo', label: 'Combo Chart', icon: TrendingUp },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
  ];

  const groupByOptions = [
    { value: 'tahun', label: 'Tahun' },
    { value: 'wilayah', label: 'Wilayah' }
  ];

  if (!chartData || !chartData.processedData || chartData.processedData.series.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Tidak ada data untuk divisualisasikan
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Silakan sesuaikan filter untuk melihat grafik.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipe Grafik
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {chartTypeOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setChartType(option.value as ChartType)}
                    className={`flex items-center justify-center p-2 rounded-md border transition-colors ${
                      chartType === option.value
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Group By Selection - Show for all chart types except pie */}
        {chartType !== 'pie' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group By
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {groupByOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setGroupBy(option.value as GroupByType)}
                    className={`flex items-center justify-center p-2 rounded-md border transition-colors ${
                      groupBy === option.value
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Group className="w-4 h-4 mr-2" />
                    <span className="text-xs">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Garis Tren Selection - Only show for column charts when Indonesia data is available */}
        {chartType === 'column' && chartData?.hasIndonesiaData && groupBy === 'tahun' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Garis Tren
              </label>
              <button
                onClick={() => setShowGarisTren(!showGarisTren)}
                className={`flex items-center justify-center p-2 rounded-md border transition-colors w-full ${
                  showGarisTren
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                <span className="text-xs">{showGarisTren ? 'Sembunyikan Tren Nasional' : 'Tampilkan Tren Nasional'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <HighchartsReact
          highcharts={Highcharts}
          options={getChartOptions()}
          containerProps={{ style: { height: '400px', width: '100%' } }}
        />
      </div>

      {/* Chart Legend */}
      {chartData.processedData.series.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Legend:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {chartData.processedData.series.map((series: any, index: number) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: series.color }}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate" title={series.name}>
                  {series.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}