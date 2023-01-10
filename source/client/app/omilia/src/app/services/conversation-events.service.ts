import { Injectable } from '@angular/core'
import {
  OmiliaError, UserSessionAction
} from '../classes/common-types/common-types'
import { BehaviorSubject, filter, Observable, Subject } from 'rxjs'
import { HttpClient } from '@angular/common/http'

export const CONVERSATION_MANAGER_URL = 'http://localhost:5000' // TODO replace

@Injectable({
  providedIn: 'root'
})

export class ConversationEventsService {
  private readonly eventSource = new BehaviorSubject<EventSource | undefined>(undefined)
  private readonly errorSubject = new Subject<OmiliaError>()
  sessionId: string | undefined

  constructor (private readonly httpClient: HttpClient) {}

  connectToSession (sessionId: string): void {
    this.eventSource.next(new EventSource(`${CONVERSATION_MANAGER_URL}/events?stream=${sessionId}`))
  }

  getEventSourceObservable (): Observable<EventSource> {
    return this.eventSource.asObservable().pipe(filter(event => event !== undefined)) as Observable<EventSource>
  }

  getErrorObservable (): Observable<OmiliaError> {
    return this.errorSubject.asObservable()
  }

  sendActionRequestToSession (userSessionAction: UserSessionAction): void {
    this.httpClient.post(`${CONVERSATION_MANAGER_URL}/session/action`, userSessionAction).subscribe()
  }
}
