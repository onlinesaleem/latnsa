'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail, Phone, MapPin, Clock, Send,
  MessageSquare, User, CheckCircle, Shield, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/MainLayout'

const contactSchema = z.object({
  name:    z.string().min(2,  'Name must be at least 2 characters'),
  email:   z.string().email('Please enter a valid email address'),
  subject: z.string().min(5,  'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
type ContactForm = z.infer<typeof contactSchema>

export default function ContactPage() {
  const { language } = useLanguage()
  const isArabic = language === 'arabic'

  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [honeypot,  setHoneypot]  = useState('')

  const formStartTimeRef    = useRef(Date.now())
  const mouseMoveCountRef   = useRef(0)
  const keystrokeCountRef   = useRef(0)
  const [mouseMoved, setMouseMoved] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  useEffect(() => {
    const mm = () => { mouseMoveCountRef.current++; if (mouseMoveCountRef.current > 5) setMouseMoved(true) }
    const kp = () => { keystrokeCountRef.current++ }
    window.addEventListener('mousemove', mm)
    window.addEventListener('keydown', kp)
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('keydown', kp) }
  }, [])

  const handleContactSubmit = async (data: ContactForm) => {
    const timeSpent = Date.now() - formStartTimeRef.current
    if (honeypot !== '') { toast.error('An error occurred. Please try again.'); return }
    if (timeSpent < 5000) { toast.error(isArabic ? 'يرجى أخذ وقتك في ملء النموذج' : 'Please take your time filling the form'); return }

    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data, language,
          _meta: { timeSpent, mouseMoved, keystrokes: keystrokeCountRef.current, timestamp: new Date().toISOString() },
        }),
      })
      const result = await response.json()
      if (response.ok) {
        setSubmitted(true)
        reset()
        toast.success(isArabic ? 'تم إرسال رسالتك بنجاح' : 'Message sent successfully')
      } else {
        toast.error(isArabic ? (result.errorAr || 'حدث خطأ أثناء الإرسال') : (result.error || 'Error sending message'))
      }
    } catch {
      toast.error(isArabic ? 'حدث خطأ أثناء الإرسال' : 'Error sending message')
    } finally {
      setLoading(false)
    }
  }

  const contactCards = [
    { icon: Phone,  titleEn: 'Phone',   titleAr: 'الهاتف',                detailEn: '+962 7 9699 8578',          detailAr: '٩٦٢ ٧ ٩٦٩٩ ٨٥٧٨+' },
    { icon: Mail,   titleEn: 'Email',   titleAr: 'البريد الإلكتروني',     detailEn: 'Info@latensa.com',          detailAr: 'Info@latensa.com' },
    { icon: MapPin, titleEn: 'Location',titleAr: 'الموقع',                detailEn: 'Riyadh, Saudi Arabia',      detailAr: 'الرياض، المملكة العربية السعودية' },
    { icon: Clock,  titleEn: 'Support', titleAr: 'الدعم',                 detailEn: '24 / 7 Online Support',    detailAr: 'دعم متاح على مدار الساعة' },
  ]

  /* ── Success State ── */
  if (submitted) {
    return (
      <div className={`min-h-screen bg-[#F7F2F4] flex items-center justify-center px-4 font-body ${isArabic ? 'rtl' : 'ltr'}`}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          .font-display { font-family: 'DM Serif Display', Georgia, serif; }
          .font-body    { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        `}</style>
        <div className="max-w-md w-full bg-white rounded-3xl p-12 text-center shadow-[0_4px_40px_rgba(163,23,85,0.08)] border border-[#A31755]/10">
          <div className="w-16 h-16 bg-[#E8F5EE] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#2E9E4F]" />
          </div>
          <h2 className={`font-display text-3xl text-gray-900 mb-3 ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic ? 'تم إرسال رسالتك!' : 'Message sent!'}
          </h2>
          <p className={`text-[15px] text-gray-500 leading-relaxed mb-8 ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic
              ? 'شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.'
              : 'Thank you for reaching out. Our team will get back to you as soon as possible.'}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-[#A31755] text-white font-semibold text-sm rounded-xl hover:bg-[#8B1248] transition-colors ${isArabic ? 'font-arabic' : ''}`}
          >
            {isArabic ? 'إرسال رسالة أخرى' : 'Send another message'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-white font-body ${isArabic ? 'rtl' : 'ltr'}`}>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'DM Serif Display', Georgia, serif; }
        .font-body    { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .anim-2 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .anim-3 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both; }

        .field-input {
          width: 100%;
          padding: 13px 16px;
          border: 1px solid #EDE8E3;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #1A1410;
          background: #FDFAF8;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .field-input:focus {
          border-color: #A31755;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(163,23,85,0.08);
        }
        .field-input-icon-l { padding-left: 44px; }
        .field-input-icon-r { padding-right: 44px; }
        .field-input::placeholder { color: #8C7E76; }

        .contact-card {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
        }
        .contact-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(163,23,85,0.08);
          border-color: rgba(163,23,85,0.2) !important;
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="relative bg-[#A31755] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-[-100px] -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.08]" />
          <div className="absolute top-1/2 right-[-40px] -translate-y-1/2 w-[260px] h-[260px] rounded-full border border-white/[0.11]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="anim-1">
            <span className={`inline-block bg-white/15 border border-white/25 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic ? 'تواصل معنا' : 'Contact Us'}
            </span>
          </div>
          <h1 className={`anim-2 font-display text-[42px] lg:text-[56px] text-white leading-[1.1] mb-5 ${isArabic ? 'font-arabic text-3xl lg:text-5xl' : ''}`}>
            {isArabic ? 'اتصل بنا' : <>We'd love<br />to hear from you</>}
          </h1>
          <p className={`anim-3 text-white/70 text-[16px] max-w-xl mx-auto leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic
              ? 'نحن هنا لمساعدتك. تواصل معنا للحصول على الدعم أو الإجابة على استفساراتك.'
              : "We're here to help you and your family. Reach out for support, questions, or anything you need."}
          </p>
        </div>
      </section>

      {/* ── Contact Cards ── */}
      <section className="bg-gray-50 py-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactCards.map((c, i) => {
              const Icon = c.icon
              return (
                <div
                  key={i}
                  className="contact-card bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center gap-3"
                >
                  <div className="w-11 h-11 bg-[#F9EEF3] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#A31755]" />
                  </div>
                  <div>
                    <p className={`text-[11px] font-semibold tracking-wider uppercase text-gray-400 mb-1 ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? c.titleAr : c.titleEn}
                    </p>
                    <p className={`text-[13.5px] font-medium text-gray-800 leading-snug ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? c.detailAr : c.detailEn}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left — info (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className={`font-display text-3xl lg:text-4xl text-gray-900 mb-4 leading-snug ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
                {isArabic ? 'معلومات التواصل' : <>Get in touch<br />with our team</>}
              </h2>
              <p className={`text-[15px] text-gray-500 leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic
                  ? 'يسعدنا تواصلك معنا. فريقنا متاح لمساعدتك في أي استفسار أو دعم تحتاجه.'
                  : "We'd love to hear from you. Our team is ready to help with any question, concern, or support you need."}
              </p>
            </div>

            {/* What to expect */}
            <div className="bg-[#F9EEF3] rounded-2xl p-7 border border-[#A31755]/10">
              <p className={`text-[12px] font-semibold tracking-wider uppercase text-[#A31755]/60 mb-5 ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic ? 'ما تتوقعه منا' : 'What to expect'}
              </p>
              <div className="space-y-4">
                {[
                  { en: 'Reply within 24 hours',          ar: 'رد خلال 24 ساعة' },
                  { en: 'Bilingual support (AR / EN)',     ar: 'دعم ثنائي اللغة (عربي / إنجليزي)' },
                  { en: 'Full confidentiality guaranteed', ar: 'سرية تامة مضمونة' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#2E9E4F] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className={`text-[14px] text-gray-700 ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? item.ar : item.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-3 p-4 bg-[#EBF0FB] border border-[#2B4DA8]/10 rounded-xl">
              <Shield className="w-5 h-5 text-[#2B4DA8] flex-shrink-0" />
              <p className={`text-[13px] text-[#2B4DA8] leading-snug ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic
                  ? 'جميع رسائلك محمية ومشفرة بشكل آمن.'
                  : 'All your messages are protected and securely encrypted.'}
              </p>
            </div>
          </div>

          {/* Right — form (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_40px_rgba(0,0,0,0.06)] overflow-hidden">

              {/* Form header strip */}
              <div className="bg-[#A31755] px-8 py-6">
                <h3 className={`font-display text-2xl text-white mb-1 ${isArabic ? 'font-arabic' : ''}`}>
                  {isArabic ? 'أرسل لنا رسالة' : 'Send us a message'}
                </h3>
                <p className={`text-white/65 text-[13.5px] ${isArabic ? 'font-arabic' : ''}`}>
                  {isArabic ? 'سنرد عليك في أقرب وقت ممكن.' : "We'll get back to you as soon as possible."}
                </p>
              </div>

              <form className="p-8 space-y-6" onSubmit={handleSubmit(handleContactSubmit)}>
                {/* Honeypot */}
                <div style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
                  <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
                </div>

                {/* Name */}
                <div>
                  <label className={`block text-[13px] font-semibold text-gray-700 mb-2 ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? 'الاسم الكامل' : 'Full name'} <span className="text-[#A31755]">*</span>
                  </label>
                  <div className="relative">
                    <User className={`absolute top-[13px] ${isArabic ? 'right-4' : 'left-4'} w-[18px] h-[18px] text-gray-400 pointer-events-none`} />
                    <input
                      {...register('name')}
                      className={`field-input ${isArabic ? 'field-input-icon-r text-right' : 'field-input-icon-l'}`}
                      placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && <p className="text-[#A31755] text-xs mt-1.5">{isArabic ? 'الاسم يجب أن يكون حرفين على الأقل' : errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-[13px] font-semibold text-gray-700 mb-2 ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? 'البريد الإلكتروني' : 'Email address'} <span className="text-[#A31755]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`absolute top-[13px] ${isArabic ? 'right-4' : 'left-4'} w-[18px] h-[18px] text-gray-400 pointer-events-none`} />
                    <input
                      {...register('email')}
                      type="email"
                      className={`field-input ${isArabic ? 'field-input-icon-r text-right' : 'field-input-icon-l'}`}
                      placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-[#A31755] text-xs mt-1.5">{isArabic ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : errors.email.message}</p>}
                </div>

                {/* Subject */}
                <div>
                  <label className={`block text-[13px] font-semibold text-gray-700 mb-2 ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? 'الموضوع' : 'Subject'} <span className="text-[#A31755]">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className={`absolute top-[13px] ${isArabic ? 'right-4' : 'left-4'} w-[18px] h-[18px] text-gray-400 pointer-events-none`} />
                    <input
                      {...register('subject')}
                      className={`field-input ${isArabic ? 'field-input-icon-r text-right' : 'field-input-icon-l'}`}
                      placeholder={isArabic ? 'موضوع الرسالة' : 'Message subject'}
                      autoComplete="off"
                    />
                  </div>
                  {errors.subject && <p className="text-[#A31755] text-xs mt-1.5">{isArabic ? 'الموضوع يجب أن يكون 5 أحرف على الأقل' : errors.subject.message}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className={`block text-[13px] font-semibold text-gray-700 mb-2 ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? 'الرسالة' : 'Message'} <span className="text-[#A31755]">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    className={`field-input resize-none ${isArabic ? 'text-right' : ''}`}
                    placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here…'}
                    autoComplete="off"
                  />
                  {errors.message && <p className="text-[#A31755] text-xs mt-1.5">{isArabic ? 'الرسالة يجب أن تكون 10 أحرف على الأقل' : errors.message.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full flex items-center justify-center gap-3
                    px-8 py-4 bg-[#A31755] hover:bg-[#8B1248]
                    text-white font-semibold text-[15px] rounded-xl
                    transition-all duration-200
                    disabled:opacity-60 disabled:cursor-not-allowed
                    ${isArabic ? 'font-arabic' : ''}
                  `}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {isArabic ? 'جاري الإرسال...' : 'Sending…'}
                    </>
                  ) : (
                    <>
                      <Send className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                      {isArabic ? 'إرسال الرسالة' : 'Send message'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className={`text-[13px] font-semibold tracking-widest uppercase text-gray-400 mb-4 ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic ? 'هل أنت جاهز؟' : 'Ready to begin?'}
          </p>
          <h2 className={`font-display text-3xl lg:text-4xl text-gray-900 mb-5 ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
            {isArabic ? 'ابدأ التقييم الآن' : 'Take the first step today'}
          </h2>
          <p className={`text-[15px] text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic
              ? 'لا تنسى معك في كل خطوة من رحلتك.'
              : 'LaTnsa is with you at every step — from the first question to a clear, compassionate care plan.'}
          </p>
          <Link
            href="/auth/register"
            className={`inline-flex items-center gap-2 px-8 py-4 bg-[#A31755] text-white font-bold text-[15px] rounded-xl hover:bg-[#8B1248] transition-all duration-200 shadow-lg ${isArabic ? 'font-arabic' : ''}`}
          >
            {isArabic ? 'ابدأ التقييم الآن' : 'Start Assessment Now'}
            <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  )
}