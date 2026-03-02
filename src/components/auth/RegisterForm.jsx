import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../ui/Button'
import Input from '../ui/Input'
import toast from 'react-hot-toast'

export default function RegisterForm() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      await register(email, password, displayName)
      navigate('/')
      toast.success('¡Cuenta creada exitosamente!')
    } catch (error) {
      toast.error('Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Tu nombre"
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>
      <p className="text-center text-sm text-text-light">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-gold hover:text-gold-dark font-medium">
          Inicia Sesión
        </Link>
      </p>
    </form>
  )
}
