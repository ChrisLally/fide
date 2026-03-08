import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Hero } from '@/components/Landing/Hero/Hero'
import { Section } from '@/components/Landing/Section'

type Milestone = {
  date: string
  title: string
  detail: ReactNode
}

const milestones: Milestone[] = [
  {
    date: '2022',
    title: 'Launch',
    detail: (
      <>
        We originally launched Fide to empower trusted investment, talent, and
        audience discovery in the blockchain ecosystem. Our early{' '}
        <a
          href="https://x.com/fide_work/status/1607966476958371840"
          target="_blank"
          rel="noreferrer"
          className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
        >
          background checks
        </a>{' '}
        mapped project and community profiles to make informed decisions
        possible.
      </>
    ),
  },
  {
    date: '2023-2025',
    title: 'Then',
    detail: (
      <>
        It was an honor to parter with our earliest paying clients such as{' '}
        <a
          href="https://www.anchorage.com/"
          target="_blank"
          rel="noreferrer"
          className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
        >
          Anchorage
        </a>
        ,{' '}
        <a
          href="https://flipsidecrypto.xyz/"
          target="_blank"
          rel="noreferrer"
          className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
        >
          Flipside
        </a>
        , and{' '}
        <a
          href="https://0x.org"
          target="_blank"
          rel="noreferrer"
          className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
        >
          0x
        </a>
        {' to shape our product offerings grounded in complex context maps. '}
        While they absolutely validated the demand for quality context, we knew by the end of 2025 that it was time to expand our products and mission.
      </>
    ),
  },
  {
    date: '2026',
    title: 'Now',
    detail:
      'Our mission is expanding to empower Human & AI teams work confidently with unified identity and context. We are leveraging our years of context mapping experience to set a new standerd for graphing world models.',
  },
]

export const metadata: Metadata = {
  title: 'Fide Story',
  description: 'Why we started Fide and how the mission is evolving.',
}

export default function StoryPage() {
  return (
    <main className="flex flex-col">
      <Section className="gap-y-16 py-0 md:py-0">
        <Hero
          title="Why we started Fide"
          description="Our Story & Mission."
        />
      </Section>

      <Section className="gap-y-8 pt-0 md:pt-0">
        <div className="dark:bg-polar-900/40 dark:border-polar-700 space-y-8 rounded-3xl border border-gray-200 bg-white/80 p-8 backdrop-blur-sm md:p-12">
          <section className="space-y-3">
            <h2 className="text-3xl leading-tight md:text-4xl">Problem</h2>
            <p className="dark:text-polar-400 text-gray-600">
              The world lacks a unified source of truth. Social algorithms, generated content, and bad actors have made cutting through the noise all the more difficult. As AI Agents become teammates, it is increasingly important to have access to context grounded in facts, relationships, and the why behind decisions made.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-3xl leading-tight md:text-4xl">Mission</h2>
            <p className="dark:text-polar-400 text-gray-600">
              Fide is committed to setting the standard for trusted and accessable models of the world.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-3xl leading-tight md:text-4xl">Philosophy</h2>
            <p className="dark:text-polar-400 text-gray-600">
              Our products and standards are dependable, accessible,
              transparent, and open - published at{' '}
              <a
                href="https://github.com/fide"
                target="_blank"
                rel="noreferrer"
                className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
              >
                github.com/fide
              </a> under the{' '}
              <a
                href="https://www.apache.org/licenses/LICENSE-2.0"
                target="_blank"
                rel="noreferrer"
                className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
              >
                Apache 2.0 license
              </a>
              .
            </p>
          </section>
        </div>
      </Section>

      <Section className="gap-y-8">
        <div className="dark:bg-polar-900/40 dark:border-polar-700 space-y-6 rounded-3xl border border-gray-200 bg-white/80 p-8 md:p-12">
          <h3 className="text-3xl leading-tight">Memberships</h3>
          <p className="dark:text-polar-400 text-gray-600">
            We are proud of our memberships in the {' '}
            <a
              href="https://qubiclabs.com/portfolio/"
              target="_blank"
              rel="noreferrer"
              className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
            >
              QUBIC Labs R&D</a>, {' '}
            <a
              href="https://aws.amazon.com/startups"
              target="_blank"
              rel="noreferrer"
              className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
            >
              AWS Activate
            </a>
            ,{' '}
            <a
              href="https://cloud.google.com/startup"
              target="_blank"
              rel="noreferrer"
              className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
            >
              Google Cloud for Startups
            </a>
            ,{' '}
            <a
              href="https://modal.com/startups"
              target="_blank"
              rel="noreferrer"
              className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
            >
              Modal for Startups
            </a>
            , and{' '}
            <a
              href="https://www.mongodb.com/solutions/startups"
              target="_blank"
              rel="noreferrer"
              className="dark:text-polar-300 text-gray-700 underline underline-offset-4 hover:opacity-80"
            >
              MongoDB for Startups
            </a>{' '}
            programs with $150k+ in combined grants and credits awarded.
          </p>
        </div>
      </Section>

      <Section className="gap-y-8">
        <div className="dark:bg-polar-900/40 dark:border-polar-700 rounded-3xl border border-gray-200 bg-white/80 p-8 md:p-12">
          <h3 className="text-3xl leading-tight">Milestones</h3>
          <div className="mt-8 grid gap-4">
            {milestones.map((item) => (
              <div
                key={item.title}
                className="dark:border-polar-700 grid gap-2 rounded-2xl border border-gray-200 p-5 md:grid-cols-[140px_1fr]"
              >
                <p className="dark:text-polar-500 text-sm text-gray-500">
                  {item.date}
                </p>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="dark:text-polar-400 mt-1 text-sm text-gray-600">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="gap-y-8">
        <div className="dark:bg-polar-900/40 dark:border-polar-700 rounded-3xl border border-gray-200 bg-white/80 p-8 md:p-12">
          <h3 className="text-3xl leading-tight text-black dark:text-white">
            Fide Holdings, Inc.
          </h3>
          <div className="dark:text-polar-400 mt-8 space-y-1 text-gray-600">
            <p>Delaware C-Corporation</p>
            <p>16192 Coastal Highway, Lewes, DE 19958</p>
            <p>Incorporated: May 16, 2022</p>
            <p>Delaware File Number: 6800609</p>
          </div>
        </div>
      </Section>
    </main>
  )
}
