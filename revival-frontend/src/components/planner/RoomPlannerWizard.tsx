'use client'

import { useState, useEffect } from 'react'
import { useContactSettings } from '@/lib/useContactSettings'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles, Check, Loader2, MessageCircle, Home, Maximize, Palette, PoundSterling, User } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

const roomOptions = [
  { key: 'livingRoom', label: 'Living Room', icon: '🛋️', description: 'Sofas, coffee tables, TV units' },
  { key: 'bedroom', label: 'Bedroom', icon: '🛏️', description: 'Beds, wardrobes, dressers' },
  { key: 'diningRoom', label: 'Dining Room', icon: '🍽️', description: 'Tables, chairs, sideboards' },
  { key: 'homeOffice', label: 'Home Office', icon: '💼', description: 'Desks, chairs, storage' },
  { key: 'hallway', label: 'Hallway', icon: '🚪', description: 'Console tables, shoe storage' },
]

const sizeOptions = [
  { key: 'small', label: 'Small', description: 'Up to 12m²', icon: '🏠' },
  { key: 'medium', label: 'Medium', description: '12-20m²', icon: '🏡' },
  { key: 'large', label: 'Large', description: '20m²+', icon: '🏰' },
]

const styleOptions = [
  { key: 'modern', label: 'Modern', description: 'Clean lines, minimal', icon: '🔲' },
  { key: 'classic', label: 'Classic', description: 'Timeless elegance', icon: '🏛️' },
  { key: 'midCentury', label: 'Mid-Century', description: 'Retro charm', icon: '🪑' },
  { key: 'scandinavian', label: 'Scandinavian', description: 'Light & natural', icon: '🌲' },
  { key: 'industrial', label: 'Industrial', description: 'Raw & urban', icon: '🏭' },
  { key: 'rustic', label: 'Rustic', description: 'Country warmth', icon: '🪵' },
]

const steps = [
  { num: 1, label: 'Room', icon: Home },
  { num: 2, label: 'Size', icon: Maximize },
  { num: 3, label: 'Style', icon: Palette },
  { num: 4, label: 'Budget', icon: PoundSterling },
  { num: 5, label: 'Details', icon: User },
  { num: 6, label: 'Plan', icon: Sparkles },
]

const DEFAULT_PLANNER_SETTINGS = {
  planner_budget_min: 500,
  planner_budget_max: 10000,
  planner_budget_default: 2000,
  planner_budget_presets: [1000, 2000, 3000, 5000],
}

export function RoomPlannerWizard() {
  const contact = useContactSettings()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [plannerSettings, setPlannerSettings] = useState(DEFAULT_PLANNER_SETTINGS)
  const [budget, setBudget] = useState(DEFAULT_PLANNER_SETTINGS.planner_budget_default)
  const [result, setResult] = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    api.getSiteSettingsByGroup('planner').then(res => {
      if (res?.data) {
        const s = res.data
        const merged = {
          planner_budget_min: s.planner_budget_min ?? DEFAULT_PLANNER_SETTINGS.planner_budget_min,
          planner_budget_max: s.planner_budget_max ?? DEFAULT_PLANNER_SETTINGS.planner_budget_max,
          planner_budget_default: s.planner_budget_default ?? DEFAULT_PLANNER_SETTINGS.planner_budget_default,
          planner_budget_presets: Array.isArray(s.planner_budget_presets) && s.planner_budget_presets.length > 0
            ? s.planner_budget_presets
            : DEFAULT_PLANNER_SETTINGS.planner_budget_presets,
        }
        setPlannerSettings(merged)
        setBudget(merged.planner_budget_default)
      }
    }).catch(() => {
      // Keep defaults on error
    })
  }, [])

  // Customer details state
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')

  const [submitError, setSubmitError] = useState('')

  async function generateAndSubmitPlan() {
    if (!selectedRoom || !selectedSize || !selectedStyle) return
    if (!customerName || !email || !phone || !houseNumber || !addressLine1 || !city || !postcode) return

    setLoading(true)
    setSubmitError('')

    // Step 1: Generate plan (non-fatal — submit still proceeds even if this fails)
    let planData = { items: [] as any[], total_cost: 0 }
    try {
      const res = await api.generateRoomPlan({
        room_type: selectedRoom,
        room_size: selectedSize,
        style: selectedStyle,
        budget: budget,
      })
      planData = res.data
      setResult(res.data)
    } catch {
      // Generate failed — set a minimal result so we still show step 6
      setResult({ items: [], total_cost: 0, room: { name: selectedRoom }, style: { name: selectedStyle } })
    }

    // Step 2: Submit the enquiry (this must succeed)
    setSubmitting(true)
    try {
      await api.submitRoomPlan({
        room_type: selectedRoom,
        room_size: selectedSize,
        style: selectedStyle,
        budget: budget,
        selected_items: planData.items,
        total_cost: planData.total_cost,
        customer_name: customerName,
        email: email,
        phone: phone,
        house_number: houseNumber,
        address_line1: addressLine1,
        address_line2: addressLine2 || undefined,
        city: city,
        postcode: postcode,
      })
      setSubmitted(true)
      setStep(6)
    } catch (error: any) {
      const msg = error?.data?.errors
        ? Object.values(error.data.errors as Record<string, string[]>).flat()[0]
        : 'Failed to submit your plan. Please try again.'
      setSubmitError(msg as string)
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  function resetWizard() {
    setStep(1)
    setSelectedRoom('')
    setSelectedSize('')
    setSelectedStyle('')
    setBudget(plannerSettings.planner_budget_default)
    setResult(null)
    setSubmitted(false)
    setCustomerName('')
    setEmail('')
    setPhone('')
    setHouseNumber('')
    setAddressLine1('')
    setAddressLine2('')
    setCity('')
    setPostcode('')
    setSubmitError('')
  }

  const selectedRoomLabel = roomOptions.find(r => r.key === selectedRoom)?.label || ''

  const isCustomerFormValid = customerName && email && phone && houseNumber && addressLine1 && city && postcode

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
        {/* Progress Steps */}
        <div className="bg-gradient-to-r from-[#3d4a3a] to-[#4a5a46] p-4 sm:p-6">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s.num === step
                      ? 'bg-[#c9a962] text-[#3d4a3a] ring-4 ring-[#c9a962]/30'
                      : s.num < step
                        ? 'bg-[#7a9b76] text-white'
                        : 'bg-white/20 text-white/60'
                  }`}>
                    {s.num < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[8px] sm:text-[10px] mt-1 font-medium ${s.num <= step ? 'text-white' : 'text-white/50'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-4 sm:w-8 lg:w-12 h-0.5 mx-1 mb-4 ${s.num < step ? 'bg-[#7a9b76]' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Step 1 of 5
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">What room are you furnishing?</h3>
                  <p className="text-sm text-[#666] mt-2">Select the room type to get tailored furniture recommendations</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {roomOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedRoom(opt.key)}
                      className={`p-4 sm:p-6 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        selectedRoom === opt.key
                          ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg'
                          : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'
                      }`}
                    >
                      <div className="text-3xl sm:text-4xl mb-2">{opt.icon}</div>
                      <div className="font-semibold text-[#3d4a3a] text-sm sm:text-base">{opt.label}</div>
                      <div className="text-[10px] sm:text-xs text-[#666] mt-1 hidden sm:block">{opt.description}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedRoom}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Step 2 of 5
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">What size is your room?</h3>
                  <p className="text-sm text-[#666] mt-2">This helps us recommend the right number and size of furniture pieces</p>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {sizeOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedSize(opt.key)}
                      className={`p-4 sm:p-6 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        selectedSize === opt.key
                          ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg'
                          : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'
                      }`}
                    >
                      <div className="text-3xl sm:text-4xl mb-2">{opt.icon}</div>
                      <div className="font-semibold text-[#3d4a3a] text-sm sm:text-base">{opt.label}</div>
                      <div className="text-xs text-[#666] mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedSize}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Step 3 of 5
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">What style do you prefer?</h3>
                  <p className="text-sm text-[#666] mt-2">Choose your aesthetic to match furniture recommendations to your taste</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {styleOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedStyle(opt.key)}
                      className={`p-3 sm:p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        selectedStyle === opt.key
                          ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg'
                          : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-2">{opt.icon}</div>
                      <div className="font-semibold text-[#3d4a3a] text-sm">{opt.label}</div>
                      <div className="text-[10px] sm:text-xs text-[#666] mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!selectedStyle}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Step 4 of 5
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">What&apos;s your budget?</h3>
                  <p className="text-sm text-[#666] mt-2">Set your total budget and we&apos;ll find the best furniture within it</p>
                </div>

                <div className="bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8] rounded-2xl p-6 sm:p-8 mb-6">
                  <div className="text-center mb-6">
                    <span className="text-4xl sm:text-5xl font-bold text-[#3d4a3a]">{formatCurrency(budget)}</span>
                    <p className="text-sm text-[#666] mt-2">Total furniture budget</p>
                  </div>

                  <div className="relative">
                    <input
                      type="range"
                      min={plannerSettings.planner_budget_min}
                      max={plannerSettings.planner_budget_max}
                      step="100"
                      value={budget}
                      onChange={e => setBudget(parseInt(e.target.value))}
                      className="w-full h-3 bg-[#e5e5e5] rounded-full appearance-none cursor-pointer accent-[#3d4a3a]"
                    />
                    <div className="flex justify-between text-sm text-[#666] mt-3">
                      <span>{formatCurrency(plannerSettings.planner_budget_min)}</span>
                      <span className="text-[#7a9b76] font-medium">Budget-Friendly</span>
                      <span>{formatCurrency(plannerSettings.planner_budget_max)}</span>
                    </div>
                  </div>

                  {/* Quick Budget Options */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {plannerSettings.planner_budget_presets.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setBudget(amount)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          budget === amount
                            ? 'bg-[#3d4a3a] text-white'
                            : 'bg-white text-[#3d4a3a] border border-[#e5e5e5] hover:border-[#3d4a3a]'
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Step 5 of 5
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Your Contact Details</h3>
                  <p className="text-sm text-[#666] mt-2">Please provide your details so we can contact you about your furniture plan</p>
                </div>

                <div className="bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8] rounded-2xl p-6 sm:p-8 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+44 7XXX XXXXXX"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">House Number *</label>
                      <input
                        type="text"
                        value={houseNumber}
                        onChange={e => setHouseNumber(e.target.value)}
                        placeholder="e.g. 42 or Flat 3B"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Address Line 1 *</label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={e => setAddressLine1(e.target.value)}
                        placeholder="Street name"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none bg-white"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Address Line 2</label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={e => setAddressLine2(e.target.value)}
                        placeholder="Apartment, suite, building (optional)"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. London"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Postcode *</label>
                      <input
                        type="text"
                        value={postcode}
                        onChange={e => setPostcode(e.target.value)}
                        placeholder="e.g. SW1A 1AA"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center">
                    {submitError}
                  </div>
                )}

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    onClick={generateAndSubmitPlan}
                    disabled={loading || !isCustomerFormValid}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#c9a962] text-[#3d4a3a] rounded-full font-bold hover:bg-[#d4b46d] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {submitting ? 'Submitting...' : 'Generating...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate My Plan
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 6 && result && (
              <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                {/* Thank You Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] rounded-2xl p-6 sm:p-8 text-center text-white mb-6"
                >
                  <div className="w-16 h-16 bg-[#c9a962]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[#c9a962]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4">Thank You, {customerName}!</h3>
                  <p className="text-white/90 leading-relaxed mb-4">
                    Thank you for providing the necessary details about your building and room.
                    Our technical team is going through it and we will revert back with personalized recommendations.
                  </p>
                  <p className="text-[#c9a962] font-semibold">
                    Your Personalised Furniture Plan is Ready!
                  </p>
                </motion.div>

                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    <Sparkles className="w-4 h-4" />
                    AI-Generated Plan
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Your Personalised Furniture Plan</h3>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-[#faf8f5] rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xs text-[#666] mb-1">Room</div>
                    <div className="font-semibold text-[#3d4a3a] text-sm sm:text-base">{result.room.name}</div>
                  </div>
                  <div className="bg-[#faf8f5] rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xs text-[#666] mb-1">Size</div>
                    <div className="font-semibold text-[#3d4a3a] text-sm sm:text-base">{result.size.name}</div>
                  </div>
                  <div className="bg-[#faf8f5] rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xs text-[#666] mb-1">Style</div>
                    <div className="font-semibold text-[#3d4a3a] text-sm sm:text-base">{result.style.name}</div>
                  </div>
                  <div className="bg-[#faf8f5] rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xs text-[#666] mb-1">Budget</div>
                    <div className="font-semibold text-[#3d4a3a] text-sm sm:text-base">{formatCurrency(result.budget)}</div>
                  </div>
                </div>

                {/* Furniture Items */}
                <div className="mb-6">
                  <h4 className="font-semibold text-[#3d4a3a] mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-[#7a9b76]/20 rounded-full flex items-center justify-center">
                      🪑
                    </span>
                    Recommended Furniture
                  </h4>
                  <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
                    {result.items.map((item: any, i: number) => (
                      <div
                        key={i}
                        className={`flex justify-between items-center p-4 hover:bg-[#faf8f5] transition-colors ${
                          i !== result.items.length - 1 ? 'border-b border-[#e5e5e5]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.furniture_type_icon || '🪑'}</span>
                          <div>
                            <div className="font-medium text-[#3d4a3a]">{item.name}</div>
                            <div className="text-xs text-[#666]">{item.furniture_type}</div>
                          </div>
                        </div>
                        <div className="font-bold text-[#c9a962]">{formatCurrency(item.adjusted_price)}</div>
                      </div>
                    ))}
                    <div className="bg-gradient-to-r from-[#3d4a3a] to-[#4a5a46] text-white p-4 flex justify-between items-center">
                      <span className="font-semibold">Total Estimated Cost</span>
                      <span className="text-xl font-bold">{formatCurrency(result.total_cost)}</span>
                    </div>
                  </div>
                </div>

                {/* Budget Status */}
                <div className={`rounded-xl p-4 text-center font-medium ${
                  result.within_budget
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {result.within_budget
                    ? `✓ Under budget by ${formatCurrency(result.budget - result.total_cost)}`
                    : `⚠ Over budget by ${formatCurrency(result.total_cost - result.budget)}`
                  }
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
                  <a
                    href={`https://wa.me/${contact.whatsapp_number}?text=Hi, I'm ${customerName}. I'd like to furnish my ${selectedRoomLabel} with the AI-generated plan (Budget: ${formatCurrency(budget)}). Can you help me source these items?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#128C7E] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Get These Items via WhatsApp
                  </a>
                  <button
                    onClick={resetWizard}
                    className="px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                  >
                    Start New Plan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
