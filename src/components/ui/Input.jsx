export default function Input({ label, type = 'text', value, onChange, placeholder, required, error, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold text-sm bg-surface text-text resize-none"
          {...props}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold text-sm bg-surface text-text"
          {...props}
        >
          {props.children}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold text-sm bg-surface text-text"
          {...props}
        />
      )}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}
