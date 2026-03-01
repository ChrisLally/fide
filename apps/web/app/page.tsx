import { Metadata } from 'next'
import LandingPage from '@/components/Landing/LandingPage'

export const metadata: Metadata = {
  title: 'Fide — Trust your context',
  description: 'Trust your context',
  keywords:
    'context, trustworthy, trust, verification, authentication, authorization, identity, security, privacy, compliance, regulation, governance, risk, management, risk assessment, risk management, risk mitigation, risk reduction, risk avoidance, risk acceptance, risk transfer, risk retention, risk insurance, risk hedging, risk diversification, risk pooling, risk concentration, risk concentration limit, risk concentration limit policy, risk concentration limit policy implementation, risk concentration limit policy implementation guidance, risk concentration limit policy implementation guidance guidance, risk concentration limit policy implementation guidance guidance guidance',
  openGraph: {
    siteName: 'Fide',
    type: 'website',
    images: [
      {
        url: 'https://fide.work/assets/brand/fide_og.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://fide.work/assets/brand/fide_og.jpg',
        width: 1200,
        height: 630,
        alt: 'Fide',
      },
    ],
  },
}

export default function Page() {
  return <LandingPage />
}
