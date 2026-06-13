import { getAllNetworks, NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'
import HeroSection from '@/components/landing/HeroSection'
import StatsBar from '@/components/landing/StatsBar'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import NetworkStatus from '@/components/landing/NetworkStatus'
import TerminalSpotlight from '@/components/landing/TerminalSpotlight'
import CTABanner from '@/components/landing/CTABanner'

export default function HomePage() {
  const networks = getAllNetworks()

  return (
    <div className="mx-auto max-w-5xl px-4">
      <HeroSection />
      <StatsBar />
      <section id="how-it-works" className="py-16 md:py-24">
        <HowItWorksSection />
      </section>
      <section id="features" className="py-16 md:py-24">
        <FeaturesSection />
      </section>
      <section id="networks" className="py-16 md:py-24">
        <NetworkStatus networks={networks} colorClasses={NETWORK_COLOR_CLASSES} />
      </section>
      <section className="py-16 md:py-24">
        <TerminalSpotlight />
      </section>
      <section className="py-16 md:py-24">
        <CTABanner />
      </section>
    </div>
  )
}
