import { Hero } from '@/components/home/Hero'
import { Features } from '@/components/home/Features'
import { FurnitureShowcase } from '@/components/home/FurnitureShowcase'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Testimonials } from '@/components/home/Testimonials'
import { CTA } from '@/components/home/CTA'

export default function Home() {
  return (
    <>
      {/* Products first on all screen sizes */}
      <div id="buy">
        <FurnitureShowcase />
      </div>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  )
}
