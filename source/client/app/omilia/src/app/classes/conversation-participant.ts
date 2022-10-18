import { UserProfileInfo } from './common-classes/common-classes'

export interface ConversationParticipant {
  profileInfo: UserProfileInfo
  score: number
  requestToSpeak: boolean
}
