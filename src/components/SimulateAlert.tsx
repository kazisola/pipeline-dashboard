import { useState } from 'react';
import { sensorsApi } from '../api/sensors.api';
import { Zap, CheckCircle, Loader } from 'lucide-react';

// Pre-built dramatic scenarios — each one tells a story
const SCENARIOS = [
  {
    label: '💥 Gas Leak Detected',
    description: 'Methane spike at Pump Station 3',
    data: {
      sensorId: 'SENSOR-TX-004',
      pipelineId: 'PIPELINE-GULF-COAST-A',
      type: 'GAS_LEVEL',
      value: 1850,      // Way over 900 ppm threshold > CRITICAL
      unit: 'ppm',
      latitude: 29.9012,
      longitude: -95.5231,
      location: 'Gulf Coast Segment A — Pump Station 3',
      threshold: 900,
      isActive: true,
    }
  },
  {
    label: '🔥 Temperature Surge',
    description: 'Overheating at Refinery Gate B',
    data: {
      sensorId: 'SENSOR-TX-007',
      pipelineId: 'PIPELINE-GULF-COAST-A',
      type: 'TEMPERATURE',
      value: 498,       // 498°F vs 400°F threshold > CRITICAL
      unit: '°F',
      latitude: 29.4231,
      longitude: -94.9876,
      location: 'Gulf Coast Segment A — Refinery Gate B',
      threshold: 400,
      isActive: true,
    }
  },
  {
    label: '⚡ Pressure Critical',
    description: 'Pipeline pressure exceeding safe limits',
    data: {
      sensorId: 'SENSOR-TX-001',
      pipelineId: 'PIPELINE-GULF-COAST-A',
      type: 'PRESSURE',
      value: 3150,      // Over 3000 PSI threshold > CRITICAL
      unit: 'PSI',
      latitude: 29.7604,
      longitude: -95.3698,
      location: 'Gulf Coast Segment A — Mile Marker 47',
      threshold: 3000,
      isActive: true,
    }
  },
  {
    label: '✅ All Clear',
    description: 'Restore all sensors to normal',
    data: {
      sensorId: 'SENSOR-TX-004',
      pipelineId: 'PIPELINE-GULF-COAST-A',
      type: 'GAS_LEVEL',
      value: 120,       // Well below threshold > NORMAL
      unit: 'ppm',
      latitude: 29.9012,
      longitude: -95.5231,
      location: 'Gulf Coast Segment A — Pump Station 3',
      threshold: 900,
      isActive: true,
    }
  },
];

interface SimulateAlertProps {
  onSimulated: () => void;
  // Callback to trigger a data refetch after simulation to tell dashboard
}

const SimulateAlert = ({ onSimulated }: SimulateAlertProps) => {
  const [loading, setLoading] = useState(false);
  const [lastFired, setLastFired] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fireScenario = async (scenario: typeof SCENARIOS[0]) => {
    setLoading(true);
    setError(null);

    try {
      await sensorsApi.create(scenario.data);

      setLastFired(scenario.label);

      onSimulated();

      setTimeout(() => setLastFired(null), 3000);

    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to simulate — check your token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#111827',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #2a3548',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Zap size={16} color="#f59e0b" />
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Simulate Event</h2>
          <span style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '10px',
            color: '#f59e0b',
            fontWeight: 600,
          }}>
            DEMO MODE
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b' }}>
          Fire a live sensor event — watch the dashboard react in real time
        </p>
      </div>

      {/* Scenario buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.label}
            onClick={() => fireScenario(scenario)}
            disabled={loading}
            // disabled = can't click while a request is in flight
            style={{
              background: scenario.label.includes('Clear')
                ? 'rgba(34,197,94,0.08)'
                : 'rgba(239,68,68,0.08)',
              border: `1px solid ${scenario.label.includes('Clear')
                ? 'rgba(34,197,94,0.25)'
                : 'rgba(239,68,68,0.25)'}`,
              borderRadius: '10px',
              padding: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>
              {scenario.label}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {scenario.description}
            </div>
          </button>
        ))}
      </div>

      {/* Status feedback */}
      <div style={{ marginTop: '12px', minHeight: '24px' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
            <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Firing event...
          </div>
        )}
        {lastFired && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontSize: '13px' }}>
            <CheckCircle size={14} />
            {lastFired} — event fired! Dashboard updating...
          </div>
        )}
        {error && (
          <div style={{ color: '#ef4444', fontSize: '12px' }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* Spin animation for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default SimulateAlert;