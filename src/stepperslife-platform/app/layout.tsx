import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { FeatureProvider } from '@/lib/features'
import { getEnabledFeatures, getUserPreferences } from '@/lib/features/server'
import { getCurrentUser } from '@/lib/auth'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SteppersLife - Events & Marketplace',
  description: 'Discover events, shop products, and connect with the SteppersLife community',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const enabledFeatures = await getEnabledFeatures()
  const userPreferences = user ? await getUserPreferences(user.id) : null

  const enabledFeatureNames = enabledFeatures.map((f) => f.name) as ('events' | 'store' | 'blog')[]

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <FeatureProvider
            initialFeatures={enabledFeatureNames}
            userPreferences={userPreferences ?? undefined}
          >
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
          </FeatureProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
