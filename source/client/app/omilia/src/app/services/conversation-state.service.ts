import { Injectable } from '@angular/core'
import {
  Convert,
  DBUserProfileInfo, ScoresUpdateEvent, SessionStateInfo,
  UserConnectionStatusEvent,
  UserProfileInfo, UserSessionEvent
} from '../classes/common-classes/common-classes'
import { FirebaseApp, initializeApp } from 'firebase/app'
import { getFirestore, Firestore, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { ConversationEventsService } from './conversation-events.service'

const firebaseConfig = {
  apiKey: 'AIzaSyAMHtHjdNLCTPqwRUGmRYk25VGXYPb-ARA',
  authDomain: 'omilia-7adde.firebaseapp.com',
  projectId: 'omilia-7adde',
  storageBucket: 'omilia-7adde.appspot.com',
  messagingSenderId: '373016730412',
  appId: '1:373016730412:web:52a6ca3c5f6c6c987a6a89',
  measurementId: 'G-6M2T4Z24VH'
}

@Injectable({
  providedIn: 'root'
})
export class ConversationStateService {
  connectedUsers: Map<string, UserProfileInfo> = new Map<string, UserProfileInfo>()
  userScores: Map<string, number> = new Map<string, number>()
  requestsToSpeak: Set<string> = new Set<string>()
  authenticatedUsers: Set<string> = new Set<string>()
  private sessionEndedFlag: boolean = false
  private sessionDataLoadedFlag: boolean = false
  sessionDoesNotExistFlag: boolean = false
  private sessionName: string | undefined
  private readonly firebaseApp: FirebaseApp
  private readonly fireStore: Firestore

  constructor (private readonly eventsService: ConversationEventsService) {
    this.firebaseApp = initializeApp(firebaseConfig)
    this.fireStore = getFirestore(this.firebaseApp)
    this.setupListeners()
  }

  private async registerUser (userId: string): Promise<void> {
    this.connectedUsers.set(userId, {
      displayName: 'New user',
      id: userId,
      avatarURL: 'https://cdn.discordapp.com/attachments/699320068261019660/1025236816401535086/Omilia_logo_outlined.png'
    })
    const docRef = doc(this.fireStore, 'userProfileInfo', userId)
    const docSnapshot = await getDoc(docRef)
    let userInfo: DBUserProfileInfo
    if (docSnapshot.exists()) {
      userInfo = docSnapshot.data() as DBUserProfileInfo
      this.connectedUsers.set(userId, { displayName: userInfo.displayName, id: userInfo.userId, avatarURL: userInfo.avatarUrl })
    } else {
      const unsubscribe = onSnapshot(docRef, (doc) => {
        userInfo = doc.data() as DBUserProfileInfo
        this.connectedUsers.set(userId, { displayName: userInfo.displayName, id: userInfo.userId, avatarURL: userInfo.avatarUrl })
        unsubscribe()
      })
      setTimeout(() => unsubscribe(), 800)
    }
  }

  get sessionId (): string | undefined {
    return this.eventsService.sessionId
  }

  set sessionId (newId) {
    this.eventsService.sessionId = newId
  }

  getSessionDataLoadedFlag (): boolean {
    return this.sessionDataLoadedFlag
  }

  private setupListeners (): void {
    this.eventsService.hubConnection.on('loadSession', (event: string) => this.onLoadSession(Convert.toSessionStateInfo(event)))
    this.eventsService.getSessionEventObservable('userJoin').subscribe((event) => this.onUserJoin(Convert.toUserConnectionStatusEvent(event)))
    this.eventsService.getSessionEventObservable('userLeave').subscribe((event: string) => this.onUserLeave(Convert.toUserConnectionStatusEvent(event)))
    this.eventsService.getSessionEventObservable('userScoresUpdate').subscribe((event: string) => this.onUsersScoreUpdate(Convert.toScoresUpdateEvent(event)))
    this.eventsService.getSessionEventObservable('requestToSpeak').subscribe((event: string) => this.onRequestToSpeak(Convert.toUserSessionEvent(event)))
    this.eventsService.getSessionEventObservable('endRequestToSpeak').subscribe((event: string) => this.onEndRequestToSpeak(Convert.toUserSessionEvent(event)))
    this.eventsService.getSessionEventObservable('sessionEnded').subscribe(() => this.onSessionEnd())
    this.eventsService.getSessionEventObservable('authentication').subscribe((event: string) => this.onAuthenticatedUserAdd(Convert.toUserSessionEvent(event)))
    this.eventsService.getSessionEventObservable('endAuthentication').subscribe((event: string) => this.onAuthenticatedUserRemove(Convert.toUserSessionEvent(event)))
  }

  private onUserJoin (event: UserConnectionStatusEvent): void {
    console.log('• onUserJoin called')
    void this.registerUser(event.userId)
  }

  private onUserLeave (event: UserConnectionStatusEvent): void {
    console.log('• onUserLeave called')
    this.connectedUsers.delete(event.userId)
    this.requestsToSpeak.delete(event.userId)
  }

  private onLoadSession (event: SessionStateInfo): void {
    this.sessionDataLoadedFlag = true
    console.log('• load session called')
    event.connectedSpeakers.forEach(speakerId => {
      void this.registerUser(speakerId)
    })
    this.requestsToSpeak = new Set<string>(event.requestsToSpeak)
    this.userScores = new Map<string, number>(event.userScores.map(request => [request.userId, request.score]))
    this.authenticatedUsers = new Set<string>(event.authenticatedSpeakers)
    this.sessionName = event.sessionName
  }

  private onUsersScoreUpdate (event: ScoresUpdateEvent): void {
    event.scores.forEach(score => this.userScores.set(score.userId, score.score))
  }

  private onSessionEnd (): void {
    this.sessionEndedFlag = true
  }

  getSessionName (): string | undefined {
    return this.sessionName
  }

  getSessionEndedFlag (): boolean {
    return this.sessionEndedFlag
  }

  private onRequestToSpeak (event: UserSessionEvent): void {
    this.requestsToSpeak.add(event.userId)
  }

  private onEndRequestToSpeak (event: UserSessionEvent): void {
    this.requestsToSpeak.delete(event.userId)
  }

  private onAuthenticatedUserAdd (event: UserSessionEvent): void {
    this.authenticatedUsers.add(event.userId)
  }

  private onAuthenticatedUserRemove (event: UserSessionEvent): void {
    this.authenticatedUsers.delete(event.userId)
  }

  isEmptySession (): boolean {
    return this.connectedUsers.size === 0
  }

  getRequestsToSpeak (): Set<string> {
    return this.requestsToSpeak
  }
}
