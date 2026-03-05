'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Shield } from 'lucide-react'
import { api } from '@/lib/api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.adminLogin(email, password)
      if (res.success) {
        router.push('/admin/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <Image
              src="/logo.jpg"
              alt="Revival Studio"
              fill
              className="object-contain rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Admin Portal</h1>
          <p className="text-[#666] mt-2">Sign in to manage Revival Studio</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@revivalstudio.co.uk"
              required
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#0f3460] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0f3460] text-white rounded-full font-semibold hover:bg-[#1a1a2e] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
