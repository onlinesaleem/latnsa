// lib/sms.ts
// SMS Service - Will implement with Unifonic later

export interface SmsOptions {
  to: string
  message: string
}

export async function sendSms({ to, message }: SmsOptions) {
  // TODO: Implement Unifonic SMS service
  // For now, we'll just log the SMS (development only)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('=== SMS MESSAGE (DEV MODE) ===')
    console.log(`To: ${to}`)
    console.log(`Message: ${message}`)
    console.log('===============================')
    
    // Return success for development
    return { success: true, messageId: 'dev-' + Date.now() }
  }
  
  // Production implementation will be added later with Unifonic
  console.warn('SMS service not implemented yet. Configure Unifonic credentials.')
  return { success: false, error: 'SMS service not configured' }
}

// SMS Templates
export const smsTemplates = {
  otpVerification: (otp: string, language: 'english' | 'arabic') => {
    if (language === 'arabic') {
      return `رمز التحقق الخاص بك هو: ${otp}. صالح لمدة 10 دقائق.`
    }
    return `Your verification code is: ${otp}. Valid for 10 minutes.`
  }
}

/* 
TODO: Unifonic Implementation Guide
=====================================

1. Install axios for HTTP requests:
   npm install axios

2. Get Unifonic credentials:
   - Sign up at https://www.unifonic.com/
   - Get App SID and Sender ID
   - Add to .env.local:
     UNIFONIC_APP_SID="your_app_sid"
     UNIFONIC_SENDER_ID="your_sender_id"

3. Replace the sendSms function above with:

import axios from 'axios'

export async function sendSms({ to, message }: SmsOptions) {
  try {
    const response = await axios.post('https://el.cloud.unifonic.com/rest/SMS/messages', {
      AppSid: process.env.UNIFONIC_APP_SID,
      SenderID: process.env.UNIFONIC_SENDER_ID,
      Recipient: to,
      Body: message
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (response.data.success) {
      return { success: true, messageId: response.data.MessageID }
    } else {
      return { success: false, error: response.data.errorCode }
    }
  } catch (error) {
    console.error('Unifonic SMS error:', error)
    return { success: false, error: error.message }
  }
}

4. Test SMS functionality before production deployment
*/