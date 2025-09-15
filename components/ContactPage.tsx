
// components/ContactPage.tsx
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
              : 'Thank you for contacting us. We will get back to you as soon as possible.'
            }
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isArabic ? 'إرسال رسالة أخرى' : 'Send Another Message'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {isArabic ? 'اتصل بنا' : 'Contact Us'}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {isArabic 
                ? 'نحن هنا لمساعدتك. تواصل معنا للحصول على الدعم أو الإجابة على استفساراتك'
                : 'We\'re here to help you. Contact us for support or to answer any questions you may have'
              }
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {isArabic ? 'معلومات التواصل' : 'Get in Touch'}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {isArabic 
                  ? 'يسعدنا تواصلك معنا. فريقنا متاح لمساعدتك في أي استفسار أو دعم تحتاجه.'
                  : 'We\'d love to hear from you. Our team is available to help with any questions or support you need.'
                }
              </p>

              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
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

              {/* FAQ Section */}
              <div className="mt-12 p-6 bg-blue-50 rounded-2xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {isArabic ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {isArabic ? 'كم يستغرق التقييم؟' : 'How long does the assessment take?'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {isArabic ? 'عادة ما يستغرق 15-20 دقيقة' : 'Typically takes 15-20 minutes'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {isArabic ? 'هل التقييم مجاني؟' : 'Is the assessment free?'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {isArabic ? 'نعم، التقييم الأولي مجاني' : 'Yes, the initial assessment is free'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isArabic ? 'أرسل لنا رسالة' : 'Send us a Message'}
                </h2>
                <p className="text-gray-600">
                  {isArabic ? 'املأ النموذج وسنتواصل معك قريباً' : 'Fill out the form and we\'ll get back to you soon'}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                    <input
                      {...register('name')}
                      type="text"
                      className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
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
                      className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'الموضوع' : 'Subject'}
                  </label>
                  <div className="relative">
                    <MessageSquare className={`absolute top-2.5 ${isArabic ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                    <input
                      {...register('subject')}
                      type="text"
                      className={`w-full ${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      placeholder={isArabic ? 'موضوع الرسالة' : 'Message subject'}
                    />
                  </div>
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>

                <button
                  onClick={handleSubmit(handleContactSubmit)}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}