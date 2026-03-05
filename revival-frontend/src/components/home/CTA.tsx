'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wrench, Banknote, Home } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 lg:p-16 shadow-xl text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3d4a3a] mb-4">
            Ready to Revive Your Furniture?
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto mb-10">
            Whether you want to repair a beloved piece, sell furniture you no longer need,
            or plan a complete room makeover - start your journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/repair"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#c9a962] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#d4b46d] hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl"
            >
              <Wrench className="w-5 h-5" />
              Repair Estimator
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3d4a3a] text-white rounded-full font-semibold hover:bg-[#2d3a2a] hover:-translate-y-0.5 transition-all"
            >
              <Banknote className="w-5 h-5" />
              Sell Furniture
            </Link>
            <Link
              href="/planner"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#3d4a3a] text-[#3d4a3a] rounded-full font-semibold hover:bg-[#3d4a3a] hover:text-white transition-all"
            >
              <Home className="w-5 h-5" />
              Room Planner
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
