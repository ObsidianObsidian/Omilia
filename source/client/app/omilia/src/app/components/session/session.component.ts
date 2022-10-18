import { Component, OnInit } from '@angular/core'
import { AuthenticationService } from '../../services/authentication.service'
import { SelectionBoardOption } from '../selection-board/selection-board-option'
import { filter } from 'rxjs'
import { MessageType, NotificationsService } from '../../services/notifications.service'
import { ConversationStateService } from '../../services/conversation-state.service'
import { ConversationEventsService } from '../../services/conversation-events.service'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {
  constructor (private readonly authenticationService: AuthenticationService,
    readonly conversationStateService: ConversationStateService,
    private readonly conversationEventsService: ConversationEventsService,
    private readonly notificationsService: NotificationsService,
    private readonly route: ActivatedRoute) {
  }

  getProfileSelectionOptions (): SelectionBoardOption[] {
    const users = Array.from(this.conversationStateService.connectedUsers.values())
    const options: SelectionBoardOption[] = users.map(user => {
      const asBoardOption: SelectionBoardOption = {
        id: user.id,
        optionName: user.displayName,
        imageURL: user.avatarURL !== undefined ? user.avatarURL : '',
        isDisabled: this.conversationStateService.authenticatedUsers.has(user.id)
      }
      return asBoardOption
    })
    console.log(`connectedUsers ${this.conversationStateService.connectedUsers.size}`)
    return options
  }

  isAuthenticated (): boolean {
    return this.authenticationService.isAuthenticated()
  }

  onProfileSelection (selection: SelectionBoardOption): void {
    this.authenticationService.authenticateAsUser(selection.id)
  }

  sessionExistenceConfirmed (): boolean {
    return this.conversationStateService.getSessionDataLoadedFlag()
  }

  sessionExistenceUndetermined (): boolean {
    return !this.sessionExistenceConfirmed() && !this.conversationStateService.sessionDoesNotExistFlag
  }

  sessionDoesNotExist (): boolean {
    return this.conversationStateService.sessionDoesNotExistFlag
  }

  ngOnInit (): void {
    const retrievedSessionId = this.route.snapshot.paramMap.get('sessionId')
    this.conversationStateService.sessionId = retrievedSessionId !== null ? retrievedSessionId : undefined
    if (retrievedSessionId !== null) {
      this.conversationEventsService.connectToSession(retrievedSessionId)
    }
    this.conversationEventsService.getErrorObservable().pipe(filter((error) => error.errorName === 'CANNOT_LOAD_FROM_UNKNOWN_SESSION')).subscribe(() => {
      this.conversationStateService.sessionDoesNotExistFlag = true
      const displayMessage = (retrievedSessionId != null) ? `Session with id "${retrievedSessionId}" does not exist` : 'No session Id in URL'
      this.notificationsService.displaySnackBar(displayMessage, MessageType.Error, undefined, { duration: 3000 })
    })
  }
}
