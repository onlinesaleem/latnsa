// components/AboutPage.tsx
'use client'

import React from 'react'
import { 
  Brain, 
  Users, 
  Award, 
  Heart, 
  Shield, 
  Clock,
  CheckCircle,
  Star,
  Target,
  Lightbulb
} from 'lucide-react'

interface AboutPageProps {
  language?: 'english' | 'arabic'
}

export default function AboutPage({ language = 'english' }: AboutPageProps) {
  const isArabic = language === 'arabic'

  const stats = [
    { numberEn: '10,000+', numberAr: '10,000+', labelEn: 'Assessments Completed', labelAr: 'تقييم مكتمل' },
    { numberEn: '95%', numberAr: '95%', labelEn: 'Accuracy Rate', labelAr: 'معدل الدقة' },
    { numberEn: '24/7', numberAr: '24/7', labelEn: 'Available', labelAr: 'متاح' },
    { numberEn: '50+', numberAr: '50+', labelEn: 'Healthcare Partners', labelAr: 'شريك في الرعاية الصحية' }
  ]

  const features = [
    {
      icon: Brain,
      titleEn: 'Advanced Assessment Tools',
      titleAr: 'أدوات تقييم متقدمة',
      descEn: 'Scientifically validated cognitive and functional assessment instruments',
      descAr: 'أدوات تقييم معرفية ووظيفية معتمدة علمياً'
    },
    {
      icon: Users,
      titleEn: 'Expert Clinical Team',
      titleAr: 'فريق طبي خبير',
      descEn: 'Board-certified healthcare professionals with specialized training',
      descAr: 'متخصصون في الرعاية الصحية معتمدون مع تدريب متخصص'
    },
    {
      icon: Shield,
      titleEn: 'Privacy & Security',
      titleAr: 'الخصوصية والأمان',
      descEn: 'HIPAA-compliant security measures to protect your health information',
      descAr: 'تدابير أمنية متوافقة مع معايير حماية المعلومات الصحية'
    },
    {
      icon: Clock,
      titleEn: 'Quick & Convenient',
      titleAr: 'سريع ومريح',
      descEn: 'Complete assessments from the comfort of your home in 15-20 minutes',
      descAr: 'أكمل التقييمات من راحة منزلك في 15-20 دقيقة'
    }
  ]

  const team = [
    {
      nameEn: 'Dr. Sarah Al-Mansouri',
      nameAr: 'د. سارة المنصوري',
      roleEn: 'Clinical Director',
      roleAr: 'المديرة الطبية',
      specialtyEn: 'Neuropsychology',
      specialtyAr: 'علم النفس العصبي'
    },
    {
      nameEn: 'Dr. Ahmed Hassan',
      nameAr: 'د. أحمد حسن',
      roleEn: 'Senior Clinician',
      roleAr: 'طبيب أول',
      specialtyEn: 'Geriatric Medicine',
      specialtyAr: 'طب المسنين'
    },
    {
      nameEn: 'Dr. Fatima Al-Zahra',
      nameAr: 'د. فاطمة الزهراء',
      roleEn: 'Research Coordinator',
      roleAr: 'منسقة البحوث',
      specialtyEn: 'Cognitive Assessment',
      specialtyAr: 'التقييم المعرفي'
    }
  ]

  return (
    <div className={`min-h-screen bg-white ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {isArabic ? 'حول لاتنسا الصحية' : 'About Latnsa Health'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isArabic 
                ? 'نحن متخصصون في تقديم تقييمات صحية شاملة ودقيقة للمساعدة في الكشف المبكر عن التغييرات المعرفية والوظيفية'
                : 'We specialize in providing comprehensive and accurate health assessments to help with early detection of cognitive and functional changes'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {isArabic ? stat.numberAr : stat.numberEn}
                </div>
                <div className="text-gray-600">
                  {isArabic ? stat.labelAr : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {isArabic ? 'مهمتنا' : 'Our Mission'}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {isArabic
                  ? 'نهدف إلى توفير أدوات تقييم صحية متقدمة ومتاحة للجميع، مما يمكّن الأفراد ومقدمي الرعاية من اتخاذ قرارات مدروسة حول صحتهم المعرفية والوظيفية.'
                  : 'We aim to provide advanced and accessible health assessment tools that empower individuals and caregivers to make informed decisions about their cognitive and functional health.'
                }
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {isArabic ? 'الكشف المبكر' : 'Early Detection'}
                    </h3>
                    <p className="text-gray-600">
                      {isArabic ? 'تحديد التغييرات المعرفية في مراحلها المبكرة' : 'Identify cognitive changes in their early stages'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {isArabic ? 'رعاية شخصية' : 'Personalized Care'}
                    </h3>
                    <p className="text-gray-600">
                      {isArabic ? 'توصيات مخصصة بناءً على احتياجاتك الفردية' : 'Tailored recommendations based on your individual needs'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {isArabic ? 'التثقيف الصحي' : 'Health Education'}
                    </h3>
                    <p className="text-gray-600">
                      {isArabic ? 'تعزيز الوعي والفهم للصحة المعرفية' : 'Promoting awareness and understanding of cognitive health'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {isArabic ? 'معتمد دولياً' : 'Internationally Certified'}
                  </h3>
                  <p className="text-gray-600">
                    {isArabic 
                      ? 'أدوات التقييم لدينا معتمدة من قبل المنظمات الصحية الدولية'
                      : 'Our assessment tools are certified by international health organizations'
                    }
                  </p>
                  <div className="flex justify-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isArabic ? 'ما يميزنا' : 'What Sets Us Apart'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isArabic
                ? 'نجمع بين التكنولوجيا المتقدمة والخبرة الطبية لتقديم تقييمات دقيقة وشاملة'
                : 'We combine advanced technology with medical expertise to deliver accurate and comprehensive assessments'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
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

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isArabic ? 'فريقنا الطبي' : 'Our Clinical Team'}
            </h2>
            <p className="text-xl text-gray-600">
              {isArabic 
                ? 'خبراء معتمدون في مجال الصحة المعرفية والوظيفية'
                : 'Certified experts in cognitive and functional health'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isArabic ? member.nameAr : member.nameEn}
                </h3>
                <p className="text-blue-600 font-medium mb-1">
                  {isArabic ? member.roleAr : member.roleEn}
                </p>
                <p className="text-gray-600">
                  {isArabic ? member.specialtyAr : member.specialtyEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {isArabic ? 'قيمنا' : 'Our Values'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isArabic ? 'الدقة' : 'Accuracy'}
              </h3>
              <p className="text-gray-600">
                {isArabic 
                  ? 'نلتزم بأعلى معايير الدقة في جميع تقييماتنا'
                  : 'We maintain the highest standards of accuracy in all our assessments'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isArabic ? 'التعاطف' : 'Compassion'}
              </h3>
              <p className="text-gray-600">
                {isArabic 
                  ? 'نقدم الرعاية بتعاطف وفهم لاحتياجات كل مريض'
                  : 'We provide care with empathy and understanding of each patient\'s needs'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isArabic ? 'الثقة' : 'Trust'}
              </h3>
              <p className="text-gray-600">
                {isArabic 
                  ? 'نحمي خصوصيتك ونبني الثقة من خلال الشفافية'
                  : 'We protect your privacy and build trust through transparency'
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}