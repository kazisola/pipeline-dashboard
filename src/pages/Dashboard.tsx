import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertTriangle, CheckCircle, Radio, LogOut } from 'lucide-react';
import { sensorsApi } from '../api/sensors.api';
import keycloak from '../keycloak';
import StatCard from '../components/StatCard';
import AlertBadge from '../components/AlertBadge';
import PipelineMap from '../components/PipelineMap';
import SensorTable from '../components/SensorTable';
import SensorChart from '../components/SensorChart';
import SimulateAlert from '../components/SimulateAlert';

const PIPELINE_ID = 'PIPELINE-GULF-COAST-A';

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: sensorsData, isLoading: sensorsLoading } = useQuery({
    queryKey: ['sensors', PIPELINE_ID],
    queryFn: () => sensorsApi.getAll({ pipelineId: PIPELINE_ID, limit: 100 }),
    refetchInterval: 15000,
  });

  const sensors = sensorsData?.data || [];

  const totalSensors = sensors.length;
  const criticalCount = sensors.filter((s: any) => s.alertLevel === 'CRITICAL').length;
  const warningCount  = sensors.filter((s: any) => s.alertLevel === 'WARNING').length;
  const normalCount   = sensors.filter((s: any) => s.alertLevel === 'NORMAL').length;

  // Deduplicate — latest reading per sensor for the map
  const latestBySensor = sensors.reduce((acc: any, sensor: any) => {
    if (!acc[sensor.sensorId] || new Date(sensor.createdAt) > new Date(acc[sensor.sensorId].createdAt)) {
      acc[sensor.sensorId] = sensor;
    }
    return acc;
  }, {});
  const uniqueSensors = Object.values(latestBySensor) as any[];

  // Called by SimulateAlert after firing an event
  // invalidateQueries tells React Query: this cache is stale, refetch now
  const handleSimulated = () => {
    queryClient.invalidateQueries({ queryKey: ['sensors', PIPELINE_ID] });
    // invalidateQueries = marks the cache as stale so triggers immediate refetch
    // This is how the dashboard updates instantly after a simulation
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f1f5f9' }}>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(90deg, #0d1424 0%, #111827 100%)',
        borderBottom: '1px solid #2a3548',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(59,130,246,0.15)', borderRadius: '8px', padding: '8px', boxShadow: '0 0 12px rgba(59,130,246,0.2)' }}>
            <Activity size={20} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.01em' }}>Pipeline Monitor</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Gulf Coast Operations Center</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {criticalCount > 0 && (
            // Only show this banner when there are active critical alerts
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              color: '#ef4444',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              animation: 'blink 2s ease-in-out infinite',
            }}>
              🚨 {criticalCount} CRITICAL ALERT{criticalCount > 1 ? 'S' : ''} ACTIVE
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>LIVE</span>
          </div>

          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            👤 {keycloak.tokenParsed?.preferred_username}
          </div>

          <button
            onClick={() => keycloak.logout()}
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
              transition: 'all 0.15s',
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' }}>
            {PIPELINE_ID.replace(/-/g, ' ')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Real-time sensor monitoring • {totalSensors} readings • Auto-refreshes every 15s
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard title="Total Readings"  value={totalSensors}  icon={Radio}          color="blue"   trend="Across all sensors" />
          <StatCard title="Normal"          value={normalCount}   icon={CheckCircle}    color="green"  trend="Within safe range" />
          <StatCard title="Warnings"        value={warningCount}  icon={AlertTriangle}  color="yellow" trend="Approaching threshold" />
          <StatCard title="Critical"        value={criticalCount} icon={AlertTriangle}  color="red"    trend={criticalCount > 0 ? '⚠️ Action required' : 'No active alerts'} />
        </div>

        {/* Map + Alert Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#111827', borderRadius: '12px', padding: '20px', border: '1px solid #2a3548' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Pipeline Route Map</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Click any sensor marker for details</p>
            </div>
            <PipelineMap sensors={uniqueSensors} />
          </div>

          <div style={{ background: '#111827', borderRadius: '12px', padding: '20px', border: '1px solid #2a3548', overflowY: 'auto', maxHeight: '560px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Alert Feed</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sensors
                .filter((s: any) => s.alertLevel !== 'NORMAL')
                .sort((a: any, b: any) => {
                  const order = { CRITICAL: 0, WARNING: 1, NORMAL: 2 };
                  return order[a.alertLevel as keyof typeof order] - order[b.alertLevel as keyof typeof order];
                })
                .map((sensor: any) => (
                  <div key={sensor._id} style={{
                    background: sensor.alertLevel === 'CRITICAL' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${sensor.alertLevel === 'CRITICAL' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    animation: sensor.alertLevel === 'CRITICAL' ? 'fadeIn 0.3s ease' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{sensor.sensorId}</span>
                      <AlertBadge level={sensor.alertLevel} />
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700 }}>
                      {sensor.value.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b' }}>{sensor.unit}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{sensor.type.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                      {new Date(sensor.createdAt).toLocaleTimeString()}
                    </div>
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

        {/* Chart + Simulate Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '16px', marginBottom: '24px' }}>
          <SensorChart sensors={sensors} />
          <SimulateAlert onSimulated={handleSimulated} />
        </div>

        {/* Sensor Table */}
        <div style={{ background: '#111827', borderRadius: '12px', border: '1px solid #2a3548', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>All Sensor Readings</h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              {totalSensors} readings • Sorted by most recent
            </p>
          </div>
          <SensorTable sensors={sensors} isLoading={sensorsLoading} />
        </div>
      </main>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}