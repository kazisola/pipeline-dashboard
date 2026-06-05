
interface AlertBadgeProps {
  level: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

const AlertBadge = ({ level }: AlertBadgeProps) => {

  const styles = {
    NORMAL:   { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e', border: 'rgba(34,197,94,0.3)'   },
    WARNING:  { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
    CRITICAL: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', border: 'rgba(239,68,68,0.3)',  },
  };

  const s = styles[level] || styles.NORMAL;

  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: '999px',
      padding: '3px 10px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      // Combine all these for a clean "chip" look
    }}>
      {level === 'CRITICAL' && '🚨 '}
      {level === 'WARNING' && '⚠️ '}
      {level === 'NORMAL' && '✅ '}
      {level}
    </span>
  );
}

export default AlertBadge;