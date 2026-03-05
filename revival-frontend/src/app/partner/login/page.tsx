'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, LogIn } from 'lucide-react'
import { api } from '@/lib/api'

export default function PartnerLoginPage() {
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
      const res = await api.outletLogin(email, password)
      if (res.success) {
        router.push('/partner/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#3d4a3a] to-[#7a9b76]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#3d4a3a] to-[#7a9b76] flex items-center justify-center">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold text-[#3d4a3a]">Partner Login</h1>
          <p className="text-[#666] mt-2">Access your outlet marketplace dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3d4a3a] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="outlet@revivalstudio.co.uk"
              required
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3d4a3a] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#c9a962] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#d4b46d] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            Login
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#e5e5e5] text-center">
          <p className="text-sm text-[#666]">
            Not a partner yet?{' '}
            <Link href="mailto:partners@revivalstudio.co.uk" className="text-[#3d4a3a] font-medium hover:underline">
              Contact us
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-[#faf8f5] rounded-xl text-sm">
          <p className="font-medium text-[#3d4a3a] mb-1">Demo Credentials:</p>
          <p className="text-[#666]">Email: london@revivalstudio.co.uk</p>
          <p className="text-[#666]">Password: revival2024</p>
        </div>
      </div>
    </div>
  )
}
