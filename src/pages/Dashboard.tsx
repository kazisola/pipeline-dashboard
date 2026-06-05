
import { useQuery } from '@tanstack/react-query';

import { Activity, AlertTriangle, CheckCircle, Radio, LogOut } from 'lucide-react';
import { sensorsApi } from '../api/sensors.api';
import keycloak from '../keycloak';
import StatCard from '../components/StatCard';
import AlertBadge from '../components/AlertBadge';
import PipelineMap from '../components/PipelineMap';
import SensorTable from '../components/SensorTable';

const PIPELINE_ID = 'PIPELINE-GULF-COAST-A';

const Dashboard = () => {

  // Fetch all sensor readings
  const { data: sensorsData, isLoading: sensorsLoading } = useQuery({
    queryKey: ['sensors', PIPELINE_ID],

    queryFn: () => sensorsApi.getAll({ pipelineId: PIPELINE_ID, limit: 50 }),

    refetchInterval: 15000,
  });

  // Fetch pipeline summary stats
  const { data: summaryData } = useQuery({
    queryKey: ['summary', PIPELINE_ID],
    queryFn: () => sensorsApi.getPipelineSummary(PIPELINE_ID),
    refetchInterval: 15000,
  });

  const sensors = sensorsData?.data || [];

  const summary = summaryData?.data || [];

  // Derive stats from sensor data
  const totalSensors = sensors.length;
  const criticalCount = sensors.filter((s: any) => s.alertLevel === 'CRITICAL').length;

  const warningCount = sensors.filter((s: any) => s.alertLevel === 'WARNING').length;
  const normalCount = sensors.filter((s: any) => s.alertLevel === 'NORMAL').length;

  // Get latest reading for each unique sensor (deduplicated)
  const latestBySensor = sensors.reduce((acc: any, sensor: any) => {
    // reduce() builds up an object — one entry per sensorId
    // accumulator — the object being built up
    // If we haven't seen this sensorId yet, or this reading is newer then keep it
    if (!acc[sensor.sensorId] || new Date(sensor.createdAt) > new Date(acc[sensor.sensorId].createdAt)) {
      acc[sensor.sensorId] = sensor;
    }
    return acc;
  }, {});
  const uniqueSensors = Object.values(latestBySensor) as any[];
  // Object.values() to convert { 'SENSOR-001': {...}, 'SENSOR-002': {...} }
  // into [ {...}, {...} ] — an array of the values

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f1f5f9' }}>

      {/* Header */}
      <header style={{
        background: '#111827',
        borderBottom: '1px solid #2a3548',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        // sticky + zIndex: stays at top while scrolling, appears above map
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(59,130,246,0.15)', borderRadius: '8px', padding: '8px' }}>
            <Activity size={20} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Pipeline Monitor</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Gulf Coast Operations</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Live indicator — pulsing dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
              animation: 'pulse 2s infinite',
              // CSS animation 
            }} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>LIVE</span>
          </div>

          {/* Logged in user from Keycloak token */}
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            👤 {keycloak.tokenParsed?.preferred_username}
            {/* tokenParsed = the decoded JWT payload — contains user info */}
          </div>

          {/* Logout button */}
          <button
            onClick={() => keycloak.logout()}
            // keycloak.logout() clears the token and redirects to Keycloak logout
            style={{
              background: 'transparent',
              border: '1px solid #2a3548',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Page title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
            {PIPELINE_ID.replace(/-/g, ' ')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Real-time sensor monitoring • Auto-refreshes every 15s
          </p>
        </div>

        {/* Stat Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard title="Total Sensors"  value={totalSensors}  icon={Radio}          color="blue"   trend="Active monitoring" />
          <StatCard title="Normal"         value={normalCount}   icon={CheckCircle}    color="green"  trend="Operating within range" />
          <StatCard title="Warnings"       value={warningCount}  icon={AlertTriangle}  color="yellow" trend="Approaching threshold" />
          <StatCard title="Critical"       value={criticalCount} icon={AlertTriangle}  color="red"    trend={criticalCount > 0 ? '⚠️ Immediate action required' : 'No critical alerts'} />
        </div>

        {/* Map + Alerts Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', marginBottom: '24px' }}>

          {/* Map */}
          <div style={{ background: '#111827', borderRadius: '12px', padding: '20px', border: '1px solid #2a3548' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Pipeline Route Map</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Click any sensor for details</p>
            </div>
            <PipelineMap sensors={uniqueSensors} />
          </div>

          {/* Alert Feed */}
          <div style={{ background: '#111827', borderRadius: '12px', padding: '20px', border: '1px solid #2a3548', overflowY: 'auto', maxHeight: '560px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Alert Feed</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sensors
                .filter((s: any) => s.alertLevel !== 'NORMAL')
                // Only show non-normal sensors in the alert feed
                .sort((a: any, b: any) => {
                  // Sort: CRITICAL first, then WARNING
                  const order = { CRITICAL: 0, WARNING: 1, NORMAL: 2 };
                  return order[a.alertLevel as keyof typeof order] - order[b.alertLevel as keyof typeof order];
                })
                .map((sensor: any) => (
                  <div key={sensor._id} style={{
                    background: sensor.alertLevel === 'CRITICAL' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${sensor.alertLevel === 'CRITICAL' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                    borderRadius: '8px',
                    padding: '12px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{sensor.sensorId}</span>
                      <AlertBadge level={sensor.alertLevel} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>
                      {sensor.value.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b' }}>{sensor.unit}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{sensor.type}</div>
                  </div>
                ))
              }
              {sensors.filter((s: any) => s.alertLevel !== 'NORMAL').length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '13px' }}>
                  ✅ All sensors operating normally
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sensor Readings Table */}
        <div style={{ background: '#111827', borderRadius: '12px', border: '1px solid #2a3548', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Sensor Readings</h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              {totalSensors} readings • Showing latest 50
            </p>
          </div>
          <SensorTable sensors={sensors} isLoading={sensorsLoading} />
        </div>
      </main>

      {/* CSS animation for the live pulsing dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;