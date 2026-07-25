import { getAllNetworks, NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'
import HeroSection from '@/components/landing/HeroSection'
import StatsBar from '@/components/landing/StatsBar'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import NetworkStatus from '@/components/landing/NetworkStatus'
import TerminalSpotlight from '@/components/landing/TerminalSpotlight'
import CTABanner from '@/components/landing/CTABanner'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  // Four available targets plus Clarke (coming soon) make up the five-network
  // product surface. Localnet is intentionally included for local development.
  const networks = getAllNetworks()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <HeroSection />
      <StatsBar />
      <section id="how-it-works" className="py-20 md:py-28">
        <HowItWorksSection />
      </section>
      <section id="features" className="border-t border-white/[0.06] py-20 md:py-28">
        <FeaturesSection />
      </section>
      <section id="networks" className="border-t border-white/[0.06] py-20 md:py-28">
        <NetworkStatus networks={networks} colorClasses={NETWORK_COLOR_CLASSES} />
      </section>
      <section className="border-t border-white/[0.06] py-20 md:py-28">
        <TerminalSpotlight />
      </section>
      <section className="py-16 md:py-24">
        <CTABanner />
      </section>
      <Footer />
    </div>
  )
}
