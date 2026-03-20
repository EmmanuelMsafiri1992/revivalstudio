import { RepairWizard } from '@/components/repair/RepairWizard'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import { Wrench, Clock, Shield, Sparkles, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'AI Repair Cost Estimator | Revival Studio',
  description: 'Get an instant AI-powered repair cost estimate for your furniture. Select your furniture type, describe the damage, and receive an accurate price range in seconds.',
}

export default function RepairPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962]/20 rounded-full text-[#c9a962] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Technology
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Instant Repair Cost
              <span className="text-[#c9a962]"> Estimator</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Get an accurate repair estimate in under 60 seconds. Our AI analyzes your furniture type, material, and damage to provide transparent pricing.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-5 h-5 text-[#c9a962]" />
                <span>60-Second Estimate</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-5 h-5 text-[#c9a962]" />
                <span>No Obligation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wrench className="w-5 h-5 text-[#c9a962]" />
                <span>Expert Craftsmen</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section className="py-8 sm:py-12 px-4 bg-[#faf8f5]">
        <RepairWizard />
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d4a3a] text-center mb-8 sm:mb-12">
            Why Choose Our Repair Service?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Estimates',
                description: 'Our algorithm analyzes thousands of repair jobs to give you accurate pricing instantly.'
              },
              {
                icon: Shield,
                title: '12-Month Guarantee',
                description: 'All repairs come with a comprehensive warranty for your peace of mind.'
              },
              {
                icon: Wrench,
                title: 'Expert Craftsmen',
                description: 'Network of 50+ vetted professional furniture restorers across the UK.'
              },
              {
                icon: CheckCircle,
                title: 'Transparent Pricing',
                description: 'No hidden fees. The price you see is the price you pay.'
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-[#faf8f5] hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#7a9b76]/20 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-[#7a9b76]" />
                </div>
                <h3 className="font-semibold text-[#3d4a3a] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#666]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#3d4a3a] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Need Help or Have Questions?</h2>
          <p className="text-white/80 mb-6">Our team is ready to assist you with any furniture repair enquiries.</p>
          <WhatsAppCTA
            prefillMessage="Hi, I need help with furniture repair"
            label="Chat on WhatsApp"
          />
        </div>
      </section>
    </>
  )
}
