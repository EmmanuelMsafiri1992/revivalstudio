'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Lock, Crown, Star, Zap, MapPin, RefreshCw, Gavel, Tag } from 'lucide-react'

const PREMIUM_PASSWORD = 'REVIVALPREMIUM2024'

const premiumFeatures = [
  {
    icon: Tag,
    title: 'Discount Pro',
    description: 'Access exclusive discounted furniture from our partner network',
    color: 'text-[#c9a962]',
    bg: 'bg-[#c9a962]/10',
  },
  {
    icon: MapPin,
    title: 'Near Me',
    description: 'Find quality second-hand furniture close to your location',
    color: 'text-[#7a9b76]',
    bg: 'bg-[#7a9b76]/10',
  },
  {
    icon: RefreshCw,
    title: 'Exchange Pro',
    description: 'Get 20% above standard resale value for your furniture',
    color: 'text-[#c9a962]',
    bg: 'bg-[#c9a962]/10',
  },
  {
    icon: Gavel,
    title: 'Bidding Pro',
    description: 'Let our partner network compete to give you the best price',
    color: 'text-[#7a9b76]',
    bg: 'bg-[#7a9b76]/10',
  },
]

function PremiumLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // If already authenticated, redirect
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('premium_token')
      if (token === 'authenticated') {
        const redirect = searchParams.get('redirect') || '/buy'
        router.replace(redirect)
      }
    }
  }, [router, searchParams])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Small delay for UX
    setTimeout(() => {
      if (code.trim().toUpperCase() === PREMIUM_PASSWORD) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('premium_token', 'authenticated')
        }
        setSuccess(true)
        setTimeout(() => {
          const redirect = searchParams.get('redirect') || '/buy'
          router.push(redirect)
        }, 1200)
      } else {
        setError('Invalid access code. Please check your premium code and try again.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#2a3528]">
      <div className="w-full max-w-xl">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#c9a962] to-[#d4b46d] px-8 py-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-[#3d4a3a]" />
            </div>
            <h1 className="text-2xl font-bold text-[#3d4a3a]">Premium Access</h1>
            <p className="text-[#3d4a3a]/80 text-sm mt-1">Enter your premium access code to unlock exclusive features</p>
          </div>

          <div className="p-8">
            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                success ? 'bg-green-100' : 'bg-[#faf8f5]'
              }`}>
                {success ? (
                  <Star className="w-8 h-8 text-[#c9a962]" />
                ) : (
                  <Lock className="w-8 h-8 text-[#3d4a3a]" />
                )}
              </div>
            </div>

            {success ? (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-[#3d4a3a] mb-2">Access Granted!</p>
                <p className="text-[#666] text-sm">Redirecting you to premium features...</p>
                <Loader2 className="w-6 h-6 animate-spin text-[#c9a962] mx-auto mt-4" />
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                      Premium Access Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter your premium code"
                      required
                      autoFocus
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none text-center text-lg font-mono tracking-widest uppercase"
                    />
                    <p className="text-xs text-[#999] mt-2 text-center">
                      Contact Revival Studio to get your premium access code
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !code.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                    ) : (
                      <><Crown className="w-5 h-5" /> Unlock Premium Access</>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.back()}
                    className="text-sm text-[#666] hover:text-[#3d4a3a] transition-colors"
                  >
                    &larr; Go back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Premium Features Preview */}
        <div className="mt-8">
          <p className="text-center text-white/70 text-sm mb-4 uppercase tracking-wider font-medium">
            Premium Features Included
          </p>
          <div className="grid grid-cols-2 gap-3">
            {premiumFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              >
                <div className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Zap badge */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-2 text-[#c9a962] text-sm font-medium">
            <Zap className="w-4 h-4" />
            Instant access after code verification
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PremiumLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#3d4a3a] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#c9a962] border-t-transparent rounded-full animate-spin" /></div>}>
      <PremiumLoginContent />
    </Suspense>
  )
}
