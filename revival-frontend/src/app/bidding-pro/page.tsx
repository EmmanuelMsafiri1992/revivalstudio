'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Check, Loader2,
  Sparkles, Tag, Star, Package, Camera, Upload, X,
  PoundSterling, Truck, MapPin, Building, AlertTriangle,
  Crown, Gavel, User, Mail, Phone, CheckCircle
} from 'lucide-react'
import { api } from '@/lib/api'

interface FurnitureType {
  id: number
  name: string
  icon: string
}

const furnitureTypeOptions = [
  { key: 'sofa', label: 'Sofa', icon: '🛋️' },
  { key: 'bed', label: 'Bed', icon: '🛏️' },
  { key: 'wardrobe', label: 'Wardrobe', icon: '🚪' },
  { key: 'dining_table', label: 'Dining Table', icon: '🍽️' },
  { key: 'office_desk', label: 'Office Desk', icon: '🖥️' },
  { key: 'chair', label: 'Chair', icon: '🪑' },
  { key: 'drawer_cabinet', label: 'Drawer / Cabinet', icon: '🗄️' },
  { key: 'other', label: 'Other', icon: '📦' },
]

const brandOptions = [
  { key: 'ikea', label: 'IKEA', icon: '🔵' },
  { key: 'argos', label: 'Argos', icon: '🔴' },
  { key: 'local_unknown', label: 'Local / Unknown', icon: '❓' },
]

const conditionOptions = [
  { key: 'like_new', label: 'Like New', description: 'Barely used, no visible wear', icon: '✨', color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'good', label: 'Good', description: 'Minor wear, fully functional', icon: '👍', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'average', label: 'Average', description: 'Normal wear for age, works well', icon: '👌', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'needs_repair', label: 'Needs Repair', description: 'Requires some fixing', icon: '🔧', color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'poor', label: 'Poor', description: 'Significant wear, major repairs needed', icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50' },
]

const damageOptions = [
  { key: 'scratches', label: 'Scratches', icon: '📝' },
  { key: 'broken_parts', label: 'Broken Parts', icon: '💔' },
  { key: 'loose_joints', label: 'Loose Joints', icon: '🔩' },
  { key: 'fabric_tear', label: 'Fabric Tear', icon: '🧵' },
  { key: 'unusable', label: 'Unusable', icon: '❌' },
  { key: 'none', label: 'No Damage', icon: '✅' },
]

const deliveryOptions = [
  { key: 'self_deliver', label: 'I will deliver it', icon: '🚗', description: 'You bring the item to us' },
  { key: 'revival_collect', label: 'Revival must collect', icon: '🚚', description: 'We pick up from your location' },
]

const floorOptions = [
  { key: 'ground', label: 'Ground Floor', icon: '🏠' },
  { key: '1-2', label: '1-2 Floor', icon: '🏢' },
  { key: '3+', label: '3+ Floor', icon: '🏙️' },
  { key: 'lift', label: 'Lift Available', icon: '🛗' },
]

const steps = [
  { num: 1, label: 'Type', icon: Package },
  { num: 2, label: 'Brand', icon: Tag },
  { num: 3, label: 'Condition', icon: Star },
  { num: 4, label: 'Damage', icon: AlertTriangle },
  { num: 5, label: 'Delivery', icon: Truck },
  { num: 6, label: 'Location', icon: MapPin },
  { num: 7, label: 'Photos', icon: Camera },
  { num: 8, label: 'Submit', icon: Gavel },
]

export default function BiddingProPage() {
  const router = useRouter()
  const [hasPremium, setHasPremium] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [step, setStep] = useState(1)
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])

  const [selectedFurnitureType, setSelectedFurnitureType] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [selectedDamages, setSelectedDamages] = useState<string[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState('')
  const [postcode, setPostcode] = useState('')
  const [selectedFloor, setSelectedFloor] = useState('')
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [description, setDescription] = useState('')

  // Contact form (step 8)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [desiredPrice, setDesiredPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('premium_token')
      if (token === 'authenticated') {
        setHasPremium(true)
      } else {
        router.replace('/premium-login?redirect=/bidding-pro')
        return
      }
    }
    setCheckingAuth(false)
  }, [router])

  useEffect(() => {
    if (!hasPremium) return
    api.getFurnitureTypes().then(res => setFurnitureTypes(res.data)).catch(() => {})
  }, [hasPremium])

  function toggleDamage(key: string) {
    if (key === 'none') {
      setSelectedDamages(['none'])
    } else {
      setSelectedDamages(prev => {
        const filtered = prev.filter(d => d !== 'none')
        return filtered.includes(key) ? filtered.filter(d => d !== key) : [...filtered, key]
      })
    }
  }

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedPhotos(prev => [...prev, event.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }, [])

  function removePhoto(index: number) {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      await fetch(`${API_BASE}/bidding-pro/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          furniture_type: selectedFurnitureType,
          brand: selectedBrand,
          condition: selectedCondition,
          damages: selectedDamages,
          delivery: selectedDelivery,
          postcode,
          floor: selectedFloor,
          description,
          customer_name: name,
          email,
          phone,
          whatsapp,
          desired_price: desiredPrice ? parseFloat(desiredPrice) : undefined,
        }),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  function resetWizard() {
    setStep(1); setSelectedFurnitureType(''); setSelectedBrand(''); setSelectedCondition('')
    setSelectedDamages([]); setSelectedDelivery(''); setPostcode(''); setSelectedFloor('')
    setUploadedPhotos([]); setDescription(''); setName(''); setEmail(''); setPhone('')
    setWhatsapp(''); setDesiredPrice(''); setSubmitted(false)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a962]" />
      </div>
    )
  }
  if (!hasPremium) return null

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962]/20 rounded-full text-[#c9a962] text-sm font-bold mb-6">
              <Crown className="w-4 h-4" />
              Premium Feature
            </div>
            <div className="w-16 h-16 mx-auto mb-4 bg-[#c9a962]/20 rounded-full flex items-center justify-center">
              <Gavel className="w-8 h-8 text-[#c9a962]" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Bidding
              <span className="text-[#c9a962]"> Pro</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Upload your furniture details and let our partner network bid for the best price. More competition means better offers for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 text-sm">
                <Gavel className="w-5 h-5 text-[#c9a962]" />
                <span>Partner Network Bidding</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-5 h-5 text-[#c9a962]" />
                <span>Best Price Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-5 h-5 text-[#c9a962]" />
                <span>No Obligation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section className="py-8 sm:py-12 px-4 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            {/* Progress Steps */}
            <div className="bg-gradient-to-r from-[#3d4a3a] to-[#4a5a46] p-4 sm:p-6">
              <div className="flex justify-between items-center max-w-3xl mx-auto overflow-x-auto">
                {steps.map((s, idx) => (
                  <div key={s.num} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        s.num === step ? 'bg-[#c9a962] text-[#3d4a3a] ring-4 ring-[#c9a962]/30' :
                        s.num < step ? 'bg-[#7a9b76] text-white' : 'bg-white/20 text-white/60'
                      }`}>
                        {s.num < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                      </div>
                      <span className={`text-[8px] sm:text-xs mt-1 font-medium hidden sm:block ${s.num <= step ? 'text-white' : 'text-white/50'}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-4 sm:w-8 lg:w-12 h-0.5 mx-0.5 sm:mx-1 mb-0 sm:mb-5 ${s.num < step ? 'bg-[#7a9b76]' : 'bg-white/20'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <AnimatePresence mode="wait">
                {/* Step 1 */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">Step 1 of 7</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">What type of furniture is this?</h3>
                      <p className="text-sm text-[#666] mt-2">Select the category that best matches your item</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {furnitureTypeOptions.map(type => (
                        <button key={type.key} onClick={() => setSelectedFurnitureType(type.key)}
                          className={`p-4 sm:p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedFurnitureType === type.key ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                          <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{type.icon}</div>
                          <div className="text-xs sm:text-sm font-medium text-[#3d4a3a]">{type.label}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end mt-8">
                      <button onClick={() => setStep(2)} disabled={!selectedFurnitureType}
                        className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all shadow-lg">
                        Continue <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">Step 2 of 7</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Brand / Manufacturer</h3>
                      <p className="text-sm text-[#666] mt-2">Select the brand of your furniture</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {brandOptions.map(brand => (
                        <button key={brand.key} onClick={() => setSelectedBrand(brand.key)}
                          className={`p-5 sm:p-6 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedBrand === brand.key ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                          <div className="text-3xl sm:text-4xl mb-2">{brand.icon}</div>
                          <div className="text-sm sm:text-base font-semibold text-[#3d4a3a]">{brand.label}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(3)} disabled={!selectedBrand} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 hover:bg-[#2d3a2a] transition-all shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">Step 3 of 7</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Current Physical Condition</h3>
                      <p className="text-sm text-[#666] mt-2">Be honest — better condition means higher bids</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {conditionOptions.map(opt => (
                        <button key={opt.key} onClick={() => setSelectedCondition(opt.key)}
                          className={`p-4 sm:p-5 rounded-xl border-2 transition-all text-left hover:scale-[1.01] ${selectedCondition === opt.key ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 ${opt.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <span className="text-2xl">{opt.icon}</span>
                            </div>
                            <div>
                              <div className={`font-semibold ${opt.color}`}>{opt.label}</div>
                              <div className="text-sm text-[#666]">{opt.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(4)} disabled={!selectedCondition} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 hover:bg-[#2d3a2a] transition-all shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">Step 4 of 7</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Any visible damage?</h3>
                      <p className="text-sm text-[#666] mt-2">Select all that apply</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {damageOptions.map(damage => (
                        <button key={damage.key} onClick={() => toggleDamage(damage.key)}
                          className={`p-4 sm:p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedDamages.includes(damage.key) ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selectedDamages.includes(damage.key) ? 'border-[#3d4a3a] bg-[#3d4a3a]' : 'border-[#ccc]'}`}>
                              {selectedDamages.includes(damage.key) && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <span className="text-xl">{damage.icon}</span>
                            <span className="text-sm font-medium text-[#3d4a3a]">{damage.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(5)} disabled={selectedDamages.length === 0} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 hover:bg-[#2d3a2a] transition-all shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5 */}
                {step === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">Step 5 of 7</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Is delivery available?</h3>
                      <p className="text-sm text-[#666] mt-2">How will the furniture be transported?</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {deliveryOptions.map(opt => (
                        <button key={opt.key} onClick={() => setSelectedDelivery(opt.key)}
                          className={`p-6 sm:p-8 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedDelivery === opt.key ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                          <div className="text-4xl mb-3">{opt.icon}</div>
                          <div className="font-semibold text-[#3d4a3a] mb-1">{opt.label}</div>
                          <div className="text-sm text-[#666]">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(4)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(6)} disabled={!selectedDelivery} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 hover:bg-[#2d3a2a] transition-all shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 6 */}
                {step === 6 && (
                  <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">Step 6 of 7</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Location &amp; Pick up Condition</h3>
                      <p className="text-sm text-[#666] mt-2">Where is the furniture located?</p>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" /> Pickup Location (Postcode)
                      </label>
                      <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        placeholder="e.g. SW1A 1AA"
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none text-lg" />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-3">
                        <Building className="w-4 h-4 inline mr-1" /> Floor Level
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {floorOptions.map(floor => (
                          <button key={floor.key} onClick={() => setSelectedFloor(floor.key)}
                            className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${selectedFloor === floor.key ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg' : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'}`}>
                            <div className="text-2xl mb-1">{floor.icon}</div>
                            <div className="text-xs sm:text-sm font-medium text-[#3d4a3a]">{floor.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(5)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(7)} disabled={!postcode || !selectedFloor} className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 hover:bg-[#2d3a2a] transition-all shadow-lg">Continue <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 7 */}
                {step === 7 && (
                  <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">Step 7 of 7</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Upload photos</h3>
                      <p className="text-sm text-[#666] mt-2">Great photos attract higher bids from our partner network</p>
                    </div>
                    <div className="mb-6">
                      <label className="block">
                        <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${uploadedPhotos.length > 0 ? 'border-[#7a9b76] bg-[#7a9b76]/5' : 'border-[#e5e5e5] hover:border-[#7a9b76]'}`}>
                          <Upload className="w-10 h-10 mx-auto mb-3 text-[#7a9b76]" />
                          <p className="font-medium text-[#3d4a3a]">Click to upload photos</p>
                          <p className="text-sm text-[#666] mt-1">JPG, PNG up to 10MB each</p>
                        </div>
                        <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                    {uploadedPhotos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                        {uploadedPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-20 sm:h-24 object-cover rounded-lg" />
                            <button onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#3d4a3a] mb-2">Additional details (optional)</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the furniture, age, any extras included..."
                        rows={3} className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none resize-none" />
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setStep(6)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                      <button onClick={() => setStep(8)}
                        className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#c9a962] text-[#3d4a3a] rounded-full font-bold hover:bg-[#d4b46d] transition-all shadow-lg">
                        <Gavel className="w-5 h-5" /> Proceed to Bid
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 8: Contact & Submit */}
                {step === 8 && !submitted && (
                  <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-6 sm:mb-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962]/10 text-[#c9a962] rounded-full font-bold text-sm mb-4">
                        <Gavel className="w-4 h-4" /> Final Step
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">Your Contact Details</h3>
                      <p className="text-sm text-[#666] mt-2">
                        Our partner network will contact you with their best offers for your furniture
                      </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-[#faf8f5] rounded-xl p-4 sm:p-5 mb-6 text-sm">
                      <h4 className="font-semibold text-[#3d4a3a] mb-3 flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-[#c9a962]" /> Bidding Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-[#666]">Item:</span><p className="font-medium text-[#3d4a3a]">{furnitureTypeOptions.find(f => f.key === selectedFurnitureType)?.label}</p></div>
                        <div><span className="text-[#666]">Brand:</span><p className="font-medium text-[#3d4a3a]">{brandOptions.find(b => b.key === selectedBrand)?.label}</p></div>
                        <div><span className="text-[#666]">Condition:</span><p className="font-medium text-[#3d4a3a]">{conditionOptions.find(c => c.key === selectedCondition)?.label}</p></div>
                        <div><span className="text-[#666]">Location:</span><p className="font-medium text-[#3d4a3a]">{postcode}</p></div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                          <User className="w-4 h-4 inline mr-1" /> Full Name *
                        </label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                          placeholder="Your full name"
                          className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                          <Mail className="w-4 h-4 inline mr-1" /> Email Address *
                        </label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                          <Phone className="w-4 h-4 inline mr-1" /> Phone Number *
                        </label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                          placeholder="+44 7000 000000"
                          className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                          💬 WhatsApp Number *
                        </label>
                        <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required
                          placeholder="+44 7000 000000"
                          className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none" />
                        <p className="text-xs text-[#999] mt-1">Partners will contact you directly on WhatsApp</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                          <span className="inline-flex items-center gap-1"><span>£</span> Desired Selling Price *</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] font-medium">£</span>
                          <input type="number" value={desiredPrice} onChange={(e) => setDesiredPrice(e.target.value)} required
                            min="1" step="0.01"
                            placeholder="e.g. 150.00"
                            className="w-full pl-8 pr-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#c9a962] focus:outline-none" />
                        </div>
                        <p className="text-xs text-[#999] mt-1">Partners will see your asking price and contact you to negotiate</p>
                      </div>

                      <div className="flex justify-between mt-8 pt-4">
                        <button type="button" onClick={() => setStep(7)} className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>
                        <button type="submit" disabled={submitting || !name || !email || !phone || !whatsapp || !desiredPrice}
                          className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-full font-bold hover:from-[#d4b46d] hover:to-[#c9a962] transition-all shadow-lg disabled:opacity-50">
                          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Gavel className="w-5 h-5" /> Submit for Bidding</>}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Success */}
                {submitted && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-[#c9a962]/20 rounded-full flex items-center justify-center">
                      <Gavel className="w-10 h-10 text-[#c9a962]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#3d4a3a] mb-4">You're in the Bidding!</h3>
                    <p className="text-[#666] leading-relaxed max-w-md mx-auto mb-6">
                      Thank you for joining our bidding program. We will revert back to you with best offer for your product.
                    </p>
                    <div className="bg-[#faf8f5] rounded-xl p-4 sm:p-6 max-w-sm mx-auto mb-6 text-left text-sm">
                      <p className="flex items-center gap-2 text-[#3d4a3a] mb-2"><CheckCircle className="w-4 h-4 text-[#7a9b76]" /> Details submitted to partner network</p>
                      <p className="flex items-center gap-2 text-[#3d4a3a] mb-2"><CheckCircle className="w-4 h-4 text-[#7a9b76]" /> Asking price: <strong>£{parseFloat(desiredPrice || '0').toFixed(2)}</strong></p>
                      <p className="flex items-center gap-2 text-[#3d4a3a] mb-2"><CheckCircle className="w-4 h-4 text-[#7a9b76]" /> Partners will contact you on WhatsApp</p>
                      <p className="flex items-center gap-2 text-[#3d4a3a]"><CheckCircle className="w-4 h-4 text-[#7a9b76]" /> Confirmation sent to {email}</p>
                    </div>
                    <button onClick={resetWizard}
                      className="px-6 py-3 bg-[#3d4a3a] text-white rounded-full font-semibold hover:bg-[#2d3a2a] transition-colors">
                      Submit Another Item
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
