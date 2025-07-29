'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, registrar, deleteAccount } from '@/api'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'register' | 'delete'>('login')
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('user')) {
      router.push('/simulation')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const actions = {
      login: handleLogin,
      register: handleRegister,
      delete: handleDelete
    }

    await actions[mode]()
  }

  const handleLogin = async () => {
    try {
      await login({ login: username, senha: password })
      localStorage.setItem('user', username)
      router.push('/simulation')
    } catch (err) {
      console.error('Login failed:', err)
      setError('Falha no login. Verifique suas credenciais.')
    }
  }

  const handleRegister = async () => {
    try {
      await registrar({ login: username, senha: password, avatar: avatar })
      await login({ login: username, senha: password })
      localStorage.setItem('user', username)
      router.push('/simulation')
    } catch (err) {
      console.error('Registration failed:', err)
      setError('Falha no registro. O nome de usuário pode já estar em uso.')
    }
  }
  

  const handleDelete = async () => {
    try {
      await deleteAccount(username)
      localStorage.removeItem('user')
      setMode('login')
      setSuccessMessage('Conta deletada com sucesso.')
    } catch {
      setError('Falha ao deletar a conta. Verifique suas credenciais.')
    }
  }

  const getTitle = () => {
    if (mode === 'register') return 'Registrar'
    if (mode === 'delete') return 'Deletar Conta'
    return 'Login'
  }

  const getButtonText = () => {
    if (mode === 'register') return 'Registrar'
    if (mode === 'delete') return 'Deletar Conta Permanentemente'
    return 'Entrar'
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-black">{getTitle()}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {mode !== 'delete' && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {mode === 'register' && (
            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700"
              >
                Avatar (URL da imagem)
              </label>
              <input
                id="foto"
                type="text"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {successMessage && (
            <p className="text-sm text-green-500">{successMessage}</p>
          )}
          <button
            type="submit"
            id="entrar"
            className={`w-full py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${mode === 'delete' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}>
            {getButtonText()}
          </button>
        </form>
        <div className="text-sm text-center text-gray-600">
          {mode === 'login' && (
            <p>
              Não tem uma conta?{' '}
              <button
                id="cadastro"
                onClick={() => setMode('register')}
                className="font-medium text-blue-600 hover:underline"
              >
                Crie uma
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Já tem uma conta?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-medium text-blue-600 hover:underline"
              >
                Faça login
              </button>
            </p>
          )}
          {mode !== 'delete' && (
            <p className="mt-2">
              <button
                onClick={() => setMode('delete')}
                className="font-medium text-red-600 hover:underline"
              >
                Deletar conta
              </button>
            </p>
          )}
          {mode === 'delete' && (
            <p className="mt-2">
              <button
                onClick={() => setMode('login')}
                className="font-medium text-gray-600 hover:underline"
              >
                Voltar para o Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
