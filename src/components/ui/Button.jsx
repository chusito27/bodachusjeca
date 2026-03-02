export default function Button({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled = false, className = '' }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gold hover:bg-gold-dark text-white shadow-sm',
    secondary: 'bg-surface hover:bg-surface-elevated text-text border border-border',
    danger: 'bg-error hover:bg-red-600 text-white',
    ghost: 'hover:bg-surface-elevated text-text-light'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
