'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  ShoppingBag,
  ShoppingCart,
  LayoutGrid,
  Tag,
  MapPin,
  DollarSign,
  Wrench,
  TrendingUp,
  ArrowLeftRight,
  Gavel,
  Cpu,
  Users,
  MessageCircle,
  Phone,
  Crown,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  description: string
  premium?: boolean
}

interface DropdownGroup {
  label?: string
  items: NavItem[]
  premium?: boolean
}

interface NavEntry {
  label: string
  icon: React.ElementType
  href?: string          // simple link (no dropdown)
  groups?: DropdownGroup[] // dropdown nav
}

// ─── Navigation data ──────────────────────────────────────────────────────────

const navEntries: NavEntry[] = [
  {
    label: 'Home',
    icon: Home,
    href: '/',
  },
  {
    label: 'Market Place',
    icon: ShoppingBag,
    href: '/marketplace',
  },
  {
    label: 'Buy',
    icon: ShoppingCart,
    groups: [
      {
        items: [
          {
            href: '/planner',
            label: 'Room Planner',
            icon: LayoutGrid,
            description: 'Design your space for free',
          },
        ],
      },
      {
        label: 'Premium Login',
        premium: true,
        items: [
          {
            href: '/planner',
            label: 'Room Planner',
            icon: LayoutGrid,
            description: 'Advanced planner features',
            premium: true,
          },
          {
            href: '/discounted',
            label: 'Discount Pro',
            icon: Tag,
            description: 'Exclusive discounted listings',
            premium: true,
          },
          {
            href: '/near-me',
            label: 'Near Me',
            icon: MapPin,
            description: 'Find furniture near you',
            premium: true,
          },
        ],
      },
    ],
  },
  {
    label: 'Sell',
    icon: DollarSign,
    groups: [
      {
        items: [
          {
            href: '/repair',
            label: 'Repair Cost Estimator',
            icon: Wrench,
            description: 'Estimate repair costs for free',
          },
          {
            href: '/sell',
            label: 'Resale Value Generator',
            icon: TrendingUp,
            description: 'Get your resale value for free',
          },
        ],
      },
      {
        label: 'Premium Login',
        premium: true,
        items: [
          {
            href: '/repair',
            label: 'Repair Cost Estimator',
            icon: Wrench,
            description: 'Advanced repair analytics',
            premium: true,
          },
          {
            href: '/sell',
            label: 'Resale Value Generator',
            icon: TrendingUp,
            description: 'Full resale value suite',
            premium: true,
          },
          {
            href: '/exchange-pro',
            label: 'Exchange Pro',
            icon: ArrowLeftRight,
            description: 'Pro furniture exchange platform',
            premium: true,
          },
          {
            href: '/bidding-pro',
            label: 'Bidding Pro',
            icon: Gavel,
            description: 'Live bidding & auctions',
            premium: true,
          },
        ],
      },
    ],
  },
  {
    label: 'Tech & Tools',
    icon: Cpu,
    groups: [
      {
        items: [
          {
            href: '/tech-tools',
            label: 'Tech & Tools',
            icon: Cpu,
            description: 'Explore our technology suite',
          },
        ],
      },
    ],
  },
]

// ─── Colour constants ─────────────────────────────────────────────────────────

const PRIMARY = '#3d4a3a'
const ACCENT = '#c9a962'
const BG = '#faf8f5'

// ─── Desktop Dropdown ─────────────────────────────────────────────────────────

function DesktopDropdown({
  entry,
  pathname,
}: {
  entry: NavEntry
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120)
  }

  // Determine whether this dropdown's route is currently active
  const allHrefs = entry.groups?.flatMap((g) => g.items.map((i) => i.href)) ?? []
  const isActive = allHrefs.includes(pathname)

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
          isActive
            ? 'bg-[#3d4a3a] text-white shadow-md'
            : 'text-[#3d4a3a] hover:bg-[#3d4a3a]/5'
        }`}
      >
        <entry.icon className="w-4 h-4" />
        {entry.label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        {isActive && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#c9a962] rounded-full" />
        )}
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] overflow-hidden transition-all duration-200 origin-top ${
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ zIndex: 60 }}
      >
        {entry.groups?.map((group, gi) =>
          group.premium ? (
            <div key={gi}>
              {/* Premium section header */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ background: `linear-gradient(90deg, ${ACCENT} 0%, #d4b46d 100%)` }}
              >
                <Crown className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                <span
                  className="text-xs font-bold tracking-wider uppercase"
                  style={{ color: PRIMARY }}
                >
                  {group.label}
                </span>
              </div>
              {group.items.map((item) => (
                <DesktopDropdownItem key={item.href + item.label} item={item} pathname={pathname} />
              ))}
            </div>
          ) : (
            <div key={gi} className={gi > 0 ? 'border-t border-[#e5e5e5]' : ''}>
              {group.label && (
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#999]">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <DesktopDropdownItem key={item.href + item.label} item={item} pathname={pathname} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function DesktopDropdownItem({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const isActive = pathname === item.href

  return (
    <Link
      href={item.href}
      className={`flex items-start gap-3 px-4 py-3 transition-all duration-150 group ${
        item.premium
          ? 'hover:bg-[#c9a962]/10'
          : 'hover:bg-[#3d4a3a]/5'
      } ${isActive ? (item.premium ? 'bg-[#c9a962]/15' : 'bg-[#3d4a3a]/8') : ''}`}
    >
      <div
        className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: item.premium ? `${ACCENT}22` : `${PRIMARY}12`,
        }}
      >
        <item.icon
          className="w-4 h-4"
          style={{ color: item.premium ? ACCENT : PRIMARY }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: item.premium ? '#8a6c2a' : PRIMARY }}
          >
            {item.label}
          </span>
          {item.premium && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: ACCENT, color: PRIMARY }}
            >
              Premium
            </span>
          )}
        </div>
        <p className="text-xs text-[#888] mt-0.5 leading-tight">{item.description}</p>
      </div>
    </Link>
  )
}

// ─── Mobile menu section ───────────────────────────────────────────────────────

function MobileSection({
  entry,
  pathname,
  onClose,
}: {
  entry: NavEntry
  pathname: string
  onClose: () => void
}) {
  if (entry.href) {
    // Simple link
    const isActive = pathname === entry.href
    return (
      <Link
        href={entry.href}
        onClick={onClose}
        className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
          isActive ? 'bg-[#3d4a3a] text-white' : 'bg-[#faf8f5] text-[#3d4a3a] hover:bg-[#3d4a3a]/10'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isActive ? 'bg-white/20' : 'bg-[#3d4a3a]/10'
            }`}
          >
            <entry.icon className="w-5 h-5" />
          </div>
          <span className="font-semibold">{entry.label}</span>
        </div>
        <ChevronRight className={`w-5 h-5 ${isActive ? 'text-white/70' : 'text-[#666]'}`} />
      </Link>
    )
  }

  // Dropdown entry — expand all groups inline
  return (
    <div className="rounded-2xl overflow-hidden border border-[#e5e5e5]">
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#3d4a3a]">
        <entry.icon className="w-5 h-5 text-white" />
        <span className="font-bold text-white">{entry.label}</span>
      </div>

      {entry.groups?.map((group, gi) =>
        group.premium ? (
          <div key={gi}>
            {/* Premium header bar */}
            <div
              className="flex items-center gap-2 px-4 py-2"
              style={{ background: `linear-gradient(90deg, ${ACCENT} 0%, #d4b46d 100%)` }}
            >
              <Crown className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: PRIMARY }}>
                {group.label}
              </span>
            </div>
            {group.items.map((item) => (
              <MobileLinkRow
                key={item.href + item.label}
                item={item}
                pathname={pathname}
                onClose={onClose}
              />
            ))}
          </div>
        ) : (
          <div key={gi} className={gi > 0 ? 'border-t border-[#e5e5e5]' : ''}>
            {group.items.map((item) => (
              <MobileLinkRow
                key={item.href + item.label}
                item={item}
                pathname={pathname}
                onClose={onClose}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}

function MobileLinkRow({
  item,
  pathname,
  onClose,
}: {
  item: NavItem
  pathname: string
  onClose: () => void
}) {
  const isActive = pathname === item.href
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-3 transition-all ${
        item.premium ? 'hover:bg-[#c9a962]/10' : 'hover:bg-[#3d4a3a]/5'
      } ${isActive ? (item.premium ? 'bg-[#c9a962]/15' : 'bg-[#3d4a3a]/5') : 'bg-white'}`}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: item.premium ? `${ACCENT}22` : `${PRIMARY}12` }}
      >
        <item.icon className="w-4 h-4" style={{ color: item.premium ? ACCENT : PRIMARY }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: item.premium ? '#8a6c2a' : PRIMARY }}>
            {item.label}
          </span>
          {item.premium && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: ACCENT, color: PRIMARY }}
            >
              Premium
            </span>
          )}
        </div>
        <p className="text-xs text-[#888]">{item.description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#ccc]" />
    </Link>
  )
}

// ─── Main Header ──────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isMenuOpen])

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
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
            {navEntries.map((entry) =>
              entry.href ? (
                // Simple link (Home, Market Place)
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    pathname === entry.href
                      ? 'bg-[#3d4a3a] text-white shadow-md'
                      : 'text-[#3d4a3a] hover:bg-[#3d4a3a]/5'
                  }`}
                >
                  <entry.icon className="w-4 h-4" />
                  {entry.label}
                  {pathname === entry.href && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#c9a962] rounded-full" />
                  )}
                </Link>
              ) : (
                // Dropdown (Buy, Sell, Tech & Tools)
                <DesktopDropdown key={entry.label} entry={entry} pathname={pathname} />
              )
            )}

            {/* Partner Login — always gold */}
            <Link
              href="/partner/login"
              className={`ml-4 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                pathname === '/partner/login'
                  ? 'bg-[#c9a962] text-[#3d4a3a] shadow-md'
                  : 'bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <Users className="w-4 h-4" />
              Partners&apos; Login
            </Link>
          </div>

          {/* Mobile toggle */}
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

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[90%] max-w-sm bg-white z-50 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
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

        {/* Drawer body */}
        <div className="p-4 overflow-y-auto h-[calc(100%-80px)] space-y-3">
          {navEntries.map((entry) => (
            <MobileSection
              key={entry.label}
              entry={entry}
              pathname={pathname}
              onClose={() => setIsMenuOpen(false)}
            />
          ))}

          {/* Partner Login */}
          <div className="pt-2 border-t border-[#e5e5e5]">
            <Link
              href="/partner/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-3 w-full p-4 bg-gradient-to-r from-[#c9a962] to-[#d4b46d] text-[#3d4a3a] rounded-2xl font-semibold shadow-lg"
            >
              <Users className="w-5 h-5" />
              Partners&apos; Login
            </Link>
          </div>

          {/* Contact info */}
          <div className="p-4 bg-[#faf8f5] rounded-2xl">
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
