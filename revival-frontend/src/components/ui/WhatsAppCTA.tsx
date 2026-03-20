'use client'

import { MessageCircle } from 'lucide-react'
import { useContactSettings } from '@/lib/useContactSettings'

interface WhatsAppCTAProps {
  text?: string
  prefillMessage?: string
  className?: string
  label?: string
}

export function WhatsAppCTA({
  text,
  prefillMessage = '',
  className = 'inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#128C7E] transition-colors',
  label = 'Chat with an Expert',
}: WhatsAppCTAProps) {
  const { whatsapp_number } = useContactSettings()
  const href = prefillMessage
    ? `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(prefillMessage)}`
    : `https://wa.me/${whatsapp_number}`

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <MessageCircle className="w-5 h-5" />
      {text || label}
    </a>
  )
}
