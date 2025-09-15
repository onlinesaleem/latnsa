// app/api/contact/route.ts - Contact form API
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  language: z.enum(['english', 'arabic']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = contactSchema.parse(body)
    const isArabic = validatedData.language === 'arabic'

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@latnsa.com'
    
    await sendEmail({
      to: adminEmail,
      subject: `Contact Form: ${validatedData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">New Contact Form Submission</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Contact Details</h3>
            <p><strong>Name:</strong> ${validatedData.name}</p>
            <p><strong>Email:</strong> ${validatedData.email}</p>
            <p><strong>Subject:</strong> ${validatedData.subject}</p>
            <p><strong>Language:</strong> ${isArabic ? 'Arabic' : 'English'}</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
            <h3>Message</h3>
            <p style="white-space: pre-line;">${validatedData.message}</p>
          </div>
          
          <div style="margin-top: 20px; font-size: 12px; color: #666;">
            Sent from Healthcare Assessment System - ${new Date().toLocaleString()}
          </div>
        </div>
      `
    })

    // Send confirmation email to user
    await sendEmail({
      to: validatedData.email,
      subject: isArabic ? 'تأكيد استلام رسالتك - لاتنسا الصحية' : 'Message Received - Latnsa Health',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${isArabic ? 'rtl' : 'ltr'};">
          <h2 style="color: #0ea5e9;">
            ${isArabic ? 'شكراً لتواصلك معنا' : 'Thank You for Contacting Us'}
          </h2>
          
          <p>
            ${isArabic ? `مرحباً ${validatedData.name},` : `Hello ${validatedData.name},`}
          </p>
          
          <p>
            ${isArabic 
              ? 'تم استلام رسالتك بنجاح. سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.'
              : 'We have successfully received your message. Our team will get back to you as soon as possible.'
            }
          </p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${isArabic ? 'ملخص رسالتك:' : 'Your Message Summary:'}</h3>
            <p><strong>${isArabic ? 'الموضوع:' : 'Subject:'}</strong> ${validatedData.subject}</p>
            <p><strong>${isArabic ? 'تاريخ الإرسال:' : 'Sent on:'}</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>
            ${isArabic 
              ? 'إذا كان لديك أي استفسارات إضافية، لا تتردد في التواصل معنا.'
              : 'If you have any additional questions, please don\'t hesitate to contact us.'
            }
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            ${isArabic ? 'نظام التقييم الصحي - لاتنسا' : 'Healthcare Assessment System - Latnsa'}
          </div>
        </div>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageAr: 'تم إرسال الرسالة بنجاح'
    })

  } catch (error) {
    console.error('Contact form API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to send message',
        errorAr: 'فشل في إرسال الرسالة'
      },
      { status: 500 }
    )
  }
}