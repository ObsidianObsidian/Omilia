import { Component, OnInit } from '@angular/core'
import { ConversationParticipant } from '../../classes/conversation-participant'
import { ConversationStateService } from '../../services/conversation-state.service'
import { AuthenticationService } from '../../services/authentication.service'
import { ConversationEventsService } from '../../services/conversation-events.service'
import {Convert, UserSessionAction} from '../../classes/common-types/common-types'

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit {
  constructor (public readonly conversationStateService: ConversationStateService, private readonly authenticationService: AuthenticationService, private readonly conversationEventsService: ConversationEventsService) {
  }

  getConversationParticipants (): ConversationParticipant[] {
    const participants: ConversationParticipant[] = []
    this.conversationStateService.connectedUsers.forEach((v, k) => {
      const score = this.conversationStateService.userScores.get(v.id)
      return participants.push({ profileInfo: v, score: score != null ? score : 0, requestToSpeak: this.conversationStateService.requestsToSpeak.has(v.id) })
    })
    return participants.sort(this.participantsSortingRule)
  }

  getNonRequestSpeakers (): ConversationParticipant[] {
    return this.getConversationParticipants().filter(participant => !participant.requestToSpeak).sort(this.participantsSortingRule)
  }

  getRequestSpeakers (): ConversationParticipant[] {
    return this.getConversationParticipants().filter(participant => participant.requestToSpeak).sort(this.participantsSortingRule)
  }

  ongoingRequests (): boolean {
    return this.conversationStateService.getRequestsToSpeak().size > 0
  }

  multipleSpeakerBoards (): boolean {
    return this.ongoingRequests() && this.conversationStateService.connectedUsers.size > this.conversationStateService.requestsToSpeak.size
  }

  isEmptySession (): boolean {
    return this.conversationStateService.isEmptySession()
  }

  conversationHasEnded (): boolean {
    return this.conversationStateService.getSessionEndedFlag()
  }

  private participantsSortingRule (a: ConversationParticipant, b: ConversationParticipant): number {
    return a.score - b.score
  }

  ongoingRequest (): boolean {
    const candidateId = this.authenticationService.getCandidateUserId()
    if (candidateId === null) {
      return false
    }
    return this.authenticationService.isAuthenticated() && this.conversationStateService.requestsToSpeak.has(candidateId)
  }

  onRequestBtnClicked (): void {
    const userId = this.authenticationService.getUserId()
    if (!this.authenticationService.isAuthenticated() || userId === null) {
      return
    }
    const userSessionAction: UserSessionAction = { userId, sessionId: this.conversationStateService.sessionId === undefined ? '' : this.conversationStateService.sessionId, eventName: this.ongoingRequest() ? 'endRequestToSpeak' : 'requestToSpeak'}
    this.conversationEventsService.sendActionRequestToSession(userSessionAction)
  }

  ngOnInit (): void {
  }
}
