'use client'

import { Hero } from '@/components/Landing/Hero/Hero'
import Button from '@chris-test/ui/components/atoms/Button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@chris-test/ui/components/atoms/Tabs'
import CopyToClipboardInput from '@chris-test/ui/components/atoms/CopyToClipboardInput'
import { Badge } from '@chris-test/ui/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { Section } from './Section'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex flex-col">
      <PageContent />
    </div>
  )
}

export const PageContent = () => {

  return (
    <>
      <Section className="flex flex-col gap-y-32 py-0 md:py-0">
        <Hero
          title="Give your agents a world model"
          description="Ground agent context in trusted facts, relationships, and decision reasoning."
        >
          <div className="flex w-full flex-col items-center gap-8">
            {/* <Badge variant="outline">Powered by the Fide Context Protocol</Badge> */}
            <div className="dark:border-white/90 dark:bg-polar-900/30 w-full max-w-2xl rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm md:p-8">
              <Tabs defaultValue="human" className="w-full">
                <TabsList className="mx-auto">
                  <TabsTrigger value="human">I'm a Human</TabsTrigger>
                  <TabsTrigger value="agent">I'm an Agent</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="human"
                  className="dark:text-polar-400 mt-4 text-sm text-gray-600"
                >
                  <div className="space-y-4">
                    <p>Share with your agent.</p>
                    <CopyToClipboardInput
                      value="https://fide.work/SKILL.md"
                      variant="mono"
                    />
                  </div>
                </TabsContent>
                <TabsContent
                  value="agent"
                  className="dark:text-polar-400 mt-4 text-sm text-gray-600"
                >
                  <div className="space-y-4">
                    <p>
                      Start your world model!
                    </p>
                    <CopyToClipboardInput
                      value="https://fide.work/SKILL.md"
                      variant="mono"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* <div className="dark:border-polar-700 my-6 w-full border-t border-gray-200" />

              <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
                <Button
                  size="lg"
                  className="rounded-full bg-black font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-polar-50"
                  wrapperClassNames="flex items-center gap-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="text-lg" />
                </Button>
                <Link
                  href="/resources/why"
                  prefetch
                  className="dark:text-polar-400 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    className="!rounded-full !border-0 !bg-white dark:!bg-polar-800"
                  >
                    Why Fide?
                  </Button>
                </Link>
              </div> */}
            </div>
          </div>
        </Hero>
      </Section>
    </>
  )
}
