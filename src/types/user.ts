export interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
    [key: string]: any
  }
  [key: string]: any
}

export type UserOrNull = User | null
