'use client'

import React, { useState } from 'react'
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
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button' // ✅ use our custom button

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type ContactForm = z.infer<typeof contactSchema>

interface ContactPageProps {
  language?: 'english' | 'arabic'
}

export default function ContactPage({ language = 'english' }: ContactPageProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const isArabic = language === 'arabic'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema)
  })

  const contactInfo = [
    {
      icon: Phone,
      titleEn: 'Phone',
      titleAr: 'الهاتف',
      detailEn: '+966 11 234 5678',
      detailAr: '+966 11 234 5678'
    },
    {
      icon: Mail,
      titleEn: 'Email',
      titleAr: 'البريد الإلكتروني',
      detailEn: 'info@latnsa-health.com',
      detailAr: 'info@latnsa-health.com'
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
      detailAr: 'دعم متاح 24/7'
    }
  ]

  const handleContactSubmit = async (data: ContactForm) => {
    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, language })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitted(true)
        reset()
        toast.success(isArabic ? 'تم إرسال رسالتك بنجاح' : 'Message sent successfully')
      } else {
        toast.error(isArabic ? result.errorAr : result.error)
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء الإرسال' : 'Error sending message')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isArabic ? 'rtl' : 'ltr'}`}>
        <div className="max-w-md mx-auto text-center p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isArabic ? 'تم إرسال رسالتك!' : 'Message Sent!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isArabic
              ? 'شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.'
              : 'Thank you for contacting us. We will get back to you as soon as possible.'}
          </p>
          <Button
            variant="outline"
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
          <p className="text-xl max-w-3xl mx-auto text-blue-50 leading-relaxed">
            {isArabic
              ? 'نحن هنا لمساعدتك. تواصل معنا للحصول على الدعم أو الإجابة على استفساراتك.'
              : "We're here to help you. Contact us for support or any questions you may have."}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Info */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {isArabic ? 'معلومات التواصل' : 'Get in Touch'}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {isArabic
                ? 'يسعدنا تواصلك معنا. فريقنا متاح لمساعدتك في أي استفسار أو دعم تحتاجه.'
                : 'We\'d love to hear from you. Our team is available to help with any questions or support you need.'}
            </p>

            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#E76A6A]/20 to-[#85C3E0]/20 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#E76A6A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
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
          </div>

          {/* Right Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isArabic ? 'أرسل لنا رسالة' : 'Send us a Message'}
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit(handleContactSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                  <input
                    {...register('name')}
                    className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-[#85C3E0] focus:border-[#85C3E0]`}
                    placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-[#85C3E0] focus:border-[#85C3E0]`}
                    placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الموضوع' : 'Subject'}
                </label>
                <div className="relative">
                  <MessageSquare className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                  <input
                    {...register('subject')}
                    className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-[#85C3E0] focus:border-[#85C3E0]`}
                    placeholder={isArabic ? 'موضوع الرسالة' : 'Message subject'}
                  />
                </div>
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#85C3E0] focus:border-[#85C3E0]"
                  placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isArabic ? 'جاري الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
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
