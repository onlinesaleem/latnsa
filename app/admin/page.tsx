// app/admin/page.tsx
import { Toaster } from 'react-hot-toast'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  return (
    <>
      <AdminDashboard />
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

