'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  CheckCircle, ChevronRight, ChevronLeft,
  Heart, ArrowRight, Calendar, Clock, Stethoscope, FlaskConical,
  Video, ClipboardList, BookOpen, Smartphone, Bell, MessageCircle,
  Download,
} from 'lucide-react'
import { useLanguage } from './MainLayout'

const SLIDE_DURATION = 6500

// ─── Data ───────────────────────────────────────

const getHeroSlides = (isArabic: boolean) => [
  {
    eyebrow: isArabic ? 'استشاريون سعوديون متخصصون' : 'Saudi Memory Care Specialists',
    headline: isArabic
      ? ['أنت لست وحدك', 'في هذه الرحلة…']
      : ['You are not alone', 'on this journey…'],
    sub: isArabic
      ? 'نحن معك ومع عائلتك خطوة بخطوة.'
      : 'We are with you and your family, step by step.',
    body: isArabic
      ? 'في لا تنسى، نكون سند لك ولعائلتك. نفهم قلقكم ونقدّم دعمًا طبيًا وإنسانيًا متكاملًا.'
      : 'At LaTnsa, we stand by you with comprehensive medical and human-centered support, because reassurance begins with understanding.',
    cta: isArabic ? 'احجز استشارة الآن' : 'Book a Consultation',
    ctaB: isArabic ? 'ابدأ التقييم' : 'Start Assessment',
  },
  {
    eyebrow: isArabic ? 'التشخيص المبكر يصنع الفرق' : 'Early Diagnosis Makes a Difference',
    headline: isArabic
      ? ['التشخيص المبكر', 'يصنع الفرق…']
      : ['Early diagnosis', 'makes a difference…'],
    sub: isArabic
      ? 'لكن الأهم أن يكون بخطوات مدروسة واحتواء حقيقي.'
      : 'What truly matters is a thoughtful process and genuine care.',
    body: isArabic
      ? 'عندما تلاحظ تغيرًا على شخص تحبه وتراودك الأسئلة، تحتاج إلى جهة تفهمك قبل أن تشخّص.'
      : 'When you notice changes in your loved one and fear begins to grow, you need a place that understands before diagnosing.',
    cta: isArabic ? 'ابدأ التقييم الآن' : 'Start the Assessment',
    ctaB: isArabic ? 'تعرف علينا' : 'Learn More',
  },
]

const getTrust = (isArabic: boolean) => [
  { en: 'Saudi Consultants',            ar: 'استشاريون سعوديون' },
  { en: 'Accurate Diagnosis',           ar: 'تشخيص دقيق' },
  { en: 'Flexible Virtual Appointments',ar: 'مواعيد افتراضية مرنة' },
  { en: 'Full Privacy',                 ar: 'سرية تامة' },
]

const getServices = (isArabic: boolean) => [
  { Icon: ClipboardList, en: 'Comprehensive Assessment & Accurate Diagnosis',           ar: 'التقييم الشامل والتشخيص الدقيق' },
  { Icon: Clock,         en: 'Medical Review Within a Short Timeframe',                ar: 'مراجعة طبية خلال وقت قصير' },
  { Icon: FlaskConical,  en: 'Organization & Coordination of Investigations',          ar: 'تنظيم وتقديم الفحوصات اللازمة' },
  { Icon: Video,         en: 'Virtual Consultations with Saudi Consultants',           ar: 'استشارات افتراضية مع استشاريين سعوديين' },
  { Icon: Stethoscope,   en: 'Personalized Treatment Plans & Continuous Follow-up',   ar: 'خطط علاج ومتابعة مستمرة' },
  { Icon: Heart,         en: 'Psychological & Educational Support for Caregivers',    ar: 'دعم نفسي وتثقيفي لمقدمي الرعاية' },
]

const getWhyItems = (isArabic: boolean) => [
  { en: 'Not looking for quick answers — you need true understanding.',      ar: 'لأنك لا تبحث عن إجابة سريعة، بل عن فهم حقيقي.' },
  { en: 'Families need someone who listens, reassures, and guides them.',    ar: 'لأن العائلة تحتاج إلى أحد يستمع لها، ويطمئنها، ويوجهها.' },
  { en: 'Saudi consultants who understand your culture and family dynamics.',ar: 'لأن فريقنا يفهم ثقافتنا وطبيعة بيوتنا.' },
  { en: 'You need a partner who walks the entire journey with you.',         ar: 'لأنك تحتاج إلى جهة تمشي معك المشوار كامل.' },
  { en: 'The burden falls on the whole family, not only the patient.',       ar: 'لأننا نعرف أن العبء على العائلة كلها، وليس المريض وحده.' },
  { en: 'Virtual care that makes follow-up easy and accessible.',            ar: 'لأننا نوفر رعاية افتراضية تسهّل المتابعة بدون عناء.' },
]

const getJourney = (isArabic: boolean) => [
  { n: '01', en: 'Questionnaire',         ar: 'الاستبيان الشامل',       bodyEn: 'A family member or caregiver fills a detailed form about daily life.',               bodyAr: 'يجيب عليه أحد أفراد العائلة أو مقدم الرعاية.' },
  { n: '02', en: 'Specialist Review',     ar: 'مراجعة متخصصة',         bodyEn: 'Our team reviews carefully and determines appropriate investigations.',               bodyAr: 'يراجعه فريقنا بعناية ويحدد الفحوصات المناسبة.' },
  { n: '03', en: 'Virtual Consultation',  ar: 'الاستشارة الافتراضية',   bodyEn: 'A fully prepared, unhurried session with all data and findings ready.',              bodyAr: 'جلسة كاملة التحضير — بدون استعجال وبسرية تامة.' },
  { n: '04', en: 'Clear Care Plan',       ar: 'خطة رعاية واضحة',       bodyEn: 'We listen, answer your questions, and provide a plan that fits you and your loved one.', bodyAr: 'نستمع لكم، نجيب على أسئلتكم، ونمدكم بخطة واضحة.' },
]

const getAppFeatures = (isArabic: boolean) => [
  { Icon: ClipboardList, en: 'Initial assessment',            ar: 'التقييم الأولي' },
  { Icon: Calendar,      en: 'Consultation booking',          ar: 'حجز الاستشارات' },
  { Icon: FlaskConical,  en: 'Test & investigation follow-up',ar: 'متابعة الفحوصات' },
  { Icon: Bell,          en: 'Daily reminders & support',     ar: 'تذكيرات ودعم يومي' },
  { Icon: BookOpen,      en: 'Educational content',           ar: 'محتوى تثقيفي' },
  { Icon: MessageCircle, en: 'Secure consultant messaging',   ar: 'تواصل آمن مع فريقك' },
]

// ─── Component ──────────────────────────────────

export default function LandingPage() {
  const { language } = useLanguage()
  const isArabic = language === 'arabic'
  const slides    = getHeroSlides(isArabic)

  const [current, setCurrent] = useState(0)
  const [fading,  setFading]  = useState(false)

  const goTo = useCallback((i: number) => {
    if (i === current) return
    setFading(true)
    setTimeout(() => { setCurrent(i); setFading(false) }, 350)
  }, [current])

  const goNext = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length])
  const goPrev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo, slides.length])

  useEffect(() => { const t = setInterval(goNext, SLIDE_DURATION); return () => clearInterval(t) }, [goNext])

  const slide = slides[current]

  return (
    <div className={`min-h-screen bg-[#FFFEF9] ${isArabic ? 'rtl' : 'ltr'}`}
      style={{ fontFamily: "'Baloo Bhaijaan 2', system-ui, sans-serif" }}>

      {/* ══ GLOBAL STYLES ══ */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Baloo Bhaijaan 2', system-ui, sans-serif !important; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes blobDrift { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-30px) scale(1.05)} 66%{transform:translate(-15px,14px) scale(0.96)} }
        @keyframes slideProgress { from{width:0%} to{width:100%} }

        .anim-up  { animation: fadeUp  0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-in  { animation: fadeIn  0.6s ease both; }
        .d1{animation-delay:0.05s} .d2{animation-delay:0.17s}
        .d3{animation-delay:0.29s} .d4{animation-delay:0.41s}
        .d5{animation-delay:0.53s}

        .card-lift {
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.35s ease, border-color 0.25s ease;
        }
        .card-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(163,23,85,0.12);
          border-color: rgba(163,23,85,0.22) !important;
        }
        .card-lift:hover .i-ring {
          background: #A31755 !important;
          transform: scale(1.1) rotate(-4deg);
        }
        .card-lift:hover .i-ring svg {
          color: white !important; stroke: white !important;
        }
        .i-ring {
          transition: background 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .grain-hero::after {
          content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
          opacity:0.55; mix-blend-mode:overlay;
        }
      `}</style>

      {/* ══ HERO ══════════════════════════════════ */}
      <section className="grain-hero relative overflow-hidden" style={{ background: "linear-gradient(135deg,#A31755 0%,#405EAA 100%)" }}>
        {/* Blob 1 */}
        <div style={{ position:'absolute', width:520, height:520, borderRadius:'50%', background:'rgba(255,255,255,0.05)', top:-180, right:-160, animation:'blobDrift 12s ease-in-out infinite', pointerEvents:'none' }} />
        {/* Blob 2 */}
        <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', background:'rgba(255,255,255,0.04)', bottom:-120, left:-100, animation:'blobDrift 16s ease-in-out 3s infinite', pointerEvents:'none' }} />
        {/* Rings */}
        {[700, 500, 320].map((s, i) => (
          <div key={i} style={{ position:'absolute', width:s, height:s, borderRadius:'50%', border:`1px solid rgba(255,255,255,${0.04+i*0.025})`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', zIndex:1 }} />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-28 text-center">
          <div style={{ transition:'opacity 0.35s ease', opacity: fading ? 0 : 1 }}>

            {/* Eyebrow */}
            <div className={`anim-up d1 inline-flex items-center gap-2 bg-white/[0.12] border border-white/[0.22] rounded-full px-5 py-2 mb-9 ${isArabic ? 'font-arabic' : ''}`}>
              <span className="w-2 h-2 bg-[#A8D163] rounded-full flex-shrink-0" />
              <span className="text-white/90 text-[13px] font-medium tracking-tight">{slide.eyebrow}</span>
            </div>

            {/* Headline — DM Serif Display */}
            <h1 className={`anim-up d2 font-display text-[46px] sm:text-[58px] lg:text-[70px] text-white leading-[1.08] mb-6 tracking-[-1px] ${isArabic ? 'font-arabic text-4xl sm:text-5xl lg:text-6xl' : ''}`}>
              {slide.headline[0]}
              <br />
              <span className="italic opacity-90">{slide.headline[1]}</span>
            </h1>

            {/* Sub */}
            <p className={`anim-up d3 text-[19px] sm:text-[22px] font-medium text-white/80 mb-4 ${isArabic ? 'font-arabic' : ''}`}>
              {slide.sub}
            </p>

            {/* Body */}
            <p className={`anim-up d4 text-[15.5px] text-white/60 leading-relaxed max-w-xl mx-auto mb-11 ${isArabic ? 'font-arabic' : ''}`}>
              {slide.body}
            </p>

            {/* CTAs */}
            <div className="anim-up d5 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register"
                className={`inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-white text-[#A31755] font-bold text-[15px] rounded-2xl hover:bg-[#FDF5F8] transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.15)] ${isArabic ? 'font-arabic' : ''}`}>
                {slide.cta}
                <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
              <Link href="/about"
                className={`inline-flex items-center justify-center gap-2 px-9 py-4 bg-white/[0.10] text-white font-semibold text-[15px] rounded-2xl border border-white/25 hover:bg-white/[0.17] transition-all duration-200 ${isArabic ? 'font-arabic' : ''}`}>
                {slide.ctaB}
              </Link>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 mt-14">
            <button onClick={goPrev} className="w-9 h-9 rounded-full bg-white/[0.14] hover:bg-white/[0.24] flex items-center justify-center text-white transition-all duration-200">
              {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/55'}`} />
              ))}
            </div>
            <button onClick={goNext} className="w-9 h-9 rounded-full bg-white/[0.14] hover:bg-white/[0.24] flex items-center justify-center text-white transition-all duration-200">
              {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 max-w-[180px] mx-auto h-[2px] bg-white/[0.18] rounded-full overflow-hidden">
            <div key={current} className="h-full bg-white rounded-full" style={{ animation: `slideProgress ${SLIDE_DURATION}ms linear forwards` }} />
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="bg-[#1A1410] py-3.5 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          {getTrust(isArabic).map((t, i) => (
            <div key={i} className={`flex items-center gap-2 text-white/80 text-[13px] font-medium ${isArabic ? 'font-arabic' : ''}`}>
              <span className="w-1.5 h-1.5 bg-[#A8D163] rounded-full flex-shrink-0" />
              {isArabic ? t.ar : t.en}
            </div>
          ))}
        </div>
      </div>

      {/* ══ ABOUT — Split panel ══════════════════ */}
      <section className="py-24 bg-[#FFFEF9]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-[#F2F2F2] shadow-[0_4px_40px_rgba(26,20,16,0.06)]">

            {/* Left — brand */}
            <div className="grain-hero relative p-10 lg:p-14 flex flex-col justify-between gap-10 overflow-hidden" style={{ background: "linear-gradient(135deg,#A31755 0%,#405EAA 100%)" }}>
              <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.05)', bottom:-80, right:-80, pointerEvents:'none' }} />
              <div className="relative z-10">
                <span className={`inline-block bg-white/[0.15] border border-white/[0.2] text-white/90 text-[11px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-[1.5px] mb-7 ${isArabic ? 'font-arabic' : ''}`}>
                  {isArabic ? 'عيادات لا تنسى الافتراضية' : 'LaTnsa Virtual Clinics'}
                </span>
                <h2 className={`font-display text-[32px] lg:text-[38px] text-white leading-[1.15] mb-6 ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
                  {isArabic ? 'نبدأ دائمًا بالاحتواء قبل أي تشخيص' : <>We always begin<br /><span className="italic">with care, before diagnosis</span></>}
                </h2>
                <div className={`space-y-4 text-[15px] text-white/75 leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
                  <p>{isArabic
                    ? 'في لا تنسى، ندرك جيدًا أن اضطرابات الذاكرة لا تؤثر على المريض فقط، بل تمتد لتؤثر على العائلة كلها.'
                    : "At LaTnsa, we know that memory disorders don't affect only the patient — they affect the whole family."
                  }</p>
                  <p>{isArabic
                    ? 'صممنا عيادات افتراضية بدعم متكامل، يقودها استشاريون سعوديون متخصصون يفهمون الحالة وواقع العائلة.'
                    : 'Our virtual clinics are led by Saudi consultants who understand the condition, the family\'s reality, and the weight you carry.'
                  }</p>
                </div>
              </div>
              <p className={`relative z-10 font-display text-[20px] text-white italic ${isArabic ? 'font-arabic text-[18px] not-italic font-semibold' : ''}`}>
                {isArabic ? 'لستم وحدكم… لا تنسى معكم في كل خطوة.' : '"You are not alone. LaTnsa is with you at every step."'}
              </p>
            </div>

            {/* Right — journey */}
            <div className="bg-white p-10 lg:p-14">
              <h3 className={`font-display text-[24px] text-[#1A1410] mb-9 ${isArabic ? 'font-arabic text-xl' : ''}`}>
                {isArabic ? 'كيف تسير رحلتكم معنا' : 'How your journey works'}
              </h3>
              <div className="space-y-8">
                {getJourney(isArabic).map((step, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#F9EEF3] flex items-center justify-center">
                      <span className="text-[13px] font-bold text-[#A31755]">{step.n}</span>
                    </div>
                    <div className="pt-1">
                      <p className={`text-[15px] font-semibold text-[#1A1410] mb-1 ${isArabic ? 'font-arabic' : ''}`}>
                        {isArabic ? step.ar : step.en}
                      </p>
                      <p className={`text-[13.5px] text-[#1A1410] leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
                        {isArabic ? step.bodyAr : step.bodyEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY ══════════════════════════════════ */}
      <section className="py-24 bg-[#FFFEF9]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row gap-14 items-start">
            {/* Left sticky title */}
            <div className="lg:w-[300px] flex-shrink-0 lg:sticky lg:top-24">
              <span className={`inline-block bg-[#A31755]/10 text-[#A31755] text-[11px] font-bold uppercase tracking-[1.8px] px-3.5 py-1.5 rounded-full mb-5 ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic ? 'لماذا لا تنسى؟' : 'Why LaTnsa?'}
              </span>
              <h2 className={`font-display text-[34px] lg:text-[42px] text-[#1A1410] leading-[1.15] ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
                {isArabic ? 'مبنيون حول العائلة، لا المريض فقط' : <>Built around<br />families,<br /><span className="italic text-[#A31755]">not just patients</span></>}
              </h2>
            </div>

            {/* Right grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getWhyItems(isArabic).map((item, i) => (
                <div key={i} className="card-lift bg-white rounded-2xl p-6 border border-[#F2F2F2] flex gap-4">
                  <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-[#F9EEF3] flex items-center justify-center">
                    <span className="text-[12px] font-bold text-[#A31755]">{i + 1}</span>
                  </div>
                  <p className={`text-[14px] text-[#4A3F38] leading-relaxed pt-1 ${isArabic ? 'font-arabic' : ''}`}>
                    {isArabic ? item.ar : item.en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ═════════════════════════════ */}
      <section className="py-24 bg-[#FFFEF9]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <span className={`inline-block bg-[#EBF0FB] text-[#405EAA] text-[11px] font-bold uppercase tracking-[1.8px] px-3.5 py-1.5 rounded-full mb-5 ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic ? 'خدماتنا' : 'Our Services'}
            </span>
            <h2 className={`font-display text-[34px] lg:text-[42px] text-[#1A1410] mb-3 ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
              {isArabic ? 'رعاية متكاملة في كل خطوة' : 'Comprehensive care, every step'}
            </h2>
            <p className={`text-[16px] text-[#1A1410] max-w-lg mx-auto ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic
                ? 'خدمات لدعم مرضى الزهايمر واضطرابات الذاكرة ومقدمي الرعاية'
                : "Supporting Alzheimer's patients, memory disorder individuals, and their caregivers."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {getServices(isArabic).map(({ Icon, en, ar }, i) => (
              <div key={i} className="card-lift group bg-white rounded-2xl p-7 border border-[#F2F2F2]">
                <div className="i-ring w-12 h-12 bg-[#F9EEF3] rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[#A31755]" />
                </div>
                <p className={`text-[14.5px] font-semibold text-[#1A1410] leading-snug ${isArabic ? 'font-arabic' : ''}`}>
                  {isArabic ? ar : en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEAM — Full-width editorial ══════════ */}
      <section className="grain-hero relative bg-[#405EAA] py-24 overflow-hidden">
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.06)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <span className={`inline-block bg-white/[0.14] border border-white/[0.22] text-white/85 text-[11px] font-bold uppercase tracking-[1.8px] px-4 py-1.5 rounded-full mb-7 ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic ? 'فريقنا الاستشاري' : 'Our Consultant Team'}
          </span>
          <h2 className={`font-display text-[34px] lg:text-[48px] text-white mb-5 ${isArabic ? 'font-arabic text-2xl lg:text-4xl' : ''}`}>
            {isArabic ? 'كل استشارة هدفها' : <>Every consultation<br /><span className="italic">aims to</span></>}
          </h2>
          <p className={`text-[#FFFEF9]/80 text-[15.5px] mb-12 max-w-2xl mx-auto leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic
              ? 'فريقنا من استشاريين سعوديين متخصصين يعملون كشركاء حقيقيين للعائلة وليس مجرد مقدمي استشارة.'
              : 'Our team of Saudi consultants specialized in memory disorders work as true partners to the family — not just as advisors.'
            }
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {[
              { en: 'Reassure families and caregivers',                              ar: 'طمأنة الأسرة ومقدمي الرعاية' },
              { en: 'Clear explanations of condition, diagnosis, and care approach', ar: 'شرح واضح للحالة والتشخيص وطريقة التعامل' },
              { en: 'Help you make decisions right for you and your loved one',      ar: 'مساعدتكم على اتخاذ القرارات المناسبة' },
            ].map((g, i) => (
              <div key={i} className={`flex items-center gap-3 bg-white/[0.10] border border-white/[0.14] rounded-xl px-5 py-3.5 text-[14px] text-white/90 ${isArabic ? 'font-arabic' : ''}`}>
                <div className="w-5 h-5 rounded-full bg-[#A8D163] flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                {isArabic ? g.ar : g.en}
              </div>
            ))}
          </div>
          <Link href="/auth/register"
            className={`inline-flex items-center gap-2.5 px-9 py-4 bg-white text-[#405EAA] font-bold text-[15px] rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-xl ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic ? 'احجز موعدك عبر التطبيق' : 'Book Your Appointment via the App'}
            <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>

      {/* ══ APP ══════════════════════════════════ */}
      <section className="py-24 bg-[#1A1410] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left */}
            <div>
              <span className={`inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] rounded-full px-4 py-1.5 text-[12px] font-semibold text-white/70 uppercase tracking-wider mb-7 ${isArabic ? 'font-arabic' : ''}`}>
                <Smartphone className="w-3.5 h-3.5" />
                {isArabic ? 'تطبيق لا تنسى' : 'LaTnsa App'}
              </span>
              <h2 className={`font-display text-[34px] lg:text-[44px] text-white leading-[1.12] mb-5 ${isArabic ? 'font-arabic text-2xl lg:text-3xl' : ''}`}>
                {isArabic ? 'لأنك تحتاجه معك كل يوم' : <>Because you need it<br /><span className="italic text-white/75">with you every day</span></>}
              </h2>
              <p className={`text-[15px] text-white/55 leading-relaxed mb-9 ${isArabic ? 'font-arabic' : ''}`}>
                {isArabic
                  ? 'نؤمن أن العناية باضطرابات الذاكرة تبدأ بالاحتواء قبل العلاج. صممنا التطبيق ليجمع كل شيء في مكان واحد.'
                  : "We believe caring for memory disorders begins with compassion before treatment. The LaTnsa app brings everything together in one place."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getAppFeatures(isArabic).map(({ Icon, en, ar }, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.05] border border-white/[0.08] rounded-xl p-4">
                    <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-[#A31755]/30 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white/80" />
                    </div>
                    <p className={`text-[13.5px] text-white/75 font-medium ${isArabic ? 'font-arabic' : ''}`}>
                      {isArabic ? ar : en}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — QR + Downloads */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {(['iOS', 'Android'] as const).map(p => (
                  <div key={p} className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-7 text-center hover:bg-white/[0.08] transition-colors duration-200">
                    <div className="bg-white p-3 rounded-xl inline-block mb-4">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent('https://latnsa.com/')}`}
                        alt={`${p} QR`} width={110} height={110}
                        className="w-[96px] h-[96px]"
                      />
                    </div>
                    <p className="text-white font-semibold text-[14px] mb-1">{p}</p>
                    <p className="text-white/45 text-[12px]">{isArabic ? 'امسح للتحميل' : 'Scan to Download'}</p>
                  </div>
                ))}
              </div>
              <a href="https://latnsa.com/" target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-3 w-full py-4 bg-white text-[#1A1410] font-bold text-[14.5px] rounded-2xl hover:bg-[#FFFEF9] transition-all duration-200 ${isArabic ? 'font-arabic' : ''}`}>
                <Download className="w-5 h-5" />
                {isArabic ? 'تحميل من App Store' : 'Download on App Store'}
              </a>
              <a href="https://latnsa.com/" target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-3 w-full py-4 bg-white/[0.08] text-white font-semibold text-[14.5px] rounded-2xl border border-white/[0.12] hover:bg-white/[0.13] transition-all duration-200 ${isArabic ? 'font-arabic' : ''}`}>
                <Download className="w-5 h-5" />
                {isArabic ? 'تحميل من Google Play' : 'Download on Google Play'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════ */}
      <section className="grain-hero relative py-24 overflow-hidden" style={{ background: "linear-gradient(135deg,#A31755 0%,#405EAA 100%)" }}>
        {[700, 480, 280].map((s, i) => (
          <div key={i} style={{ position:'absolute', width:s, height:s, borderRadius:'50%', border:`1px solid rgba(255,255,255,${0.04+i*0.025})`, top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
        ))}
        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
          <h2 className={`font-display text-[38px] lg:text-[52px] text-white mb-5 ${isArabic ? 'font-arabic text-3xl lg:text-4xl' : ''}`}>
            {isArabic ? 'ابدأ رحلتك الصحية اليوم' : <>Start your health<br /><span className="italic">journey today</span></>}
          </h2>
          <p className={`text-white/70 text-[17px] mb-11 max-w-lg mx-auto leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>
            {isArabic ? 'لأن كل يوم يفرق — نحن هنا لنبدأ معكم.' : 'Because every day matters — we are here to begin with you.'}
          </p>
          <Link href="/auth/register"
            className={`inline-flex items-center gap-2.5 px-11 py-4.5 bg-white text-[#A31755] font-bold text-[16px] rounded-2xl hover:bg-[#FDF5F8] transition-all duration-200 shadow-[0_8px_40px_rgba(0,0,0,0.2)] ${isArabic ? 'font-arabic' : ''}`}
            style={{ paddingTop: '18px', paddingBottom: '18px' }}>
            {isArabic ? 'ابدأ التقييم الآن' : 'Start your evaluation now'}
            <ArrowRight className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-9 flex-wrap">
            {getTrust(isArabic).map((t, i) => (
              <div key={i} className={`flex items-center gap-2 text-[#FFFEF9]/80 text-[13px] ${isArabic ? 'font-arabic' : ''}`}>
                <span className="w-1.5 h-1.5 bg-[#A8D163] rounded-full" />
                {isArabic ? t.ar : t.en}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}