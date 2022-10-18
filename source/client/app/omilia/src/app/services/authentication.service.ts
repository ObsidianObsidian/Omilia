import { Injectable } from '@angular/core'
import { ConversationEventsService } from './conversation-events.service'
import { ConversationStateService } from './conversation-state.service'
import { Convert, NotificationToSessionEvent, UserSessionEvent } from '../classes/common-classes/common-classes'

const AUTHENTICATION_STORAGE_KEY = 'authentication.userId'

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  constructor (private readonly conversationEventsService: ConversationEventsService, private readonly conversationStateService: ConversationStateService) {
  }

  authenticateAsUser (userId: string): void {
    localStorage.setItem(AUTHENTICATION_STORAGE_KEY, userId)
    const event: UserSessionEvent = { userId }
    const notification: NotificationToSessionEvent = { eventName: 'authentication', eventPayload: Convert.userSessionEventToJson(event) }
    this.conversationEventsService.sendNotificationToSession(notification)
  };

  isAuthenticated (): boolean {
    const authenticatedUserId = this.getCandidateUserId()
    if (authenticatedUserId !== null) {
      return this.conversationStateService.authenticatedUsers.has(authenticatedUserId)
    }
    return false
  }

  getCandidateUserId (): string | null {
    return localStorage.getItem(AUTHENTICATION_STORAGE_KEY)
  }

  getUserId (): string | null {
    return (!this.isAuthenticated() || this.getCandidateUserId() === null) ? null : this.getCandidateUserId()
  }
}
