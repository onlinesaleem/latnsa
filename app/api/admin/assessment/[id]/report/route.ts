// app/api/admin/assessment/[id]/report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PDFReportGenerator } from '@/lib/pdf-generator'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const reportRequestSchema = z.object({
  language: z.enum(['english', 'arabic']).default('english'),
  includeResponses: z.boolean().default(true),
  includeClinicalNotes: z.boolean().default(true),
  format: z.enum(['pdf', 'email']).default('pdf'),
  emailTo: z.string().email().optional()
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
    const options = reportRequestSchema.parse(body)

    // Get assessment with responses
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Generate PDF report
    const generator = new PDFReportGenerator(options.language)
    const pdfDoc = generator.generateAssessmentReport(assessment, options)
    
    if (options.format === 'email' && options.emailTo) {
      // Generate PDF as blob and send via email
     // const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'))
     const pdfBuffer = generator.getBuffer();
      const pdfBlob = generator.getBlob();
      const isArabic = options.language === 'arabic'
      const patientName = assessment.formType === 'PROXY' ? 
        assessment.subjectName : assessment.registrantName
      
      await sendEmail({
        to: options.emailTo,
        subject: isArabic ? 
          `تقرير التقييم الصحي - ${patientName}` :
          `Health Assessment Report - ${patientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${isArabic ? 'rtl' : 'ltr'};">
            <h2 style="color: #0ea5e9;">
              ${isArabic ? 'تقرير التقييم الصحي' : 'Health Assessment Report'}
            </h2>
            
            <p>
              ${isArabic ? 'تحية طيبة,' : 'Dear Colleague,'}
            </p>
            
            <p>
              ${isArabic 
                ? 'يرجى العثور على تقرير التقييم الصحي المرفق للمريض.'
                : 'Please find attached the health assessment report for the patient.'
              }
            </p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${isArabic ? 'تفاصيل التقرير' : 'Report Details'}</h3>
              <p><strong>${isArabic ? 'المريض:' : 'Patient:'}</strong> ${patientName}</p>
              <p><strong>${isArabic ? 'رقم التقييم:' : 'Assessment ID:'}</strong> ${assessment.id}</p>
              <p><strong>${isArabic ? 'تاريخ التقييم:' : 'Assessment Date:'}</strong> ${new Date(assessment.submittedAt).toLocaleDateString()}</p>
              <p><strong>${isArabic ? 'تاريخ التقرير:' : 'Report Generated:'}</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>
              ${isArabic 
                ? 'هذا التقرير سري ومخصص للاستخدام الطبي فقط.'
                : 'This report is confidential and intended for medical use only.'
              }
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
              ${isArabic ? 'نظام التقييم الصحي - لاتنسا' : 'Healthcare Assessment System - Latnsa'}
            </div>
          </div>
        `,
        attachments: [{
          filename: isArabic ? 
            `تقرير-التقييم-${assessment.id}.pdf` :
            `assessment-report-${assessment.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      })

      return NextResponse.json({
        success: true,
        message: 'Report sent via email successfully'
      })
    } else {
      // Return PDF as response
      const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'))
      
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="assessment-report-${assessment.id}.pdf"`
        }
      })
    }

  } catch (error) {
    console.error('Generate report API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
