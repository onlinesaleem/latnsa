// app/api/admin/reports/analytics/export/route.ts
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const exportRequestSchema = z.object({
  fromDate: z.string(),
  toDate: z.string(),
  type: z.enum(['summary', 'detailed', 'statistical']).default('summary'),
  format: z.enum(['pdf', 'csv', 'excel']).default('pdf')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CLINICAL_STAFF')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { fromDate, toDate, type, format } = exportRequestSchema.parse(body)

    const startDate = new Date(fromDate)
    const endDate = new Date(toDate)
    endDate.setHours(23, 59, 59, 999) // End of day

    // Get comprehensive analytics data
    const [
      assessments,
      totalStats,
      clinicalStats,
      patientDemographics
    ] = await Promise.all([
      prisma.assessment.findMany({
        where: {
          submittedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          responses: true
        },
        orderBy: {
          submittedAt: 'desc'
        }
      }),

      // Overall statistics
      prisma.assessment.aggregate({
        _count: {
          id: true
        },
        _avg: {
          subjectAge: true
        },
        where: {
          submittedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Clinical review statistics
      prisma.assessment.groupBy({
        by: ['status', 'isReviewed'],
        _count: {
          id: true
        },
        where: {
          submittedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Patient demographics
      prisma.assessment.groupBy({
        by: ['formType', 'language', 'subjectGender'],
        _count: {
          id: true
        },
        _avg: {
          subjectAge: true
        },
        where: {
          submittedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ])

    if (format === 'pdf') {
      // Generate PDF analytics report
      const generator = new AnalyticsReportGenerator('english')
      const pdfDoc = generator.generateAnalyticsReport({
        assessments,
        totalStats,
        clinicalStats,
        patientDemographics,
        dateRange: { fromDate, toDate },
        reportType: type
      })

      const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'))
      
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics-report-${fromDate}-to-${toDate}.pdf"`
        }
      })
    } else if (format === 'csv') {
      // Generate CSV report
      const csvData = generateCSVReport(assessments, type)
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-report-${fromDate}-to-${toDate}.csv"`
        }
      })
    } else {
      return NextResponse.json({
        error: 'Excel format not implemented yet'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Export analytics API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to export analytics report' },
      { status: 500 }
    )
  }
}

// Analytics Report Generator Class
class AnalyticsReportGenerator {
  private pdf: any
  private language: 'english' | 'arabic'

  constructor(language: 'english' | 'arabic' = 'english') {
    this.language = language
    
    // Dynamic import to avoid issues with jsPDF
   // const jsPDF = require('jspdf')
    //require('jspdf-autotable')
    
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
  }

  generateAnalyticsReport(data: any): any {
    this.addHeader(data.dateRange)
    this.addExecutiveSummary(data)
    this.addPatientDemographics(data)
    this.addClinicalOverview(data)
    
    if (data.reportType === 'detailed') {
      this.addDetailedAssessmentData(data.assessments)
    }
    
    if (data.reportType === 'statistical') {
      this.addStatisticalAnalysis(data)
    }
    
    this.addFooter()
    
    return this.pdf
  }

  private addHeader(dateRange: any) {
    const isArabic = this.language === 'arabic'
    const pageWidth = this.pdf.internal.pageSize.width
    
    this.pdf.setFillColor(14, 165, 233)
    this.pdf.rect(0, 0, pageWidth, 40, 'F')
    
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(20)
    this.pdf.setFont('helvetica', 'bold')
    
    const title = isArabic ? 'تقرير التحليلات الصحية' : 'Healthcare Analytics Report'
    this.pdf.text(title, 20, 25)
    
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'normal')
    const subtitle = `${isArabic ? 'الفترة:' : 'Period:'} ${dateRange.fromDate} ${isArabic ? 'إلى' : 'to'} ${dateRange.toDate}`
    this.pdf.text(subtitle, 20, 35)
    
    this.pdf.setTextColor(0, 0, 0)
  }

  private addExecutiveSummary(data: any) {
    let yPos = 55
    
    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Executive Summary', 20, yPos)
    
    yPos += 15
    
    const summaryData = [
      ['Total Assessments', data.totalStats._count.id.toString()],
      ['Average Patient Age', data.totalStats._avg.subjectAge?.toFixed(1) || 'N/A'],
      ['Completion Rate', this.calculateCompletionRate(data.clinicalStats)],
      ['Most Common Language', this.getMostCommonLanguage(data.patientDemographics)],
      ['Clinical Review Status', this.getReviewStatus(data.clinicalStats)]
    ]

    this.createTable(summaryData, yPos, ['Metric', 'Value'])
  }

  private addPatientDemographics(data: any) {
    const finalY = (this.pdf as any).lastAutoTable?.finalY || 120
    let yPos = finalY + 20

    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Patient Demographics', 20, yPos)

    yPos += 10

    const demographicsData = data.patientDemographics.map((item: any) => [
      item.formType,
      item.language,
      item.subjectGender || 'Not specified',
      item._count.id.toString(),
      item._avg.subjectAge?.toFixed(1) || 'N/A'
    ])

    this.createTable(demographicsData, yPos, [
      'Type', 'Language', 'Gender', 'Count', 'Avg Age'
    ])
  }

  private addClinicalOverview(data: any) {
    const finalY = (this.pdf as any).lastAutoTable?.finalY || 180
    let yPos = finalY + 20

    if (yPos > 250) {
      this.pdf.addPage()
      yPos = 20
    }

    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Clinical Review Overview', 20, yPos)

    yPos += 10

    const clinicalData = data.clinicalStats.map((item: any) => [
      item.status,
      item.isReviewed ? 'Yes' : 'No',
      item._count.id.toString()
    ])

    this.createTable(clinicalData, yPos, ['Status', 'Reviewed', 'Count'])
  }

  private addDetailedAssessmentData(assessments: any[]) {
    const finalY = (this.pdf as any).lastAutoTable?.finalY || 220
    let yPos = finalY + 20

    if (yPos > 250) {
      this.pdf.addPage()
      yPos = 20
    }

    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Detailed Assessment Data', 20, yPos)

    yPos += 10

    const detailedData = assessments.slice(0, 50).map(assessment => [
      assessment.id.substring(0, 8) + '...',
      (assessment.registrantName || assessment.subjectName || 'N/A').substring(0, 20),
      assessment.status,
      new Date(assessment.submittedAt).toLocaleDateString(),
      assessment.responses.length.toString(),
      assessment.clinicalScore || 'Pending'
    ])

    this.createTable(detailedData, yPos, [
      'ID', 'Patient', 'Status', 'Date', 'Responses', 'Score'
    ])
  }

  private addStatisticalAnalysis(data: any) {
    const finalY = (this.pdf as any).lastAutoTable?.finalY || 260
    let yPos = finalY + 20

    if (yPos > 250) {
      this.pdf.addPage()
      yPos = 20
    }

    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Statistical Analysis', 20, yPos)

    yPos += 15

    // Calculate statistics
    const stats = this.calculateAdvancedStatistics(data.assessments)
    
    const statsData = [
      ['Average Responses per Assessment', stats.avgResponses.toFixed(1)],
      ['Response Rate by Language - English', `${stats.responseRateEnglish}%`],
      ['Response Rate by Language - Arabic', `${stats.responseRateArabic}%`],
      ['Self vs Proxy Assessment Ratio', `${stats.selfVsProxy}%`],
      ['Average Time to Clinical Review', `${stats.avgReviewTime} days`],
      ['Most Common Age Group', stats.mostCommonAgeGroup]
    ]

    this.createTable(statsData, yPos, ['Statistical Measure', 'Value'])
  }

  private createTable(data: any[], startY: number, headers: string[]) {
    autoTable(this.pdf, {
      startY,
      head: [headers],
      body: data,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })
  }
  private addFooter() {
    const pageCount = this.pdf.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i)
      
      const pageHeight = this.pdf.internal.pageSize.height
      const pageWidth = this.pdf.internal.pageSize.width
      
      // Footer line
      this.pdf.setDrawColor(200, 200, 200)
      this.pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20)
      
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.setTextColor(100, 100, 100)
      
      this.pdf.text(
        `Healthcare Assessment System - Generated on ${new Date().toLocaleDateString()}`,
        20,
        pageHeight - 10
      )
      
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: 'right' }
      )
    }
  }

  // Helper methods
  private calculateCompletionRate(clinicalStats: any[]): string {
    const completed = clinicalStats.find(s => s.status === 'COMPLETED')?._count.id || 0
    const total = clinicalStats.reduce((sum, s) => sum + s._count.id, 0)
    return total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '0%'
  }

  private getMostCommonLanguage(demographics: any[]): string {
    const languageCounts = demographics.reduce((acc, item) => {
      acc[item.language] = (acc[item.language] || 0) + item._count.id
      return acc
    }, {})
    
    const mostCommon = Object.entries(languageCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]
    
    return mostCommon ? mostCommon[0] : 'N/A'
  }

  private getReviewStatus(clinicalStats: any[]): string {
    const reviewed = clinicalStats.filter(s => s.isReviewed).reduce((sum, s) => sum + s._count.id, 0)
    const total = clinicalStats.reduce((sum, s) => sum + s._count.id, 0)
    return total > 0 ? `${reviewed}/${total} reviewed` : 'No data'
  }

  private calculateAdvancedStatistics(assessments: any[]) {
    const totalResponses = assessments.reduce((sum, a) => sum + a.responses.length, 0)
    const avgResponses = assessments.length > 0 ? totalResponses / assessments.length : 0
    
    const englishAssessments = assessments.filter(a => a.language === 'ENGLISH').length
    const arabicAssessments = assessments.filter(a => a.language === 'ARABIC').length
    const total = assessments.length
    
    const responseRateEnglish = total > 0 ? ((englishAssessments / total) * 100).toFixed(1) : '0'
    const responseRateArabic = total > 0 ? ((arabicAssessments / total) * 100).toFixed(1) : '0'
    
    const selfAssessments = assessments.filter(a => a.formType === 'SELF').length
    const selfVsProxy = total > 0 ? ((selfAssessments / total) * 100).toFixed(1) : '0'
    
    // Calculate average review time
    const reviewedAssessments = assessments.filter(a => a.reviewedAt)
    const avgReviewTime = reviewedAssessments.length > 0 ? 
      reviewedAssessments.reduce((sum, a) => {
        const diff = new Date(a.reviewedAt).getTime() - new Date(a.submittedAt).getTime()
        return sum + (diff / (1000 * 60 * 60 * 24)) // days
      }, 0) / reviewedAssessments.length : 0
    
    // Most common age group
    const ageGroups = assessments.reduce((acc, a) => {
      if (a.subjectAge) {
        const ageGroup = Math.floor(a.subjectAge / 10) * 10
        const groupName = `${ageGroup}-${ageGroup + 9}`
        acc[groupName] = (acc[groupName] || 0) + 1
      }
      return acc
    }, {})
    
    const mostCommonAgeGroup = Object.entries(ageGroups)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'
    
    return {
      avgResponses,
      responseRateEnglish,
      responseRateArabic,
      selfVsProxy,
      avgReviewTime: avgReviewTime.toFixed(1),
      mostCommonAgeGroup
    }
  }
}

// CSV Generator Function
function generateCSVReport(assessments: any[], type: string): string {
  const headers = [
    'Assessment ID',
    'Patient Name',
    'Patient Email',
    'Form Type',
    'Language',
    'Subject Age',
    'Subject Gender',
    'Status',
    'Reviewed',
    'Clinical Score',
    'Submitted At',
    'Reviewed At',
    'Total Responses',
    'Recommendations'
  ]

  const rows = assessments.map(assessment => [
    assessment.id,
    assessment.registrantName || assessment.subjectName || '',
    assessment.registrantEmail || '',
    assessment.formType,
    assessment.language,
    assessment.subjectAge || '',
    assessment.subjectGender || '',
    assessment.status,
    assessment.isReviewed ? 'Yes' : 'No',
    assessment.clinicalScore || '',
    assessment.submittedAt.toISOString(),
    assessment.reviewedAt?.toISOString() || '',
    assessment.responses.length,
    assessment.recommendations || ''
  ])

  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}