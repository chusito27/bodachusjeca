import { useEffect } from 'react'
import { IoClose } from 'react-icons/io5'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-surface rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <h2 className="text-base sm:text-lg font-semibold text-text truncate mr-2">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors flex-shrink-0">
            <IoClose size={20} />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
