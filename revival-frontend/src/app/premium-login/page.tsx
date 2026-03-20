'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Loader2, Crown, Star, Zap, MapPin, RefreshCw, Gavel, Tag,
  Eye, EyeOff, Check, Mail, Lock, User, CreditCard, Calendar, Shield,
  ChevronLeft, CheckCircle, ArrowRight
} from 'lucide-react'
import { api } from '@/lib/api'

const plans = [
  {
    key: 'monthly' as const,
    label: 'Monthly',
    price: '£9.99',
    period: '/month',
    description: 'Billed monthly, cancel anytime',
    badge: null,
  },
  {
    key: 'yearly' as const,
    label: 'Yearly',
    price: '£79.99',
    period: '/year',
    description: 'Save 33% — just £6.67/month',
    badge: 'Best Value',
  },
]

const premiumFeatures = [
  { icon: Tag,      label: 'Discount Pro',    desc: 'Exclusive discounted listings' },
  { icon: MapPin,   label: 'Near Me',         desc: 'Find furniture near you' },
  { icon: RefreshCw, label: 'Exchange Pro',   desc: '+20% above market value' },
  { icon: Gavel,    label: 'Bidding Pro',     desc: 'Partner network bids for you' },
]

function PremiumLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/buy'

  const [tab, setTab] = useState<'register' | 'login'>('register')
  const [step, setStep] = useState(1) // register: 1=account, 2=plan+payment, 3=done

  // Register fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')

  // Payment fields (UI only — replace with Stripe Elements for real charging)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('')
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false)
  const [existingUserName, setExistingUserName] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('premium_token') === 'authenticated') {
      const stored = localStorage.getItem('premium_user')
      const parsed = stored ? JSON.parse(stored) : null
      setExistingUserName(parsed?.name || '')
      setAlreadyLoggedIn(true)
    }
  }, [])

  // Card number formatting
  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  // Expiry formatting
  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  function grantAccess(name: string) {
    localStorage.setItem('premium_token', 'authenticated')
    localStorage.setItem('premium_user', JSON.stringify({ name }))
    setUserName(name)
    setAlreadyLoggedIn(false)
  }

  function handleLogout() {
    localStorage.removeItem('premium_token')
    localStorage.removeItem('premium_user')
    setAlreadyLoggedIn(false)
    setExistingUserName('')
  }

  // Step 1 → Step 2 validation
  function handleAccountContinue() {
    setError('')
    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setStep(2)
  }

  // Step 2 submit — register + payment
  async function handleRegisterSubmit() {
    setError('')
    if (!cardName.trim()) { setError('Please enter the cardholder name.'); return }
    if (cardNumber.replace(/\s/g, '').length < 16) { setError('Please enter a valid 16-digit card number.'); return }
    if (cardExpiry.length < 5) { setError('Please enter a valid expiry date.'); return }
    if (cardCvv.length < 3) { setError('Please enter a valid CVV.'); return }

    setLoading(true)
    try {
      const res = await api.premiumRegister({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        plan: selectedPlan,
      })
      if (res.success) {
        grantAccess(res.user.name)
        setStep(3)
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (err: any) {
      const msg = err?.data?.errors
        ? Object.values(err.data.errors as Record<string, string[]>).flat()[0]
        : 'Registration failed. Please check your details and try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Login submit
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.premiumLogin({ email: loginEmail, password: loginPassword })
      if (res.success) {
        grantAccess(res.user.name)
        setTimeout(() => router.push(redirect), 1200)
      } else {
        setError('Invalid email or password.')
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#2a3528] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Already logged in */}
        {alreadyLoggedIn && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#c9a962]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-[#c9a962]" />
            </div>
            <h2 className="text-xl font-bold text-[#3d4a3a] mb-1">
              {existingUserName ? `Welcome back, ${existingUserName}!` : 'You\'re already logged in'}
            </h2>
            <p className="text-[#666] text-sm mb-6">You have an active premium account.</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push(redirect)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-md"
              >
                <Zap className="w-5 h-5" /> Go to Premium Features
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-3 border-2 border-[#e5e5e5] text-[#666] rounded-full font-medium hover:border-[#3d4a3a] hover:text-[#3d4a3a] transition-colors text-sm"
              >
                Sign in as a different account
              </button>
            </div>
          </div>
        )}

        {/* Logo / Brand + main form — hidden when already logged in */}
        {!alreadyLoggedIn && <>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-5 py-3">
            <Crown className="w-6 h-6 text-[#c9a962]" />
            <span className="text-white font-bold text-lg">Revival Studio Premium</span>
          </div>
        </div>

        {/* Step 3 — Success (register) */}
        {tab === 'register' && step === 3 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-[#7a9b76]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#7a9b76]" />
            </div>
            <h2 className="text-2xl font-bold text-[#3d4a3a] mb-2">Welcome, {userName}!</h2>
            <p className="text-[#666] mb-6">Your premium account is ready. Enjoy full access to all tools.</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {premiumFeatures.map(f => (
                <div key={f.label} className="flex items-center gap-2 bg-[#faf8f5] rounded-xl p-3">
                  <f.icon className="w-4 h-4 text-[#c9a962]" />
                  <span className="text-sm font-medium text-[#3d4a3a]">{f.label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push(redirect)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold text-lg hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-lg"
            >
              <Zap className="w-5 h-5" /> Go to Premium Features
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#e5e5e5]">
              <button
                onClick={() => { setTab('register'); setStep(1); setError('') }}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'register' ? 'text-[#3d4a3a] border-b-2 border-[#c9a962]' : 'text-[#999] hover:text-[#3d4a3a]'}`}
              >
                Create Account
              </button>
              <button
                onClick={() => { setTab('login'); setError('') }}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'login' ? 'text-[#3d4a3a] border-b-2 border-[#c9a962]' : 'text-[#999] hover:text-[#3d4a3a]'}`}
              >
                Log In
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* ── REGISTER FLOW ── */}
              {tab === 'register' && (
                <>
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-6">
                    {[1, 2].map(s => (
                      <div key={s} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          s < step ? 'bg-[#7a9b76] text-white' : s === step ? 'bg-[#c9a962] text-[#3d4a3a]' : 'bg-[#e5e5e5] text-[#999]'
                        }`}>
                          {s < step ? <Check className="w-4 h-4" /> : s}
                        </div>
                        <span className={`text-xs font-medium ${s === step ? 'text-[#3d4a3a]' : 'text-[#999]'}`}>
                          {s === 1 ? 'Your Details' : 'Plan & Payment'}
                        </span>
                        {s < 2 && <div className="w-8 h-px bg-[#e5e5e5]" />}
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  {/* Step 1: Account details */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-[#3d4a3a]">Create your account</h2>

                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="John Smith"
                            className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            className="w-full pl-10 pr-12 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#3d4a3a]"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-1">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleAccountContinue}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#3d4a3a] text-white rounded-full font-bold hover:bg-[#2d3a2a] transition-all shadow-md mt-2"
                      >
                        Continue <ArrowRight className="w-5 h-5" />
                      </button>

                      <p className="text-center text-xs text-[#999]">
                        Already have an account?{' '}
                        <button onClick={() => { setTab('login'); setError('') }} className="text-[#c9a962] font-semibold hover:underline">
                          Log in
                        </button>
                      </p>
                    </div>
                  )}

                  {/* Step 2: Plan + Payment */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => { setStep(1); setError('') }} className="text-[#999] hover:text-[#3d4a3a]">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-[#3d4a3a]">Choose your plan</h2>
                      </div>

                      {/* Plan selector */}
                      <div className="grid grid-cols-2 gap-3">
                        {plans.map(plan => (
                          <button
                            key={plan.key}
                            onClick={() => setSelectedPlan(plan.key)}
                            className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                              selectedPlan === plan.key
                                ? 'border-[#c9a962] bg-[#c9a962]/5'
                                : 'border-[#e5e5e5] hover:border-[#c9a962]/50'
                            }`}
                          >
                            {plan.badge && (
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#c9a962] text-[#3d4a3a] text-[10px] font-bold rounded-full whitespace-nowrap">
                                {plan.badge}
                              </span>
                            )}
                            <div className="font-bold text-[#3d4a3a] text-lg">{plan.price}</div>
                            <div className="text-xs text-[#666]">{plan.period}</div>
                            <div className="text-[10px] text-[#999] mt-1">{plan.description}</div>
                            {selectedPlan === plan.key && (
                              <Check className="absolute top-3 right-3 w-4 h-4 text-[#c9a962]" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Features included */}
                      <div className="bg-[#faf8f5] rounded-xl p-4">
                        <p className="text-xs font-bold text-[#3d4a3a] uppercase tracking-wider mb-3">Included with premium</p>
                        <div className="grid grid-cols-2 gap-2">
                          {premiumFeatures.map(f => (
                            <div key={f.label} className="flex items-center gap-2 text-sm text-[#3d4a3a]">
                              <Check className="w-4 h-4 text-[#7a9b76] flex-shrink-0" />
                              {f.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment form */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-4 h-4 text-[#7a9b76]" />
                          <span className="text-sm font-semibold text-[#3d4a3a]">Payment Details</span>
                          <span className="text-xs text-[#999] ml-auto">🔒 Secure</span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-[#666] mb-1">Cardholder Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                              <input
                                type="text"
                                value={cardName}
                                onChange={e => setCardName(e.target.value)}
                                placeholder="Name on card"
                                className="w-full pl-9 pr-4 py-2.5 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#666] mb-1">Card Number</label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className="w-full pl-9 pr-4 py-2.5 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none text-sm font-mono tracking-wider"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-[#666] mb-1">Expiry Date</label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                                <input
                                  type="text"
                                  value={cardExpiry}
                                  onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className="w-full pl-9 pr-4 py-2.5 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none text-sm font-mono"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#666] mb-1">CVV</label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
                                <input
                                  type="text"
                                  value={cardCvv}
                                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                  placeholder="CVV"
                                  maxLength={4}
                                  className="w-full pl-9 pr-4 py-2.5 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none text-sm font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleRegisterSubmit}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold text-base hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-lg disabled:opacity-60"
                      >
                        {loading ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                        ) : (
                          <><Crown className="w-5 h-5" /> Pay {plans.find(p => p.key === selectedPlan)?.price} &amp; Create Account</>
                        )}
                      </button>

                      <p className="text-center text-[10px] text-[#999]">
                        By subscribing you agree to our terms. Cancel anytime.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── LOGIN FLOW ── */}
              {tab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold text-[#3d4a3a]">Welcome back</h2>
                  <p className="text-sm text-[#666]">Log in to access your premium tools</p>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Your password"
                        required
                        className="w-full pl-10 pr-12 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#3d4a3a]"
                      >
                        {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !loginEmail || !loginPassword}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
                    ) : (
                      <><Star className="w-5 h-5" /> Sign In</>
                    )}
                  </button>

                  <p className="text-center text-sm text-[#999]">
                    Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => { setTab('register'); setError('') }} className="text-[#c9a962] font-semibold hover:underline">
                      Create one
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Features preview (below card) */}
        {!(tab === 'register' && step === 3) && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {premiumFeatures.map(f => (
              <div key={f.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#c9a962]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-[#c9a962]" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{f.label}</p>
                  <p className="text-white/50 text-[10px]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        </>}
      </div>
    </div>
  )
}

export default function PremiumLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#3d4a3a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#c9a962] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PremiumLoginContent />
    </Suspense>
  )
}
