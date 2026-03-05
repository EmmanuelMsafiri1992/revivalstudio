import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#3d4a3a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4 bg-white rounded-xl p-3 inline-block">
              <Image
                src="/logo.jpg"
                alt="Revival Studio"
                width={160}
                height={55}
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-white/70 text-sm mb-4">
              AI-powered circular furniture marketplace. Buy, Sell, Repair & Exchange quality furniture across the UK.
            </p>
            <p className="text-[#c9a962] text-sm font-medium italic">
              "Smart Furniture. Sustainable Future."
            </p>
            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.facebook.com/profile.php?id=61588351737342"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#c9a962] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/447570578520"
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
                  About Revival Studio
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
                <span>Canberra Road 10, London,<br />United Kingdom, SE7 7BA</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#c9a962] flex-shrink-0" />
                <a href="tel:+447511775529" className="hover:text-[#c9a962] transition-colors">
                  +44 7511 775529
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#c9a962] flex-shrink-0" />
                <a href="https://wa.me/447570578520" className="hover:text-[#c9a962] transition-colors">
                  WhatsApp: +44 7570 578520
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#c9a962] flex-shrink-0" />
                <a href="mailto:revivalstudio2026@gmail.com" className="hover:text-[#c9a962] transition-colors">
                  revivalstudio2026@gmail.com
                </a>
              </li>
            </ul>

            {/* CTA Button */}
            <a
              href="https://wa.me/447570578520"
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
              &copy; {new Date().getFullYear()} Revival Studio. All rights reserved.
            </p>
            <p className="text-white/50 text-sm">
              London Based | Delivery Available | UK-Wide Partner Network
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
