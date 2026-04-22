'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
}

const HealthTrendChart: React.FC<ChartProps> = ({ title, data, dataKey, color = '#006977' }) => {
  return (
    <div className="w-full">
      {title && (
        <div className="mb-10">
          <h3 className="text-xl font-bold text-[#2c3436] font-jakarta">{title}</h3>
          <p className="text-[11px] text-[#635888]/60 font-black uppercase tracking-[0.2em] mt-1">Biometric Analysis</p>
        </div>
      )}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="rgba(172, 179, 182, 0.1)" 
            />
            <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#635888', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                }}
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#635888', fontSize: 10, fontWeight: 700 }}
                dx={-10}
            />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 24px 48px rgba(44, 52, 54, 0.1)',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#2c3436'
                }}
                itemStyle={{ color: '#006977' }}
                cursor={{ stroke: '#006977', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HealthTrendChart;
