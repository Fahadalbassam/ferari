import Image from "next/image";

export default function MoreAboutPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-32 w-40 sm:h-40 sm:w-52">
            <Image
              src="/ferrari-logo-png_seeklogo-512505.png"
              alt="Ferrari prancing horse"
              fill
              sizes="260px"
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">More About Ferrari</h1>
            <p className="text-base text-neutral-700">
              Racing bloodline, Italian craft, and an obsession with performance — this is the Cavallino Rampante.
            </p>
          </div>
        </header>

        <div className="space-y-10 text-base leading-7 text-neutral-800">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-neutral-900">What Is Ferrari?</h2>
            <p>
              Ferrari is an Italian luxury sports-car manufacturer rooted in Maranello, born from the vision of{" "}
              <strong>Enzo Ferrari</strong>. Since the first Ferrari-badged car in 1947, the name has stood for speed,
              racing glory, and unmistakable Italian design.
            </p>
            <p>
              The brand emerged from Enzo’s early workshop, Auto Avio Costruzioni (1939), and quickly became a symbol of
              innovation and motorsport success once the prancing horse appeared on the 125 S.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-neutral-900">How Ferrari Started</h2>
            <p>
              Enzo Ferrari began as a racing driver for Alfa Romeo in the 1920s, then pivoted to building and organizing
              race cars — his true passion. Key milestones:
            </p>
            <ul className="space-y-2 pl-5 text-neutral-800">
              <li className="list-disc">
                <strong>1929 — Scuderia Ferrari</strong>: a racing team running Alfa Romeos for gentleman drivers.
              </li>
              <li className="list-disc">
                <strong>1939 — Auto Avio Costruzioni</strong>: Enzo’s own company in Modena, building components and
                race cars under a non-compete.
              </li>
              <li className="list-disc">
                <strong>1947 — Ferrari 125 S</strong>: the first true Ferrari, a V12 racer that won its debut in Rome.
              </li>
            </ul>
            <p>From day one, road cars existed to fund racing — not the other way around.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-neutral-900">The Prancing Horse</h2>
            <p>
              The black prancing horse (Cavallino Rampante) first appeared on WWI flying ace Francesco Baracca’s plane.
              After a race win in Ravenna, Baracca’s mother urged Enzo to use the emblem for luck. Ferrari added a
              Modena-yellow shield in 1932, and by 1947 the 125 S carried the badge that still defines the brand.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-neutral-900">Why Ferrari Exists</h2>
            <ol className="space-y-2 pl-5 text-neutral-800">
              <li className="list-decimal">
                <strong>Racing DNA</strong> — Born as a racing team, competition remains the core identity.
              </li>
              <li className="list-decimal">
                <strong>Excellence &amp; Innovation</strong> — Engineering and craftsmanship aimed at intense, emotional
                performance.
              </li>
              <li className="list-decimal">
                <strong>Italian Design &amp; Culture</strong> — Elegance, detail, and style as important as speed.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-neutral-900">Racing Heritage</h2>
            <p>Ferrari’s legend was forged on track:</p>
            <ul className="space-y-2 pl-5 text-neutral-800">
              <li className="list-disc">Launched its own racers in 1947 and won immediately with the 125 S.</li>
              <li className="list-disc">
                Entered Formula One in 1950; today it is the oldest and most decorated team in F1 history.
              </li>
              <li className="list-disc">
                Dominated endurance events like Le Mans and Mille Miglia through the 1950s–60s, using racing as the test
                bed for road cars.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-neutral-900">Road Cars &amp; Innovation</h2>
            <p>
              Ferrari road cars brought the badge into everyday culture — from front-engined V12 GTs to mid-engined
              icons. Highlights:
            </p>
            <ul className="space-y-2 pl-5 text-neutral-800">
              <li className="list-disc">Front-engined V12 GTs shaped by Italian coachbuilders.</li>
              <li className="list-disc">
                Mid-engined breakthroughs like the Dino 206 GT set the template for future supercars.
              </li>
              <li className="list-disc">Icons such as 250 GTO, F40, Enzo, and LaFerrari became auction legends.</li>
              <li className="list-disc">
                Modern lineup spans supercars, grand tourers, and a performance SUV — all in limited numbers to preserve
                exclusivity.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-neutral-900">Ferrari Today</h2>
            <p>
              Headquartered in Maranello and listed publicly, Ferrari ships under 14,000 cars a year, investing heavily
              in hybrid tech and the path to full electrification while keeping its racing soul intact.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-neutral-900">Quick Timeline</h2>
            <div className="grid gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-neutral-800">
              {[
                { year: "1898", note: "Enzo Ferrari is born in Modena." },
                { year: "1929", note: "Scuderia Ferrari racing team is founded." },
                { year: "1939", note: "Auto Avio Costruzioni, Ferrari’s precursor, is created." },
                { year: "1947", note: "First Ferrari-badged car (125 S) wins on debut." },
                { year: "1950", note: "Ferrari enters Formula One." },
                { year: "1960s–1970s", note: "Golden era in F1 and endurance racing; classic road cars flourish." },
                { year: "1969", note: "Fiat takes a significant stake in Ferrari." },
                { year: "2016", note: "Ferrari completes spin-off and becomes an independent public company." },
              ].map((item) => (
                <div key={item.year} className="flex items-start gap-3">
                  <span className="min-w-[70px] font-semibold text-neutral-900">{item.year}</span>
                  <span className="text-sm leading-6 text-neutral-800">{item.note}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
