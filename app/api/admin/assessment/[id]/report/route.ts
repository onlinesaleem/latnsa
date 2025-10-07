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
  includeCharts: z.boolean().default(false),
  format: z.enum(['pdf', 'email']).default('pdf'),
  emailTo: z.string().email().optional()
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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
    const { id } = await context.params

    // Get assessment with all related data
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            fullName: true,
            email: true,
            phone: true,
            gender: true,
            dateOfBirth: true,
            address: true
          }
        },
        submitter: {
          select: {
            name: true,
            email: true
          }
        },
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
      // Generate PDF buffer and send via email
      const pdfBuffer = generator.getBuffer()
      const isArabic = options.language === 'arabic'
      
      // Use patient name (always available now)
      const patientName = assessment.patient.fullName
      const patientMRN = assessment.patient.mrn
      const assessmentNumber = assessment.assessmentNumber
      
      // Determine who submitted (for context)
      const submitterInfo = assessment.formType === 'PROXY' 
        ? `${isArabic ? 'عبر' : 'via'} ${assessment.proxyName} (${assessment.proxyRelationship})`
        : assessment.submitter?.name || assessment.patient.email || ''

      await sendEmail({
        to: options.emailTo,
        subject: isArabic ? 
          `تقرير التقييم الصحي - ${patientName} - ${assessmentNumber}` :
          `Health Assessment Report - ${patientName} - ${assessmentNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${isArabic ? 'rtl' : 'ltr'};">
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white;">
              <h2 style="margin: 0; font-size: 24px;">
                ${isArabic ? 'تقرير التقييم الصحي' : 'Health Assessment Report'}
              </h2>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">
                ${isArabic ? 'نظام التقييم الصحي - لاتنسا' : 'Healthcare Assessment System - Latnsa'}
              </p>
            </div>
            
            <div style="padding: 30px; background: white; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px;">
                ${isArabic ? 'تحية طيبة،' : 'Dear Colleague,'}
              </p>
              
              <p style="line-height: 1.6;">
                ${isArabic 
                  ? 'يرجى العثور على تقرير التقييم الصحي المرفق للمريض المذكور أدناه.'
                  : 'Please find attached the health assessment report for the patient mentioned below.'
                }
              </p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
                <h3 style="margin: 0 0 15px 0; color: #0369a1; font-size: 18px;">
                  ${isArabic ? 'تفاصيل التقرير' : 'Report Details'}
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">
                      ${isArabic ? 'اسم المريض:' : 'Patient Name:'}
                    </td>
                    <td style="padding: 8px 0; color: #1e293b;">
                      ${patientName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">
                      ${isArabic ? 'رقم السجل الطبي:' : 'Medical Record Number:'}
                    </td>
                    <td style="padding: 8px 0; color: #1e293b; font-family: monospace; font-weight: 600;">
                      ${patientMRN}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">
                      ${isArabic ? 'رقم التقييم:' : 'Assessment Number:'}
                    </td>
                    <td style="padding: 8px 0; color: #1e293b; font-family: monospace; font-weight: 600;">
                      ${assessmentNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">
                      ${isArabic ? 'نوع التقييم:' : 'Assessment Type:'}
                    </td>
                    <td style="padding: 8px 0; color: #1e293b;">
                      ${assessment.formType}
                      ${submitterInfo ? ` <span style="color: #64748b;">(${submitterInfo})</span>` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">
                      ${isArabic ? 'تاريخ التقديم:' : 'Submission Date:'}
                    </td>
                    <td style="padding: 8px 0; color: #1e293b;">
                      ${new Date(assessment.submittedAt || assessment.createdAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">
                      ${isArabic ? 'تاريخ إنشاء التقرير:' : 'Report Generated:'}
                    </td>
                    <td style="padding: 8px 0; color: #1e293b;">
                      ${new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">
                      ${isArabic ? 'الحالة:' : 'Status:'}
                    </td>
                    <td style="padding: 8px 0;">
                      <span style="background: ${assessment.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7'}; color: ${assessment.status === 'COMPLETED' ? '#166534' : '#854d0e'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${assessment.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                  ${assessment.priority !== 'NORMAL' ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">
                      ${isArabic ? 'الأولوية:' : 'Priority:'}
                    </td>
                    <td style="padding: 8px 0;">
                      <span style="background: ${assessment.priority === 'URGENT' ? '#fee2e2' : '#fed7aa'}; color: ${assessment.priority === 'URGENT' ? '#991b1b' : '#9a3412'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${assessment.priority}
                      </span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>${isArabic ? '⚠️ تنبيه:' : '⚠️ Notice:'}</strong>
                  ${isArabic 
                    ? 'هذا التقرير سري ومخصص للاستخدام الطبي فقط. يرجى التعامل معه وفقاً لسياسات الخصوصية والامتثال الطبي.'
                    : 'This report is confidential and intended for medical use only. Please handle according to privacy and medical compliance policies.'
                  }
                </p>
              </div>
              
              ${assessment.reviewedBy ? `
              <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #166534;">
                  <strong>${isArabic ? '✓ تمت المراجعة:' : '✓ Reviewed:'}</strong>
                  ${isArabic 
                    ? `تمت المراجعة السريرية في ${new Date(assessment.reviewedAt || '').toLocaleDateString('ar-SA')}`
                    : `Clinical review completed on ${new Date(assessment.reviewedAt || '').toLocaleDateString('en-US')}`
                  }
                </p>
              </div>
              ` : ''}
              
              <p style="margin-top: 25px; line-height: 1.6;">
                ${isArabic 
                  ? 'إذا كان لديك أي استفسارات بخصوص هذا التقرير، يرجى التواصل مع الفريق الطبي.'
                  : 'If you have any questions regarding this report, please contact the clinical team.'
                }
              </p>
              
              <p style="color: #64748b; margin-top: 25px;">
                ${isArabic ? 'مع أطيب التحيات،' : 'Best regards,'}<br>
                ${isArabic ? 'الفريق الطبي' : 'Clinical Team'}
              </p>
            </div>
            
            <div style="margin-top: 20px; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">
                ${isArabic ? 'نظام التقييم الصحي - لاتنسا' : 'Healthcare Assessment System - Latnsa'}
              </p>
              <p style="margin: 5px 0 0 0;">
                ${isArabic ? 'هذا البريد الإلكتروني تم إنشاؤه تلقائياً' : 'This email was automatically generated'}
              </p>
            </div>
          </div>
        `,
        attachments: [{
          filename: isArabic ? 
            `تقرير-تقييم-${assessmentNumber}.pdf` :
            `assessment-report-${assessmentNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      })

      return NextResponse.json({
        success: true,
        message: options.language === 'arabic' 
          ? 'تم إرسال التقرير عبر البريد الإلكتروني بنجاح'
          : 'Report sent via email successfully',
        assessmentNumber,
        patientMRN
      })
    } else {
      // Return PDF as download
       const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'))
      const filename = options.language === 'arabic'
        ? `تقرير-تقييم-${assessment.assessmentNumber}.pdf`
        : `assessment-report-${assessment.assessmentNumber}.pdf`
      
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`
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
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}