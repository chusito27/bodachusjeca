import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../ui/Button'
import Input from '../ui/Input'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
      toast.success('¡Bienvenido!')
    } catch (error) {
      toast.error('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </Button>
      <p className="text-center text-sm text-text-light">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-gold hover:text-gold-dark font-medium">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
