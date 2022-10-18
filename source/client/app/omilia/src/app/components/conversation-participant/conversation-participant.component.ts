import { Component, Input, OnInit } from '@angular/core'
import { ConversationParticipant } from '../../classes/conversation-participant'
import { ConversationParametersService } from '../../services/conversation-parameters.service'

@Component({
  selector: 'app-conversation-participant',
  templateUrl: './conversation-participant.component.html',
  styleUrls: ['./conversation-participant.component.scss']
})
export class ConversationParticipantComponent implements OnInit {
  @Input() public _conversationParticipant: ConversationParticipant | undefined

  constructor (public readonly conversationParametersService: ConversationParametersService) {
  }

  ngOnInit (): void {
    if (this._conversationParticipant == null) {
      throw new TypeError('Missing required input')
    }
  }

  get conversationParticipant (): ConversationParticipant {
    if (this._conversationParticipant == null) {
      throw new TypeError('Missing required input')
    }
    return this._conversationParticipant
  }

  getSpeakerScore (): number | undefined {
    return this.conversationParticipant?.score
  }
}
