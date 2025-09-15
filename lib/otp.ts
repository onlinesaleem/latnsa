// lib/otp.ts
import { prisma } from './prisma'
import { sendEmail } from './email'
import { sendSms, smsTemplates } from './sms'
import { OtpType } from '@prisma/client'

export interface OtpRequest {
  identifier: string // email or phone
  type: OtpType
  name?: string // for personalization
  language?: 'english' | 'arabic'
}

export interface OtpVerification {
  identifier: string
  otp: string
  type: OtpType
}

// Generate 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Check if identifier is email or phone
function detectIdentifierType(identifier: string): OtpType {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^(\+966|966|0)?[0-9]{8,9}$/
  
  if (emailRegex.test(identifier)) {
    return OtpType.EMAIL
  } else if (phoneRegex.test(identifier)) {
    return OtpType.SMS
  } else {
    throw new Error('Invalid identifier format')
  }
}

// Send OTP
export async function sendOtp({ identifier, type, name, language = 'english' }: OtpRequest) {
  try {
    // Clean up expired OTPs first
    await prisma.otpVerification.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })

    // Check rate limiting (max 3 attempts per hour)
    const recentAttempts = await prisma.otpVerification.count({
      where: {
        identifier,
        createdAt: {
          gt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      }
    })

    if (recentAttempts >= 3) {
      return { 
        success: false, 
        error: 'Too many OTP requests. Please try again later.',
        errorAr: 'تم إرسال عدد كبير من الرموز. يرجى المحاولة لاحقاً.'
      }
    }

    // Auto-detect type if not provided
    if (!type) {
      type = detectIdentifierType(identifier)
    }

    // Generate OTP
    const otp = generateOtp()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP to database
    await prisma.otpVerification.create({
      data: {
        identifier,
        otp,
        expires,
        type,
        verified: false,
        attempts: 0
      }
    })

    // Send OTP based on type
    let sendResult: any

    if (type === OtpType.EMAIL) {
      const emailTemplate = getEmailOtpTemplate(otp, name, language)
      sendResult = await sendEmail({
        to: identifier,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      })
    } else if (type === OtpType.SMS) {
      const smsMessage = smsTemplates.otpVerification(otp, language)
      sendResult = await sendSms({
        to: identifier,
        message: smsMessage
      })
    }

    if (!sendResult.success) {
      // Delete the OTP record if sending failed
      await prisma.otpVerification.deleteMany({
        where: { identifier, otp }
      })
      
      return {
        success: false,
        error: `Failed to send OTP via ${type.toLowerCase()}`,
        details: sendResult.error
      }
    }

    return {
      success: true,
      message: `OTP sent successfully to ${type === OtpType.EMAIL ? 'email' : 'phone'}`,
      messageAr: `تم إرسال رمز التحقق بنجاح ${type === OtpType.EMAIL ? 'للبريد الإلكتروني' : 'للهاتف'}`,
      expiresIn: 10 * 60 // seconds
    }

  } catch (error) {
    console.error('Send OTP error:', error)
    return {
      success: false,
      error: 'Failed to send OTP',
      details: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
    }
  }
}

// Verify OTP
export async function verifyOtp({ identifier, otp, type }: OtpVerification) {
  try {
    // Find the OTP record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        identifier,
        type,
        verified: false,
        expires: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!otpRecord) {
      return {
        success: false,
        error: 'Invalid or expired OTP',
        errorAr: 'رمز التحقق غير صحيح أو منتهي الصلاحية'
      }
    }

    // Check attempt limit (max 5 attempts)
    if (otpRecord.attempts >= 5) {
      await prisma.otpVerification.delete({
        where: { id: otpRecord.id }
      })
      
      return {
        success: false,
        error: 'Too many failed attempts. Please request a new OTP.',
        errorAr: 'محاولات كثيرة خاطئة. يرجى طلب رمز تحقق جديد.'
      }
    }

    // Increment attempts
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: {
        attempts: otpRecord.attempts + 1
      }
    })

    // Check OTP match
    if (otpRecord.otp !== otp) {
      return {
        success: false,
        error: 'Invalid OTP',
        errorAr: 'رمز التحقق غير صحيح',
        attemptsLeft: 5 - (otpRecord.attempts + 1)
      }
    }

    // Mark as verified and clean up
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: {
        verified: true
      }
    })

    // Clean up other OTPs for this identifier
    await prisma.otpVerification.deleteMany({
      where: {
        identifier,
        id: { not: otpRecord.id }
      }
    })

    return {
      success: true,
      message: 'OTP verified successfully',
      messageAr: 'تم التحقق من الرمز بنجاح'
    }

  } catch (error) {
    console.error('Verify OTP error:', error)
    return {
      success: false,
      error: 'Failed to verify OTP',
      details: error.message
    }
  }
}

// Email template for OTP
function getEmailOtpTemplate(otp: string, name?: string, language: 'english' | 'arabic' = 'english') {
  const isArabic = language === 'arabic'
  
  return {
    subject: isArabic ? 'رمز التحقق الخاص بك' : 'Your Verification Code',
    html: `
      <div style="font-family: ${isArabic ? 'Arial' : 'Arial'}, sans-serif; max-width: 600px; margin: 0 auto; direction: ${isArabic ? 'rtl' : 'ltr'};">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">
            ${isArabic ? 'رمز التحقق' : 'Verification Code'}
          </h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          ${name ? `<p>${isArabic ? `مرحباً ${name}،` : `Hello ${name},`}</p>` : ''}
          
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            ${isArabic 
              ? 'استخدم الرمز التالي لتأكيد هويتك:'
              : 'Please use the following code to verify your identity:'
            }
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #0ea5e9; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>${isArabic ? '⏰ مهم:' : '⏰ Important:'}</strong>
              ${isArabic 
                ? 'هذا الرمز صالح لمدة 10 دقائق فقط ولا تشاركه مع أحد.'
                : 'This code is valid for 10 minutes only and should not be shared with anyone.'
              }
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            ${isArabic 
              ? 'إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.'
              : 'If you did not request this code, please ignore this email.'
            }
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          ${isArabic ? 'نظام التقييم الصحي - لاتنسا' : 'Healthcare Assessment System - Latnsa'}
        </div>
      </div>
    `
  }
}

// Clean up expired OTPs (run periodically)
export async function cleanupExpiredOtps() {
  try {
    const result = await prisma.otpVerification.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    
    console.log(`Cleaned up ${result.count} expired OTPs`)
    return result.count
  } catch (error) {
    console.error('Cleanup OTPs error:', error)
    return 0
  }
}