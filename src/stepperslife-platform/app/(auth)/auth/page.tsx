import { Metadata } from 'next'
import { UnifiedAuthForm } from '@/components/auth/unified-auth-form'

export const metadata: Metadata = {
  title: 'Get Started | SteppersLife',
  description: 'Sign in or create your SteppersLife account',
}

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to SteppersLife</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account or create a new one to continue
          </p>
        </div>

        <UnifiedAuthForm />
      </div>
    </div>
  )
}
