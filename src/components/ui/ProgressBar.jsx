export default function ProgressBar({ value = 0, max = 100, label, showPercentage = true, color = 'gold' }) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0

  const colors = {
    gold: 'bg-gold',
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning'
  }

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm text-text-light">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-text">{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-border rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
