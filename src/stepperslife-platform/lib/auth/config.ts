import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const ADMIN_EMAILS = ['iradwatkins@gmail.com', 'bobbygwatkins@gmail.com']

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: 'ADMIN' | 'USER' | 'EVENT_ORGANIZER' | 'VENDOR'
    }
  }

  interface User {
    role: 'ADMIN' | 'USER' | 'EVENT_ORGANIZER' | 'VENDOR'
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  // Allow account linking when email matches
  allowDangerousEmailAccountLinking: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentialsSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
              role: true,
            },
          })

          if (!user || !user.password) {
            return null
          }

          const isValidPassword = await bcrypt.compare(password, user.password)

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (account?.provider === 'google' && !existingUser) {
        const role = ADMIN_EMAILS.includes(user.email) ? 'ADMIN' : 'USER'

        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            role,
            emailVerified: new Date(),
          },
        })
      } else if (existingUser && ADMIN_EMAILS.includes(user.email)) {
        if (existingUser.role !== 'ADMIN') {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: 'ADMIN' },
          })
        }
      }

      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as 'ADMIN' | 'USER' | 'EVENT_ORGANIZER' | 'VENDOR'
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
      }

      if (trigger === 'update' && session?.user) {
        token.role = session.user.role
      }

      // Don't query database in Edge Runtime (middleware)
      // Role is set during initial login and updated via triggers

      return token
    },
  },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
})
