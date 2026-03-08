'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  User,
  CheckCircle,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/MainLayout'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type ContactForm = z.infer<typeof contactSchema>

interface ContactInfo {
  icon: React.ComponentType<{ className?: string }>
  titleEn: string
  titleAr: string
  detailEn: string
  detailAr: string
}

export default function ContactPage() {
  const { language } = useLanguage()
  const isArabic = language === 'arabic'
  
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // Security Layer 1: Honeypot
  const [honeypot, setHoneypot] = useState('')
  
  // Security Layer 2: Time-based
  const formStartTimeRef = useRef(Date.now())
  
  // Security Layer 3: Mouse movement
  const [mouseMoved, setMouseMoved] = useState(false)
  const mouseMoveCountRef = useRef(0)
  
  // Security Layer 4: Keyboard interaction
  const keystrokeCountRef = useRef(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema)
  })

  const contactInfo: ContactInfo[] = [
    {
      icon: Phone,
      titleEn: 'Phone',
      titleAr: 'الهاتف',
      detailEn: '+966 11 234 5678',
      detailAr: '٠١١ ٢٣٤ ٥٦٧٨ ٩٦٦+'
    },
    {
      icon: Mail,
      titleEn: 'Email',
      titleAr: 'البريد الإلكتروني',
      detailEn: 'info@latnsa.com',
      detailAr: 'info@latnsa.com'
    },
    {
      icon: MapPin,
      titleEn: 'Address',
      titleAr: 'العنوان',
      detailEn: 'Riyadh, Saudi Arabia',
      detailAr: 'الرياض، المملكة العربية السعودية'
    },
    {
      icon: Clock,
      titleEn: 'Hours',
      titleAr: 'ساعات العمل',
      detailEn: '24/7 Online Support',
      detailAr: 'دعم متاح على مدار الساعة'
    }
  ]

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = () => {
      mouseMoveCountRef.current++
      if (mouseMoveCountRef.current > 5) {
        setMouseMoved(true)
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Track keyboard events
  useEffect(() => {
    const handleKeyPress = () => {
      keystrokeCountRef.current++
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleContactSubmit = async (data: ContactForm) => {
    const timeSpent = Date.now() - formStartTimeRef.current
    
    // Security Check 1: Honeypot
    if (honeypot !== '') {
      console.log('🚫 Bot detected: honeypot filled')
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.error(isArabic ? 'حدث خطأ. يرجى المحاولة مرة أخرى لاحقاً.' : 'An error occurred. Please try again later.')
      return
    }

    // Security Check 2: Time-based (lenient for elderly users)
    if (timeSpent < 5000) {
      console.log('🚫 Bot detected: too fast', timeSpent, 'ms')
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.error(isArabic ? 'يرجى أخذ وقتك في ملء النموذج' : 'Please take your time filling the form')
      return
    }

    // Security Check 3: Pattern detection (logging only, not blocking)
    if (!mouseMoved && timeSpent < 30000) {
      console.log('⚠️ Suspicious: no mouse movement detected')
    }

    if (keystrokeCountRef.current < 10 && timeSpent < 15000) {
      console.log('⚠️ Suspicious: very few keystrokes', keystrokeCountRef.current)
    }

    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          language,
          _meta: {
            timeSpent,
            mouseMoved,
            keystrokes: keystrokeCountRef.current,
            timestamp: new Date().toISOString()
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitted(true)
        reset()
        toast.success(isArabic ? 'تم إرسال رسالتك بنجاح' : 'Message sent successfully')
      } else {
        toast.error(isArabic ? (result.errorAr || 'حدث خطأ أثناء الإرسال') : (result.error || 'Error sending message'))
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء الإرسال' : 'Error sending message')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isArabic ? 'rtl' : 'ltr'}`}>
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isArabic ? 'تم إرسال رسالتك!' : 'Message Sent!'}
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {isArabic
              ? 'شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.'
              : 'Thank you for contacting us. We will get back to you as soon as possible.'}
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setSubmitted(false)}
          >
            {isArabic ? 'إرسال رسالة أخرى' : 'Send Another Message'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#E76A6A] to-[#85C3E0] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            {isArabic ? 'اتصل بنا' : 'Contact Us'}
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-white/90 leading-relaxed">
            {isArabic
              ? 'نحن هنا لمساعدتك. تواصل معنا للحصول على الدعم أو الإجابة على استفساراتك.'
              : "We're here to help you. Contact us for support or any questions you may have."}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isArabic ? 'معلومات التواصل' : 'Get in Touch'}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {isArabic
                  ? 'يسعدنا تواصلك معنا. فريقنا متاح لمساعدتك في أي استفسار أو دعم تحتاجه.'
                  : 'We\'d love to hear from you. Our team is available to help with any questions or support you need.'}
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-[#85C3E0]/40 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-[#E76A6A]/10 to-[#85C3E0]/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#E76A6A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {isArabic ? info.titleAr : info.titleEn}
                      </h3>
                      <p className="text-gray-600">
                        {isArabic ? info.detailAr : info.detailEn}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Security Info */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <Shield className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm text-blue-900">
                {isArabic
                  ? 'جميع رسائلك محمية ومشفرة بشكل آمن.'
                  : 'All your messages are protected and securely encrypted.'}
              </p>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isArabic ? 'أرسل لنا رسالة' : 'Send us a Message'}
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit(handleContactSubmit)}>
              
              {/* Honeypot Field - Hidden from users */}
              <div 
                style={{ 
                  position: 'absolute', 
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden'
                }} 
                aria-hidden="true"
              >
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                  <input
                    {...register('name')}
                    className={`w-full ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85C3E0] focus:border-transparent transition-all`}
                    placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {isArabic ? 'الاسم يجب أن يكون حرفين على الأقل' : errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85C3E0] focus:border-transparent transition-all`}
                    placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {isArabic ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الموضوع' : 'Subject'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                  <input
                    {...register('subject')}
                    className={`w-full ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85C3E0] focus:border-transparent transition-all`}
                    placeholder={isArabic ? 'موضوع الرسالة' : 'Message subject'}
                    autoComplete="off"
                  />
                </div>
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {isArabic ? 'الموضوع يجب أن يكون 5 أحرف على الأقل' : errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الرسالة' : 'Message'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('message')}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85C3E0] focus:border-transparent transition-all resize-none"
                  placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  autoComplete="off"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {isArabic ? 'الرسالة يجب أن تكون 10 أحرف على الأقل' : errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] hover:from-[#d85858] hover:to-[#6ebfe6]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isArabic ? 'جاري الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className={`w-5 h-5 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                    {isArabic ? 'إرسال الرسالة' : 'Send Message'}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
