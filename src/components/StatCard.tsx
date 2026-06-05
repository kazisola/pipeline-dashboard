
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string; // Optional trend text e.g. "+2 this hour"
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) => {

  const colorMap = {
    blue:   { border: '#3b82f6', glow: 'rgba(59,130,246,0.15)',  icon: '#3b82f6' },
    green:  { border: '#22c55e', glow: 'rgba(34,197,94,0.15)',   icon: '#22c55e' },
    yellow: { border: '#f59e0b', glow: 'rgba(245,158,11,0.15)',  icon: '#f59e0b' },
    red:    { border: '#ef4444', glow: 'rgba(239,68,68,0.15)',   icon: '#ef4444' },
  };

  const c = colorMap[color];

  return (
    <div style={{
      background: '#1a2235',
      border: `1px solid ${c.border}`,
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: `0 0 20px ${c.glow}`,
      // Box shadow with the color's glow creates a subtle neon effect
      transition: 'transform 0.2s',
      // Smooth animation for hover effect
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <div style={{ background: c.glow, borderRadius: '8px', padding: '8px' }}>
          <Icon size={20} color={c.icon} />
        </div>
      </div>

      <div style={{ fontSize: '32px', fontWeight: 700, color: '#f1f5f9' }}>
        {value}
      </div>

      {trend && (
        // Conditional rendering — only shows if trend prop was provided
        // {trend && <element>} = if trend is truthy, render the element
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          {trend}
        </div>
      )}
    </div>
  );
}

export default StatCard;