// app/api/zoom/debug/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const accountId = process.env.ZOOM_ACCOUNT_ID
  const clientId = process.env.ZOOM_CLIENT_ID
  const clientSecret = process.env.ZOOM_CLIENT_SECRET

  // Check if credentials exist
  const checks = {
    hasAccountId: !!accountId,
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    accountIdLength: accountId?.length || 0,
    clientIdLength: clientId?.length || 0,
    clientSecretLength: clientSecret?.length || 0,
    accountIdPreview: accountId?.substring(0, 8) + '...',
    clientIdPreview: clientId?.substring(0, 8) + '...',
  }

  // Test token request
  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`
    
    console.log('Testing token request to:', tokenUrl)
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const responseText = await response.text()
    console.log('Response:', responseText)

    let result
    try {
      result = JSON.parse(responseText)
    } catch {
      result = { raw: responseText }
    }

    return NextResponse.json({
      checks,
      tokenRequest: {
        status: response.status,
        ok: response.ok,
        response: result
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      checks,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}