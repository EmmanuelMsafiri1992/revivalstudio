'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { api } from '@/lib/api'

const STAT_DEFAULTS = {
  stat_average_rating: '4.9/5',
  stat_happy_customers: '2,500+',
  stat_satisfaction_rate: '98%',
  stat_partner_outlets: '50+',
}

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    location: 'London',
    rating: 5,
    text: "Revival Studio transformed my grandmother's old dresser into a stunning centrepiece for my bedroom. The craftsmanship is exceptional!",
    service: 'Furniture Repair',
  },
  {
    id: 2,
    name: 'James Thompson',
    location: 'Manchester',
    rating: 5,
    text: "I sold my vintage dining set through their platform and got a much better price than I expected. The process was seamless.",
    service: 'Furniture Sale',
  },
  {
    id: 3,
    name: 'Emma Williams',
    location: 'Birmingham',
    rating: 5,
    text: "The room planner helped me visualise my new living room perfectly. Every piece they suggested fit beautifully together.",
    service: 'Room Planning',
  },
]

export function Testimonials() {
  const [stats, setStats] = useState(STAT_DEFAULTS)

  useEffect(() => {
    api.getSiteSettingsByGroup('stats').then(res => {
      if (res?.data) {
        setStats({
          stat_average_rating: res.data.stat_average_rating ?? STAT_DEFAULTS.stat_average_rating,
          stat_happy_customers: res.data.stat_happy_customers ?? STAT_DEFAULTS.stat_happy_customers,
          stat_satisfaction_rate: res.data.stat_satisfaction_rate ?? STAT_DEFAULTS.stat_satisfaction_rate,
          stat_partner_outlets: res.data.stat_partner_outlets ?? STAT_DEFAULTS.stat_partner_outlets,
        })
      }
    }).catch(() => {})
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-[#c9a962]/20 text-[#3d4a3a] rounded-full text-sm font-medium mb-4">
            Customer Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3d4a3a] mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Join thousands of satisfied customers who have trusted Revival Studio with their furniture needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-gradient-to-br from-[#faf8f5] to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="absolute -top-4 right-8">
                <div className="w-10 h-10 bg-[#c9a962] rounded-full flex items-center justify-center">
                  <Quote className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#c9a962] fill-current" />
                ))}
              </div>

              <p className="text-[#666] mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
                <div>
                  <p className="font-semibold text-[#3d4a3a]">{testimonial.name}</p>
                  <p className="text-sm text-[#666]">{testimonial.location}</p>
                </div>
                <span className="px-3 py-1 bg-[#7a9b76]/20 text-[#3d4a3a] rounded-full text-xs font-medium">
                  {testimonial.service}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 mt-16 pt-12 border-t border-[#e5e5e5]"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-[#3d4a3a]">{stats.stat_average_rating}</div>
            <div className="text-sm text-[#666]">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#3d4a3a]">{stats.stat_happy_customers}</div>
            <div className="text-sm text-[#666]">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#3d4a3a]">{stats.stat_satisfaction_rate}</div>
            <div className="text-sm text-[#666]">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#3d4a3a]">{stats.stat_partner_outlets}</div>
            <div className="text-sm text-[#666]">UK Partner Outlets</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
