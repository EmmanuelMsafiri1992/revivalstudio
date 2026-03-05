import { RoomPlannerWizard } from '@/components/planner/RoomPlannerWizard'
import { Sparkles, Clock, Target, Palette, CheckCircle, MessageCircle, Home, PoundSterling } from 'lucide-react'

export const metadata = {
  title: 'AI Room Planner | Revival Studio',
  description: 'Design your perfect room with our AI-powered furniture planner. Select your room type, style, and budget to get personalised furniture recommendations instantly.',
}

export default function PlannerPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#3d4a3a] via-[#4a5a46] to-[#7a9b76] text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962]/20 rounded-full text-[#c9a962] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Room Design
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Smart Furniture
              <span className="text-[#c9a962]"> Room Planner</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Tell us about your room and budget, and our AI will create a personalised furniture plan with recommendations from our curated collection.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-5 h-5 text-[#c9a962]" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-5 h-5 text-[#c9a962]" />
                <span>Budget-Optimised</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Palette className="w-5 h-5 text-[#c9a962]" />
                <span>Style-Matched</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wizard */}
      <section className="py-8 sm:py-12 px-4 bg-[#faf8f5]">
        <RoomPlannerWizard />
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d4a3a] text-center mb-4">
            How the AI Planner Works
          </h2>
          <p className="text-center text-[#666] max-w-2xl mx-auto mb-8 sm:mb-12">
            Our intelligent system analyses thousands of furniture combinations to create the perfect plan for your space.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                icon: Home,
                title: 'Select Your Room',
                description: 'Choose from living room, bedroom, dining room, home office, or hallway.'
              },
              {
                step: '2',
                icon: Target,
                title: 'Set Room Size',
                description: 'Tell us the approximate size so we recommend the right furniture scale.'
              },
              {
                step: '3',
                icon: Palette,
                title: 'Pick Your Style',
                description: 'Modern, classic, mid-century, Scandinavian, industrial, or rustic.'
              },
              {
                step: '4',
                icon: PoundSterling,
                title: 'Set Your Budget',
                description: 'We optimise recommendations to give you the best value within your budget.'
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-[#faf8f5] hover:shadow-lg transition-shadow relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#c9a962] text-[#3d4a3a] rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="w-14 h-14 mx-auto mb-4 mt-2 rounded-full bg-[#7a9b76]/20 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-[#7a9b76]" />
                </div>
                <h3 className="font-semibold text-[#3d4a3a] mb-2">{item.title}</h3>
                <p className="text-sm text-[#666]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-16 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3d4a3a] text-center mb-8 sm:mb-12">
            Why Use Our AI Planner?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Matching',
                description: 'Our algorithm considers size, style, and budget to create cohesive furniture sets.'
              },
              {
                icon: PoundSterling,
                title: 'Budget Optimisation',
                description: 'Get the most value from your budget with smart price-to-quality recommendations.'
              },
              {
                icon: Palette,
                title: 'Style Consistency',
                description: 'Every piece is selected to match your chosen aesthetic perfectly.'
              },
              {
                icon: CheckCircle,
                title: 'Sustainable Choice',
                description: 'All recommendations come from our curated pre-loved furniture collection.'
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-white hover:shadow-lg transition-shadow">
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
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Need Personalised Advice?</h2>
          <p className="text-white/80 mb-6">Our furniture experts are ready to help you create your dream room.</p>
          <a
            href="https://wa.me/447570578520?text=Hi, I need help with room furniture planning"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#128C7E] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with an Expert
          </a>
        </div>
      </section>
    </>
  )
}
