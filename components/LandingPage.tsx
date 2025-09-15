'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Brain, 
  Shield, 
  Users, 
  Clock, 
  CheckCircle, 
  Star,
  ChevronRight,
  Globe,
  Heart,
  Award,
  ArrowRight,
  Play
} from 'lucide-react'

interface LandingPageProps {
  initialLanguage?: 'english' | 'arabic'
}

export default function LandingPage({ initialLanguage = 'english' }: LandingPageProps) {
  const [language, setLanguage] = useState<'english' | 'arabic'>(initialLanguage)
  const router = useRouter()
  const isArabic = language === 'arabic'

  const features = [
    {
      icon: Brain,
      titleEn: "Comprehensive Assessment",
      titleAr: "تقييم شامل",
      descEn: "Advanced cognitive and functional evaluation tools",
      descAr: "أدوات تقييم معرفية ووظيفية متقدمة"
    },
    {
      icon: Shield,
      titleEn: "Secure & Private",
      titleAr: "آمن وخصوصي",
      descEn: "Your health data is protected with enterprise-grade security",
      descAr: "بياناتك الصحية محمية بأمان على مستوى المؤسسات"
    },
    {
      icon: Users,
      titleEn: "Expert Clinical Team",
      titleAr: "فريق طبي خبير",
      descEn: "Reviewed by qualified healthcare professionals",
      descAr: "يراجعها متخصصون مؤهلون في الرعاية الصحية"
    },
    {
      icon: Clock,
      titleEn: "Quick & Easy",
      titleAr: "سريع وسهل",
      descEn: "Complete assessment in 15-20 minutes from anywhere",
      descAr: "أكمل التقييم في 15-20 دقيقة من أي مكان"
    }
  ]

  const benefits = [
    {
      titleEn: "Early Detection",
      titleAr: "الكشف المبكر",
      descEn: "Identify cognitive changes before they become severe",
      descAr: "تحديد التغييرات المعرفية قبل أن تصبح شديدة"
    },
    {
      titleEn: "Professional Analysis",
      titleAr: "تحليل مهني",
      descEn: "Get expert clinical interpretation of your results",
      descAr: "احصل على تفسير طبي خبير لنتائجك"
    },
    {
      titleEn: "Personalized Care",
      titleAr: "رعاية شخصية",
      descEn: "Receive tailored recommendations for your situation",
      descAr: "تلقي توصيات مخصصة لحالتك"
    }
  ]

  return (
    <div className={`min-h-screen bg-white ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full max-w-7xl mx-auto">
            <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-40 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <Award className="w-4 h-4 mr-2" />
                  {isArabic ? 'معتمد طبياً' : 'Clinically Validated'}
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {isArabic ? (
                    <>
                      تقييم صحي{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        شامل
                      </span>
                    </>
                  ) : (
                    <>
                      Comprehensive{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Health
                      </span>{' '}
                      Assessment
                    </>
                  )}
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  {isArabic
                    ? 'احصل على تقييم مفصل لحالتك الصحية والمعرفية من فريق طبي متخصص. آمن وسري وسهل الاستخدام.'
                    : 'Get a detailed evaluation of your cognitive and functional health from our expert clinical team. Secure, confidential, and easy to use.'
                  }
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isArabic ? 'ابدأ التقييم' : 'Start Assessment'}
                  <ArrowRight className={`w-5 h-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
                </Link>
                
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                  <Play className={`w-5 h-5 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? 'مشاهدة الفيديو' : 'Watch Video'}
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10,000+</div>
                  <div className="text-sm text-gray-600">
                    {isArabic ? 'تقييم مكتمل' : 'Assessments Completed'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">
                    {isArabic ? 'رضا المرضى' : 'Patient Satisfaction'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">
                    {isArabic ? 'متاح دائماً' : 'Available'}
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl transform rotate-6"></div>
                <div className="relative bg-white rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {isArabic ? 'التقييم المعرفي' : 'Cognitive Assessment'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {isArabic ? 'جاري التقدم...' : 'In Progress...'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {isArabic ? 'التقدم' : 'Progress'}
                        </span>
                        <span className="font-semibold text-blue-600">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-green-800 font-medium">
                            {isArabic ? 'مكتمل' : 'Complete'}
                          </span>
                        </div>
                        <div className="text-green-600 mt-1">
                          {isArabic ? 'المعلومات الأساسية' : 'Basic Info'}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-800 font-medium">
                            {isArabic ? 'الحالي' : 'Current'}
                          </span>
                        </div>
                        <div className="text-blue-600 mt-1">
                          {isArabic ? 'الأعراض' : 'Symptoms'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {isArabic ? 'لماذا تختار تقييمنا الصحي؟' : 'Why Choose Our Health Assessment?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isArabic
                ? 'نقدم تقييماً شاملاً ومتقدماً يساعدك على فهم حالتك الصحية والحصول على التوجيه المناسب'
                : 'We provide comprehensive, advanced assessment tools that help you understand your health status and get appropriate guidance'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isArabic ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-gray-600">
                    {isArabic ? feature.descAr : feature.descEn}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {isArabic ? 'الفوائد التي ستحصل عليها' : 'Benefits You\'ll Receive'}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {isArabic
                  ? 'تقييمنا الصحي يوفر لك رؤية شاملة عن حالتك الصحية مع توصيات مخصصة من فريق طبي متخصص'
                  : 'Our health assessment provides you with comprehensive insights into your health status with personalized recommendations from expert medical professionals'
                }
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {isArabic ? benefit.titleAr : benefit.titleEn}
                      </h3>
                      <p className="text-gray-600">
                        {isArabic ? benefit.descAr : benefit.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isArabic ? 'تقرير صحي مفصل' : 'Detailed Health Report'}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">
                      {isArabic ? 'التقييم المعرفي' : 'Cognitive Assessment'}
                    </span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-green-500 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800 font-medium">
                      {isArabic ? 'الأنشطة اليومية' : 'Daily Activities'}
                    </span>
                    <div className="text-blue-600 font-semibold">85/100</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-800 font-medium">
                      {isArabic ? 'التوصيات' : 'Recommendations'}
                    </span>
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            {isArabic ? 'ابدأ تقييمك الصحي اليوم' : 'Start Your Health Assessment Today'}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {isArabic
              ? 'خذ الخطوة الأولى نحو فهم أفضل لحالتك الصحية واحصل على توجيه مهني متخصص'
              : 'Take the first step towards better understanding your health and get professional expert guidance'
            }
          </p>
          
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isArabic ? 'ابدأ الآن مجاناً' : 'Get Started Free'}
            <ArrowRight className={`w-5 h-5 ${isArabic ? 'mr-2' : 'ml-2'}`} />
          </Link>

          <div className="mt-6 text-blue-100 text-sm">
            {isArabic ? '✓ بدون رسوم ✓ آمن ومحمي ✓ نتائج فورية' : '✓ No fees ✓ Secure & Protected ✓ Instant Results'}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}