// app/api/assessment/create-patient/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // Adjust path as needed
import { prisma } from '@/lib/prisma' // Adjust path as needed

// Generate MRN
async function generateMRN(): Promise<string> {
  const year = new Date().getFullYear()
  
  // Get the last patient with this year's MRN
  const lastPatient = await prisma.patient.findFirst({
    where: { 
      mrn: { startsWith: `MRN-${year}-` } 
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const nextNumber = lastPatient 
    ? parseInt(lastPatient.mrn.split('-')[2]) + 1 
    : 1
    
  return `MRN-${year}-${String(nextNumber).padStart(5, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { formType, patientInfo, proxyInfo } = body

    // Validate required fields
    if (!patientInfo?.fullName || !patientInfo?.dateOfBirth || !patientInfo?.gender) {
      return NextResponse.json(
        { 
          error: 'Missing required patient information',
          errorAr: 'معلومات المريض المطلوبة مفقودة'
        },
        { status: 400 }
      )
    }

    // For PROXY, validate proxy information
    if (formType === 'PROXY') {
      if (!proxyInfo?.proxyName || !proxyInfo?.proxyRelationship) {
        return NextResponse.json(
          { 
            error: 'Missing required proxy information',
            errorAr: 'معلومات الممثل المطلوبة مفقودة'
          },
          { status: 400 }
        )
      }
    }

    // Check if patient already exists (by email or phone)
    let existingPatient = null
    
    if (patientInfo.email) {
      existingPatient = await prisma.patient.findFirst({
        where: { email: patientInfo.email }
      })
    }
    
    if (!existingPatient && patientInfo.phone) {
      existingPatient = await prisma.patient.findFirst({
        where: { phone: patientInfo.phone }
      })
    }

    let patient

    if (existingPatient) {
      // Patient exists, update if needed
      patient = await prisma.patient.update({
        where: { id: existingPatient.id },
        data: {
          fullName: patientInfo.fullName,
          dateOfBirth: new Date(patientInfo.dateOfBirth),
          gender: patientInfo.gender,
          email: patientInfo.email || existingPatient.email,
          phone: patientInfo.phone || existingPatient.phone,
          address: patientInfo.address || existingPatient.address,
          // Link to user if SELF and not already linked
          userId: formType === 'SELF' && !existingPatient.userId 
            ? session.user.id 
            : existingPatient.userId
        }
      })
    } else {
      // Create new patient
      const mrn = await generateMRN()
      
      patient = await prisma.patient.create({
        data: {
          mrn,
          fullName: patientInfo.fullName,
          dateOfBirth: new Date(patientInfo.dateOfBirth),
          gender: patientInfo.gender,
          email: patientInfo.email,
          phone: patientInfo.phone,
          address: patientInfo.address,
          // Link to user if this is a SELF assessment
          userId: formType === 'SELF' ? session.user.id : null
        }
      })
    }

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        mrn: patient.mrn,
        fullName: patient.fullName
      }
    })

  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        errorAr: 'خطأ في الخادم الداخلي'
      },
      { status: 500 }
    )
  }
}