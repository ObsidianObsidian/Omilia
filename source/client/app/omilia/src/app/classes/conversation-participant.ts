import { UserProfileInfo } from './common-types/common-types'

export interface ConversationParticipant {
  profileInfo: UserProfileInfo
  score: number
  requestToSpeak: boolean
}
