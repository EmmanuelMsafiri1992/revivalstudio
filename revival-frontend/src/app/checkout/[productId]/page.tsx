'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, CreditCard, Truck, Check, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  images: string[] | null
  status: string
  furniture_type?: {
    name: string
  }
  outlet?: {
    name: string
    city: string | null
  }
}

interface PaymentMethod {
  id: number
  name: string
  code: string
  description: string | null
  instructions: string | null
  is_active: boolean
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string

  const [product, setProduct] = useState<Product | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ orderNumber: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    house_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postcode: '',
    payment_method: '',
    notes: '',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productRes, paymentRes] = await Promise.all([
          api.getProduct(parseInt(productId)),
          api.getPaymentMethods(),
        ])

        if (productRes.data) {
          if (productRes.data.status !== 'available') {
            setError('This product is no longer available for purchase.')
          } else {
            setProduct(productRes.data)
          }
        } else {
          setError('Product not found')
        }

        if (paymentRes.success && paymentRes.data) {
          setPaymentMethods(paymentRes.data)
          // Set default payment method
          if (paymentRes.data.length > 0) {
            setFormData(prev => ({ ...prev, payment_method: paymentRes.data[0].code }))
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load checkout data')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadData()
    }
  }, [productId])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.customer_name.trim()) errors.customer_name = 'Full name is required'
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (!formData.house_number.trim()) errors.house_number = 'House number is required'
    if (!formData.address_line1.trim()) errors.address_line1 = 'Address is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.postcode.trim()) errors.postcode = 'Postcode is required'
    if (!formData.payment_method) errors.payment_method = 'Please select a payment method'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !product) return

    try {
      setSubmitting(true)
      setError(null)

      const response = await api.createOrder({
        product_id: product.id,
        customer_name: formData.customer_name,
        email: formData.email,
        phone: formData.phone,
        house_number: formData.house_number,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || undefined,
        city: formData.city,
        postcode: formData.postcode,
        payment_method: formData.payment_method,
        notes: formData.notes || undefined,
      })

      if (response.success && response.data) {
        setSuccess({ orderNumber: response.data.order_number })
      } else {
        setError('Failed to place order. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return '0.00'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
  }

  const transformImageUrl = (img: string) => {
    if (img.startsWith('http')) return img
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://api.revivalstudio.uk'
    if (img.startsWith('/storage/')) return `${apiBase}${img}`
    if (img.startsWith('/')) return img
    return `${apiBase}/storage/${img}`
  }

  const selectedPaymentMethod = paymentMethods.find(m => m.code === formData.payment_method)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a962]"></div>
      </div>
    )
  }

  // Error state (product not available)
  if (error && !product) {
    return (
      <div className="min-h-screen bg-[#f8f6f3] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#3d4a3a] mb-2">Oops!</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a962] text-[#3d4a3a] font-semibold rounded-xl hover:bg-[#b8994e] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f6f3] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#3d4a3a] mb-2">Order Placed!</h1>
            <p className="text-gray-600 mb-2">Thank you for your order.</p>
            <p className="text-lg font-semibold text-[#c9a962] mb-6">
              Order Number: {success.orderNumber}
            </p>

            {selectedPaymentMethod && (
              <div className="bg-[#f8f6f3] rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold text-[#3d4a3a] mb-2">Payment Instructions</h3>
                <p className="text-gray-600 text-sm whitespace-pre-line">
                  {selectedPaymentMethod.instructions || 'You will receive payment instructions via email.'}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6">
              A confirmation email has been sent to <strong>{formData.email}</strong>
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a962] text-[#3d4a3a] font-semibold rounded-xl hover:bg-[#b8994e] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Parse product images
  let productImages = product?.images
  if (typeof productImages === 'string') {
    try {
      productImages = JSON.parse(productImages)
    } catch {
      productImages = null
    }
  }
  const productImage = (Array.isArray(productImages) && productImages.length > 0)
    ? transformImageUrl(productImages[0])
    : '/products/placeholder.jpg'

  return (
    <div className="min-h-screen bg-[#f8f6f3] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#3d4a3a] hover:text-[#c9a962] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Shop
        </Link>

        <h1 className="text-3xl font-bold text-[#3d4a3a] mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#3d4a3a] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#c9a962] text-[#3d4a3a] rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Your Details
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a962] focus:border-transparent transition-colors ${formErrors.customer_name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="John Smith"
                    />
                    {formErrors.customer_name && <p className="mt-1 text-sm text-red-500">{formErrors.customer_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a962] focus:border-transparent transition-colors ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="john@example.com"
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a962] focus:border-transparent transition-colors ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="07123 456789"
                    />
                    {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#3d4a3a] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#c9a962] text-[#3d4a3a] rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Delivery Address
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">House Number *</label>
                    <input
                      type="text"
                      name="house_number"
                      value={formData.house_number}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a962] focus:border-transparent transition-colors ${formErrors.house_number ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="42"
                    />
                    {formErrors.house_number && <p className="mt-1 text-sm text-red-500">{formErrors.house_number}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a962] focus:border-transparent transition-colors ${formErrors.address_line1 ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="High Street"
                    />
                    {formErrors.address_line1 && <p className="mt-1 text-sm text-red-500">{formErrors.address_line1}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a962] focus:border-transparent transition-colors"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a962] focus:border-transparent transition-colors ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="London"
                    />
                    {formErrors.city && <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postcode *</label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#c9a962] focus:border-transparent transition-colors ${formErrors.postcode ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="SW1A 1AA"
                    />
                    {formErrors.postcode && <p className="mt-1 text-sm text-red-500">{formErrors.postcode}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#3d4a3a] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#c9a962] text-[#3d4a3a] rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Payment Method
                </h2>

                {formErrors.payment_method && (
                  <p className="mb-4 text-sm text-red-500">{formErrors.payment_method}</p>
                )}

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        formData.payment_method === method.code
                          ? 'border-[#c9a962] bg-[#f8f6f3]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.code}
                        checked={formData.payment_method === method.code}
                        onChange={handleInputChange}
                        className="mt-1 w-5 h-5 text-[#c9a962] border-gray-300 focus:ring-[#c9a962]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {method.code === 'cod' ? (
                            <Truck className="w-5 h-5 text-[#c9a962]" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-[#c9a962]" />
                          )}
                          <span className="font-semibold text-[#3d4a3a]">{method.name}</span>
                        </div>
                        {method.description && (
                          <p className="mt-1 text-sm text-gray-600">{method.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {selectedPaymentMethod?.instructions && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-800 whitespace-pre-line">
                      {selectedPaymentMethod.instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#3d4a3a] mb-4">Order Notes (Optional)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a962] focus:border-transparent transition-colors resize-none"
                  placeholder="Any special instructions for your order..."
                />
              </div>

              {/* Submit Button - Mobile */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#c9a962] hover:bg-[#b8994e] disabled:bg-gray-400 text-[#3d4a3a] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Place Order - £{formatPrice(product?.price)}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-[#3d4a3a] mb-6">Order Summary</h2>

              {/* Product */}
              <div className="flex gap-4 pb-6 border-b">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={productImage}
                    alt={product?.name || ''}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#3d4a3a] truncate">{product?.name}</h3>
                  {product?.furniture_type && (
                    <p className="text-sm text-gray-500">{product.furniture_type.name}</p>
                  )}
                  <p className="text-lg font-bold text-[#c9a962] mt-1">£{formatPrice(product?.price)}</p>
                </div>
              </div>

              {/* Totals */}
              <div className="py-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>£{formatPrice(product?.price)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="pt-6 border-t">
                <div className="flex justify-between text-xl font-bold text-[#3d4a3a]">
                  <span>Total</span>
                  <span>£{formatPrice(product?.price)}</span>
                </div>
              </div>

              {/* Submit Button - Desktop */}
              <button
                type="submit"
                form="checkout-form"
                onClick={handleSubmit}
                disabled={submitting}
                className="hidden lg:flex w-full mt-6 py-4 bg-[#c9a962] hover:bg-[#b8994e] disabled:bg-gray-400 text-[#3d4a3a] font-bold rounded-xl items-center justify-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>Free delivery on all orders</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Quality checked items</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
