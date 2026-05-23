/**
 * App — the single-scroll landing page.
 *
 * Composes the seven sections in page order. The i18n provider + global styles
 * are already wired in main.tsx, so this just renders the sections; each one
 * pulls its own bilingual copy from content.ts via useI18n.
 *
 * Page order (band rhythm in parens):
 *   Nav (translucent over white)
 *   Hero      — white
 *   Apps      — panel
 *   Approach  — white
 *   Stats     — ink
 *   Cta       — accent band
 *   Footer    — deeper ink
 *
 * Bands already alternate at the section layer (white → panel → white → ink →
 * accent → deeper-ink); no collisions. Reveals stagger per-section and run once;
 * reduced-motion is honored at the token + primitive layer.
 *
 * A skip link lets keyboard users jump past the nav to the main content.
 */

import { Nav } from "./sections/nav";
import { HeroSection } from "./sections/hero-section";
import { AppsSection } from "./sections/apps-section";
import { ApproachSection } from "./sections/approach-section";
import { StatsSection } from "./sections/stats-section";
import { CtaSection } from "./sections/cta-section";
import { Footer } from "./sections/footer";
import { useI18n } from "./i18n";

export function App() {
  const { t } = useI18n();

  return (
    <>
      <a className="oml-skip-link" href="#top">
        {t.nav.skipToContent}
      </a>

      <Nav />

      <main id="main">
        <HeroSection />
        <AppsSection />
        <ApproachSection />
        <StatsSection />
        <CtaSection />
      </main>

      <Footer />
    </>
  );
}
