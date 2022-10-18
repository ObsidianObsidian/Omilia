import { Component, Input, OnInit } from '@angular/core'
import { ConversationParticipant } from '../../classes/conversation-participant'

@Component({
  selector: 'app-conversation-board',
  templateUrl: './conversation-board.component.html',
  styleUrls: ['./conversation-board.component.scss']
})
export class ConversationBoardComponent implements OnInit {
  @Input() conversationParticipants: ConversationParticipant[] = []
  ngOnInit (): void {
  }
}
