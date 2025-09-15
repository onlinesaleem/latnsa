// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
   attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    })

    console.log('Email sent successfully:', result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error) }
  }
}

// Email templates
export const emailTemplates = {
  // Assessment submission notification to client
  assessmentNotificationClient: (data: {
    registrantName: string
    assessmentId: string
    submittedAt: string
    formType: string
    subjectName?: string
  }) => ({
    subject: `New Assessment Submission - ${data.registrantName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">New Assessment Submission</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Submission Details</h3>
          <p><strong>Assessment ID:</strong> ${data.assessmentId}</p>
          <p><strong>Registrant:</strong> ${data.registrantName}</p>
          <p><strong>Form Type:</strong> ${data.formType}</p>
          ${data.subjectName ? `<p><strong>Subject:</strong> ${data.subjectName}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
        </div>
        
        <p>Please log in to the admin portal to review this submission.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
          Healthcare Assessment System - Latnsa
        </div>
      </div>
    `
  }),

  // Assessment submission notification to clinical team
  assessmentNotificationClinical: (data: {
    registrantName: string
    assessmentId: string
    submittedAt: string
    formType: string
    subjectName?: string
    priority?: string
  }) => ({
    subject: `Clinical Review Required - Assessment ${data.assessmentId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Clinical Review Required</h2>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <h3>Assessment Details</h3>
          <p><strong>Assessment ID:</strong> ${data.assessmentId}</p>
          <p><strong>Registrant:</strong> ${data.registrantName}</p>
          <p><strong>Form Type:</strong> ${data.formType}</p>
          ${data.subjectName ? `<p><strong>Subject:</strong> ${data.subjectName}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
          ${data.priority ? `<p><strong>Priority:</strong> <span style="color: #dc2626;">${data.priority}</span></p>` : ''}
        </div>
        
        <p>A new assessment has been submitted and requires clinical review.</p>
        <p>Please log in to the admin portal to review the responses and provide follow-up recommendations.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
          Healthcare Assessment System - Clinical Team
        </div>
      </div>
    `
  }),

  // Confirmation email to user
  assessmentConfirmation: (data: {
    registrantName: string
    assessmentId: string
    submittedAt: string
    language: 'english' | 'arabic'
  }) => {
    const isArabic = data.language === 'arabic'
    
    return {
      subject: isArabic ? 'تم استلام تقييمك الصحي' : 'Assessment Submission Confirmed',
      html: `
        <div style="font-family: ${isArabic ? 'Arial' : 'Arial'}, sans-serif; max-width: 600px; margin: 0 auto; direction: ${isArabic ? 'rtl' : 'ltr'};">
          <h2 style="color: #0ea5e9;">
            ${isArabic ? 'شكراً لك على إكمال التقييم الصحي' : 'Thank You for Completing Your Health Assessment'}
          </h2>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${isArabic ? 'تفاصيل التقييم' : 'Assessment Details'}</h3>
            <p><strong>${isArabic ? 'رقم التقييم:' : 'Assessment ID:'}</strong> ${data.assessmentId}</p>
            <p><strong>${isArabic ? 'الاسم:' : 'Name:'}</strong> ${data.registrantName}</p>
            <p><strong>${isArabic ? 'تاريخ الإرسال:' : 'Submitted:'}</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
          </div>
          
          <p>
            ${isArabic 
              ? 'تم استلام تقييمك الصحي بنجاح. سيقوم فريقنا الطبي بمراجعة إجاباتك والتواصل معك قريباً.'
              : 'Your health assessment has been successfully received. Our clinical team will review your responses and contact you soon.'
            }
          </p>
          
          <p>
            ${isArabic
              ? 'إذا كان لديك أي استفسارات، يرجى التواصل معنا.'
              : 'If you have any questions, please feel free to contact us.'
            }
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            ${isArabic ? 'نظام التقييم الصحي - لاتنسا' : 'Healthcare Assessment System - Latnsa'}
          </div>
        </div>
      `
    }
  }
}