'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import {
  Brain, Heart, Shield, CheckCircle,
  Target, Eye, Clock, Users, Lock, ArrowRight
} from 'lucide-react'
import { useLanguage } from '@/components/MainLayout'

export default function AboutPage() {
  const { language } = useLanguage()
  const isArabic = language === 'arabic'

  const whatSetsUsApart = [
    {
      icon: Brain,
      titleEn: 'Advanced Memory Assessments',
      titleAr: 'تقييمات متقدمة للذاكرة',
      descEn: 'Clinically validated tools built on the latest cognitive science research.',
      descAr: 'أدوات معتمدة طبياً مبنية على أحدث أبحاث علم الإدراك.',
    },
    {
      icon: Users,
      titleEn: 'Expert Saudi Consultants',
      titleAr: 'استشاريون سعوديون متخصصون',
      descEn: 'Specialists who understand your culture, language, and family dynamics.',
      descAr: 'متخصصون يفهمون ثقافتك ولغتك وديناميكيات عائلتك.',
    },
    {
      icon: Shield,
      titleEn: 'Secure & Confidential',
      titleAr: 'آمن وسري تماماً',
      descEn: 'Your health information is protected with the highest privacy standards.',
      descAr: 'معلوماتك الصحية محمية بأعلى معايير الخصوصية.',
    },
    {
      icon: Clock,
      titleEn: 'Care From Home',
      titleAr: 'رعاية من المنزل',
      descEn: 'Flexible virtual appointments that fit your family\'s schedule.',
      descAr: 'مواعيد افتراضية مرنة تناسب جدول عائلتك.',
    },
  ]

  const values = [
    {
      icon: CheckCircle,
      color: '#A31755',
      bgColor: '#F9EEF3',
      titleEn: 'Accuracy',
      titleAr: 'الدقة',
      descEn: 'Every insight we provide is grounded in rigorous medical evidence.',
      descAr: 'كل رؤية نقدمها مبنية على أدلة طبية صارمة.',
    },
    {
      icon: Heart,
      color: '#2B4DA8',
      bgColor: '#EBF0FB',
      titleEn: 'Compassion',
      titleAr: 'التعاطف',
      descEn: 'We begin every relationship by listening — before we ever diagnose.',
      descAr: 'نبدأ كل علاقة بالاستماع — قبل أي تشخيص.',
    },
    {
      icon: Lock,
      color: '#2E9E4F',
      bgColor: '#E8F5EE',
      titleEn: 'Trust',
      titleAr: 'الثقة',
      descEn: 'Complete transparency and privacy at every step of your journey.',
      descAr: 'شفافية تامة وخصوصية كاملة في كل خطوة من رحلتك.',
    },
  ]

  return (
    <div className={`min-h-screen bg-white ${isArabic ? 'rtl' : 'ltr'}`}>

      {/* ── Google Fonts ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'DM Serif Display', Georgia, serif; }
        .font-body    { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .anim-2 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .anim-3 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .anim-4 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both; }

        .card-lift {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.3s cubic-bezier(0.16,1,0.3,1),
                      border-color 0.3s ease;
        }
        .card-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(163,23,85,0.10);
          border-color: rgba(163,23,85,0.2) !important;
        }

        .icon-ring {
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .card-lift:hover .icon-ring {
          background: #A31755 !important;
          transform: scale(1.08);
        }
        .card-lift:hover .icon-ring svg {
          color: white !important;
        }
      `}</style>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative bg-[#F7F2F4] overflow-hidden font-body">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(163,23,85,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Soft bleed */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#A31755]/[0.05] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">

          {/* Logo badge */}
          <div className="anim-1 flex justify-center mb-10">
            <div className="bg-white rounded-2xl px-8 py-5 shadow-[0_2px_20px_rgba(163,23,85,0.12)] border border-[#A31755]/10 inline-flex items-center justify-center">
              <div className="relative w-[140px] h-[56px]">
                <Image src="/logo.png" alt="LaTnsa" fill className="object-contain" priority />
              </div>
            </div>
          </div>

          <div className="anim-2">
            <span className={`inline-block bg-[#A31755]/10 text-[#A31755] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 font-body ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic ? 'من نحن' : 'About Us'}
            </span>
            <h1 className={`font-display text-[44px] lg:text-[58px] text-gray-900 leading-[1.1] mb-6 ${isArabic ? 'font-arabic text-4xl lg:text-5xl' : ''}`}>
              {isArabic ? 'عن لا تنسى' : (
                <>
                  Redefining memory care<br />
                  <span className="italic text-[#A31755]">with humanity first</span>
                </>
              )}
            </h1>
          </div>

          <div className={`anim-3 max-w-2xl mx-auto space-y-4 ${isArabic ? 'font-arabic' : 'font-body'}`}>
            <p className="text-[17px] text-gray-700 leading-relaxed">
              {isArabic
                ? 'لا تنسى هي منصة صحية رقمية متخصصة في دعم الأفراد الذين يواجهون اضطرابات في الذاكرة والإدراك.'
                : 'LaTnsa is a digital health platform dedicated to supporting individuals experiencing memory and cognitive changes — and the families who love them.'}
            </p>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              {isArabic
                ? 'نقدم تقييمات متقدمة واستشارات طبية متخصصة تساعد العائلات على فهم الحالة واتخاذ الخطوات الصحيحة في الوقت المناسب.'
                : 'Through advanced assessments, expert consultations, and compassionate care, we help families understand cognitive health and take the right steps at the right time.'}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          VISION & MISSION
      ══════════════════════════════════════ */}
      <section className="py-24 bg-white font-body">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Vision */}
            <div className="card-lift group bg-[#F9EEF3] border border-[#A31755]/10 rounded-3xl p-10 lg:p-12">
              <div className="icon-ring w-14 h-14 bg-[#A31755] rounded-2xl flex items-center justify-center mb-8">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className={`text-xs font-semibold tracking-widest uppercase text-[#A31755]/60 mb-3 ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic ? 'الرؤية' : 'Vision'}
              </div>
              <h2 className={`font-display text-3xl lg:text-4xl text-gray-900 leading-snug mb-5 ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
                {isArabic
                  ? 'أن نكون جهة رائدة وموثوقة في صحة الذاكرة'
                  : <>The trusted leader<br />in memory health</>}
              </h2>
              <p className={`text-[15px] text-gray-600 leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic
                  ? 'أن نكون جهة رائدة وموثوقة في صحة أمراض الذاكرة والإدراك، تساهم في الكشف المبكر وتحسين جودة الحياة.'
                  : 'To become a trusted leader in memory and cognitive health, enabling earlier detection, better outcomes, and improved quality of life across the Kingdom and beyond.'}
              </p>
            </div>

            {/* Mission */}
            <div className="card-lift group bg-[#EBF0FB] border border-[#2B4DA8]/10 rounded-3xl p-10 lg:p-12"
              style={{ '--hover-color': '#2B4DA8' } as React.CSSProperties}
            >
              <div className="w-14 h-14 bg-[#2B4DA8] rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className={`text-xs font-semibold tracking-widest uppercase text-[#2B4DA8]/60 mb-3 ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic ? 'الرسالة' : 'Mission'}
              </div>
              <h2 className={`font-display text-3xl lg:text-4xl text-gray-900 leading-snug mb-5 ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
                {isArabic
                  ? 'رعاية في متناول كل عائلة'
                  : <>Care that reaches<br />every family</>}
              </h2>
              <p className={`text-[15px] text-gray-600 leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic
                  ? 'توفير تقييم اضطرابات الذاكرة بشكل متقدم وسهل الوصول عبر التكنولوجيا الحديثة والخبرة الطبية، لدعم المرضى وعائلاتهم في كل خطوة.'
                  : 'To make memory and cognitive assessment accessible through innovative technology, expert medical care, and compassionate human support — for every patient and every family.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHAT SETS US APART
      ══════════════════════════════════════ */}
      <section className="py-24 bg-gray-50 font-body">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className={`inline-block bg-[#A31755]/10 text-[#A31755] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5 ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic ? 'ما يميزنا' : 'What Sets Us Apart'}
            </span>
            <h2 className={`font-display text-3xl lg:text-[42px] text-gray-900 ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
              {isArabic ? 'ما الذي يميزنا' : 'Why families choose LaTnsa'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {whatSetsUsApart.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  className="card-lift group bg-white rounded-2xl p-7 border border-gray-100"
                >
                  <div className="icon-ring w-12 h-12 bg-[#F9EEF3] rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#A31755]" />
                  </div>
                  <h3 className={`text-[15px] font-semibold text-gray-900 mb-2 leading-snug ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? item.titleAr : item.titleEn}
                  </h3>
                  <p className={`text-[13.5px] text-gray-500 leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? item.descAr : item.descEn}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          VALUES — Full-width editorial strip
      ══════════════════════════════════════ */}
      <section className="py-24 bg-white font-body">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-display text-3xl lg:text-[42px] text-gray-900 mb-4 ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
              {isArabic ? 'قيمنا' : 'Our values'}
            </h2>
            <p className={`text-[16px] text-gray-500 max-w-xl mx-auto ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic
                ? 'القيم التي توجه عملنا وتحدد التزامنا تجاه مرضانا'
                : 'The principles that shape every interaction, every assessment, every moment of care.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div
                  key={i}
                  className="card-lift group relative bg-white rounded-3xl p-10 border border-gray-100 text-center overflow-hidden"
                >
                  {/* Soft tinted corner blob */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-30"
                    style={{ background: v.bgColor }}
                  />
                  <div
                    className="icon-ring w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300"
                    style={{ background: v.bgColor }}
                  >
                    <Icon className="w-7 h-7 transition-colors duration-300" style={{ color: v.color }} />
                  </div>
                  <h3 className={`font-display text-2xl text-gray-900 mb-3 ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? v.titleAr : v.titleEn}
                  </h3>
                  <p className={`text-[14.5px] text-gray-500 leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? v.descAr : v.descEn}
                  </p>
                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full transition-all duration-300 group-hover:w-24"
                    style={{ background: v.color }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="relative bg-[#A31755] py-24 overflow-hidden font-body">
        {/* Rings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.05]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-white/[0.07]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/[0.10]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className={`font-display text-4xl lg:text-5xl text-white mb-5 ${isArabic ? 'font-arabic text-3xl lg:text-4xl' : ''}`}>
            {isArabic ? 'ابدأ رحلتك معنا اليوم' : <>Start your journey<br />with us today</>}
          </h2>
          <p className={`text-white/70 text-[16px] mb-10 max-w-xl mx-auto leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic
              ? 'نحن هنا لدعمك ودعم عائلتك في كل خطوة من هذه الرحلة.'
              : "We are here to support you and your family at every step — from the very first question to the clearest care plan."}
          </p>
          <Link
            href="/auth/register"
            className={`inline-flex items-center gap-3 px-9 py-4 bg-white text-[#A31755] font-bold text-[15px] rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-xl ${isArabic ? 'font-arabic' : ''}`}
          >
            {isArabic ? 'ابدأ التقييم الآن' : 'Start Assessment Now'}
            <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  )
}
