// app/api/zoom/test/route.ts
import { NextResponse } from 'next/server'
import { getZoomService } from '@/lib/zoom-service'

export async function GET() {
  try {
    const zoomService = getZoomService()
    
    console.log('Step 1: Testing basic connection...')
    const isConnected = await zoomService.testConnection()
    
    if (!isConnected) {
      return NextResponse.json({ 
        success: false, 
        error: 'Basic connection failed. Check your credentials.'
      }, { status: 500 })
    }
    
    console.log('Step 2: Getting user info...')
    const userInfo = await zoomService.makeRequest('/users/me')
    
    console.log('Step 3: Listing upcoming meetings...')
    const meetings = await zoomService.listMeetings()
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Zoom integration fully working!',
      user: {
        email: userInfo.email,
        name: `${userInfo.first_name} ${userInfo.last_name}`,
        type: userInfo.type === 2 ? 'Pro' : 'Basic'
      },
      meetings: {
        count: meetings.meetings?.length || 0,
        list: meetings.meetings || []
      }
    })
  } catch (error: any) {
    console.error('Zoom test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}