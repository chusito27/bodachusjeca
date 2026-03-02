export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-5xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg font-medium text-text mb-2">{title}</h3>
      {description && <p className="text-text-light text-sm mb-4 max-w-md">{description}</p>}
      {action}
    </div>
  )
}
