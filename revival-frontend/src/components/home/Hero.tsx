'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Wrench, Banknote, Recycle, MessageCircle } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] text-white">
      {/* Background Image Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&h=1080&fit=crop"
          alt="Elegant furniture"
          fill
          className="object-cover opacity-10"
          priority
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#c9a962]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#7a9b76]/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6"
          >
            AI-Powered Circular{' '}
            <span className="text-[#c9a962]">Furniture Marketplace</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0 mb-4"
          >
            Buy, Sell, Repair & Exchange quality furniture. We connect households, businesses, and trusted local refurbishers across the UK.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-[#c9a962] font-medium text-lg mb-8"
          >
            Affordable • Sustainable • Professional
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/repair"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#c9a962] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#d4b46d] hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Wrench className="w-5 h-5" />
              Get Repair Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sell"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-[#3d4a3a] transition-all text-sm sm:text-base"
            >
              <Banknote className="w-5 h-5" />
              Sell Your Furniture
            </Link>
          </motion.div>

          {/* WhatsApp CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex justify-center lg:justify-start"
          >
            <a
              href="https://wa.me/447570578520"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-full font-medium hover:bg-[#128C7E] transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp: +44 7570 578520
            </a>
          </motion.div>
        </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/products/bed-mattress.jpg"
                alt="Quality furniture at Revival Studio"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3d4a3a]/60 to-transparent" />

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#7a9b76]/20 rounded-full flex items-center justify-center">
                    <Recycle className="w-6 h-6 text-[#7a9b76]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#3d4a3a]">Circular Economy</p>
                    <p className="text-sm text-[#666]">Sustainable Living</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute top-6 right-6 bg-[#c9a962] rounded-xl p-4 shadow-lg"
              >
                <p className="text-[#3d4a3a] font-bold text-lg">From £10</p>
                <p className="text-[#3d4a3a]/80 text-sm">Quality Furniture</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 gap-6 sm:gap-8 mt-12 pt-8 border-t border-white/10"
        >
          {[
            { value: '500+', label: 'Furniture Pieces Revived' },
            { value: '50+', label: 'Partner Outlets UK-wide' },
            { value: '98%', label: 'Customer Satisfaction' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#c9a962]">{stat.value}</div>
              <div className="text-xs sm:text-sm text-white/70 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
