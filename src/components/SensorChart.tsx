import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface Sensor {
  sensorId: string;
  type: string;
  value: number;
  unit: string;
  alertLevel: string;
  threshold?: number;
  createdAt: string;
}

interface SensorChartProps {
  sensors: Sensor[];
}

const TYPE_COLORS: Record<string, string> = {
  PRESSURE:    '#3b82f6',
  TEMPERATURE: '#f59e0b',
  FLOW_RATE:   '#22c55e',
  VIBRATION:   '#a855f7',
  GAS_LEVEL:   '#ef4444',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a2235',
        border: '1px solid #2a3548',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
      }}>
        <div style={{ color: '#64748b', marginBottom: '6px' }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value?.toLocaleString()} {p.payload.unit}
          </div>
        ))}
        {payload[0]?.payload?.alertLevel !== 'NORMAL' && (
          <div style={{
            marginTop: '6px',
            color: payload[0]?.payload?.alertLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b',
            fontSize: '11px',
            fontWeight: 600,
          }}>
            ⚠️ {payload[0]?.payload?.alertLevel}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const SensorChart = ({ sensors }: SensorChartProps) => {

  // Get unique sensor types from our data
  const types = [...new Set(sensors.map(s => s.type))];

  const [selectedType, setSelectedType] = useState(types[0] || 'PRESSURE');

  // Filter and prepare chart data for selected type
  const chartData = sensors
    .filter(s => s.type === selectedType)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    .map(s => ({
      time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: s.value,
      unit: s.unit,
      alertLevel: s.alertLevel,
      threshold: s.threshold,
      sensorId: s.sensorId,
    }));

  // Get threshold from the most recent reading (if set)
  const threshold = chartData[chartData.length - 1]?.threshold;
  const unit = chartData[0]?.unit || '';
  const color = TYPE_COLORS[selectedType] || '#3b82f6';

  return (
    <div style={{ background: '#111827', borderRadius: '12px', padding: '20px', border: '1px solid #2a3548' }}>

      {/* Header + type selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Readings Over Time</h2>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Historical sensor data</p>
        </div>

        {/* Type filter buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                background: selectedType === type ? TYPE_COLORS[type] + '22' : 'transparent',
                border: `1px solid ${selectedType === type ? TYPE_COLORS[type] : '#2a3548'}`,
                borderRadius: '6px',
                padding: '4px 12px',
                color: selectedType === type ? TYPE_COLORS[type] : '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.15s',
              }}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />

            <XAxis
              dataKey="time"
              stroke="#2a3548"
              tick={{ fill: '#64748b', fontSize: 11 }}
            />

            <YAxis
              stroke="#2a3548"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => v.toLocaleString()}
              width={60}
            />

            <Tooltip content={<CustomTooltip />} />

            {threshold && (
              <ReferenceLine
                y={threshold}
                stroke="#ef4444"
                strokeDasharray="6 3"
                label={{
                  value: `Threshold: ${threshold.toLocaleString()} ${unit}`,
                  fill: '#ef4444',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const dotColor = payload.alertLevel === 'CRITICAL' ? '#ef4444'
                  : payload.alertLevel === 'WARNING' ? '#f59e0b'
                  : color;
                return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={dotColor} stroke={dotColor} strokeWidth={1} />;
              }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              name={selectedType.replace(/_/g, ' ')}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          No data for {selectedType.replace(/_/g, ' ')}
        </div>
      )}
    </div>
  );
}

export default SensorChart;