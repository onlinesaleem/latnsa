// prisma/seed-complete.ts - Complete seed matching the questionnaire document exactly
import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCompleteQuestionnaire() {
  console.log('Seeding complete healthcare assessment questionnaire...')

  // Clear existing data
  await prisma.assessmentResponse.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.question.deleteMany()
  await prisma.questionGroup.deleteMany()

  // Group 1: Introductory Questions
  const group1 = await prisma.questionGroup.create({
    data: {
      name: "Introductory Questions",
      nameAr: "أسئلة تمهيدية",
      description: "General Questions",
      descriptionAr: "أسئلة عامة",
      order: 1,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group1.id,
        text: "Are you filling out the questionnaire for someone else?",
        textAr: "هل تملأ الاستبيان لشخص آخر؟",
        type: QuestionType.RADIO,
        isRequired: true,
        order: 1,
        options: JSON.stringify({
          english: ["Yes", "No"],
          arabic: ["نعم", "لا"]
        })
      },
      {
        questionGroupId: group1.id,
        text: "Is this an emergency that may require a visit to the emergency department? Note: This service does not replace an emergency department visit in urgent cases.",
        textAr: "هل هذه حالة طوارئ قد تتطلب زيارة قسم الطوارئ؟ ملاحظة: هذه الخدمة لا تحل محل زيارة قسم الطوارئ في الحالات العاجلة.",
        type: QuestionType.RADIO,
        isRequired: true,
        order: 2,
        options: JSON.stringify({
          english: ["Yes", "No", "I acknowledge I have read this note"],
          arabic: ["نعم", "لا", "أقر أنني قرأت هذه الملاحظة"]
        })
      }
    ]
  })

  // Group 2: Basic Demographics
  const group2 = await prisma.questionGroup.create({
    data: {
      name: "Basic Demographics",
      nameAr: "المعلومات الأساسية",
      description: "Age and Gender",
      descriptionAr: "العمر والجنس",
      order: 2,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group2.id,
        text: "What is the age? (Required)",
        textAr: "ما هو العمر؟ (مطلوب)",
        type: QuestionType.NUMBER,
        isRequired: true,
        order: 3,
      },
      {
        questionGroupId: group2.id,
        text: "Gender (Required)",
        textAr: "الجنس (مطلوب)",
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

  // Group 3: Symptom Onset
  const group3 = await prisma.questionGroup.create({
    data: {
      name: "Symptom Onset",
      nameAr: "بداية الأعراض",
      description: "When and how symptoms began",
      descriptionAr: "متى وكيف بدأت الأعراض",
      order: 3,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group3.id,
        text: "When did the symptoms begin? (Required)",
        textAr: "متى بدأت الأعراض؟ (مطلوب)",
        type: QuestionType.SINGLE_SELECT,
        isRequired: true,
        order: 5,
        options: JSON.stringify({
          english: [
            "Acute symptoms — there were no issues until one month ago",
            "Gradually, over several months", 
            "Gradually, for a year or more"
          ],
          arabic: [
            "أعراض حادة — لم تكن هناك مشاكل حتى شهر مضى",
            "تدريجياً، على مدى عدة أشهر",
            "تدريجياً، لسنة أو أكثر"
          ]
        })
      },
      {
        questionGroupId: group3.id,
        text: "Are the symptoms:",
        textAr: "هل الأعراض:",
        type: QuestionType.SINGLE_SELECT,
        isRequired: true,
        order: 6,
        options: JSON.stringify({
          english: [
            "Worsening since the beginning",
            "Improving since the beginning",
            "The same since the beginning"
          ],
          arabic: [
            "تتفاقم منذ البداية",
            "تتحسن منذ البداية", 
            "نفس الحالة منذ البداية"
          ]
        })
      }
    ]
  })

  // Group 4: Memory Word List
  const group4 = await prisma.questionGroup.create({
    data: {
      name: "Memory Word List (to recall later)",
      nameAr: "قائمة كلمات الذاكرة (للتذكر لاحقاً)",
      description: "Ask the person to repeat and remember the following words; we will ask them to recall them again at the end of the questionnaire",
      descriptionAr: "اطلب من الشخص تكرار وتذكر الكلمات التالية؛ سنطلب منهم تذكرها مرة أخرى في نهاية الاستبيان",
      order: 4,
    }
  })

  await prisma.question.create({
    data: {
      questionGroupId: group4.id,
      text: "Ask the person to repeat and remember the following words: Face, School, Velvet, Clove, Blue",
      textAr: "اطلب من الشخص تكرار وتذكر الكلمات التالية: وجه، مدرسة، مخمل، قرنفل، أزرق",
      type: QuestionType.CHECKBOX,
      isRequired: false,
      order: 7,
      options: JSON.stringify({
        english: ["Words have been read to the person"],
        arabic: ["تم قراءة الكلمات للشخص"]
      })
    }
  })

  // Group 5: Current Symptoms
  const group5 = await prisma.questionGroup.create({
    data: {
      name: "Current Symptoms",
      nameAr: "الأعراض الحالية",
      description: "What symptoms is the patient currently experiencing? Choose all that apply. Choose the symptom only if it represents a change from before.",
      descriptionAr: "ما هي الأعراض التي يعاني منها المريض حالياً؟ اختر كل ما ينطبق. اختر العَرَض فقط إذا كان يمثل تغييراً عما كان عليه من قبل.",
      order: 5,
    }
  })

  const currentSymptoms = [
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
  ]

  const currentSymptomsAr = [
    "نسيان أسماء الأشخاص الذين يقابلهم لأول مرة",
    "نسيان أسماء الأشخاص الذين يعرفهم، مثل الأقارب والأحفاد",
    "تكرار الأسئلة والمحادثات",
    "تكرار الصلوات أو السؤال المتكرر عن مواقيتها، أو الخطأ فيها",
    "فقدان الأشياء الشخصية ونسيان مكان وضعها (مثل الهوية، النظارات، إلخ)",
    "نسيان الأيام والتواريخ",
    "نسيان المواعيد والتواريخ المهمة مثل زيارات الطبيب أو المناسبات المهمة كالعيد أو رمضان",
    "استخدام طرق تذكير لم يكن يستخدمها من قبل، مثل كتابة الملاحظات أو ضبط منبهات الهاتف",
    "صعوبة التخطيط (مثل التخطيط لاحتفال أو إجازة صيفية)",
    "صعوبة اتخاذ القرارات، حتى البسيطة منها (مثل الاختيار من قائمة طعام مطعم)",
    "صعوبة القيام بالمهام التي تتطلب التركيز على أكثر من شيء في نفس الوقت (مثل الطبخ)",
    "صعوبة تناول الأدوية في الوقت المحدد؛ أو اكتشاف أن الأدوية لم تنته رغم حلول موعد الوصفة الجديدة",
    "صعوبة دفع الفواتير أو استخدام تطبيقات البنوك، رغم القدرة على ذلك سابقاً",
    "صعوبة التركيز وإكمال محادثة كاملة، أو مشاهدة حلقة تلفزيونية أو فيلم",
    "صعوبة العثور على الكلمة المناسبة",
    "التأتأة",
    "صعوبة فهم الكلام، خاصة إذا كان الموضوع معقداً أو إذا كان أكثر من شخص يتحدث",
    "التحدث قليلاً جداً",
    "صعوبة التعبير عن النفس شفهياً؛ يبدو الكلام غير واضح أحياناً",
    "ضاع سابقاً، أو تعتقد أنه قد يضيع في أماكن غير مألوفة (مثل مول غير معتاد عليه، أو مكان لم يزره من قبل)",
    "ضاع أو تعتقد أنه قد يضيع في أماكن مألوفة مثل المنزل أو الحي",
    "التصرف بشكل غير لائق في بعض المناسبات بطريقة لا تتفق مع شخصية المريض (مثل السب أو الظهور بدون ملابس)",
    "تغيير في التعبير العاطفي (مثل الضحك عندما يكون الحزن مناسباً، أو عدم إظهار الحزن في المواقف الحزينة)",
    "تغيير في العلاقات وفقدان القدرة على التعبير عن الحب والاهتمام لأفراد الأسرة والأحباء",
    "تغييرات في عادات الأكل، مثل الأكل بنهم أو الرغبة الشديدة في الحلويات",
    "انقطاع النفس النومي",
    "هلوسات بصرية أو سمعية",
    "أوهام، مثل الاعتقاد أن شخصاً ما يحاول إيذاءه أو السرقة منه",
    "لا يعاني من أي مما سبق"
  ]

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group5.id,
        text: "What symptoms is the patient currently experiencing? (Choose all that apply. Choose the symptom only if it represents a change from before)",
        textAr: "ما هي الأعراض التي يعاني منها المريض حالياً؟ (اختر كل ما ينطبق. اختر العَرَض فقط إذا كان يمثل تغييراً عما كان عليه من قبل)",
        type: QuestionType.MULTI_SELECT,
        isRequired: true,
        order: 8,
        options: JSON.stringify({
          english: currentSymptoms,
          arabic: currentSymptomsAr
        })
      },
      {
        questionGroupId: group5.id,
        text: "Of the previously selected symptoms, which did you notice first?",
        textAr: "من الأعراض المختارة سابقاً، أيها لاحظت أولاً؟",
        type: QuestionType.SINGLE_SELECT,
        isRequired: false,
        order: 9,
        options: JSON.stringify({
          english: currentSymptoms.slice(0, -1), // Exclude "Does not experience any"
          arabic: currentSymptomsAr.slice(0, -1)
        })
      }
    ]
  })

  // Group 6: Lifestyle and Health Conditions
  const group6 = await prisma.questionGroup.create({
    data: {
      name: "Lifestyle and Health Conditions",
      nameAr: "أنماط الحياة والحالات الصحية",
      description: "Information about lifestyle factors and existing health conditions",
      descriptionAr: "معلومات عن عوامل نمط الحياة والحالات الصحية الموجودة",
      order: 6,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group6.id,
        text: "Which of the following apply to the patient? (Choose all that apply)",
        textAr: "أي مما يلي ينطبق على المريض؟ (اختر كل ما ينطبق)",
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
            "يعاني من الأرق أو مشاكل النوم العامة",
            "يمارس الرياضة 150 دقيقة أو أكثر في الأسبوع",
            "يمارس الرياضة لكن أقل من 150 دقيقة في الأسبوع",
            "لا يمارس الرياضة على الإطلاق"
          ]
        })
      },
      {
        questionGroupId: group6.id,
        text: "Does the patient suffer from any of the following diseases? (Choose all that apply. Choose any disease the patient was previously diagnosed with, whether they are on medication or not, and whether it is controlled or not.)",
        textAr: "هل يعاني المريض من أي من الأمراض التالية؟ (اختر كل ما ينطبق. اختر أي مرض تم تشخيص المريض به سابقاً، سواء كان يتناول دواء أم لا، وسواء كان مسيطراً عليه أم لا)",
        type: QuestionType.MULTI_SELECT,
        isRequired: true,
        order: 11,
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
            "ارتفاع الكولسترول",
            "الاكتئاب أو القلق أو أي أعراض نفسية أخرى",
            "قصور الغدة الدرقية",
            "ضعف السمع",
            "ضعف البصر",
            "لا يعاني من أي من هذه الأمراض"
          ]
        })
      },
      {
        questionGroupId: group6.id,
        text: "How many years of education does the patient have? (Required)",
        textAr: "كم سنة من التعليم لدى المريض؟ (مطلوب)",
        type: QuestionType.SINGLE_SELECT,
        isRequired: true,
        order: 12,
        options: JSON.stringify({
          english: ["0 years", "1–6 years", "7–12 years", "13–16 years", "More than 16 years"],
          arabic: ["0 سنوات", "1-6 سنوات", "7-12 سنة", "13-16 سنة", "أكثر من 16 سنة"]
        })
      }
    ]
  })

  // Group 7: Current Mental and Functional Abilities (with scoring)
  const group7 = await prisma.questionGroup.create({
    data: {
      name: "Current Mental and Functional Abilities",
      nameAr: "القدرات العقلية والوظيفية الحالية",
      description: "This section needs scoring, total score equal the number selected",
      descriptionAr: "هذا القسم يحتاج إلى تسجيل نقاط، المجموع الكلي يساوي الرقم المختار",
      order: 7,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group7.id,
        text: "Based on your assessment of the person's current mental and functional abilities, choose the statement that best describes their current situation: (can select only one answer)",
        textAr: "بناءً على تقييمك للقدرات العقلية والوظيفية الحالية للشخص، اختر العبارة التي تصف وضعه الحالي بأفضل شكل: (يمكن اختيار إجابة واحدة فقط)",
        type: QuestionType.SINGLE_SELECT,
        isRequired: true,
        order: 13,
        options: JSON.stringify({
          english: [
            "1- No difficulty performing any daily tasks",
            "2- Forgets items and words but can still perform daily tasks",
            "3- Forgets items, words, and places, and has begun to experience a decline in daily performance but is still independent",
            "4- All of the above, plus inability to perform complex tasks such as planning a family visit or planning travel and paying bills",
            "5- All of the above, plus needs help choosing appropriate clothing. May wear the same clothes for several days or more than once unless supervised",
            "6- All of the above, plus needs help with dressing, bathing, or using the bathroom",
            "7- All of the above, plus a sharp decline in the ability to speak, move, smile, or sit"
          ],
          arabic: [
            "1- لا صعوبة في أداء أي مهام يومية",
            "2- ينسى الأشياء والكلمات لكن لا يزال قادراً على أداء المهام اليومية",
            "3- ينسى الأشياء والكلمات والأماكن، وبدأ يعاني من تراجع في الأداء اليومي لكنه لا يزال مستقلاً",
            "4- كل ما سبق، بالإضافة إلى عدم القدرة على أداء المهام المعقدة مثل تخطيط زيارة عائلية أو التخطيط للسفر ودفع الفواتير",
            "5- كل ما سبق، بالإضافة إلى الحاجة للمساعدة في اختيار الملابس المناسبة. قد يرتدي نفس الملابس لعدة أيام أو أكثر من مرة ما لم يكن تحت الإشراف",
            "6- كل ما سبق، بالإضافة إلى الحاجة للمساعدة في ارتداء الملابس أو الاستحمام أو استخدام الحمام",
            "7- كل ما سبق، بالإضافة إلى تراجع حاد في القدرة على الكلام أو الحركة أو الابتسامة أو الجلوس"
          ]
        }),
        validationRules: JSON.stringify({
          functional_scoring: true // For functional abilities scoring (1-7)
        })
      },
      {
        questionGroupId: group7.id,
        text: "Are you the primary caregiver? (Required)",
        textAr: "هل أنت مقدم الرعاية الأساسي؟ (مطلوب)",
        type: QuestionType.RADIO,
        isRequired: true,
        order: 14,
        options: JSON.stringify({
          english: ["Yes", "No"],
          arabic: ["نعم", "لا"]
        })
      },
      {
        questionGroupId: group7.id,
        text: "What is the gender of the primary caregiver? (Required)",
        textAr: "ما هو جنس مقدم الرعاية الأساسي؟ (مطلوب)",
        type: QuestionType.RADIO,
        isRequired: true,
        order: 15,
        options: JSON.stringify({
          english: ["Male", "Female"],
          arabic: ["ذكر", "أنثى"]
        })
      }
    ]
  })

  // Bristol Activities of Daily Living Scale (needs scoring, A=0 B=1 C=2 D=3 E=0)
  const bristolGroup = await prisma.questionGroup.create({
    data: {
      name: "Bristol Activities of Daily Living Scale",
      nameAr: "مقياس بريستول للأنشطة اليومية",
      description: "This questionnaire is designed to assess the daily living abilities of people who may have memory difficulties. Choose the box that represents your relative's/friend's average ability over the last two weeks. If you are unsure, choose the ability level that represents the average performance over the last two weeks. Choose \"Not applicable\" if your relative/friend has never performed this activity even when healthy. Scoring: A=0, B=1, C=2, D=3, E=0",
      descriptionAr: "هذا الاستبيان مصمم لتقييم قدرات المعيشة اليومية للأشخاص الذين قد يواجهون صعوبات في الذاكرة بطريقة أو بأخرى. في الأنشطة من 1 إلى 20، تشير العبارات (أ-هـ) إلى مستويات مختلفة من القدرة. اختر المربع (لكل سؤال أدناه) الذي يمثل متوسط قدرة قريبك/صديقك خلال الأسبوعين الماضيين. التسجيل: أ=0، ب=1، ج=2، د=3، هـ=0",
      order: 8,
    }
  })

  // All 20 Bristol Scale Questions exactly as in the document
  const bristolQuestions = [
    {
      text: "Food preparation",
      textAr: "إعداد الطعام",
      options: [
        "A) Chooses and prepares food appropriately",
        "B) Can prepare food if the ingredients are provided", 
        "C) Can prepare food if prompted step by step",
        "D) Cannot prepare food even after prompting and supervision",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يختار ويحضر الطعام بشكل مناسب",
        "ب) يمكنه تحضير الطعام إذا توفرت المكونات",
        "ج) يمكنه تحضير الطعام إذا تم توجيهه خطوة بخطوة",
        "د) لا يستطيع تحضير الطعام حتى بعد التوجيه والإشراف",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Eating",
      textAr: "الأكل",
      options: [
        "A) Eats using the correct utensils or with the hands as usual",
        "B) Eats appropriately if the food is prepared in an easy-to-eat way (e.g., cutting bread)",
        "C) Eats using the fingers in a primitive way, unlike usual",
        "D) Needs someone to feed them",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يأكل باستخدام الأدوات الصحيحة أو بيديه كالمعتاد",
        "ب) يأكل بشكل مناسب إذا تم تحضير الطعام بطريقة سهلة الأكل (مثل تقطيع الخبز)",
        "ج) يأكل بأصابعه بطريقة بدائية، على خلاف المعتاد",
        "د) يحتاج إلى شخص ليطعمه",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Drink preparation",
      textAr: "تحضير المشروبات",
      options: [
        "A) Chooses and prepares drinks appropriately",
        "B) Can prepare drinks if the ingredients are provided",
        "C) Can prepare drinks if prompted step by step",
        "D) Cannot prepare drinks even after prompting and supervision",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يختار ويحضر المشروبات بشكل مناسب",
        "ب) يمكنه تحضير المشروبات إذا توفرت المكونات",
        "ج) يمكنه تحضير المشروبات إذا تم توجيهه خطوة بخطوة",
        "د) لا يستطيع تحضير المشروبات حتى بعد التوجيه والإشراف",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Drinking",
      textAr: "الشرب",
      options: [
        "A) Drinks normally",
        "B) Can drink but with assistive tools such as a straw",
        "C) Cannot drink even with assistive tools (e.g., a lidded cup) but tries",
        "D) Needs someone to help with drinking",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يشرب بشكل طبيعي",
        "ب) يمكنه الشرب لكن بأدوات مساعدة مثل الشفاط",
        "ج) لا يستطيع الشرب حتى بأدوات مساعدة (مثل كوب بغطاء) لكنه يحاول",
        "د) يحتاج إلى شخص للمساعدة في الشرب",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Dressing",
      textAr: "ارتداء الملابس",
      options: [
        "A) Chooses appropriate clothes and dresses independently",
        "B) Dresses but in the wrong order, inside-out, or in dirty clothes",
        "C) Cannot dress independently but moves limbs to help",
        "D) Does not assist with dressing and needs full help to be dressed",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يختار الملابس المناسبة ويرتديها بشكل مستقل",
        "ب) يرتدي الملابس لكن بترتيب خاطئ أو مقلوبة أو متسخة",
        "ج) لا يستطيع ارتداء الملابس بشكل مستقل لكنه يحرك أطرافه للمساعدة",
        "د) لا يساعد في ارتداء الملابس ويحتاج إلى مساعدة كاملة",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Personal hygiene",
      textAr: "النظافة الشخصية",
      options: [
        "A) Washes hands and face regularly and independently",
        "B) Can wash if soap or a towel is provided",
        "C) Can wash after prompting and supervision",
        "D) Unable to wash alone and needs complete assistance",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يغسل يديه ووجهه بانتظام وبشكل مستقل",
        "ب) يمكنه الغسل إذا تم توفير الصابون أو المنشفة",
        "ج) يمكنه الغسل بعد التوجيه والإشراف",
        "د) غير قادر على الغسل وحده ويحتاج إلى مساعدة كاملة",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Teeth",
      textAr: "الأسنان",
      options: [
        "A) Cleans teeth/dentures regularly and independently",
        "B) Cleans teeth/dentures regularly if the tools are brought to them",
        "C) Needs some help such as applying toothpaste to the brush or putting the brush in the mouth",
        "D) Needs full assistance to clean teeth",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) ينظف أسنانه/طقم أسنانه بانتظام وبشكل مستقل",
        "ب) ينظف أسنانه/طقم أسنانه بانتظام إذا تم إحضار الأدوات إليه",
        "ج) يحتاج إلى بعض المساعدة مثل وضع معجون الأسنان على الفرشاة أو وضع الفرشاة في الفم",
        "د) يحتاج إلى مساعدة كاملة لتنظيف الأسنان",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Bathing",
      textAr: "الاستحمام",
      options: [
        "A) Bathes entirely, regularly, and independently",
        "B) Needs help preparing the bath/water but bathes independently",
        "C) Needs supervision and prompting to bathe",
        "D) Fully dependent and needs complete assistance",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يستحم بشكل كامل ومنتظم ومستقل",
        "ب) يحتاج إلى مساعدة في تحضير الحمام/الماء لكنه يستحم بشكل مستقل",
        "ج) يحتاج إلى إشراف وتوجيه للاستحمام",
        "د) معتمد بشكل كامل ويحتاج إلى مساعدة تامة",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Toilet use",
      textAr: "استخدام المرحاض",
      options: [
        "A) Uses the toilet properly and as needed",
        "B) Needs help getting to the toilet and some other assistance",
        "C) Incontinent of either urine or feces",
        "D) Incontinent of both urine and feces",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يستخدم المرحاض بشكل صحيح وحسب الحاجة",
        "ب) يحتاج إلى مساعدة للوصول إلى المرحاض وبعض المساعدة الأخرى",
        "ج) سلس إما في البول أو البراز",
        "د) سلس في كل من البول والبراز",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Transferring (sitting/standing)",
      textAr: "النقل (الجلوس/الوقوف)",
      options: [
        "A) Can sit and rise from a chair without assistance",
        "B) Can sit independently but needs help to rise",
        "C) Needs help to sit and rise from a chair",
        "D) Fully dependent on others to sit and rise from a chair",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يستطيع الجلوس والنهوض من الكرسي دون مساعدة",
        "ب) يستطيع الجلوس بشكل مستقل لكنه يحتاج إلى مساعدة للنهوض",
        "ج) يحتاج إلى مساعدة للجلوس والنهوض من الكرسي",
        "د) معتمد بشكل كامل على الآخرين للجلوس والنهوض من الكرسي",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Walking",
      textAr: "المشي",
      options: [
        "A) Walks independently without assistance",
        "B) Walks but with assistance (e.g., holding onto furniture or another person's arm)",
        "C) Moves using assistive devices such as a walker or cane",
        "D) Cannot walk",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يمشي بشكل مستقل دون مساعدة",
        "ب) يمشي لكن بمساعدة (مثل التمسك بالأثاث أو ذراع شخص آخر)",
        "ج) يتحرك باستخدام أدوات مساعدة مثل المشاية أو العكاز",
        "د) لا يستطيع المشي",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Time orientation",
      textAr: "التوجه الزمني",
      options: [
        "A) Fully aware of the time, day, and date",
        "B) Not aware of the time or day but not concerned",
        "C) Frequently asks for the time, day, and date",
        "D) Confuses night and day",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) على علم كامل بالوقت واليوم والتاريخ",
        "ب) غير مدرك للوقت أو اليوم لكنه غير مهتم",
        "ج) يسأل كثيراً عن الوقت واليوم والتاريخ",
        "د) يخلط بين الليل والنهار",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Place orientation",
      textAr: "التوجه المكاني",
      options: [
        "A) Fully aware of their location, such as their current address",
        "B) Aware of surroundings only if familiar",
        "C) Gets lost in the home and needs reminders (e.g., location of bathroom)",
        "D) Cannot recognize their home and tries to leave",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) على علم كامل بموقعه، مثل عنوانه الحالي",
        "ب) مدرك للمحيط فقط إذا كان مألوفاً",
        "ج) يضيع في المنزل ويحتاج إلى تذكير (مثل موقع الحمام)",
        "د) لا يستطيع التعرف على منزله ويحاول المغادرة",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Communication",
      textAr: "التواصل",
      options: [
        "A) Can engage in a proper conversation",
        "B) Shows understanding of the speaker and tries to respond with words and gestures",
        "C) Can make themselves understood but has difficulty understanding others",
        "D) Does not respond or communicate with others",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يستطيع إجراء محادثة صحيحة",
        "ب) يظهر فهماً للمتحدث ويحاول الرد بالكلمات والإيماءات",
        "ج) يستطيع إفهام نفسه لكن لديه صعوبة في فهم الآخرين",
        "د) لا يرد أو يتواصل مع الآخرين",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Telephone use",
      textAr: "استخدام الهاتف",
      options: [
        "A) Uses the phone correctly to make calls without assistance",
        "B) Uses the phone correctly to make calls if assisted",
        "C) Can answer the phone but cannot make calls even if assisted",
        "D) Cannot use the phone at all",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يستخدم الهاتف بشكل صحيح لإجراء المكالمات دون مساعدة",
        "ب) يستخدم الهاتف بشكل صحيح لإجراء المكالمات إذا تم مساعدته",
        "ج) يستطيع الرد على الهاتف لكن لا يستطيع إجراء المكالمات حتى لو تم مساعدته",
        "د) لا يستطيع استخدام الهاتف على الإطلاق",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Housework/Gardening",
      textAr: "أعمال المنزل/البستنة",
      options: [
        "A) Can perform housework and gardening at previous level",
        "B) Can perform housework and gardening but not at previous level",
        "C) Participates minimally and only under close supervision",
        "D) Cannot or does not want to participate in previously routine activities",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يستطيع أداء أعمال المنزل والبستنة بالمستوى السابق",
        "ب) يستطيع أداء أعمال المنزل والبستنة لكن ليس بالمستوى السابق",
        "ج) يشارك بأقل قدر وفقط تحت إشراف دقيق",
        "د) لا يستطيع أو لا يريد المشاركة في الأنشطة الروتينية السابقة",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Shopping",
      textAr: "التسوق",
      options: [
        "A) Shops at previous level",
        "B) Can buy one or two items with/without a shopping list",
        "C) Cannot shop alone but participates in shopping with a companion",
        "D) Does not participate in shopping even with a companion",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يتسوق بالمستوى السابق",
        "ب) يستطيع شراء شيء أو شيئين مع/بدون قائمة تسوق",
        "ج) لا يستطيع التسوق وحده لكنه يشارك في التسوق مع مرافق",
        "د) لا يشارك في التسوق حتى مع مرافق",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Managing financial affairs",
      textAr: "إدارة الشؤون المالية",
      options: [
        "A) Responsible for financial affairs at previous level",
        "B) Cannot manage financial affairs but distinguishes the value of money and can make a purchase",
        "C) Spends money but does not distinguish its value",
        "D) Fully dependent on others",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) مسؤول عن الشؤون المالية بالمستوى السابق",
        "ب) لا يستطيع إدارة الشؤون المالية لكنه يميز قيمة المال ويستطيع الشراء",
        "ج) ينفق المال لكن لا يميز قيمته",
        "د) معتمد بشكل كامل على الآخرين",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Games and hobbies",
      textAr: "الألعاب والهوايات",
      options: [
        "A) Participates in games and activities at previous level",
        "B) Participates but needs instruction or supervision",
        "C) Hesitates to participate, participates slowly, and needs encouragement",
        "D) Cannot or does not participate in any hobby",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يشارك في الألعاب والأنشطة بالمستوى السابق",
        "ب) يشارك لكن يحتاج إلى تعليمات أو إشراف",
        "ج) يتردد في المشاركة، يشارك ببطء، ويحتاج إلى تشجيع",
        "د) لا يستطيع أو لا يشارك في أي هواية",
        "هـ) غير مطبق"
      ]
    },
    {
      text: "Transportation",
      textAr: "المواصلات",
      options: [
        "A) Can drive a car or bike, or use public transport independently",
        "B) Cannot drive a car but uses public transport or a bike",
        "C) Cannot use public transport alone",
        "D) Cannot/does not want to use transport even with a companion",
        "E) Not applicable"
      ],
      optionsAr: [
        "أ) يستطيع قيادة سيارة أو دراجة، أو استخدام المواصلات العامة بشكل مستقل",
        "ب) لا يستطيع قيادة سيارة لكنه يستخدم المواصلات العامة أو الدراجة",
        "ج) لا يستطيع استخدام المواصلات العامة وحده",
        "د) لا يستطيع/لا يريد استخدام المواصلات حتى مع مرافق",
        "هـ) غير مطبق"
      ]
    }
  ]

  // Create all 20 Bristol questions
  for (let i = 0; i < bristolQuestions.length; i++) {
    const q = bristolQuestions[i]
    await prisma.question.create({
      data: {
        questionGroupId: bristolGroup.id,
        text: `${i + 1}. ${q.text}`,
        textAr: `${i + 1}. ${q.textAr}`,
        type: QuestionType.SINGLE_SELECT,
        isRequired: true,
        order: 16 + i,
        options: JSON.stringify({
          english: q.options,
          arabic: q.optionsAr
        }),
        validationRules: JSON.stringify({
          bristol_scoring: true // Mark as Bristol scoring question
        })
      }
    })
  }

  // Group 9: Word Recall and Recognition (Last Section) - Optional
  const group9 = await prisma.questionGroup.create({
    data: {
      name: "Word Recall and Recognition",
      nameAr: "تذكر والتعرف على الكلمات",
      description: "Ask the person to recall the five words that you read earlier and asked them to remember",
      descriptionAr: "اطلب من الشخص تذكر الكلمات الخمس التي قرأتها سابقاً وطلبت منه تذكرها",
      order: 9,
    }
  })

  await prisma.question.createMany({
    data: [
      {
        questionGroupId: group9.id,
        text: "Ask the person to recall the five words that you read earlier and asked them to remember, and write them down.",
        textAr: "اطلب من الشخص تذكر الكلمات الخمس التي قرأتها سابقاً وطلبت منه تذكرها، واكتبها.",
        type: QuestionType.TEXTAREA,
        isRequired: false,
        order: 36,
      },
      {
        questionGroupId: group9.id,
        text: "Ask them to choose the correct words from the following list: (can select only 5)",
        textAr: "اطلب منه اختيار الكلمات الصحيحة من القائمة التالية: (يمكن اختيار 5 فقط)",
        type: QuestionType.MULTI_SELECT,
        isRequired: false,
        order: 37,
        options: JSON.stringify({
          english: [
            "Nose", "Velvet", "Tower", "Cardamom", "Blue", "Face", 
            "School", "Clove", "Cotton", "Red", "Hand", "Silk", 
            "Hospital", "Cinnamon", "Green"
          ],
          arabic: [
            "أنف", "مخمل", "برج", "هيل", "أزرق", "وجه",
            "مدرسة", "قرنفل", "قطن", "أحمر", "يد", "حرير",
            "مستشفى", "قرفة", "أخضر"
          ]
        }),
        validationRules: JSON.stringify({
          maxSelections: 5,
          correctAnswers: ["Face", "School", "Velvet", "Clove", "Blue"]
        })
      }
    ]
  })

  // Group 10: Geriatric Depression Scale (GDS-15)
  const group10 = await prisma.questionGroup.create({
    data: {
      name: "Geriatric Depression Scale",
      nameAr: "مقياس الاكتئاب للمسنين",
      description: "Ask the person you are filling this on their behalf the following questions. Overall over the past 2 weeks how would you answer the following:",
      descriptionAr: "اسأل الشخص الذي تملأ هذا نيابة عنه الأسئلة التالية. بشكل عام خلال الأسبوعين الماضيين كيف ستجيب على ما يلي:",
      order: 10,
    }
  })

  // GDS-15 Questions with exact scoring from document
  const gdsQuestions = [
    { text: "Are you basically satisfied with your life?", textAr: "هل أنت راضٍ عن حياتك بشكل أساسي؟", scoring: "No" },
    { text: "Have you dropped many of your activities or interests?", textAr: "هل تركت كثيراً من أنشطتك أو اهتماماتك؟", scoring: "Yes" },
    { text: "Do you feel that your life is empty?", textAr: "هل تشعر أن حياتك فارغة؟", scoring: "Yes" },
    { text: "Do you often get bored?", textAr: "هل تشعر بالملل كثيراً؟", scoring: "Yes" },
    { text: "Are you in good spirits most of the time?", textAr: "هل أنت في معنويات جيدة معظم الوقت؟", scoring: "No" },
    { text: "Are you afraid that something bad is going to happen to you?", textAr: "هل تخاف أن يحدث لك شيء سيء؟", scoring: "Yes" },
    { text: "Do you feel happy most of the time?", textAr: "هل تشعر بالسعادة معظم الوقت؟", scoring: "No" },
    { text: "Do you feel helpless?", textAr: "هل تشعر بالعجز؟", scoring: "Yes" },
    { text: "Do you prefer to stay at home, rather than go out and do things?", textAr: "هل تفضل البقاء في المنزل، بدلاً من الخروج والقيام بالأشياء؟", scoring: "Yes" },
    { text: "Do you feel that you have more problems with memory than most?", textAr: "هل تشعر أن لديك مشاكل في الذاكرة أكثر من معظم الناس؟", scoring: "Yes" },
    { text: "Do you think it is wonderful to be alive now?", textAr: "هل تعتقد أنه من الرائع أن تكون على قيد الحياة الآن؟", scoring: "No" },
    { text: "Do you feel pretty worthless the way you are now?", textAr: "هل تشعر أنك عديم القيمة كما أنت الآن؟", scoring: "Yes" },
    { text: "Do you feel full of energy?", textAr: "هل تشعر أنك مليء بالطاقة؟", scoring: "No" },
    { text: "Do you feel that your situation is hopeless?", textAr: "هل تشعر أن وضعك ميؤوس منه؟", scoring: "Yes" },
    { text: "Do you think that most people are better off then you are?", textAr: "هل تعتقد أن معظم الناس أفضل حالاً منك؟", scoring: "Yes" }
  ]

  for (let i = 0; i < gdsQuestions.length; i++) {
    const q = gdsQuestions[i]
    await prisma.question.create({
      data: {
        questionGroupId: group10.id,
        text: `${i + 1}. ${q.text}`,
        textAr: `${i + 1}. ${q.textAr}`,
        type: QuestionType.RADIO,
        isRequired: true,
        order: 38 + i,
        options: JSON.stringify({
          english: ["Yes", "No"],
          arabic: ["نعم", "لا"]
        }),
        validationRules: JSON.stringify({
          gds_scoring: q.scoring // For depression scale scoring
        })
      }
    })
  }

  console.log('✅ Complete questionnaire seeded successfully!')
  console.log(`📊 Statistics:`)
  console.log(`   • Total Groups: 10`)
  console.log(`   • Bristol Questions: ${bristolQuestions.length}`)
  console.log(`   • GDS Questions: ${gdsQuestions.length}`)
  console.log(`   • Current Symptoms Options: ${currentSymptoms.length}`)
  console.log(`   • Total Questions: ~53`)
  console.log(`   • Languages: English & Arabic`)
  
  console.log(`\n📋 Groups Created:`)
  console.log(`   1. Introductory Questions (2 questions)`)
  console.log(`   2. Basic Demographics (2 questions)`)
  console.log(`   3. Symptom Onset (2 questions)`)
  console.log(`   4. Memory Word List (1 question)`)
  console.log(`   5. Current Symptoms (2 questions with ${currentSymptoms.length} options)`)
  console.log(`   6. Lifestyle and Health Conditions (3 questions)`)
  console.log(`   7. Current Mental and Functional Abilities (3 questions)`)
  console.log(`   8. Bristol Activities of Daily Living Scale (20 questions)`)
  console.log(`   9. Word Recall and Recognition (2 questions)`)
  console.log(`   10. Geriatric Depression Scale (15 questions)`)
}

// Run the seed
seedCompleteQuestionnaire()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  })