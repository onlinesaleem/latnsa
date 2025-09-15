
// app/api/admin/assessment/[id]/review/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { z } from 'zod'

const reviewSchema = z.object({
  reviewNotes: z.string().min(1, 'Review notes are required'),
  clinicalScore: z.string().optional(),
  recommendations: z.string().optional(),
  status: z.enum(['UNDER_REVIEW', 'COMPLETED'])
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // Update assessment with review
    const assessment = await prisma.assessment.update({
      where: { id: params.id },
      data: {
        reviewNotes: validatedData.reviewNotes,
        clinicalScore: validatedData.clinicalScore || null,
        recommendations: validatedData.recommendations || null,
        status: validatedData.status,
        isReviewed: true,
        reviewedBy: session.user.name || 'Clinical Staff',
        reviewedAt: new Date()
      }
    })

    // Send notification email to patient if assessment is completed
    if (validatedData.status === 'COMPLETED' && assessment.registrantEmail) {
      try {
        await sendEmail({
          to: assessment.registrantEmail,
          subject: 'Your Health Assessment Review is Complete',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0ea5e9;">Assessment Review Complete</h2>
              
              <p>Dear ${assessment.registrantName},</p>
              
              <p>Your health assessment has been reviewed by our clinical team.</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Assessment Details</h3>
                <p><strong>Assessment ID:</strong> ${assessment.id}</p>
                <p><strong>Reviewed by:</strong> ${session.user.name}</p>
                <p><strong>Review Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              ${validatedData.recommendations ? `
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>Recommendations</h3>
                  <p>${validatedData.recommendations}</p>
                </div>
              ` : ''}
              
              <p>If you have any questions about your assessment results, please don't hesitate to contact us.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
                Healthcare Assessment System - Latnsa
              </div>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send review completion email:', emailError)
        // Don't fail the review save if email fails
      }
    }

    // Create notification record
    await prisma.notification.create({
      data: {
        assessmentId: assessment.id,
        type: validatedData.status === 'COMPLETED' ? 'ASSESSMENT_REVIEWED' : 'SYSTEM',
        recipient: assessment.registrantEmail || 'unknown',
        subject: validatedData.status === 'COMPLETED' ? 'Assessment Review Complete' : 'Assessment Under Review',
        content: validatedData.reviewNotes,
        sent: !!assessment.registrantEmail,
        sentAt: assessment.registrantEmail ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      message: validatedData.status === 'COMPLETED' ? 'Assessment review completed' : 'Review saved successfully'
    })

  } catch (error) {
    console.error('Save review API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save review' },
      { status: 500 }
    )
  }
}