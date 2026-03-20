'use client'

import { useState, useEffect, useCallback } from 'react'
import { useContactSettings } from '@/lib/useContactSettings'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Calculator, Check, Loader2,
  Wrench, Layers, AlertTriangle, Clock, Sparkles,
  TrendingDown, Shield, Zap, Camera, Upload, X,
  MessageCircle, Star, BadgeCheck, Timer, PoundSterling,
  User, Mail, Phone, CheckCircle
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface FurnitureType {
  id: number
  name: string
  icon: string
}

interface Material {
  id: number
  name: string
  icon: string
}

interface DamageType {
  id: number
  name: string
  icon: string
}

interface RepairResult {
  estimated_min: number
  estimated_max: number
  furniture_type: { name: string }
  material: { name: string }
  damages: Array<{ name: string }>
}

const urgencyOptions = [
  { key: 'flexible', label: 'Flexible', description: 'Anytime within 2 weeks', icon: Clock, discount: '10% OFF' },
  { key: 'standard', label: 'Standard', description: 'Within 1 week', icon: Timer, discount: null },
  { key: 'urgent', label: 'Urgent', description: 'Within 48 hours', icon: Zap, premium: '+15%' },
]

const steps = [
  { num: 1, label: 'Furniture', icon: Wrench },
  { num: 2, label: 'Material', icon: Layers },
  { num: 3, label: 'Damage', icon: AlertTriangle },
  { num: 4, label: 'Photos', icon: Camera },
  { num: 5, label: 'Estimate', icon: Calculator },
  { num: 6, label: 'Submit', icon: CheckCircle },
]

export function RepairWizard() {
  const contact = useContactSettings()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  // Data from API
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [damageTypes, setDamageTypes] = useState<DamageType[]>([])

  // User selections
  const [selectedFurniture, setSelectedFurniture] = useState<number | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null)
  const [selectedDamages, setSelectedDamages] = useState<number[]>([])
  const [selectedUrgency, setSelectedUrgency] = useState<string>('standard')
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [description, setDescription] = useState('')

  // Result
  const [result, setResult] = useState<RepairResult | null>(null)
  const [animateResult, setAnimateResult] = useState(false)

  // Contact & submission
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [ftRes, matRes, dmgRes] = await Promise.all([
        api.getFurnitureTypes(),
        api.getMaterials(),
        api.getDamageTypes(),
      ])
      setFurnitureTypes(ftRes.data)
      setMaterials(matRes.data)
      setDamageTypes(dmgRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function calculateEstimate() {
    if (!selectedFurniture || !selectedMaterial) return

    setCalculating(true)
    try {
      const res = await api.calculateRepair({
        furniture_type_id: selectedFurniture,
        material_id: selectedMaterial,
        damage_type_ids: selectedDamages,
      })
      setResult(res.data)
      setStep(5)
      setTimeout(() => setAnimateResult(true), 100)
    } catch (error) {
      console.error('Error calculating:', error)
    } finally {
      setCalculating(false)
    }
  }

  function toggleDamage(id: number) {
    setSelectedDamages(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
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

  async function handleSubmitRequest() {
    if (!selectedFurniture || !selectedMaterial || !customerName || !customerEmail) return
    setSubmitting(true)
    try {
      await api.submitRepairRequest({
        furniture_type_id: selectedFurniture,
        material_id: selectedMaterial,
        damage_type_ids: selectedDamages,
        customer_name: customerName,
        email: customerEmail,
        phone: customerPhone || undefined,
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting repair request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function resetWizard() {
    setStep(1)
    setSelectedFurniture(null)
    setSelectedMaterial(null)
    setSelectedDamages([])
    setSelectedUrgency('standard')
    setUploadedPhotos([])
    setDescription('')
    setResult(null)
    setAnimateResult(false)
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setSubmitting(false)
    setSubmitted(false)
  }

  const selectedFurnitureName = furnitureTypes.find(f => f.id === selectedFurniture)?.name || ''
  const selectedMaterialName = materials.find(m => m.id === selectedMaterial)?.name || ''

  // Calculate adjusted estimate based on urgency
  const getAdjustedEstimate = () => {
    if (!result) return { min: 0, max: 0 }
    let min = result.estimated_min
    let max = result.estimated_max

    if (selectedUrgency === 'flexible') {
      min = Math.round(min * 0.9)
      max = Math.round(max * 0.9)
    } else if (selectedUrgency === 'urgent') {
      min = Math.round(min * 1.15)
      max = Math.round(max * 1.15)
    }
    return { min, max }
  }

  // Estimate repair time based on damages
  const getRepairTime = () => {
    const damageCount = selectedDamages.length
    if (damageCount === 0) return '1-2 days'
    if (damageCount <= 2) return '2-3 days'
    if (damageCount <= 4) return '3-5 days'
    return '5-7 days'
  }

  // Calculate confidence score
  const getConfidenceScore = () => {
    let score = 70
    if (uploadedPhotos.length > 0) score += 15
    if (description.length > 20) score += 10
    if (selectedDamages.length > 0) score += 5
    return Math.min(score, 100)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#7a9b76] mb-4" />
        <p className="text-[#666]">Loading repair options...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
        {/* Progress Steps */}
        <div className="bg-gradient-to-r from-[#3d4a3a] to-[#4a5a46] p-4 sm:p-6">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s.num === step
                      ? 'bg-[#c9a962] text-[#3d4a3a] ring-4 ring-[#c9a962]/30'
                      : s.num < step
                        ? 'bg-[#7a9b76] text-white'
                        : 'bg-white/20 text-white/60'
                  }`}>
                    {s.num < step ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1 font-medium ${s.num <= step ? 'text-white' : 'text-white/50'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 lg:w-20 h-0.5 mx-1 sm:mx-2 mb-5 ${s.num < step ? 'bg-[#7a9b76]' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <AnimatePresence mode="wait">
            {/* Step 1: Furniture Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Step 1 of 4
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">
                    What type of furniture needs repair?
                  </h3>
                  <p className="text-sm text-[#666] mt-2">Select the item that best matches your furniture</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                  {furnitureTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedFurniture(type.id)}
                      className={`p-3 sm:p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        selectedFurniture === type.id
                          ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg'
                          : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{type.icon}</div>
                      <div className="text-xs sm:text-sm font-medium text-[#3d4a3a]">{type.name}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedFurniture}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Material */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Step 2 of 4
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">
                    What material is it made of?
                  </h3>
                  <p className="text-sm text-[#666] mt-2">Different materials require different repair techniques</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {materials.map(mat => (
                    <button
                      key={mat.id}
                      onClick={() => setSelectedMaterial(mat.id)}
                      className={`p-4 sm:p-5 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        selectedMaterial === mat.id
                          ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-lg'
                          : 'border-[#e5e5e5] hover:border-[#7a9b76] hover:shadow-md'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-2">{mat.icon}</div>
                      <div className="text-sm font-medium text-[#3d4a3a]">{mat.name}</div>
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
                    disabled={!selectedMaterial}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Damage Types */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Step 3 of 4
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">
                    What type of damage needs repair?
                  </h3>
                  <p className="text-sm text-[#666] mt-2">Select all that apply for a more accurate estimate</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {damageTypes.map(damage => (
                    <button
                      key={damage.id}
                      onClick={() => toggleDamage(damage.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        selectedDamages.includes(damage.id)
                          ? 'border-[#3d4a3a] bg-[#3d4a3a]/5 shadow-md'
                          : 'border-[#e5e5e5] hover:border-[#7a9b76]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedDamages.includes(damage.id)
                          ? 'border-[#3d4a3a] bg-[#3d4a3a]'
                          : 'border-[#ccc]'
                      }`}>
                        {selectedDamages.includes(damage.id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-xl">{damage.icon}</span>
                      <span className="text-sm font-medium text-[#3d4a3a]">{damage.name}</span>
                    </button>
                  ))}
                </div>

                {/* Urgency Selection */}
                <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
                  <h4 className="font-semibold text-[#3d4a3a] mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#7a9b76]" />
                    How soon do you need it repaired?
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {urgencyOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setSelectedUrgency(opt.key)}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all relative ${
                          selectedUrgency === opt.key
                            ? 'border-[#3d4a3a] bg-[#3d4a3a]/5'
                            : 'border-[#e5e5e5] hover:border-[#7a9b76]'
                        }`}
                      >
                        {opt.discount && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                            {opt.discount}
                          </span>
                        )}
                        {opt.premium && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                            {opt.premium}
                          </span>
                        )}
                        <opt.icon className={`w-5 h-5 mx-auto mb-1 ${selectedUrgency === opt.key ? 'text-[#3d4a3a]' : 'text-[#666]'}`} />
                        <div className="text-xs sm:text-sm font-medium text-[#3d4a3a]">{opt.label}</div>
                        <div className="text-[10px] text-[#666]">{opt.description}</div>
                      </button>
                    ))}
                  </div>
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
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-semibold hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Photos & Description */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Step 4 of 4 (Optional)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">
                    Add photos for a more accurate estimate
                  </h3>
                  <p className="text-sm text-[#666] mt-2">Photos help our AI provide a more precise repair cost</p>
                </div>

                {/* Photo Upload Area */}
                <div className="mb-6">
                  <label className="block">
                    <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                      uploadedPhotos.length > 0 ? 'border-[#7a9b76] bg-[#7a9b76]/5' : 'border-[#e5e5e5] hover:border-[#7a9b76]'
                    }`}>
                      <Upload className="w-10 h-10 mx-auto mb-3 text-[#7a9b76]" />
                      <p className="font-medium text-[#3d4a3a]">Click to upload photos</p>
                      <p className="text-sm text-[#666] mt-1">or drag and drop • JPG, PNG up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded Photos Preview */}
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 sm:h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#3d4a3a] mb-2">
                    Describe the damage (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., The leg is wobbly and there's a scratch on the surface..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none resize-none"
                  />
                </div>

                {/* Accuracy Indicator */}
                <div className="bg-[#faf8f5] rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#3d4a3a]">Estimate Accuracy</span>
                    <span className="text-sm font-bold text-[#7a9b76]">{getConfidenceScore()}%</span>
                  </div>
                  <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getConfidenceScore()}%` }}
                      className="h-full bg-gradient-to-r from-[#7a9b76] to-[#c9a962] rounded-full"
                    />
                  </div>
                  <p className="text-xs text-[#666] mt-2">
                    {uploadedPhotos.length === 0 && 'Add photos to improve accuracy'}
                    {uploadedPhotos.length > 0 && description.length < 20 && 'Add a description for better results'}
                    {uploadedPhotos.length > 0 && description.length >= 20 && 'Great! You\'ll get a highly accurate estimate'}
                  </p>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    onClick={calculateEstimate}
                    disabled={calculating}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#c9a962] text-[#3d4a3a] rounded-full font-bold hover:bg-[#d4b46d] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {calculating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Get AI Estimate
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Results */}
            {step === 5 && result && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {/* Thank You Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] rounded-2xl p-6 sm:p-8 text-center text-white mb-6"
                >
                  <div className="w-16 h-16 bg-[#c9a962]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[#c9a962]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4">Thank You!</h3>
                  <p className="text-white/90 leading-relaxed mb-4">
                    Thank you for providing the necessary details about your damaged furniture.
                    Our technical team is going through it thoroughly.
                  </p>
                  <p className="text-[#c9a962] font-semibold">
                    We will revert back with repair cost details within just a few minutes.
                  </p>
                  <p className="text-white/80 mt-2 text-sm">Thank you for your patience.</p>
                </motion.div>

                {/* Preliminary Estimate Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={animateResult ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 }}
                  className="bg-[#faf8f5] rounded-2xl p-6 sm:p-8 text-center mb-6 border-2 border-[#c9a962]/30"
                >
                  <p className="text-[#666] mb-2 text-sm">Preliminary Estimate Range</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#3d4a3a] mb-2">
                    {formatCurrency(getAdjustedEstimate().min)} - {formatCurrency(getAdjustedEstimate().max)}
                  </p>
                  {selectedUrgency === 'flexible' && (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      10% flexible discount applied
                    </span>
                  )}
                  {selectedUrgency === 'urgent' && (
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      Urgent service premium included
                    </span>
                  )}
                  <p className="text-xs text-[#666] mt-3">*Final cost will be confirmed after technical review</p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={animateResult ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-3 gap-3 mb-6"
                >
                  <div className="bg-[#faf8f5] rounded-xl p-4 text-center">
                    <Timer className="w-6 h-6 mx-auto mb-2 text-[#7a9b76]" />
                    <div className="text-xs text-[#666]">Repair Time</div>
                    <div className="font-bold text-[#3d4a3a]">{getRepairTime()}</div>
                  </div>
                  <div className="bg-[#faf8f5] rounded-xl p-4 text-center">
                    <BadgeCheck className="w-6 h-6 mx-auto mb-2 text-[#7a9b76]" />
                    <div className="text-xs text-[#666]">Confidence</div>
                    <div className="font-bold text-[#3d4a3a]">{getConfidenceScore()}%</div>
                  </div>
                  <div className="bg-[#faf8f5] rounded-xl p-4 text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-[#7a9b76]" />
                    <div className="text-xs text-[#666]">Warranty</div>
                    <div className="font-bold text-[#3d4a3a]">12 months</div>
                  </div>
                </motion.div>

                {/* Comparison with Replacement */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={animateResult ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Save up to 70% vs buying new</p>
                      <p className="text-sm text-green-600">Repair is almost always more cost-effective and sustainable</p>
                    </div>
                  </div>
                </motion.div>

                {/* Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={animateResult ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 }}
                  className="bg-[#faf8f5] rounded-xl p-4 sm:p-6 mb-6"
                >
                  <h4 className="font-semibold text-[#3d4a3a] mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#c9a962]" />
                    Repair Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#666]">Furniture:</span>
                      <p className="font-medium text-[#3d4a3a]">{result.furniture_type.name}</p>
                    </div>
                    <div>
                      <span className="text-[#666]">Material:</span>
                      <p className="font-medium text-[#3d4a3a]">{result.material.name}</p>
                    </div>
                    <div>
                      <span className="text-[#666]">Damages:</span>
                      <p className="font-medium text-[#3d4a3a]">
                        {result.damages.length > 0 ? result.damages.map(d => d.name).join(', ') : 'General wear'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#666]">Timeline:</span>
                      <p className="font-medium text-[#3d4a3a]">
                        {selectedUrgency === 'flexible' ? 'Flexible (2 weeks)' : selectedUrgency === 'urgent' ? 'Urgent (48hrs)' : 'Standard (1 week)'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={animateResult ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row justify-center gap-3"
                >
                  <button
                    onClick={() => setStep(6)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-[#c9a962] text-[#3d4a3a] rounded-full font-bold hover:bg-[#d4b46d] transition-all hover:-translate-y-0.5 shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Submit Repair Request
                  </button>
                  <a
                    href={`https://wa.me/${contact.whatsapp_number}?text=Hi, I need a repair for my ${selectedFurnitureName} (${selectedMaterialName}). AI Estimate: ${formatCurrency(getAdjustedEstimate().min)} - ${formatCurrency(getAdjustedEstimate().max)}. Damages: ${result.damages.map(d => d.name).join(', ') || 'General wear'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#128C7E] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Book via WhatsApp
                  </a>
                  <button
                    onClick={resetWizard}
                    className="px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                  >
                    Start New Estimate
                  </button>
                </motion.div>
              </motion.div>
            )}
            {/* Step 6: Contact & Submit */}
            {step === 6 && !submitted && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block px-3 py-1 bg-[#7a9b76]/10 text-[#7a9b76] rounded-full text-sm font-medium mb-3">
                    Final Step
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d4a3a]">
                    Your contact details
                  </h3>
                  <p className="text-sm text-[#666] mt-2">We'll send you the final repair quote and get back to you within minutes</p>
                </div>

                {/* Estimate Reminder */}
                {result && (
                  <div className="bg-[#faf8f5] border-2 border-[#c9a962]/30 rounded-xl p-4 mb-6 text-center">
                    <p className="text-sm text-[#666]">Your Estimate</p>
                    <p className="text-2xl font-bold text-[#3d4a3a]">
                      {formatCurrency(getAdjustedEstimate().min)} – {formatCurrency(getAdjustedEstimate().max)}
                    </p>
                  </div>
                )}

                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Smith"
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3d4a3a] mb-1">
                      Phone Number <span className="text-[#999] font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+44 7700 900000"
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] rounded-xl focus:border-[#7a9b76] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8 max-w-md mx-auto">
                  <button
                    onClick={() => setStep(5)}
                    className="flex items-center gap-2 px-5 sm:px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    disabled={submitting || !customerName || !customerEmail}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#3d4a3a] text-white rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3a2a] transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Confirm & Submit
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Success */}
            {step === 6 && submitted && (
              <motion.div
                key="step6-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-[#7a9b76]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-[#7a9b76]" />
                </div>
                <h3 className="text-2xl font-bold text-[#3d4a3a] mb-3">Request Submitted!</h3>
                <p className="text-[#666] mb-2">
                  Thank you, <span className="font-semibold text-[#3d4a3a]">{customerName}</span>!
                </p>
                <p className="text-[#666] mb-6">
                  We've received your repair request and will send the final quote to{' '}
                  <span className="font-semibold text-[#3d4a3a]">{customerEmail}</span> within minutes.
                </p>
                {result && (
                  <div className="bg-[#faf8f5] rounded-xl p-4 mb-6 max-w-xs mx-auto">
                    <p className="text-sm text-[#666]">Preliminary Estimate</p>
                    <p className="text-xl font-bold text-[#3d4a3a]">
                      {formatCurrency(getAdjustedEstimate().min)} – {formatCurrency(getAdjustedEstimate().max)}
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <a
                    href={`https://wa.me/${contact.whatsapp_number}?text=Hi, I just submitted a repair request for my ${selectedFurnitureName}. Name: ${customerName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#128C7E] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat on WhatsApp
                  </a>
                  <button
                    onClick={resetWizard}
                    className="px-6 py-3 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a]/5 transition-colors"
                  >
                    New Estimate
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
