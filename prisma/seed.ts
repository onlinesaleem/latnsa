// prisma/seed.ts - Seed the database with assessment questions
import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding assessment questions...')

  // Group 0: Introductory Questions
  const introGroup = await prisma.questionGroup.create({
    data: {
      name: "Introductory Questions",
      nameAr: "الأسئلة التمهيدية",
      description: "Initial questions to determine form type",
      descriptionAr: "الأسئلة الأولية لتحديد نوع النموذج",
      order: 0,
      videoUrl: null,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: introGroup.id,
        text: "Are you filling out the questionnaire for someone else?",
        textAr: "هل تملأ الاستبيان نيابة عن شخص آخر؟",
        type: QuestionType.RADIO,
        isRequired: true,
        order: 1,
        options: JSON.stringify({
          english: ["Yes", "No"],
          arabic: ["نعم", "لا"]
        })
      },
      {
        questionGroupId: introGroup.id,
        text: "Is this an emergency that may require a visit to the emergency department?",
        textAr: "هل هذه حالة طوارئ قد تتطلب زيارة قسم الطوارئ؟",
        description: "This service does not replace an emergency department visit in urgent cases.",
        descriptionAr: "هذه الخدمة لا تحل محل زيارة قسم الطوارئ في الحالات العاجلة.",
        type: QuestionType.RADIO,
        isRequired: true,
        order: 2,
        options: JSON.stringify({
          english: ["Yes", "No", "I acknowledge I have read this note"],
          arabic: ["نعم", "لا", "أقر بأنني قرأت هذه الملاحظة"]
        })
      }
    ]
  })

  // Group 1: Basic Demographics
  const group1 = await prisma.questionGroup.create({
    data: {
      name: "Basic Information",
      nameAr: "المعلومات الأساسية",
      order: 1,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group1.id,
        text: "What is the age?",
        textAr: "كم العمر؟",
        type: QuestionType.NUMBER,
        isRequired: true,
        order: 3,
        validationRules: JSON.stringify({
          min: 1,
          max: 120
        })
      },
      {
        questionGroupId: group1.id,
        text: "Gender",
        textAr: "الجنس",
        type: QuestionType.RADIO,
        isRequired: true,
        order: 4,
        options: JSON.stringify({
          english: ["Male", "Female"],
          arabic: ["ذكر", "أنثى"]
        })
      }
    ]
  })

  // Group 2: Symptom Onset
  const group2 = await prisma.questionGroup.create({
    data: {
      name: "Symptom Onset",
      nameAr: "بداية الأعراض",
      order: 2,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group2.id,
        text: "When did the symptoms begin?",
        textAr: "متى بدأت الأعراض؟",
        type: QuestionType.RADIO,
        isRequired: true,
        order: 5,
        options: JSON.stringify({
          english: [
            "Acute symptoms - there were no issues until one month ago",
            "Gradually, over several months",
            "Gradually, for a year or more"
          ],
          arabic: [
            "أعراض حادة - لم تكن هناك مشاكل حتى شهر واحد مضى",
            "تدريجياً، خلال عدة أشهر",
            "تدريجياً، لسنة أو أكثر"
          ]
        })
      },
      {
        questionGroupId: group2.id,
        text: "Are the symptoms:",
        textAr: "هل الأعراض:",
        type: QuestionType.RADIO,
        isRequired: true,
        order: 6,
        options: JSON.stringify({
          english: [
            "Worsening since the beginning",
            "Improving since the beginning",
            "The same since the beginning"
          ],
          arabic: [
            "تسوء منذ البداية",
            "تتحسن منذ البداية",
            "نفسها منذ البداية"
          ]
        })
      }
    ]
  })

  // Group 3: Memory Word List (Optional)
  const group3 = await prisma.questionGroup.create({
    data: {
      name: "Memory Word List",
      nameAr: "قائمة كلمات الذاكرة",
      description: "Ask the person to repeat and remember the following words; we will ask them to recall them again at the end of the questionnaire",
      descriptionAr: "اطلب من الشخص تكرار وتذكر الكلمات التالية؛ سنطلب منه تذكرها مرة أخرى في نهاية الاستبيان",
      order: 3,
    }
  })

  await prisma.question.create({
    data: {
      questionGroupId: group3.id,
      text: "Please repeat and remember these words: Face, School, Velvet, Clove, Blue",
      textAr: "يرجى تكرار وتذكر هذه الكلمات: وجه، مدرسة، مخمل، قرنفل، أزرق",
      type: QuestionType.CHECKBOX,
      isRequired: false,
      order: 7,
      options: JSON.stringify({
        english: ["I have read and will remember the words"],
        arabic: ["لقد قرأت الكلمات وسأتذكرها"]
      })
    }
  })

  // Group 4: Current Symptoms (Complex multi-select)
  const group4 = await prisma.questionGroup.create({
    data: {
      name: "Current Symptoms",
      nameAr: "الأعراض الحالية",
      description: "What symptoms is the patient currently experiencing? Choose all that apply. Choose the symptom only if it represents a change from before.",
      descriptionAr: "ما هي الأعراض التي يعاني منها المريض حالياً؟ اختر كل ما ينطبق. اختر العرض فقط إذا كان يمثل تغييراً عما كان عليه من قبل.",
      order: 4,
    }
  })

  await prisma.question.create({
    data: {
      questionGroupId: group4.id,
      text: "What symptoms is the patient currently experiencing?",
      textAr: "ما هي الأعراض التي يعاني منها المريض حالياً؟",
      type: QuestionType.MULTI_SELECT,
      isRequired: true,
      order: 8,
      options: JSON.stringify({
        english: [
          "Forgetting names of people they meet for the first time",
          "Forgetting names of people they know, such as relatives and grandchildren",
          "Repeating questions and conversations",
          "Repeating prayers or repeatedly asking about their timings, or making mistakes in them",
          "Misplacing personal items and forgetting where they were placed (e.g., ID, glasses, etc.)",
          "Forgetting days and dates",
          "Forgetting important appointments and dates such as doctor's visits or important occasions like Eid or Ramadan",
          "Using reminder methods they did not use before, such as writing notes or setting phone alarms",
          "Difficulty planning (e.g., planning a celebration or a summer vacation)",
          "Difficulty making decisions, even simple ones (e.g., choosing from a restaurant menu)",
          "Difficulty doing tasks that require focusing on more than one thing at the same time (e.g., cooking)",
          "Difficulty taking medications on time; or finding that the medications have not finished even though a new prescription is due",
          "Difficulty paying bills or using banking apps, despite previously being able to do so",
          "Difficulty focusing and completing a full conversation, or watching a TV episode or a film",
          "Difficulty finding the appropriate word",
          "Stuttering",
          "Difficulty understanding speech, especially if the topic is complex or if more than one person is speaking",
          "Speaking very little",
          "Difficulty expressing oneself verbally; speech seems unclear at times",
          "Previously got lost, or you think they might get lost in unfamiliar places (e.g., a mall they are not used to, or a place not visited before)",
          "Got lost or you think they might get lost in familiar places such as the home or the neighborhood",
          "Behaving inappropriately on some occasions in a way that is out of character for the patient (e.g., swearing or appearing without clothes)",
          "Change in emotional expression (e.g., laughing when sadness is appropriate, or not showing sadness in sad situations)",
          "Change in relationships and loss of the ability to express love and care to family members and loved ones",
          "Changes in eating habits, such as binge eating or craving sweets",
          "Sleep apnea",
          "Visual or auditory hallucinations",
          "Delusions, such as believing someone is trying to harm them or steal from them",
          "Does not experience any of the above"
        ],
        arabic: [
          "نسيان أسماء الأشخاص الذين يقابلهم لأول مرة",
          "نسيان أسماء الأشخاص الذين يعرفهم، مثل الأقارب والأحفاد",
          "تكرار الأسئلة والمحادثات",
          "تكرار الصلوات أو السؤال المتكرر عن مواقيتها، أو الأخطاء فيها",
          "وضع الأشياء الشخصية في غير مكانها ونسيان مكان وضعها (مثل الهوية، النظارات، إلخ)",
          "نسيان الأيام والتواريخ",
          "نسيان المواعيد المهمة والتواريخ مثل زيارات الطبيب أو المناسبات المهمة مثل العيد أو رمضان",
          "استخدام طرق التذكير التي لم يستخدمها من قبل، مثل كتابة الملاحظات أو ضبط منبهات الهاتف",
          "صعوبة في التخطيط (مثل تخطيط احتفال أو عطلة صيفية)",
          "صعوبة في اتخاذ القرارات، حتى البسيطة منها (مثل الاختيار من قائمة مطعم)",
          "صعوبة في القيام بالمهام التي تتطلب التركيز على أكثر من شيء في الوقت نفسه (مثل الطبخ)",
          "صعوبة في تناول الأدوية في الوقت المحدد؛ أو وجود أن الأدوية لم تنته رغم استحقاق وصفة جديدة",
          "صعوبة في دفع الفواتير أو استخدام تطبيقات البنوك، رغم القدرة على ذلك سابقاً",
          "صعوبة في التركيز وإكمال محادثة كاملة، أو مشاهدة حلقة تلفزيونية أو فيلم",
          "صعوبة في العثور على الكلمة المناسبة",
          "التأتأة",
          "صعوبة في فهم الكلام، خاصة إذا كان الموضوع معقداً أو إذا كان أكثر من شخص يتحدث",
          "التحدث قليلاً جداً",
          "صعوبة في التعبير عن النفس لفظياً؛ يبدو الكلام غير واضح أحياناً",
          "ضل الطريق سابقاً، أو تعتقد أنه قد يضل في أماكن غير مألوفة (مثل مول لم يعتد عليه، أو مكان لم يزره من قبل)",
          "ضل الطريق أو تعتقد أنه قد يضل في أماكن مألوفة مثل المنزل أو الحي",
          "التصرف بشكل غير لائق في بعض المناسبات بطريقة لا تتناسب مع شخصية المريض (مثل السب أو الظهور بدون ملابس)",
          "تغيير في التعبير العاطفي (مثل الضحك عندما يكون الحزن مناسباً، أو عدم إظهار الحزن في المواقف الحزينة)",
          "تغيير في العلاقات وفقدان القدرة على التعبير عن الحب والاهتمام لأفراد العائلة والأحباء",
          "تغييرات في عادات الأكل، مثل الإفراط في الأكل أو الرغبة الشديدة في الحلويات",
          "انقطاع النفس النومي",
          "هلوسات بصرية أو سمعية",
          "أوهام، مثل الاعتقاد أن شخصاً ما يحاول إيذاءهم أو السرقة منهم",
          "لا يعاني من أي مما سبق"
        ]
      })
    }
  })

  // First Noticed Symptom
  await prisma.question.create({
    data: {
      questionGroupId: group4.id,
      text: "Of the previously selected symptoms, which did you notice first?",
      textAr: "من الأعراض المختارة سابقاً، أيها لاحظت أولاً؟",
      type: QuestionType.SINGLE_SELECT,
      isRequired: false,
      order: 9,
      options: JSON.stringify({
        english: "DYNAMIC_FROM_PREVIOUS", // This will be populated dynamically based on previous answer
        arabic: "DYNAMIC_FROM_PREVIOUS"
      })
    }
  })

  // Group 5: Lifestyle and Health
  const group5 = await prisma.questionGroup.create({
    data: {
      name: "Lifestyle and Health Conditions",
      nameAr: "نمط الحياة والحالات الصحية",
      order: 5,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group5.id,
        text: "Which of the following apply to the patient?",
        textAr: "أي من التالي ينطبق على المريض؟",
        type: QuestionType.MULTI_SELECT,
        isRequired: true,
        order: 10,
        options: JSON.stringify({
          english: [
            "Currently smokes or was a smoker within the last five years",
            "Suffers from insomnia or general sleeping problems",
            "Exercises 150 minutes or more per week",
            "Exercises but less than 150 minutes per week",
            "Does not exercise at all"
          ],
          arabic: [
            "يدخن حالياً أو كان مدخناً خلال السنوات الخمس الماضية",
            "يعاني من الأرق أو مشاكل النوم بشكل عام",
            "يمارس الرياضة 150 دقيقة أو أكثر في الأسبوع",
            "يمارس الرياضة لكن أقل من 150 دقيقة في الأسبوع",
            "لا يمارس الرياضة على الإطلاق"
          ]
        })
      },
      {
        questionGroupId: group5.id,
        text: "Does the patient suffer from any of the following diseases?",
        textAr: "هل يعاني المريض من أي من الأمراض التالية؟",
        description: "Choose all that apply. Choose any disease the patient was previously diagnosed with, whether they are on medication or not, and whether it is controlled or not.",
        descriptionAr: "اختر كل ما ينطبق. اختر أي مرض تم تشخيص المريض به سابقاً، سواء كان يتناول دواءً أم لا، وسواء كان مسيطراً عليه أم لا.",
        type: QuestionType.MULTI_SELECT,
        isRequired: true,
        order: 12,
        options: JSON.stringify({
          english: [
            "High blood pressure",
            "Diabetes mellitus",
            "High cholesterol",
            "Depression, anxiety, or any other psychological symptoms",
            "Hypothyroidism",
            "Hearing impairment",
            "Visual impairment",
            "Does not suffer from any of these diseases"
          ],
          arabic: [
            "ارتفاع ضغط الدم",
            "داء السكري",
            "ارتفاع الكوليسترول",
            "الاكتئاب أو القلق أو أي أعراض نفسية أخرى",
            "قصور الغدة الدرقية",
            "ضعف السمع",
            "ضعف البصر",
            "لا يعاني من أي من هذه الأمراض"
          ]
        })
      },
      {
        questionGroupId: group5.id,
        text: "How many years of education does the patient have?",
        textAr: "كم سنة من التعليم حصل عليها المريض؟",
        type: QuestionType.SINGLE_SELECT,
        isRequired: true,
        order: 13,
        options: JSON.stringify({
          english: [
            "0 years",
            "1-6 years",
            "7-12 years",
            "13-16 years",
            "More than 16 years"
          ],
          arabic: [
            "0 سنوات",
            "1-6 سنوات",
            "7-12 سنة",
            "13-16 سنة",
            "أكثر من 16 سنة"
          ]
        })
      }
    ]
  })

  console.log('Basic questions seeded. Bristol scale and other complex sections will be added next...')

  // Note: This is part 1 of the seed. Bristol Activities of Daily Living Scale and other sections
  // will be created in subsequent parts due to complexity
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })