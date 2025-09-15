// scripts/fix-question-text.ts - Fix existing assessments with proper question text
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixQuestionText() {
  console.log('🔧 Fixing question text in existing assessment responses...')

  try {
    // Get all assessment responses that need fixing
    const responses = await prisma.assessmentResponse.findMany({
      where: {
        questionText: {
          startsWith: 'Question c' // These are the malformed ones
        }
      }
    })

    console.log(`Found ${responses.length} responses with incorrect question text`)

    let fixed = 0
    for (const response of responses) {
      try {
        // Get the actual question from database
        const question = await prisma.question.findUnique({
          where: { id: response.questionId }
        })

        if (question) {
          // Update the response with correct question text
          await prisma.assessmentResponse.update({
            where: { id: response.id },
            data: {
              questionText: question.text
            }
          })
          fixed++
        } else {
          console.warn(`⚠️  Question not found for ID: ${response.questionId}`)
        }
      } catch (error) {
        console.error(`❌ Error fixing response ${response.id}:`, error)
      }
    }

    console.log(`✅ Successfully fixed ${fixed} assessment responses`)

    // Show a sample of fixed responses
    if (fixed > 0) {
      console.log('\n📋 Sample of fixed responses:')
      const sampleFixed = await prisma.assessmentResponse.findMany({
        where: {
          questionText: {
            not: {
              startsWith: 'Question c'
            }
          }
        },
        take: 3,
        include: {
          assessment: {
            select: {
              registrantName: true,
              id: true
            }
          }
        }
      })

      sampleFixed.forEach((response, index) => {
        console.log(`${index + 1}. ${response.questionText.substring(0, 60)}...`)
        console.log(`   Answer: ${response.answerValue.substring(0, 40)}...`)
        console.log(`   Assessment: ${response.assessment.registrantName} (${response.assessment.id})`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Error fixing question text:', error)
    throw error
  }
}

// Also create a verification function
async function verifyQuestionText() {
  console.log('\n🔍 Verifying question text fix...')

  const badResponses = await prisma.assessmentResponse.count({
    where: {
      questionText: {
        startsWith: 'Question c'
      }
    }
  })

  const goodResponses = await prisma.assessmentResponse.count({
    where: {
      questionText: {
        not: {
          startsWith: 'Question c'
        }
      }
    }
  })

  console.log(`✅ Good responses: ${goodResponses}`)
  console.log(`❌ Bad responses remaining: ${badResponses}`)

  if (badResponses === 0) {
    console.log('🎉 All question texts have been fixed!')
  }
}

async function main() {
  await fixQuestionText()
  await verifyQuestionText()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/*
To run this script:

1. Add to package.json:
   "fix-questions": "tsx scripts/fix-question-text.ts"

2. Run it:
   npm run fix-questions

3. Or run directly:
   npx tsx scripts/fix-question-text.ts
*/