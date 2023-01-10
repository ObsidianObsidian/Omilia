import { Injectable } from '@angular/core'
import { ConversationEventsService } from './conversation-events.service'
import { ConversationStateService } from './conversation-state.service'
import {
  Convert,
  NotificationToSessionEvent,
  UserSessionAction,
  UserSessionEvent
} from '../classes/common-types/common-types'

const AUTHENTICATION_STORAGE_KEY = 'authentication.userId'

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  constructor (private readonly conversationEventsService: ConversationEventsService, private readonly conversationStateService: ConversationStateService) {
  }

  authenticateAsUser (userId: string): void {
    localStorage.setItem(AUTHENTICATION_STORAGE_KEY, userId)
    const notification: UserSessionAction = { eventName: 'authenticate', userId, sessionId: this.conversationStateService.sessionId === undefined ? '' : this.conversationStateService.sessionId }
    this.conversationEventsService.sendActionRequestToSession(notification)
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
