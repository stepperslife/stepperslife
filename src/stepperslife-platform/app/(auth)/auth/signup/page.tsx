import { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign Up | SteppersLife',
  description: 'Create your SteppersLife account',
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join SteppersLife to get started
          </p>
        </div>

        <SignUpForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
