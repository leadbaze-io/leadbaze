export interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export type UserOrNull = User | null
