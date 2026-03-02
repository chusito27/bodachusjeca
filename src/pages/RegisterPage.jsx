import RegisterForm from '../components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text">Chus & Jeca</h1>
          <p className="text-gold mt-2">27 de Febrero, 2027</p>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
        </div>
        <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
          <h2 className="text-xl font-semibold text-text mb-6 text-center">Crear Cuenta</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
