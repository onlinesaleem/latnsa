// lib/zoom-service.ts
import jwt from 'jsonwebtoken'

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

export class ZoomService {
  private apiKey: string
  private apiSecret: string
  private baseUrl = 'https://api.zoom.us/v2'

  constructor() {
    this.apiKey = process.env.ZOOM_API_KEY!
    this.apiSecret = process.env.ZOOM_API_SECRET!

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Zoom API credentials not configured')
    }
  }

  private generateToken(): string {
    const payload = {
      iss: this.apiKey,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    }

    return jwt.sign(payload, this.apiSecret)
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.generateToken()
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Zoom API error: ${response.status} - ${errorData.message || response.statusText}`)
    }

    return response.json()
  }

  async createMeeting(options: CreateMeetingOptions): Promise<ZoomMeeting> {
    const meetingData = {
      topic: options.topic,
      type: 2, // Scheduled meeting
      start_time: options.start_time,
      duration: options.duration,
      timezone: options.timezone || 'UTC',
      password: options.password || this.generateMeetingPassword(),
      settings: {
        join_before_host: false,
        waiting_room: true,
        mute_upon_entry: true,
        approval_type: 1, // Manually approve
        audio: 'both',
        video: true,
        enforce_login: false,
        participant_video: false,
        host_video: true,
        auto_recording: 'none',
        ...options.settings
      }
    }

    return this.makeRequest('/users/me/meetings', {
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

  async listMeetings(): Promise<{ meetings: ZoomMeeting[] }> {
    return this.makeRequest('/users/me/meetings')
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

  // Get meeting recording after the session
  async getMeetingRecordings(meetingId: string): Promise<any> {
    return this.makeRequest(`/meetings/${meetingId}/recordings`)
  }

  // Generate secure meeting password
  private generateMeetingPassword(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }
    return password
  }

  // Utility method to create healthcare-specific meeting
  async createHealthcareConsultation(options: {
    patientName: string
    clinicianName?: string
    appointmentTime: string
    duration: number
    patientEmail: string
  }): Promise<ZoomMeeting> {
    const meeting = await this.createMeeting({
      topic: `Healthcare Consultation - ${options.patientName}`,
      start_time: options.appointmentTime,
      duration: options.duration,
      settings: {
        join_before_host: false,
        waiting_room: true,
        mute_upon_entry: true,
        approval_type: 1,
        audio: 'both',
        video: true,
        enforce_login: false,
        participant_video: true,
        host_video: true,
        auto_recording: 'cloud' // For healthcare compliance
      }
    })

    // Add patient as registrant for better security
    await this.addMeetingRegistrant(meeting.id.toString(), {
      email: options.patientEmail,
      first_name: options.patientName.split(' ')[0],
      last_name: options.patientName.split(' ').slice(1).join(' ')
    })

    return meeting
  }
}

