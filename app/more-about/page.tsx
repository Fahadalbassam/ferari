import Image from "next/image";

export default function MoreAboutPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-neutral-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <section className="flex flex-col items-start gap-10 md:flex-row md:items-center md:gap-14">
          <div className="space-y-3 md:flex-1">
            <h1 className="text-3xl font-semibold">More About Ferrari</h1>
            <p className="text-base text-muted-foreground">
              The story of Ferrari is a story of speed, design, and devotion—crafted in Maranello and loved all over the
              world.
            </p>
          </div>
          <div className="mx-auto w-40 sm:w-48 md:w-56 lg:w-64">
            <Image
              src="/ferrari-logo-png_seeklogo-512505.png"
              alt="Ferrari prancing horse logo"
              width={512}
              height={640}
              className="h-auto w-full drop-shadow-lg"
              priority
            />
          </div>
        </section>

        <article className="mx-auto max-w-5xl space-y-12 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">A Legacy Forged on the Track</h2>
            <p>
              Ferrari began as the dream of <strong>Enzo Ferrari</strong>, a racer before he was a founder. From the
              early days of Scuderia Ferrari in the 1930s to the first road car—the <em>125 S</em> in 1947—the brand was
              built on a single idea: racing improves the breed. Every lap, every victory, and every heartbreak
              informed the engineering that would go into road cars bearing the Cavallino Rampante.
            </p>
            <ul className="list-disc pl-6">
              <li>
                <strong>1947</strong> — Ferrari 125 S debuts; a V12 symphony that set the tone for decades.
              </li>
              <li>
                <strong>1950s–1960s</strong> — Le Mans dominance with the 250 Testa Rossa and 250 GTO; design icons by
                Pininfarina.
              </li>
              <li>
                <strong>1984</strong> — The <em>288 GTO</em> births the modern supercar era; followed by the <em>F40</em>.
              </li>
              <li>
                <strong>2000s–today</strong> — Formula 1 titles with Schumacher; hybrid performance with LaFerrari, SF90
                Stradale and beyond.
              </li>
            </ul>
            <p>
              Today’s Ferraris blend hand-finished craftsmanship with wind-tunnel data and simulation tools borrowed from
              F1. The result is a car that feels alive—responsive, precise, and unmistakably Italian.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Design Philosophy</h2>
            <p>
              Ferrari design balances emotion and efficiency. Air is sculpted, not just channeled; materials are chosen
              for feel as well as performance. Interiors are built around the driver: compact steering wheels with
              integrated controls, visibility tuned for apexes, and haptics engineered to feel intentional—every click
              and paddle pull.
            </p>
            <p>
              Sustainability matters, too. Hybrid systems like those in the SF90 Stradale and 296 GTB show Ferrari’s
              philosophy: electrification should amplify soul, not silence it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">How Our Dealership Works</h2>
            <p>
              Our showroom is curated to feel like a paddock before a race: focused, personal, and exhilarating. Whether
              you’re buying new or certified pre-owned, your journey is guided by a single specialist from the first call
              to delivery day.
            </p>
            <ol className="list-decimal pl-6">
              <li>
                <strong>Discovery</strong> — We align on purpose (track days, grand touring, collection) and fit (model,
                spec, budget).
              </li>
              <li>
                <strong>Configuration</strong> — Colors, materials, stitching, and carbon packages. We provide photo-real
                renders and a seat-fit session when available.
              </li>
              <li>
                <strong>Order & Allocation</strong> — For new cars, we secure an allocation with an estimated build slot.
                For pre-owned, we prepare a full provenance dossier.
              </li>
              <li>
                <strong>Preparation</strong> — Every car undergoes a 101-point inspection, paint measurement, ECU scan,
                and road test.
              </li>
              <li>
                <strong>Delivery</strong> — Hand-over includes detailed feature walk-through, drive mode coaching, and a
                first-service booking.
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Certified Pre-Owned (CPO)</h2>
            <p>Our CPO program preserves value and peace of mind. Each vehicle includes:</p>
            <ul className="list-disc pl-6">
              <li>Comprehensive inspection &amp; verified service history</li>
              <li>Minimum 12-month warranty &amp; roadside assistance</li>
              <li>Paint &amp; interior detailing to Ferrari standards</li>
              <li>Optional extended maintenance plans</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Test Drives</h2>
            <p>
              Test drives are by appointment to ensure the right route and conditions. A valid license, insurance
              verification, and a refundable security deposit may be required. For certain models, accompanied drives
              with our specialist are standard to help you explore performance modes safely.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Ownership &amp; Service</h2>
            <ul className="list-disc pl-6">
              <li>
                <strong>First service</strong> — Booked at delivery. We provide valet pick-up options.
              </li>
              <li>
                <strong>Track support</strong> — Brake packages, tires, and telemetry sessions for clients who enjoy track
                days.
              </li>
              <li>
                <strong>Detailing</strong> — Paint protection film (PPF), ceramic, and interior care tailored to Ferrari
                materials.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Financing &amp; Trade-In</h2>
            <p>
              We partner with performance-friendly lenders and can structure balloon payments or seasonal schedules. We
              welcome trade-ins and provide appraisals based on market comps, provenance, and service status.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Refunds, Returns &amp; Cancellations</h2>
            <p className="italic text-muted-foreground">
              The following policy is for demonstration purposes for your project; adjust to your local laws as needed.
            </p>
            <ul className="list-disc pl-6">
              <li>
                <strong>Deposits</strong> — Fully refundable within 48 hours of payment if the vehicle has not been
                allocated or shipped for preparation.
              </li>
              <li>
                <strong>Cooling-off (CPO cars)</strong> — You may return within <strong>7 days or 500 km</strong>{" "}
                (whichever first) for a refund minus a 2% admin fee, provided the car is in delivered condition (no new
                damage, mods, or track use).
              </li>
              <li>
                <strong>New builds</strong> — Factory orders are cancellable until status moves to “locked for
                production.” After that, deposits convert to a build-change credit; refunds are not guaranteed.
              </li>
              <li>
                <strong>Defects</strong> — Any material defect discovered within 30 days will be repaired under warranty
                or you may request a replacement vehicle if repair is not feasible.
              </li>
              <li>
                <strong>Refund timing</strong> — Approved refunds are processed within 5–7 business days to the original
                payment method.
              </li>
              <li>
                <strong>Non-returnable</strong> — Custom accessories, personalized items, and track consumables
                (pads/tires) once used.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Promise</h2>
            <p>
              We believe every Ferrari should feel like a signature—yours. From first spec to first service, we obsess
              over the details so that you can simply drive. If something isn’t perfect, we’ll make it right.
            </p>
          </section>

          <footer className="mt-10 border-t pt-6 text-sm text-muted-foreground">
            <p>
              For appointments and allocations, contact our showroom team at{" "}
              <a className="underline" href="mailto:showroom@example.com">
                showroom@example.com
              </a>
              .
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}





