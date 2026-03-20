import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export interface ContactSettings {
  whatsapp_number: string
  contact_phone: string
}

const DEFAULTS: ContactSettings = {
  whatsapp_number: '447570578520',
  contact_phone: '+44 7570 578520',
}

export function useContactSettings(): ContactSettings {
  const [settings, setSettings] = useState<ContactSettings>(DEFAULTS)

  useEffect(() => {
    api.getSiteSettingsByGroup('contact').then(res => {
      if (res?.data) {
        setSettings({
          whatsapp_number: res.data.whatsapp_number ?? DEFAULTS.whatsapp_number,
          contact_phone: res.data.contact_phone ?? DEFAULTS.contact_phone,
        })
      }
    }).catch(() => {})
  }, [])

  return settings
}
