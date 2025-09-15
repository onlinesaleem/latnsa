// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendOtp } from '@/lib/otp'
import { z } from 'zod'

const sendOtpSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  name: z.string().optional(),
  language: z.enum(['english', 'arabic']).optional().default('english'),
  type: z.enum(['EMAIL', 'SMS']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, name, language, type } = sendOtpSchema.parse(body)

    if (!type) {
  return NextResponse.json(
    { error: "Missing OTP type" },
    { status: 400 }
  )
}
    const result = await sendOtp({
      identifier,
      type,
      name,
      language
    })

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          errorAr: result.errorAr,
          details: result.details 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message,
      messageAr: result.messageAr,
      expiresIn: result.expiresIn
    })

  } catch (error) {
    console.error('Send OTP API error:', error)
    
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