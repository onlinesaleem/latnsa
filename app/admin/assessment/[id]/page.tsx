// app/admin/assessment/[id]/page.tsx
import { Toaster } from 'react-hot-toast'
import AssessmentReview from '@/components/AssessmentReview'

interface Props {
  params: { id: string }
}

export default function AssessmentReviewPage({ params }: Props) {
  return (
    <>
      <AssessmentReview assessmentId={params.id} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </>
  )
}