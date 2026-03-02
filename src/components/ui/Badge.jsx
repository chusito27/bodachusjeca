export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface-elevated text-text',
    success: 'bg-green-500/15 text-green-600',
    error: 'bg-red-500/15 text-red-600',
    warning: 'bg-yellow-500/15 text-yellow-600',
    gold: 'bg-gold/10 text-gold-dark',
    info: 'bg-blue-500/15 text-blue-600'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
