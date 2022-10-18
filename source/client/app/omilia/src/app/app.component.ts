import { Component } from '@angular/core'
import { ConversationEventsService } from './services/conversation-events.service'
import { NotificationsService } from './services/notifications.service'
import { debounceTime } from 'rxjs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'omilia'

  constructor (eventService: ConversationEventsService, notificationsService: NotificationsService) {
    eventService.getSessionEventObservable('requestToSpeak').pipe(debounceTime(20)).subscribe(() => {
      notificationsService.playSound('https://firebasestorage.googleapis.com/v0/b/omilia-7adde.appspot.com/o/media%2Fnotification.wav?alt=media')
    })
  }
}
