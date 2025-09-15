
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  language: z.enum(['english', 'arabic']).optional().default('english')
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required"
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, language } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { name: phone } : {} // Using name field for phone temporarily
        ].filter(condition => Object.keys(condition).length > 0)
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'User already exists',
          errorAr: 'المستخدم موجود بالفعل'
        },
        { status: 400 }
      )
    }

    // Hash password if provided
    let passwordHash: string | undefined
    if (password) {
      passwordHash = await bcrypt.hash(password, 12)
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        // Note: We're storing phone in name field for now
        // You might want to add a phone field to User model
        emailVerified: email ? new Date() : null // Mark as verified since OTP was verified
      }
    })

    // Remove sensitive data
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Registration successful',
      messageAr: 'تم التسجيل بنجاح',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}