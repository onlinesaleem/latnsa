'use client'

import Image from 'next/image'
import React from 'react'
import {
  Brain,
  Heart,
  Shield,
  CheckCircle,
  Target,
  Eye,
  Sparkles,
  Clock,
  Award,
  Users,
  Lock
} from 'lucide-react'
import { useLanguage } from '@/components/MainLayout'

export default function AboutPage() {
  const { language } = useLanguage()
  const isArabic = language === 'arabic'

  const whatSetsUsApart = [
    {
      icon: Brain,
      titleEn: 'Advanced Memory & Cognitive Assessments',
      titleAr: 'تقييمات اضطرابات الذاكرة المتقدمة',
      descEn: 'Based on scientific principles',
      descAr: 'مبنية على أسس علمية'
    },
    {
      icon: Users,
      titleEn: 'Expert Clinical Consultations',
      titleAr: 'استشارات مع خبراء متخصصين',
      descEn: 'Specialized healthcare professionals',
      descAr: 'متخصصون في الرعاية الصحية'
    },
    {
      icon: Shield,
      titleEn: 'Secure & Private Digital Care',
      titleAr: 'رعاية رقمية آمنة وسرية',
      descEn: 'Protected health information',
      descAr: 'حماية المعلومات الصحية'
    },
    {
      icon: Clock,
      titleEn: 'Fast, Convenient Assessments',
      titleAr: 'تقييم سريع ومريح',
      descEn: 'Complete from the comfort of home',
      descAr: 'من راحة المنزل'
    }
  ]

  const values = [
    {
      icon: CheckCircle,
      titleEn: 'Accuracy',
      titleAr: 'الدقة',
      descEn: 'Providing reliable medical insights.',
      descAr: 'تقديم معلومات ورؤى طبية موثوقة.'
    },
    {
      icon: Heart,
      titleEn: 'Compassion',
      titleAr: 'التعاطف',
      descEn: 'Care that understands patients and families.',
      descAr: 'رعاية إنسانية تراعي احتياجات المرضى وعائلاتهم.'
    },
    {
      icon: Lock,
      titleEn: 'Trust',
      titleAr: 'الثقة',
      descEn: 'Protecting privacy with transparency.',
      descAr: 'حماية الخصوصية والبيانات بأعلى درجات الشفافية.'
    }
  ]

  return (
    <div className={`min-h-screen ${isArabic ? 'rtl' : 'ltr'} bg-gradient-to-b from-gray-50 to-white`}>
      
      {/* Hero Section with Logo */}
      <section className="relative py-20 bg-gradient-to-br from-[#E6F0FF] via-[#F5F3FF] to-[#FFF5F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] rounded-2xl blur-xl opacity-20"></div>
                <Image
                  src="/logo.jpeg"
                  alt="Latnsa Health Logo"
                  className="relative rounded-2xl shadow-2xl"
                  width={100}
                  height={100}
                  priority={true}
                />
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {isArabic ? 'عن لا تنسى' : 'About Latnsa'}
            </h1>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                {isArabic
                  ? 'لا تنسى هي منصة صحية رقمية متخصصة في دعم الأفراد الذين يواجهون اضطرابات في الذاكرة والإدراك.'
                  : 'Latnsa is a digital health platform dedicated to supporting individuals experiencing memory and cognitive changes.'
                }
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {isArabic
                  ? 'نقدم تقييمات متقدمة واستشارات طبية متخصصة تساعد العائلات على فهم الحالة واتخاذ الخطوات الصحيحة في الوقت المناسب.'
                  : 'Through advanced assessments, expert consultations, and compassionate care, we help families understand cognitive health and take the right steps at the right time.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Vision */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E76A6A]/5 to-[#85C3E0]/5 rounded-3xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#E76A6A] to-[#85C3E0] rounded-2xl flex items-center justify-center">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {isArabic ? 'الرؤية' : 'Vision'}
                  </h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {isArabic
                    ? 'أن نكون جهة رائدة وموثوقة في صحة أمراض الذاكرة والإدراك، تساهم في الكشف المبكر وتحسين جودة الحياة.'
                    : 'To become a trusted leader in memory and cognitive health, enabling earlier detection and better quality of life.'
                  }
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#85C3E0]/5 to-[#E76A6A]/5 rounded-3xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#85C3E0] to-[#E76A6A] rounded-2xl flex items-center justify-center">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {isArabic ? 'الرسالة' : 'Mission'}
                  </h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {isArabic
                    ? 'توفير تقييم اضطرابات الذاكرة بشكل متقدم وسهل الوصول عبر التكنولوجيا الحديثة والخبرة الطبية، لدعم المرضى وعائلاتهم في كل خطوة.'
                    : 'To make memory and cognitive assessment accessible through innovative technology, expert care, and compassionate support for patients and families.'
                  }
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E76A6A]/10 to-[#85C3E0]/10 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-[#E76A6A]" />
              <span className="text-sm font-medium text-gray-700">
                {isArabic ? 'ما يميزنا' : 'What Sets Us Apart'}
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {isArabic ? 'ما الذي يميزنا' : 'What Sets Us Apart'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whatSetsUsApart.map((item, index) => {
              const Icon = item.icon
              return (
                <div 
                  key={index}
                  className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#85C3E0]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#E76A6A]/10 to-[#85C3E0]/10 rounded-xl flex items-center justify-center mb-4 group-hover:from-[#E76A6A]/20 group-hover:to-[#85C3E0]/20 transition-colors">
                    <Icon className="w-7 h-7 text-[#E76A6A]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isArabic ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {isArabic ? item.descAr : item.descEn}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {isArabic ? 'قيمنا' : 'Our Values'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isArabic
                ? 'القيم التي توجه عملنا وتحدد التزامنا تجاه مرضانا'
                : 'The values that guide our work and define our commitment to patients'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              const colorClasses = [
                { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
                { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
                { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' }
              ]
              const colors = colorClasses[index]

              return (
                <div 
                  key={index}
                  className={`bg-white rounded-2xl p-8 border ${colors.border} hover:shadow-xl transition-all duration-300`}
                >
                  <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    {isArabic ? value.titleAr : value.titleEn}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {isArabic ? value.descAr : value.descEn}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            {isArabic ? 'ابدأ رحلتك معنا اليوم' : 'Start Your Journey With Us Today'}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {isArabic
              ? 'نحن هنا لدعمك ودعم عائلتك في كل خطوة'
              : 'We are here to support you and your family every step of the way'
            }
          </p>
          <a
            href="/auth/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#E76A6A] bg-white rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {isArabic ? 'ابدأ التقييم الآن' : 'Start Assessment Now'}
          </a>
        </div>
      </section>

    </div>
  )
}
