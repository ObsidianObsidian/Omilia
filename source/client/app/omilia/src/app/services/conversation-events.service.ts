import { Injectable } from '@angular/core'
import {
  Convert,
  NotificationFromSessionEvent, NotificationToSessionEvent,
  OmiliaError,
  SocketConnectionInfo
} from '../classes/common-classes/common-classes'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { filter, map, Observable, Subject } from 'rxjs'

const CONVERSATION_MANAGER_URL = 'https://srv.omiliavoice.com'

@Injectable({
  providedIn: 'root'
})

export class ConversationEventsService {
  readonly hubConnection: HubConnection
  private readonly errorSubject = new Subject<OmiliaError>()
  private readonly sessionNotificationSubject = new Subject<NotificationFromSessionEvent>()
  sessionId: string | undefined

  constructor () {
    this.hubConnection = new HubConnectionBuilder().withUrl(`${CONVERSATION_MANAGER_URL}/sessionEvents`).withAutomaticReconnect().build()
    this.hubConnection.on('error', (error: string) => this.errorSubject.next(Convert.toOmiliaError(error)))
    this.hubConnection.on('notificationFromSession', (notification) => this.sessionNotificationSubject.next(Convert.toNotificationFromSessionEvent(notification)))
  }

  connectToSession (sessionId: string): void {
    const sessionInfo: SocketConnectionInfo = { sessionId }
    this.hubConnection.start().then(() => {
      console.log('• signalR connection established')
      void this.hubConnection.invoke('Register', Convert.socketConnectionInfoToJson(sessionInfo))
    }).catch((err) => {
      console.log('• signalR connection failed', err)
    })
  }

  getErrorObservable (): Observable<OmiliaError> {
    return this.errorSubject.asObservable()
  }

  getSessionEventObservable (eventName: string): Observable<string> {
    return this.sessionNotificationSubject.pipe(filter(event => event.eventName === eventName), map(event => event.eventPayload !== undefined ? event.eventPayload : ''))
  }

  sendNotificationToSession (notification: NotificationToSessionEvent): void {
    void this.hubConnection.invoke('NotifySession', this.sessionId, Convert.notificationToSessionEventToJson(notification))
  }
}
