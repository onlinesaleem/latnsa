// lib/zoom-service.ts - Updated version

interface ZoomMeetingSettings {
  join_before_host?: boolean
  waiting_room?: boolean
  mute_upon_entry?: boolean
  approval_type?: number
  audio?: 'both' | 'telephony' | 'voip'
  video?: boolean
  enforce_login?: boolean
  participant_video?: boolean
  host_video?: boolean
  auto_recording?: 'local' | 'cloud' | 'none'
}

interface CreateMeetingOptions {
  topic: string
  start_time: string
  duration: number
  timezone?: string
  password?: string
  settings?: ZoomMeetingSettings
}

interface ZoomMeeting {
  id: number
  uuid: string
  host_id: string
  topic: string
  start_time: string
  duration: number
  timezone: string
  join_url: string
  start_url: string
  password?: string
  settings: ZoomMeetingSettings
}

interface ZoomTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  api_url?: string  // Add this - Zoom returns the correct API URL
}

export class ZoomService {
  private accountId: string
  private clientId: string
  private clientSecret: string
  private baseUrl = 'https://api.zoom.us/v2'  // Default, will be updated
  private tokenUrl = 'https://zoom.us/oauth/token'
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.accountId = process.env.ZOOM_ACCOUNT_ID!
    this.clientId = process.env.ZOOM_CLIENT_ID!
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET!

    if (!this.accountId || !this.clientId || !this.clientSecret) {
      throw new Error('Zoom OAuth credentials not configured. Please check ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in .env')
    }
  }

  // Get OAuth access token using Server-to-Server OAuth
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    console.log('🔑 Requesting new Zoom access token...')
    
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
    
    const tokenUrl = `${this.tokenUrl}?grant_type=account_credentials&account_id=${this.accountId}`
    
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Token error:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        
        throw new Error(`Zoom OAuth error: ${response.status} - ${errorData.reason || errorData.message || response.statusText}`)
      }

      const tokenData: ZoomTokenResponse = await response.json()
      console.log('✅ Token received successfully')
      
      // Update base URL if Zoom provides a specific one
      if (tokenData.api_url) {
        this.baseUrl = `${tokenData.api_url}/v2`
        console.log('🌐 Using API URL:', this.baseUrl)
      }
      
      // Cache token (expires in 1 hour, refresh 5 minutes early)
      this.accessToken = tokenData.access_token
      this.tokenExpiry = Date.now() + ((tokenData.expires_in - 300) * 1000)
      
      return this.accessToken
    } catch (error) {
      console.error('❌ Token request failed:', error)
      throw error
    }
  }

   async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken()
    
    const url = `${this.baseUrl}${endpoint}`
    console.log('📡 Making request to:', url)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ API Error:', errorData)
      throw new Error(`Zoom API error: ${response.status} - ${errorData.message || response.statusText}`)
    }

    return response.json()
  }

  async createMeeting(options: CreateMeetingOptions, userId: string = 'me'): Promise<ZoomMeeting> {
    const meetingData = {
      topic: options.topic,
      type: 2, // Scheduled meeting
      start_time: options.start_time,
      duration: options.duration,
      timezone: options.timezone || 'Asia/Riyadh',
      password: options.password || this.generateMeetingPassword(),
      settings: {
        join_before_host: false,
        waiting_room: true,
        mute_upon_entry: true,
        approval_type: 0,
        audio: 'both',
        video: true,
        enforce_login: false,
        participant_video: true,
        host_video: true,
        auto_recording: 'cloud',
        ...options.settings
      }
    }

    return this.makeRequest(`/users/${userId}/meetings`, {
      method: 'POST',
      body: JSON.stringify(meetingData)
    })
  }

  async getMeeting(meetingId: string): Promise<ZoomMeeting> {
    return this.makeRequest(`/meetings/${meetingId}`)
  }

  async updateMeeting(meetingId: string, updates: Partial<CreateMeetingOptions>): Promise<void> {
    await this.makeRequest(`/meetings/${meetingId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    await this.makeRequest(`/meetings/${meetingId}`, {
      method: 'DELETE'
    })
  }

  async listMeetings(userId: string = 'me'): Promise<{ meetings: ZoomMeeting[] }> {
    return this.makeRequest(`/users/${userId}/meetings?type=upcoming&page_size=30`)
  }

  async getUserInfo(): Promise<any> {
    return this.makeRequest('/users/me')
  }

  async getMeetingRegistrants(meetingId: string): Promise<any> {
    return this.makeRequest(`/meetings/${meetingId}/registrants`)
  }

  async addMeetingRegistrant(meetingId: string, registrant: {
    email: string
    first_name: string
    last_name?: string
  }): Promise<any> {
    return this.makeRequest(`/meetings/${meetingId}/registrants`, {
      method: 'POST',
      body: JSON.stringify(registrant)
    })
  }

  async getMeetingRecordings(meetingId: string): Promise<any> {
    return this.makeRequest(`/meetings/${meetingId}/recordings`)
  }

  async listRecordings(userId: string = 'me', params?: {
    from?: string
    to?: string
  }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    return this.makeRequest(`/users/${userId}/recordings${query}`)
  }

  private generateMeetingPassword(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }
    return password
  }

  async createHealthcareConsultation(options: {
    patientName: string
    clinicianName?: string
    appointmentTime: string
    duration: number
    patientEmail: string
    userId?: string
  }): Promise<ZoomMeeting> {
    const meeting = await this.createMeeting({
      topic: `Healthcare Consultation - ${options.patientName}`,
      start_time: options.appointmentTime,
      duration: options.duration,
      timezone: 'Asia/Riyadh',
      settings: {
        join_before_host: false,
        waiting_room: true,
        mute_upon_entry: false,
        approval_type: 0,
        audio: 'both',
        video: true,
        enforce_login: false,
        participant_video: true,
        host_video: true,
        auto_recording: 'cloud'
      }
    }, options.userId || 'me')

    return meeting
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getUserInfo()
      return true
    } catch (error) {
      console.error('Zoom connection test failed:', error)
      return false
    }
  }
}

// Singleton instance
let zoomServiceInstance: ZoomService | null = null

export function getZoomService(): ZoomService {
  if (!zoomServiceInstance) {
    zoomServiceInstance = new ZoomService()
  }
  return zoomServiceInstance
}