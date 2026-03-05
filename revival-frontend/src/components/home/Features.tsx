'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wrench, Banknote, Home, Store, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Wrench,
    title: 'Repair Cost Estimator',
    description: 'Get an instant estimate for repairing your furniture. Select your furniture type, describe the damage, and receive a price range in seconds.',
    href: '/repair',
    color: 'from-[#7a9b76] to-[#3d4a3a]',
  },
  {
    icon: Banknote,
    title: 'Resale Value Generator',
    description: "Wondering what your old furniture is worth? Get a fair market value estimate and sell through our trusted partner network.",
    href: '/sell',
    color: 'from-[#c9a962] to-[#8b6b4a]',
  },
  {
    icon: Home,
    title: 'Furniture Planner',
    description: 'Planning a new room? Select your room type, style preference, and budget to get personalised furniture recommendations.',
    href: '/planner',
    color: 'from-[#3d4a3a] to-[#7a9b76]',
  },
  {
    icon: Store,
    title: 'Partner Marketplace',
    description: 'For our outlet partners: manage collections, track repairs, and list furniture for sale through your dedicated dashboard.',
    href: '/partner/login',
    color: 'from-[#8b6b4a] to-[#c9a962]',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function Features() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3d4a3a] mb-4">
            Our Services
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto">
            From repair estimates to room planning, we provide everything you need for your furniture journey.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#3d4a3a] mb-3">
                {feature.title}
              </h3>
              <p className="text-[#666666] mb-6 leading-relaxed">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="inline-flex items-center gap-2 text-[#3d4a3a] font-medium group-hover:text-[#7a9b76] transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
