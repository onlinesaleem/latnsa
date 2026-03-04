'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Brain,
  Shield,
  Users,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Heart,
  ArrowRight,
  Calendar,
  Clock,
  Stethoscope,
  FlaskConical,
  Video,
  ClipboardList,
  BookOpen,
  Smartphone,
  Bell,
  MessageCircle,
  Star,
  Download,
  QrCode,
} from 'lucide-react'
import { useLanguage } from './MainLayout'

const SLIDE_DURATION = 6000

// ─────────────────────────────────────────────────────────────
// HERO SLIDES
// ─────────────────────────────────────────────────────────────
const getHeroSlides = (isArabic: boolean) => [
  {
    headline: isArabic
      ? 'أنت لست وحدك في هذه الرحلة'
      : 'You are not alone on this journey…',
    subheadline: isArabic
      ? 'نحن معك ومع عائلتك خطوة بخطوة'
      : 'We are with you and your family, step by step.',
    body: isArabic
      ? 'في لا تنسى، نكون سند لك ولعائلتك. نفهم قلقكم، ونقدّم دعمًا طبيًا وإنسانيًا متكاملًا، لأن الطمأنينة تبدأ بالفهم.'
      : 'At La Tansa, we stand by you and your family, understand your worries and provide comprehensive medical and human-centered support because reassurance begins with understanding.',
    cta: isArabic ? 'احجز استشارة الآن' : 'Book a Consultation Now',
  },
  {
    headline: isArabic
      ? 'لأن التشخيص المبكر يصنع الفرق'
      : 'Early diagnosis makes a difference…',
    subheadline: isArabic
      ? 'لكن الأهم أن يكون بخطوات مدروسة واحتواء حقيقي'
      : 'But what truly matters is a thoughtful process and genuine care.',
    body: isArabic
      ? 'عندما تلاحظ تغيرًا على شخص تحبه وتراودك الأسئلة والخوف، تحتاج إلى جهة تفهمك قبل أن تشخّص.'
      : 'Once you notice changes in your beloved and fear begins to grow, you need a place that understands you before making a diagnosis.',
    cta: isArabic ? 'ابدأ التقييم الآن' : 'Start the Assessment Now',
  },
]

// ─────────────────────────────────────────────────────────────
// WHY US ITEMS
// ─────────────────────────────────────────────────────────────
const getWhyItems = (isArabic: boolean) => [
  isArabic ? 'لأنك لا تبحث عن إجابة سريعة، بل عن فهم حقيقي.' : 'You are not looking for quick answers, but for true understanding.',
  isArabic ? 'لأن العائلة تحتاج إلى أحد يستمع لها، ويطمئنها، ويوجهها.' : 'Families need someone who listens, reassures, and guides them.',
  isArabic ? 'لأن فريقنا من استشاريين سعوديين يفهمون ثقافتنا وطبيعة بيوتنا.' : 'Our team of Saudi consultants understands our culture and family dynamics.',
  isArabic ? 'لأنك تحتاج إلى جهة تمشي معك المشوار كامل.' : 'You need a partner who walks the entire journey with you.',
  isArabic ? 'لأننا نعرف أن العبء ليس على المريض وحده، بل على العائلة كلها.' : 'We know the burden is not only on the patient, but on the whole family.',
  isArabic ? 'لأننا نوفر رعاية افتراضية تسهّل المتابعة بدون عناء.' : 'We provide virtual care that makes follow-up easier and more accessible.',
]

// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────
const getServices = (isArabic: boolean) => [
  {
    Icon: ClipboardList,
    title: isArabic ? 'التقييم الشامل والتشخيص الدقيق' : 'Comprehensive Assessment & Accurate Diagnosis',
  },
  {
    Icon: Clock,
    title: isArabic ? 'مراجعة طبية خلال وقت قصير' : 'Medical Review Within a Short Timeframe',
  },
  {
    Icon: FlaskConical,
    title: isArabic ? 'تنظيم وتقديم الفحوصات اللازمة' : 'Organization & Coordination of Required Investigations',
  },
  {
    Icon: Video,
    title: isArabic ? 'استشارات افتراضية مع استشاريين سعوديين' : 'Virtual Consultations with Saudi Consultants',
  },
  {
    Icon: Stethoscope,
    title: isArabic ? 'خطط علاج ومتابعة مستمرة' : 'Personalized Treatment Plans & Continuous Follow-up',
  },
  {
    Icon: Heart,
    title: isArabic ? 'دعم نفسي وتثقيفي لمقدمي الرعاية' : 'Psychological & Educational Support for Caregivers',
  },
]

// ─────────────────────────────────────────────────────────────
// TEAM GOALS
// ─────────────────────────────────────────────────────────────
const getTeamGoals = (isArabic: boolean) => [
  isArabic ? 'طمأنة الأسرة ومقدمي الرعاية' : 'Reassure families and caregivers',
  isArabic ? 'شرح واضح للحالة والتشخيص وطريقة التعامل المناسبة' : 'Clear explanations of the condition, diagnosis, and proper care approach',
  isArabic ? 'مساعدتكم على اتخاذ قرارات تناسبكم وتناسب المريض' : 'Help you make decisions that are right for you and your loved one',
]

// ─────────────────────────────────────────────────────────────
// APP FEATURES
// ─────────────────────────────────────────────────────────────
const getAppFeatures = (isArabic: boolean) => [
  { Icon: ClipboardList, text: isArabic ? 'التقييم الأولي' : 'Initial assessment' },
  { Icon: Calendar,      text: isArabic ? 'حجز الاستشارات' : 'Consultation booking' },
  { Icon: FlaskConical,  text: isArabic ? 'متابعة الفحوصات' : 'Test and investigation follow-up' },
  { Icon: Bell,          text: isArabic ? 'تذكيرات ودعم يومي' : 'Daily reminders and support' },
  { Icon: BookOpen,      text: isArabic ? 'محتوى يخفف عنك ويفهمك المرحلة' : 'Content that supports you and helps you understand the journey' },
  { Icon: MessageCircle, text: isArabic ? 'تواصل آمن مع فريقك الاستشاري' : 'Secure communication with your consultant team' },
]

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { language } = useLanguage()
  const isArabic = language === 'arabic'

  const slides = getHeroSlides(isArabic)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fading, setFading] = useState(false)

  const goTo = useCallback((index: number) => {
    if (index === currentSlide) return
    setFading(true)
    setTimeout(() => { setCurrentSlide(index); setFading(false) }, 300)
  }, [currentSlide])

  const goNext = useCallback(() => goTo((currentSlide + 1) % slides.length), [currentSlide, goTo, slides.length])
  const goPrev = useCallback(() => goTo((currentSlide - 1 + slides.length) % slides.length), [currentSlide, goTo, slides.length])

  useEffect(() => {
    const t = setInterval(goNext, SLIDE_DURATION)
    return () => clearInterval(t)
  }, [goNext])

  const slide = slides[currentSlide]

  return (
    <div className={`min-h-screen bg-white ${isArabic ? 'rtl' : 'ltr'}`}>

      {/* ════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════ */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4 gap-3">
            <Brain className="w-8 h-8 text-[#E76A6A]" />
            <span className="text-2xl font-bold text-gray-900">LaTnsa</span>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════
          HERO CAROUSEL
      ════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden py-24">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob" />
          <div className="absolute top-40 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Slide content */}
          <div style={{ transition: 'opacity 300ms ease-in-out', opacity: fading ? 0 : 1 }}>
            <div className="space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {slide.headline}
              </h1>
              <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#E76A6A] to-[#85C3E0]">
                {slide.subheadline}
              </p>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {slide.body}
              </p>
              <div className="pt-2">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] rounded-xl hover:from-[#d85858] hover:to-[#6ebfe6] transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {slide.cta}
                  <ArrowRight className={`w-5 h-5 ${isArabic ? 'mr-3 rotate-180' : 'ml-3'}`} />
                </Link>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center mt-12 gap-6">
            <button
              onClick={goPrev}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-[#E76A6A] hover:shadow-lg transition-all duration-200"
            >
              {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? 'w-8 h-3 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0]'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              aria-label="Next slide"
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-[#E76A6A] hover:shadow-lg transition-all duration-200"
            >
              {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 max-w-xs mx-auto h-1 bg-white/50 rounded-full overflow-hidden">
            <div
              key={currentSlide}
              className="h-full bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] rounded-full"
              style={{ animation: `slideProgress ${SLIDE_DURATION}ms linear forwards` }}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ABOUT — Virtual Clinics
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            {isArabic ? 'عيادات لا تنسى الافتراضية' : 'La Tansa Virtual Clinics'}
          </h2>
          <div className="text-lg text-gray-600 leading-relaxed space-y-4 text-start">
            {isArabic ? (
              <>
                <p>في لا تنسى، ندرك جيدًا أن اضطرابات الذاكرة لا تؤثر على المريض فقط، بل تمتد لتؤثر على العائلة كلها.</p>
                <p>ولأن التشخيص المبكر يفرق، نحن معكم خطوة بخطوة، بعناية حقيقية مبنية على أسس طبية، ونبدأ دائمًا بالاحتواء قبل أي تشخيص.</p>
                <p>صممنا عيادات افتراضية بدعم متكامل، يقودها استشاريون سعوديون متخصصون في اضطرابات الذاكرة والإدراك، يفهمون الحالة، وواقع العائلة، وحجم القلق الذي تعيشونه.</p>
                <p>رحلتكم معنا تبدأ باستبيان شامل يجيب عليه أحد أفراد العائلة أو مقدم الرعاية، يعكس تفاصيل الحياة اليومية للمريض. يتم مراجعته بعناية من فريقنا الاستشاري، ثم نحدد الفحوصات المناسبة، وبعدها تكون الاستشارة الافتراضية جاهزة بكل تفاصيلها: البيانات، النتائج، وتاريخ الحالة — بدون استعجال، وبدون تكرار، وفي سرية تامة.</p>
                <p className="font-semibold text-gray-800">جلسة نستمع لكم فيها، نجيب على أسئلتكم، ونمدكم بخطة واضحة تناسبكم وتناسب المريض.</p>
                <p className="text-xl font-bold text-[#E76A6A]">لستم وحدكم… لا تنسى معكم في كل خطوة.</p>
              </>
            ) : (
              <>
                <p>At La Tansa, we know that memory problems don't affect the patient alone — they affect the whole family.</p>
                <p>Because early care makes a real difference, we support you step by step with genuine attention and medical guidance. We always begin by listening and understanding, before moving to any diagnosis.</p>
                <p>Our virtual clinics offer complete support, led by Saudi consultants specialized in memory and cognitive care. They understand the condition, the family's situation, and the worry you may be feeling.</p>
                <p>Your journey starts with a simple, comprehensive questionnaire filled out by a family member or caregiver, helping us understand the patient's daily life. Our specialists review it carefully, decide on the needed tests, and prepare the virtual consultation in advance — clearly, calmly, and in full privacy.</p>
                <p className="font-semibold text-gray-800">In your session, we listen to you, answer your questions, and provide a clear care plan that fits both you and your loved one.</p>
                <p className="text-xl font-bold text-[#E76A6A]">You are not alone. La Tansa is with you at every step.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY LA TANSA
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {isArabic ? 'لماذا لا تنسى؟' : 'Why La Tansa?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {getWhyItems(isArabic).map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#85C3E0]/40 hover:shadow-md transition-all duration-300"
              >
                <div className="mt-1 w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#E76A6A] to-[#85C3E0] flex items-center justify-center text-white text-sm font-bold">
                  {i + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SERVICES
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {isArabic ? 'خدماتنا' : 'Our Services'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isArabic
                ? 'خدمات متكاملة لدعم مرضى الزهايمر واضطرابات الذاكرة ومقدمي الرعاية لهم'
                : "Comprehensive services to support Alzheimer's patients, individuals with memory disorders, and their caregivers"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getServices(isArabic).map(({ Icon: ServiceIcon, title }, i) => (
              <div
                key={i}
                className="group flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#85C3E0]/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-[#E76A6A]/10 to-[#85C3E0]/10 rounded-xl flex items-center justify-center group-hover:from-[#E76A6A]/20 group-hover:to-[#85C3E0]/20 transition-all duration-300">
                  <ServiceIcon className="w-6 h-6 text-[#E76A6A]" />
                </div>
                <p className="font-semibold text-gray-800 leading-snug pt-2">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          OUR TEAM
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-[#E76A6A]/5 to-[#85C3E0]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {isArabic ? 'فريقنا الاستشاري' : 'Our Consultant Team'}
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 space-y-8">
            <p className="text-lg text-gray-600 leading-relaxed">
              {isArabic
                ? 'في لا تنسى، فريقنا من استشاريين سعوديين متخصصين في اضطرابات الذاكرة والأعصاب، يعملون كشركاء حقيقيين للعائلة، وليس مجرد مقدمي استشارة. نحرص على تقديم تشخيص دقيق، وشرح واضح للحالة، ومواعيد افتراضية مرنة تناسب نمط حياتكم.'
                : "At La Tansa, our team of Saudi consultants specialized in memory and neurological disorders work as true partners to the family — not just as medical advisors. We are committed to providing accurate diagnoses, clear explanations of each condition, and flexible virtual appointments that fit your lifestyle."
              }
            </p>

            <div>
              <p className="font-bold text-gray-900 mb-5 text-lg">
                {isArabic ? 'كل استشارة هدفها:' : 'Every consultation aims to:'}
              </p>
              <div className="space-y-4">
                {getTeamGoals(isArabic).map((goal, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 shrink-0 rounded-full bg-gradient-to-br from-[#E76A6A] to-[#85C3E0] flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">{goal}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] rounded-xl hover:from-[#d85858] hover:to-[#6ebfe6] transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {isArabic ? 'احجز موعدك عبر التطبيق' : 'Book Your Appointment via the App'}
                <ArrowRight className={`w-5 h-5 ${isArabic ? 'mr-3 rotate-180' : 'ml-3'}`} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          APP DOWNLOAD with QR CODES
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#E76A6A]/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#85C3E0]/20 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* Left: text + features */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium text-white/80">
                  <Smartphone className="w-4 h-4" />
                  {isArabic ? 'تطبيق لا تنسى' : 'La Tansa App'}
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                  {isArabic
                    ? 'تطبيق لا تنسى… لأنك تحتاجه معك كل يوم'
                    : 'Because you need it with you every day'
                  }
                </h2>

                <p className="text-white/70 text-lg leading-relaxed">
                  {isArabic
                    ? 'نؤمن أن العناية باضطرابات الذاكرة تبدأ بالاحتواء قبل العلاج. ولهذا صممنا تطبيق لا تنسى ليجمع كل شيء في مكان واحد.'
                    : "We believe that caring for memory disorders begins with compassion before treatment. That's why we designed the La Tansa app to bring everything together in one place."
                  }
                </p>
              </div>

              {/* Feature list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getAppFeatures(isArabic).map(({ Icon: FeatureIcon, text }, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all duration-200"
                  >
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-[#E76A6A]/40 to-[#85C3E0]/40 flex items-center justify-center">
                      <FeatureIcon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm text-white/80 leading-snug pt-1">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: QR codes + download buttons */}
            <div className="space-y-8">
              
              {/* QR Codes side by side */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* iOS QR */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 text-center hover:bg-white/10 transition-all duration-200">
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-2xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://latnsa.com/')}`}
                        alt="iOS App QR Code"
                        width={150}
                        height={150}
                        className="w-32 h-32"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">
                      {isArabic ? 'نظام iOS' : 'iOS'}
                    </p>
                    <p className="text-white/60 text-xs">
                      {isArabic ? 'امسح للتحميل' : 'Scan to Download'}
                    </p>
                  </div>
                </div>

                {/* Android QR */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 text-center hover:bg-white/10 transition-all duration-200">
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-2xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://latnsa.com/')}`}
                        alt="Android App QR Code"
                        width={150}
                        height={150}
                        className="w-32 h-32"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">
                      {isArabic ? 'نظام Android' : 'Android'}
                    </p>
                    <p className="text-white/60 text-xs">
                      {isArabic ? 'امسح للتحميل' : 'Scan to Download'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Download buttons */}
              <div className="flex flex-col gap-3">
                <a
                  href="https://latnsa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  {isArabic ? 'تحميل من App Store' : 'Download on App Store'}
                </a>
                <a
                  href="https://latnsa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  <Download className="w-5 h-5" />
                  {isArabic ? 'تحميل من Google Play' : 'Download on Google Play'}
                </a>
              </div>

              {/* Availability note */}
              <p className="text-white/50 text-sm text-center">
                {isArabic
                  ? 'متاح على iOS و Android'
                  : 'Available on iOS and Android'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0]">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            {isArabic ? 'ابدأ رحلتك الصحية اليوم' : 'Start Your Health Journey Today'}
          </h2>
          <p className="text-xl text-white/80">
            {isArabic
              ? 'لأن كل يوم يفرق — نحن هنا لنبدأ معكم'
              : 'Because every day matters — we are here to begin with you'
            }
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-[#E76A6A] bg-white rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {isArabic ? 'ابدأ التقييم الآن' : 'Start your evaluation now'}
            <ArrowRight className={`w-5 h-5 ${isArabic ? 'mr-3 rotate-180' : 'ml-3'}`} />
          </Link>
          <p className="text-white/70 text-sm">
            {isArabic
              ? '✓ استشاريون سعوديون ✓ تشخيص دقيق ✓ مواعيد مرنة ✓ سرية تامة'
              : '✓ Saudi Consultants ✓ Accurate Diagnosis ✓ Flexible Appointments ✓ Full Privacy'
            }
          </p>
        </div>
      </section>

      {/* Keyframe styles */}
      <style jsx>{`
        @keyframes blob {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(30px, -50px) scale(1.1); }
          66%  { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes slideProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .animate-blob           { animation: blob 7s infinite; }
        .animation-delay-2000   { animation-delay: 2s; }
        .animation-delay-4000   { animation-delay: 4s; }
      `}</style>

    </div>
  )
}
