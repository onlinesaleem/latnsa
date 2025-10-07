// lib/pdf-generator.ts - PDF Report Generation
import { Patient } from '@prisma/client'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface AssessmentData {
  id: string
 assessmentNumber: string
  formType: 'SELF' | 'PROXY'
  language: 'ENGLISH' | 'ARABIC'
  
  
  relationship?: string | null
  submittedAt: Date 
  reviewNotes?: string | null
  clinicalScore?: string | null
  recommendations?: string | null
  reviewedBy?: string | null
  reviewedAt?: Date | null
  responses: AssessmentResponse[]
  patient: Patient
}

interface AssessmentResponse {
  questionText: string
  answerValue: string
  answerType: string
}

interface ReportOptions {
  language: 'english' | 'arabic'
  includeResponses: boolean
  includeClinicalNotes: boolean
  logoUrl?: string
}

export class PDFReportGenerator {
  private doc: jsPDF
  private isArabic: boolean

  constructor(language: 'english' | 'arabic' = 'english') {
    this.isArabic = language === 'arabic'
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Add Arabic font support if needed
    if (this.isArabic) {
      // Note: You'll need to add Arabic font files
      // this.doc.addFont('path-to-arabic-font.ttf', 'arabic', 'normal')
      // this.doc.setFont('arabic')
    }
  }

  generateAssessmentReport(assessment: AssessmentData, options: ReportOptions = {
    language: 'english',
    includeResponses: true,
    includeClinicalNotes: true
  }): jsPDF {
    
    const { language, includeResponses, includeClinicalNotes } = options
    this.isArabic = language === 'arabic'
    
    // Header
    this.addHeader(assessment)
    
    // Patient Information
    this.addPatientInfo(assessment)
    
    // Assessment Summary
    this.addAssessmentSummary(assessment)
    
    // Clinical Review (if available and requested)
    if (includeClinicalNotes && assessment.reviewNotes) {
      this.addClinicalReview(assessment)
    }
    
    // Detailed Responses (if requested)
    if (includeResponses) {
      this.addDetailedResponses(assessment)
    }
    
    // Footer
    this.addFooter()
    
    return this.doc
  }

  private addHeader(assessment: AssessmentData) {
    const pageWidth = this.doc.internal.pageSize.getWidth()
    
    // Logo area (if provided)
    // if (logoUrl) {
    //   this.doc.addImage(logoUrl, 'PNG', 15, 15, 30, 15)
    // }
    
    // Title
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    
    const title = this.isArabic ? 'تقرير التقييم الصحي' : 'Health Assessment Report'
    this.doc.text(title, pageWidth / 2, 25, { align: 'center' })
    
    // Subtitle
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    const subtitle = this.isArabic ? 'لاتنسا للرعاية الصحية' : 'Latnsa Healthcare'
    this.doc.text(subtitle, pageWidth / 2, 35, { align: 'center' })
    
    // Date
    this.doc.setFontSize(10)
    const dateLabel = this.isArabic ? 'تاريخ التقرير:' : 'Report Date:'
    this.doc.text(`${dateLabel} ${new Date().toLocaleDateString()}`, pageWidth - 15, 20, { align: 'right' })
    
    // Assessment ID
    const idLabel = this.isArabic ? 'رقم التقييم:' : 'Assessment#:'
    this.doc.text(`${idLabel} ${assessment.assessmentNumber}`, pageWidth - 15, 30, { align: 'right' })
    
    // Line separator
    this.doc.setLineWidth(0.5)
    this.doc.line(15, 45, pageWidth - 15, 45)
  }

  private addPatientInfo(assessment: AssessmentData) {
    let yPos = 60
    
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    const patientTitle = this.isArabic ? 'معلومات المريض' : 'Patient Information'
    this.doc.text(patientTitle, 15, yPos)
    
    yPos += 10
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')
    
    // Create patient info table
    const patientData = []
    
    if (assessment.formType === 'PROXY') {
      patientData.push([
        this.isArabic ? 'اسم المريض' : 'MRN',
        assessment.patient.mrn 
      ])
        patientData.push([
        this.isArabic ? 'اسم المريض' : 'Patient Name',
        assessment.patient.fullName || 'N/A'
      ])
      patientData.push([
        this.isArabic ? 'العمر' : 'Age', 
        assessment.patient.dateOfBirth?.toString() || 'N/A'
      ])
      patientData.push([
        this.isArabic ? 'الجنس' : 'Gender',
        assessment.patient.gender 
      ])
      // patientData.push([
      //   this.isArabic ? 'معبأ بواسطة' : 'Completed by',
      //   assessment.registrantName
      // ])
      patientData.push([
        this.isArabic ? 'العلاقة' : 'Relationship',
        assessment.relationship || 'N/A'
      ])
    } else {
        patientData.push([
        this.isArabic ? 'اسم المريض' : 'MRN',
        assessment.patient.mrn 
      ])
      patientData.push([
        this.isArabic ? 'اسم المريض' : 'Patient Name',
        assessment.patient?.fullName 
      ])
      patientData.push([
        this.isArabic ? 'البريد الإلكتروني' : 'Email',
        assessment.patient.email || 'N/A'
      ])
    }
    
    patientData.push([
      this.isArabic ? 'نوع التقييم' : 'Assessment Type',
      assessment.formType === 'SELF' ? 
        (this.isArabic ? 'تقييم شخصي' : 'Self Assessment') :
        (this.isArabic ? 'تقييم نيابي' : 'Proxy Assessment')
    ])
    
    patientData.push([
      this.isArabic ? 'تاريخ التقييم' : 'Assessment Date',
      new Date(assessment.submittedAt).toLocaleDateString()
    ])
    
    autoTable(this.doc, {
      startY: yPos,
      head: [[this.isArabic ? 'البيان' : 'Field', this.isArabic ? 'القيمة' : 'Value']],
      body: patientData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Blue
      styles: { fontSize: 10 }
    })
  }

  private addAssessmentSummary(assessment: AssessmentData) {
    const finalY = (this.doc as any).lastAutoTable.finalY || 120
    let yPos = finalY + 20
    
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    const summaryTitle = this.isArabic ? 'ملخص التقييم' : 'Assessment Summary'
    this.doc.text(summaryTitle, 15, yPos)
    
    yPos += 10
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')
    
    // Calculate scores
    const bristolScore = this.calculateBristolScore(assessment.responses)
    const totalResponses = assessment.responses.length
    const completionRate = '100%' // Assuming completed assessments
    
    const summaryData = [
      [this.isArabic ? 'إجمالي الإجابات' : 'Total Responses', totalResponses.toString()],
      [this.isArabic ? 'نسبة الإكمال' : 'Completion Rate', completionRate],
      [this.isArabic ? 'نتيجة مقياس بريستول' : 'Bristol Scale Score', bristolScore.toString()],
    ]
    
    if (assessment.clinicalScore) {
      summaryData.push([
        this.isArabic ? 'التقييم الطبي' : 'Clinical Score',
        assessment.clinicalScore
      ])
    }
    
    autoTable(this.doc, {
      startY: yPos,
      head: [[this.isArabic ? 'المؤشر' : 'Metric', this.isArabic ? 'القيمة' : 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }, // Green
      styles: { fontSize: 10 }
    })
  }

  private addClinicalReview(assessment: AssessmentData) {
    const finalY = (this.doc as any).lastAutoTable.finalY || 160
    let yPos = finalY + 20
    
    // Check if we need a new page
    if (yPos > 250) {
      this.doc.addPage()
      yPos = 20
    }
    
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    const reviewTitle = this.isArabic ? 'المراجعة الطبية' : 'Clinical Review'
    this.doc.text(reviewTitle, 15, yPos)
    
    yPos += 10
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    // Reviewed by and date
    if (assessment.reviewedBy) {
      const reviewedByText = this.isArabic ? 'تمت المراجعة بواسطة:' : 'Reviewed by:'
      this.doc.text(`${reviewedByText} ${assessment.reviewedBy}`, 15, yPos)
      yPos += 5
    }
    
    if (assessment.reviewedAt) {
      const reviewDateText = this.isArabic ? 'تاريخ المراجعة:' : 'Review Date:'
      this.doc.text(`${reviewDateText} ${new Date(assessment.reviewedAt).toLocaleDateString()}`, 15, yPos)
      yPos += 10
    }
    
    // Clinical Notes
    if (assessment.reviewNotes) {
      this.doc.setFont('helvetica', 'bold')
      const notesTitle = this.isArabic ? 'الملاحظات الطبية:' : 'Clinical Notes:'
      this.doc.text(notesTitle, 15, yPos)
      yPos += 7
      
      this.doc.setFont('helvetica', 'normal')
      const splitNotes = this.doc.splitTextToSize(assessment.reviewNotes, 180)
      this.doc.text(splitNotes, 15, yPos)
      yPos += splitNotes.length * 5
    }
    
    // Recommendations
    if (assessment.recommendations) {
      yPos += 5
      this.doc.setFont('helvetica', 'bold')
      const recTitle = this.isArabic ? 'التوصيات:' : 'Recommendations:'
      this.doc.text(recTitle, 15, yPos)
      yPos += 7
      
      this.doc.setFont('helvetica', 'normal')
      const splitRec = this.doc.splitTextToSize(assessment.recommendations, 180)
      this.doc.text(splitRec, 15, yPos)
    }
  }

  private addDetailedResponses(assessment: AssessmentData) {
    this.doc.addPage()
    let yPos = 20
    
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    const responsesTitle = this.isArabic ? 'تفاصيل الإجابات' : 'Detailed Responses'
    this.doc.text(responsesTitle, 15, yPos)
    
    yPos += 15
    
    // Create responses table
    const responseData = assessment.responses.map((response, index) => [
      (index + 1).toString(),
      response.questionText.length > 50 ? 
        response.questionText.substring(0, 50) + '...' : 
        response.questionText,
      response.answerValue.length > 40 ? 
        response.answerValue.substring(0, 40) + '...' : 
        response.answerValue
    ])
    
    autoTable(this.doc, {
      startY: yPos,
      head: [[
        this.isArabic ? '#' : '#',
        this.isArabic ? 'السؤال' : 'Question',
        this.isArabic ? 'الإجابة' : 'Answer'
      ]],
      body: responseData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }, // Indigo
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 90 },
        2: { cellWidth: 80 }
      }
    })
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      
      const pageHeight = this.doc.internal.pageSize.getHeight()
      const pageWidth = this.doc.internal.pageSize.getWidth()
      
      // Footer line
      this.doc.setLineWidth(0.3)
      this.doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20)
      
      // Footer text
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'normal')
      
      const footerText = this.isArabic ? 
        'هذا التقرير سري ومخصص للاستخدام الطبي فقط - لاتنسا للرعاية الصحية' :
        'This report is confidential and intended for medical use only - Latnsa Healthcare'
      
      this.doc.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' })
      
      // Page number
      const pageText = this.isArabic ? 
        `صفحة ${i} من ${pageCount}` : 
        `Page ${i} of ${pageCount}`
      
      this.doc.text(pageText, pageWidth - 15, pageHeight - 12, { align: 'right' })
      
      // Generation timestamp
      const timestamp = this.isArabic ?
        `تم الإنشاء: ${new Date().toLocaleString('ar-SA')}` :
        `Generated: ${new Date().toLocaleString()}`
      
      this.doc.text(timestamp, 15, pageHeight - 12)
    }
  }

  private calculateBristolScore(responses: AssessmentResponse[]): number {
    let total = 0
    responses.forEach(response => {
      // Bristol scoring: A=0, B=1, C=2, D=3, E=0
      if (response.answerValue.startsWith('A)')) total += 0
      else if (response.answerValue.startsWith('B)')) total += 1
      else if (response.answerValue.startsWith('C)')) total += 2
      else if (response.answerValue.startsWith('D)')) total += 3
      else if (response.answerValue.startsWith('E)')) total += 0
    })
    return total
  }

  // Export methods
  save(filename?: string) {
    const defaultFilename = this.isArabic ? 
      'تقرير-التقييم-الصحي.pdf' : 
      'health-assessment-report.pdf'
    
    this.doc.save(filename || defaultFilename)
  }

 // Update the output method in your PDFReportGenerator class
private isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof Blob !== 'undefined';
}

getBlob(): Blob {
  const pdfData = this.doc.output('arraybuffer');
  return new Blob([pdfData], { type: 'application/pdf' });
}

getArrayBuffer(): ArrayBuffer {
  return this.doc.output('arraybuffer');
}

getBuffer(): Buffer {
  const arrayBuffer = this.doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

// Keep or modify the existing output method if needed
output(type: 'datauri' | 'dataurl' = 'datauri'): boolean | string {
  return this.doc.output(type);
}
}


// Usage example:
/*
const generator = new PDFReportGenerator('english')
const pdfDoc = generator.generateAssessmentReport(assessmentData, {
  language: 'english',
  includeResponses: true,
  includeClinicalNotes: true
})

// Save to file
generator.save('patient-report.pdf')

// Or get as blob for upload/email
const pdfBlob = generator.output('blob')
*/