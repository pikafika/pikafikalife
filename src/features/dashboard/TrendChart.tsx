import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useHistoryStore } from '../../store/useHistoryStore';

type ChartMode = 'daily' | 'record';

const TrendChart: React.FC = () => {
  const { logs } = useHistoryStore();
  const [chartMode, setChartMode] = useState<ChartMode>('daily');

  const chartData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const filtered = logs
      .filter((log) => log.timestamp >= thirtyDaysAgo.getTime())
      .sort((a, b) => a.timestamp - b.timestamp);

    if (chartMode === 'daily') {
      const grouped: Record<string, { bgSum: number; insulinSum: number; count: number }> = {};
      filtered.forEach((log) => {
        const d = new Date(log.timestamp);
        const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
        if (!grouped[key]) grouped[key] = { bgSum: 0, insulinSum: 0, count: 0 };
        grouped[key].bgSum += log.currentBG;
        grouped[key].insulinSum += log.totalInsulin || 0;
        grouped[key].count += 1;
      });

      return Object.entries(grouped).map(([date, { bgSum, insulinSum, count }]) => ({
        name: date,
        bg: Math.round(bgSum / count),
        insulin: Math.round(insulinSum * 10) / 10,
      }));
    } else {
      return filtered.map((log) => {
        const d = new Date(log.timestamp);
        return {
          name: `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
          bg: log.currentBG,
          insulin: log.totalInsulin,
        };
      });
    }
  }, [logs, chartMode]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 mx-1">
        <p className="text-text-muted font-bold">기록된 데이터가 없습니다 📉</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 탭 */}
      <div className="flex justify-end px-1">
        <div className="inline-flex bg-gray-50 p-1 rounded-sm border border-gray-100">
          <button
            onClick={() => setChartMode('daily')}
            className={`px-4 py-1.5 rounded-sm text-[12px] font-bold transition-all duration-300 ${
              chartMode === 'daily'
                ? 'bg-white text-brand-500 shadow-sm border border-gray-100'
                : 'text-text-muted hover:text-text-sub'
            }`}
          >
            일별
          </button>
          <button
            onClick={() => setChartMode('record')}
            className={`px-4 py-1.5 rounded-sm text-[12px] font-bold transition-all duration-300 ${
              chartMode === 'record'
                ? 'bg-white text-brand-500 shadow-sm border border-gray-100'
                : 'text-text-muted hover:text-text-sub'
            }`}
          >
            계속
          </button>
        </div>
      </div>

      <div className="h-72 w-full pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F0F0F0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#A1A1A1', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
              minTickGap={30}
            />
            <YAxis 
              yAxisId="left"
              domain={[40, 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#A1A1A1', fontWeight: 600 }}
              width={40}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #F0F0F0', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontSize: '12px',
                fontWeight: '700',
                padding: '8px 12px'
              }}
              cursor={{ stroke: '#06C755', strokeWidth: 1, strokeDasharray: '4 4' }}
              itemStyle={{ padding: '1px 0' }}
            />
            <Legend 
              verticalAlign="top" 
              align="left"
              height={40} 
              iconType="circle" 
              wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingBottom: 15, paddingLeft: 10 }} 
            />
            
            <ReferenceArea 
              yAxisId="left"
              y1={70} 
              y2={180} 
              fill="#E6F9EE" 
              fillOpacity={0.6} 
              stroke="none"
              label={{ value: '목표 범위', fill: '#05B34C', fontSize: 10, fontWeight: 700, position: 'insideTopLeft' }}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="bg"
              name="혈당"
              stroke="#06C755"
              strokeWidth={3}
              dot={{ r: 4, fill: '#fff', stroke: '#06C755', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#06C755', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={800}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="insulin"
              name="인슐린"
              stroke="#F97316"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={{ r: 3, fill: '#fff', stroke: '#F97316', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: '#F97316', stroke: '#fff', strokeWidth: 1.5 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
