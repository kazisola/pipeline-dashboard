
import AlertBadge from './AlertBadge';

interface Sensor {
  _id: string;
  sensorId: string;
  pipelineId: string;
  type: string;
  value: number;
  unit: string;
  location: string;
  alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL';
  isActive: boolean;
  createdAt: string;
}

interface SensorTableProps {
  sensors: Sensor[];
  isLoading: boolean;
}

const SensorTable = ({ sensors, isLoading }: SensorTableProps) => {

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading sensor data...
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>

        <thead>
          <tr style={{ borderBottom: '1px solid #2a3548' }}>
            {['Sensor ID', 'Type', 'Value', 'Location', 'Status', 'Alert', 'Time'].map(h => (
              <th key={h} style={{
                padding: '12px 16px',
                textAlign: 'left',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sensors.map((sensor, index) => (
            <tr
              key={sensor._id}
              style={{
                borderBottom: '1px solid #1e2a3a',
                background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',

                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1e2a40')}
              onMouseLeave={e => (e.currentTarget.style.background = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
              // Hover highlight — onMouseEnter/Leave change background directly
            >
              <td style={{ padding: '14px 16px', fontWeight: 600, color: '#93c5fd', whiteSpace: 'nowrap' }}>
                {sensor.sensorId}
              </td>
              <td style={{ padding: '14px 16px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                {sensor.type.replace(/_/g, ' ')}
              </td>
              <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '16px', whiteSpace: 'nowrap' }}>
                {sensor.value.toLocaleString()}
                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>
                  {sensor.unit}
                </span>
              </td>
              <td style={{ padding: '14px 16px', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sensor.location}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{
                  color: sensor.isActive ? '#22c55e' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 500,
                }}>
                  {sensor.isActive ? '● Online' : '○ Offline'}
                </span>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <AlertBadge level={sensor.alertLevel} />
              </td>
              <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                {new Date(sensor.createdAt).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sensors.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No sensor readings found
        </div>
      )}
    </div>
  );
}

export default SensorTable;