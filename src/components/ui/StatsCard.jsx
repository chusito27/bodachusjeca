import Card from './Card'

export default function StatsCard({ icon, label, value, subtitle, color = 'gold' }) {
  const colors = {
    gold: 'text-gold',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-blue-500'
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`text-2xl ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-text">{value}</p>
          <p className="text-sm text-text-light">{label}</p>
          {subtitle && <p className="text-xs text-text-light mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </Card>
  )
}
