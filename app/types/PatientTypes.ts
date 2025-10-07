export interface Patient {

    id: string
    fullName: string
    mrn: string
    dateOfBirth: Date // ISO date string
    email?: string
    gender?: string
    phone?: string
}