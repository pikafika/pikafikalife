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
      <div className="flex h-64 items-center justify-center rounded-4xl border border-dashed border-slate-200 bg-soft-blue/30 mx-1">
        <p className="text-text-muted font-bold">아직 기록된 데이터가 없어요 📉</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 탭 */}
      <div className="flex justify-end px-1">
        <div className="inline-flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button
            onClick={() => setChartMode('daily')}
            className={`px-5 py-2 rounded-xl text-[13px] font-black transition-all duration-300 ${
              chartMode === 'daily'
                ? 'bg-white text-brand-500 shadow-soft'
                : 'text-text-muted hover:text-text-sub'
            }`}
          >
            일별 추이
          </button>
          <button
            onClick={() => setChartMode('record')}
            className={`px-5 py-2 rounded-xl text-[13px] font-black transition-all duration-300 ${
              chartMode === 'record'
                ? 'bg-white text-brand-500 shadow-soft'
                : 'text-text-muted hover:text-text-sub'
            }`}
          >
            모든 기록
          </button>
        </div>
      </div>

      <div className="h-72 w-full pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
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
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
              width={40}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '24px', 
                border: 'none', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                fontSize: '13px',
                fontWeight: '800',
                padding: '12px 16px'
              }}
              cursor={{ stroke: '#3182F6', strokeWidth: 2, strokeDasharray: '6 6' }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Legend 
              verticalAlign="top" 
              align="left"
              height={40} 
              iconType="circle" 
              wrapperStyle={{ fontSize: 13, fontWeight: 800, paddingBottom: 20, paddingLeft: 10 }} 
            />
            
            <ReferenceArea 
              yAxisId="left"
              y1={70} 
              y2={180} 
              fill="#E0EFFF" 
              fillOpacity={0.4} 
              stroke="none"
              label={{ value: '목표 범위', fill: '#3182F6', fontSize: 11, fontWeight: 800, position: 'insideTopLeft' }}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="bg"
              name="혈당 (mg/dL)"
              stroke="#3182F6"
              strokeWidth={4}
              dot={{ r: 5, fill: '#fff', stroke: '#3182F6', strokeWidth: 3 }}
              activeDot={{ r: 8, fill: '#3182F6', stroke: '#fff', strokeWidth: 3 }}
              animationDuration={1000}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="insulin"
              name="인슐린 (u)"
              stroke="#F97316"
              strokeWidth={3}
              strokeDasharray="8 8"
              dot={{ r: 4, fill: '#fff', stroke: '#F97316', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
