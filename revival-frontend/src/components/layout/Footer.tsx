'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, MessageCircle, Facebook } from 'lucide-react'
import { api } from '@/lib/api'

const DEFAULTS = {
  whatsapp_number: '447570578520',
  contact_phone: '+44 7570 578520',
  contact_phone_alt: '+44 7511 775529',
  contact_email_main: 'revivalstudio2026@gmail.com',
  business_name: 'Revival Studio',
  business_address_full: 'Canberra Road 10, London, United Kingdom, SE7 7BA',
  footer_tagline: 'London Based | Delivery Available | UK-Wide Partner Network',
  social_facebook: 'https://www.facebook.com/profile.php?id=61588351737342',
}

export function Footer() {
  const [s, setS] = useState(DEFAULTS)

  useEffect(() => {
    Promise.all([
      api.getSiteSettingsByGroup('contact'),
      api.getSiteSettingsByGroup('general'),
      api.getSiteSettingsByGroup('social'),
    ]).then(([contact, general, social]) => {
      setS({
        whatsapp_number: contact.data?.whatsapp_number ?? DEFAULTS.whatsapp_number,
        contact_phone: contact.data?.contact_phone ?? DEFAULTS.contact_phone,
        contact_phone_alt: contact.data?.contact_phone_alt ?? DEFAULTS.contact_phone_alt,
        contact_email_main: contact.data?.contact_email_main ?? DEFAULTS.contact_email_main,
        business_name: general.data?.business_name ?? DEFAULTS.business_name,
        business_address_full: contact.data?.business_address_full ?? DEFAULTS.business_address_full,
        footer_tagline: general.data?.footer_tagline ?? DEFAULTS.footer_tagline,
        social_facebook: social.data?.social_facebook || DEFAULTS.social_facebook,
      })
    }).catch(() => {})
  }, [])

  return (
    <footer className="bg-[#3d4a3a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4 bg-white rounded-xl p-3 inline-block">
              <Image
                src="/logo.jpg"
                alt={s.business_name}
                width={160}
                height={55}
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-white/70 text-sm mb-4">
              AI-powered circular furniture marketplace. Buy, Sell, Repair & Exchange quality furniture across the UK.
            </p>
            <p className="text-[#c9a962] text-sm font-medium italic">
              &quot;Smart Furniture. Sustainable Future.&quot;
            </p>
            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              {s.social_facebook && (
                <a
                  href={s.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#c9a962] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              <a
                href={`https://wa.me/${s.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#25D366] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#c9a962] font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/repair" className="text-white/70 hover:text-[#c9a962] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c9a962] rounded-full"></span>
                  Repair Cost Estimator
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-white/70 hover:text-[#c9a962] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c9a962] rounded-full"></span>
                  Sell Your Furniture
                </Link>
              </li>
              <li>
                <Link href="/planner" className="text-white/70 hover:text-[#c9a962] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c9a962] rounded-full"></span>
                  Room Design & Planner
                </Link>
              </li>
              <li>
                <Link href="/partner/login" className="text-white/70 hover:text-[#c9a962] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c9a962] rounded-full"></span>
                  Partner Marketplace
                </Link>
              </li>
              <li>
                <span className="text-white/70 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c9a962] rounded-full"></span>
                  Buy Quality Used Furniture
                </span>
              </li>
              <li>
                <span className="text-white/70 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c9a962] rounded-full"></span>
                  Exchange Old for New
                </span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[#c9a962] font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-white/70 hover:text-[#c9a962] transition-colors">
                  About {s.business_name}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-[#c9a962] transition-colors">
                  Our Partner Network
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-[#c9a962] transition-colors">
                  Sustainability Mission
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-[#c9a962] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-[#c9a962] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/70 hover:text-[#c9a962] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#c9a962] font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-white/70 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#c9a962] flex-shrink-0 mt-0.5" />
                <span>{s.business_address_full}</span>
              </li>
              {s.contact_phone_alt && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#c9a962] flex-shrink-0" />
                  <a href={`tel:${s.contact_phone_alt.replace(/\s/g, '')}`} className="hover:text-[#c9a962] transition-colors">
                    {s.contact_phone_alt}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#c9a962] flex-shrink-0" />
                <a href={`https://wa.me/${s.whatsapp_number}`} className="hover:text-[#c9a962] transition-colors">
                  WhatsApp: {s.contact_phone}
                </a>
              </li>
              {s.contact_email_main && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#c9a962] flex-shrink-0" />
                  <a href={`mailto:${s.contact_email_main}`} className="hover:text-[#c9a962] transition-colors">
                    {s.contact_email_main}
                  </a>
                </li>
              )}
            </ul>

            {/* CTA Button */}
            <a
              href={`https://wa.me/${s.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-medium hover:bg-[#128C7E] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Message on WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              &copy; {new Date().getFullYear()} {s.business_name}. All rights reserved.
            </p>
            <p className="text-white/50 text-sm">
              {s.footer_tagline}
            </p>
          </div>
          <div className="text-center mt-4">
            <p className="text-white/30 text-xs">
              Developed by{' '}
              <a
                href="https://emphxs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[#c9a962] transition-colors"
              >
                Emphx Innovative Solutions
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
