export interface Contact {
  id: string
  user_id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  birthday: string | null // ISO date string
  last_contact: string | null // ISO timestamp string
  mobile_carrier: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  user_id: string
  contact_id: string | null
  title: string
  event_date: string // ISO timestamp string
  is_recurring: boolean
  created_at: string
}

export interface ContactFile {
  id: string
  user_id: string
  contact_id: string
  file_name: string
  file_path: string
  created_at: string
}
