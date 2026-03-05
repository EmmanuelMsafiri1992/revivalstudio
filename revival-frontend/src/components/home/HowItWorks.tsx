'use client'

import { motion } from 'framer-motion'
import { ClipboardList, Users, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    number: '1',
    title: 'Submit Your Request',
    description: 'Use our estimators to get instant repair costs or resale values. Fill out a quick form with your furniture details.',
  },
  {
    icon: Users,
    number: '2',
    title: 'We Connect You',
    description: 'Our team reviews your request and connects you with the nearest partner outlet for collection.',
  },
  {
    icon: CheckCircle,
    number: '3',
    title: 'Revival Complete',
    description: 'Your furniture is repaired and returned, or sold through our network. Simple, sustainable, satisfying.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3d4a3a] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto">
            Simple steps to give your furniture a new lease of life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative bg-[#faf8f5] rounded-2xl p-8 text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#e5e5e5]" />
              )}

              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#c9a962] flex items-center justify-center">
                <span className="text-3xl font-bold text-[#3d4a3a]">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold text-[#3d4a3a] mb-3">
                {step.title}
              </h3>
              <p className="text-[#666666] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
