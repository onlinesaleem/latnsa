'use client'
import Image from 'next/image';
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
  Lightbulb,
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
    { numberEn: '50+', numberAr: '50+', labelEn: 'Healthcare Partners', labelAr: 'شريك في الرعاية الصحية' },
  ]

  const features = [
    {
      icon: Brain,
      titleEn: 'Advanced Assessment Tools',
      titleAr: 'أدوات تقييم متقدمة',
      descEn: 'Scientifically validated cognitive and functional assessment instruments',
      descAr: 'أدوات تقييم معرفية ووظيفية معتمدة علمياً',
    },
    {
      icon: Users,
      titleEn: 'Expert Clinical Team',
      titleAr: 'فريق طبي خبير',
      descEn: 'Board-certified healthcare professionals with specialized training',
      descAr: 'متخصصون في الرعاية الصحية معتمدون مع تدريب متخصص',
    },
    {
      icon: Shield,
      titleEn: 'Privacy & Security',
      titleAr: 'الخصوصية والأمان',
      descEn: 'HIPAA-compliant security measures to protect your health information',
      descAr: 'تدابير أمنية متوافقة مع معايير حماية المعلومات الصحية',
    },
    {
      icon: Clock,
      titleEn: 'Quick & Convenient',
      titleAr: 'سريع ومريح',
      descEn: 'Complete assessments from the comfort of your home in 15–20 minutes',
      descAr: 'أكمل التقييمات من راحة منزلك في 15–20 دقيقة',
    },
  ]

  const team = [
    {
      nameEn: 'Dr. Sarah Al-Mansouri',
      nameAr: 'د. سارة المنصوري',
      roleEn: 'Clinical Director',
      roleAr: 'المديرة الطبية',
      specialtyEn: 'Neuropsychology',
      specialtyAr: 'علم النفس العصبي',
    },
    {
      nameEn: 'Dr. Ahmed Hassan',
      nameAr: 'د. أحمد حسن',
      roleEn: 'Senior Clinician',
      roleAr: 'طبيب أول',
      specialtyEn: 'Geriatric Medicine',
      specialtyAr: 'طب المسنين',
    },
    {
      nameEn: 'Dr. Fatima Al-Zahra',
      nameAr: 'د. فاطمة الزهراء',
      roleEn: 'Research Coordinator',
      roleAr: 'منسقة البحوث',
      specialtyEn: 'Cognitive Assessment',
      specialtyAr: 'التقييم المعرفي',
    },
  ]

  return (
    <div className={`min-h-screen ${isArabic ? 'rtl' : 'ltr'} font-sans bg-gradient-to-b from-[#f7f9ff] via-[#f2f4ff] to-[#ffffff]`}>
      
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-[#E6F0FF] via-[#F5F3FF] to-[#FFF5F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
  <Image
  src="/logo.jpeg"
  alt="Latnsa Health Logo"
  className="mx-auto mb-8 rounded-2xl shadow-lg"
  width={80}  // Required - equivalent to w-20 (20 * 4 = 80)
  height={80} // Required - equivalent to h-20 (20 * 4 = 80)
  priority={true} // Optional: if this is above the fold/important image
/>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {isArabic ? 'حول لاتنسا الصحية' : 'About Latnsa Health'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {isArabic
              ? 'نحن متخصصون في تقديم تقييمات صحية شاملة ودقيقة للمساعدة في الكشف المبكر عن التغييرات المعرفية والوظيفية'
              : 'We specialize in providing comprehensive and accurate health assessments to help with early detection of cognitive and functional changes'}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-gradient-to-br from-[#EEF3FF] to-[#F9FAFF] shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] mb-2">
                {isArabic ? stat.numberAr : stat.numberEn}
              </div>
              <div className="text-gray-600">{isArabic ? stat.labelAr : stat.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-[#FFF8FB] via-[#F4F7FF] to-[#EAF4FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {isArabic ? 'مهمتنا' : 'Our Mission'}
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {isArabic
                ? 'نهدف إلى توفير أدوات تقييم صحية متقدمة ومتاحة للجميع...'
                : 'We aim to provide advanced and accessible health assessment tools...'}
            </p>
            <div className="space-y-4">
              {[ 
                { icon: Target, en: 'Early Detection', ar: 'الكشف المبكر', descEn: 'Identify cognitive changes early', descAr: 'تحديد التغييرات المعرفية في مراحلها المبكرة' },
                { icon: Heart, en: 'Personalized Care', ar: 'رعاية شخصية', descEn: 'Tailored recommendations', descAr: 'توصيات مخصصة بناءً على احتياجاتك الفردية' },
                { icon: Lightbulb, en: 'Health Education', ar: 'التثقيف الصحي', descEn: 'Promoting awareness', descAr: 'تعزيز الوعي بالصحة المعرفية' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-start space-x-3">
                    <Icon className="w-6 h-6 text-[#85C3E0] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{isArabic ? item.ar : item.en}</h3>
                      <p className="text-gray-600">{isArabic ? item.descAr : item.descEn}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {isArabic ? 'معتمد دولياً' : 'Internationally Certified'}
            </h3>
            <p className="text-gray-600 mb-3">
              {isArabic ? 'أدواتنا معتمدة من قبل المنظمات الصحية الدولية' : 'Our tools are certified by international organizations'}
            </p>
            <div className="flex justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {isArabic ? 'ما يميزنا' : 'What Sets Us Apart'}
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            {isArabic
              ? 'نجمع بين التكنولوجيا والخبرة الطبية...'
              : 'We combine technology and medical expertise...'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="p-6 rounded-2xl bg-gradient-to-br from-[#F8FAFF] to-[#FFFFFF] hover:shadow-xl transition-all border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isArabic ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-gray-600">{isArabic ? feature.descAr : feature.descEn}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-[#F5F8FF] to-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {isArabic ? 'فريقنا الطبي' : 'Our Clinical Team'}
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            {isArabic
              ? 'خبراء معتمدون في الصحة المعرفية'
              : 'Certified experts in cognitive and functional health'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-r from-[#E76A6A] to-[#85C3E0] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isArabic ? member.nameAr : member.nameEn}
                </h3>
                <p className="text-[#85C3E0] font-medium mb-1">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {isArabic ? 'قيمنا' : 'Our Values'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle, color: 'green', en: 'Accuracy', ar: 'الدقة', descEn: 'Highest standards of accuracy', descAr: 'نلتزم بأعلى معايير الدقة' },
              { icon: Heart, color: 'blue', en: 'Compassion', ar: 'التعاطف', descEn: 'Care with empathy', descAr: 'نقدم الرعاية بتعاطف وفهم' },
              { icon: Shield, color: 'purple', en: 'Trust', ar: 'الثقة', descEn: 'Protecting privacy & transparency', descAr: 'نحمي خصوصيتك ونبني الثقة' },
            ].map((val, i) => {
              const Icon = val.icon
              return (
                <div key={i} className="bg-gradient-to-br from-[#F8FAFF] to-[#FFFFFF] p-8 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 bg-${val.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 text-${val.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{isArabic ? val.ar : val.en}</h3>
                  <p className="text-gray-600">{isArabic ? val.descAr : val.descEn}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
