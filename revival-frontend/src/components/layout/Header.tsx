'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronRight, Wrench, DollarSign, LayoutGrid, Users, MessageCircle, Phone, ShoppingBag } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home', icon: null },
  { href: '/buy', label: 'Buy', icon: ShoppingBag, description: 'Browse partner products' },
  { href: '/repair', label: 'Repair', icon: Wrench, description: 'Get repair estimates' },
  { href: '/sell', label: 'Sell', icon: DollarSign, description: 'Sell your furniture' },
  { href: '/planner', label: 'Room Planner', icon: LayoutGrid, description: 'Design your space' },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="Revival Studio"
              width={280}
              height={100}
              className="h-16 sm:h-20 md:h-24 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-[#3d4a3a] text-white shadow-md'
                    : 'text-[#3d4a3a] hover:bg-[#3d4a3a]/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </span>
                {pathname === link.href && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#c9a962] rounded-full" />
                )}
              </Link>
            ))}

            {/* Partner Login Button - Special styling */}
            <Link
              href="/partner/login"
              className={`ml-4 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                pathname === '/partner/login'
                  ? 'bg-[#c9a962] text-[#3d4a3a] shadow-md'
                  : 'bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <Users className="w-4 h-4" />
              Partner Login
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-[#3d4a3a]/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-[#3d4a3a]" />
            ) : (
              <Menu className="w-6 h-6 text-[#3d4a3a]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-50 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5]">
          <Image
            src="/logo.jpg"
            alt="Revival Studio"
            width={140}
            height={50}
            className="h-12 w-auto object-contain"
          />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-xl hover:bg-[#3d4a3a]/5 transition-colors"
          >
            <X className="w-6 h-6 text-[#3d4a3a]" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                  pathname === link.href
                    ? 'bg-[#3d4a3a] text-white'
                    : 'bg-[#faf8f5] text-[#3d4a3a] hover:bg-[#3d4a3a]/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  {link.icon && (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      pathname === link.href ? 'bg-white/20' : 'bg-[#3d4a3a]/10'
                    }`}>
                      <link.icon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{link.label}</p>
                    {link.description && (
                      <p className={`text-xs ${pathname === link.href ? 'text-white/70' : 'text-[#666]'}`}>
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 ${pathname === link.href ? 'text-white/70' : 'text-[#666]'}`} />
              </Link>
            ))}
          </nav>

          {/* Partner Login - Mobile */}
          <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
            <Link
              href="/partner/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-3 w-full p-4 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-2xl font-semibold shadow-lg"
            >
              <Users className="w-5 h-5" />
              Partner Login
            </Link>
          </div>

          {/* Contact Info - Mobile */}
          <div className="mt-6 p-4 bg-[#faf8f5] rounded-2xl">
            <p className="text-sm font-semibold text-[#3d4a3a] mb-3">Need Help?</p>
            <a
              href="https://wa.me/447570578520"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#25D366] font-medium mb-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp: +44 7570 578520
            </a>
            <a
              href="tel:+447511775529"
              className="flex items-center gap-2 text-sm text-[#666] hover:text-[#3d4a3a]"
            >
              <Phone className="w-4 h-4" />
              +44 7511 775529
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
