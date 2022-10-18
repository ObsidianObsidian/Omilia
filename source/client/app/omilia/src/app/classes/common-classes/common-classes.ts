// To parse this data:
//
//   import { Convert, SessionCreationRequest, SessionCreationRequestResponse, UserProfileInfo, SocketConnectionInfo, UserSessionEvent, ScoresUpdateEvent, UserConnectionStatusEvent, NotificationFromSessionEvent, NotificationToSessionEvent, UserScore, SessionStateInfo, DBUserProfileInfo, OmiliaError } from "./file";
//
//   const sessionCreationRequest = Convert.toSessionCreationRequest(json);
//   const sessionCreationRequestResponse = Convert.toSessionCreationRequestResponse(json);
//   const userProfileInfo = Convert.toUserProfileInfo(json);
//   const socketConnectionInfo = Convert.toSocketConnectionInfo(json);
//   const userSessionEvent = Convert.toUserSessionEvent(json);
//   const scoresUpdateEvent = Convert.toScoresUpdateEvent(json);
//   const userConnectionStatusEvent = Convert.toUserConnectionStatusEvent(json);
//   const notificationFromSessionEvent = Convert.toNotificationFromSessionEvent(json);
//   const notificationToSessionEvent = Convert.toNotificationToSessionEvent(json);
//   const userScore = Convert.toUserScore(json);
//   const sessionStateInfo = Convert.toSessionStateInfo(json);
//   const dBUserProfileInfo = Convert.toDBUserProfileInfo(json);
//   const omiliaError = Convert.toOmiliaError(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface SessionCreationRequest {
  requestId: string
  users: UserProfileInfo[]
}

export interface UserProfileInfo {
  avatarURL?: string
  displayName: string
  id: string
}

export interface SessionCreationRequestResponse {
  sessionId: string
}

export interface SocketConnectionInfo {
  sessionId: string
}

export interface UserSessionEvent {
  userId: string
}

export interface ScoresUpdateEvent {
  scores: UserScore[]
}

export interface UserScore {
  score: number
  userId: string
}

export interface UserConnectionStatusEvent {
  eventName: string
  userId: string
}

export interface NotificationFromSessionEvent {
  eventName: string
  eventPayload?: string
}

export interface NotificationToSessionEvent {
  eventName: string
  eventPayload?: string
}

export interface SessionStateInfo {
  authenticatedSpeakers: string[]
  connectedSpeakers: string[]
  requestsToSpeak: string[]
  sessionName: string
  userScores: UserScore[]
}

export interface DBUserProfileInfo {
  avatarUrl: string
  displayName: string
  userId: string
}

export interface OmiliaError {
  errorName: string
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toSessionCreationRequest (json: string): SessionCreationRequest {
    return cast(JSON.parse(json), r('SessionCreationRequest'))
  }

  public static sessionCreationRequestToJson (value: SessionCreationRequest): string {
    return JSON.stringify(uncast(value, r('SessionCreationRequest')), null, 2)
  }

  public static toSessionCreationRequestResponse (json: string): SessionCreationRequestResponse {
    return cast(JSON.parse(json), r('SessionCreationRequestResponse'))
  }

  public static sessionCreationRequestResponseToJson (value: SessionCreationRequestResponse): string {
    return JSON.stringify(uncast(value, r('SessionCreationRequestResponse')), null, 2)
  }

  public static toUserProfileInfo (json: string): UserProfileInfo {
    return cast(JSON.parse(json), r('UserProfileInfo'))
  }

  public static userProfileInfoToJson (value: UserProfileInfo): string {
    return JSON.stringify(uncast(value, r('UserProfileInfo')), null, 2)
  }

  public static toSocketConnectionInfo (json: string): SocketConnectionInfo {
    return cast(JSON.parse(json), r('SocketConnectionInfo'))
  }

  public static socketConnectionInfoToJson (value: SocketConnectionInfo): string {
    return JSON.stringify(uncast(value, r('SocketConnectionInfo')), null, 2)
  }

  public static toUserSessionEvent (json: string): UserSessionEvent {
    return cast(JSON.parse(json), r('UserSessionEvent'))
  }

  public static userSessionEventToJson (value: UserSessionEvent): string {
    return JSON.stringify(uncast(value, r('UserSessionEvent')), null, 2)
  }

  public static toScoresUpdateEvent (json: string): ScoresUpdateEvent {
    return cast(JSON.parse(json), r('ScoresUpdateEvent'))
  }

  public static scoresUpdateEventToJson (value: ScoresUpdateEvent): string {
    return JSON.stringify(uncast(value, r('ScoresUpdateEvent')), null, 2)
  }

  public static toUserConnectionStatusEvent (json: string): UserConnectionStatusEvent {
    return cast(JSON.parse(json), r('UserConnectionStatusEvent'))
  }

  public static userConnectionStatusEventToJson (value: UserConnectionStatusEvent): string {
    return JSON.stringify(uncast(value, r('UserConnectionStatusEvent')), null, 2)
  }

  public static toNotificationFromSessionEvent (json: string): NotificationFromSessionEvent {
    return cast(JSON.parse(json), r('NotificationFromSessionEvent'))
  }

  public static notificationFromSessionEventToJson (value: NotificationFromSessionEvent): string {
    return JSON.stringify(uncast(value, r('NotificationFromSessionEvent')), null, 2)
  }

  public static toNotificationToSessionEvent (json: string): NotificationToSessionEvent {
    return cast(JSON.parse(json), r('NotificationToSessionEvent'))
  }

  public static notificationToSessionEventToJson (value: NotificationToSessionEvent): string {
    return JSON.stringify(uncast(value, r('NotificationToSessionEvent')), null, 2)
  }

  public static toUserScore (json: string): UserScore {
    return cast(JSON.parse(json), r('UserScore'))
  }

  public static userScoreToJson (value: UserScore): string {
    return JSON.stringify(uncast(value, r('UserScore')), null, 2)
  }

  public static toSessionStateInfo (json: string): SessionStateInfo {
    return cast(JSON.parse(json), r('SessionStateInfo'))
  }

  public static sessionStateInfoToJson (value: SessionStateInfo): string {
    return JSON.stringify(uncast(value, r('SessionStateInfo')), null, 2)
  }

  public static toDBUserProfileInfo (json: string): DBUserProfileInfo {
    return cast(JSON.parse(json), r('DBUserProfileInfo'))
  }

  public static dBUserProfileInfoToJson (value: DBUserProfileInfo): string {
    return JSON.stringify(uncast(value, r('DBUserProfileInfo')), null, 2)
  }

  public static toOmiliaError (json: string): OmiliaError {
    return cast(JSON.parse(json), r('OmiliaError'))
  }

  public static omiliaErrorToJson (value: OmiliaError): string {
    return JSON.stringify(uncast(value, r('OmiliaError')), null, 2)
  }
}

function invalidValue (typ: any, val: any, key: any = ''): never {
  if (key) {
    throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`)
  }
  throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`)
}

function jsonToJSProps (typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ })
    typ.jsonToJS = map
  }
  return typ.jsonToJS
}

function jsToJSONProps (typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ })
    typ.jsToJSON = map
  }
  return typ.jsToJSON
}

function transform (val: any, typ: any, getProps: any, key: any = ''): any {
  function transformPrimitive (typ: string, val: any): any {
    if (typeof typ === typeof val) return val
    return invalidValue(typ, val, key)
  }

  function transformUnion (typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length
    for (let i = 0; i < l; i++) {
      const typ = typs[i]
      try {
        return transform(val, typ, getProps)
      } catch (_) {}
    }
    return invalidValue(typs, val)
  }

  function transformEnum (cases: string[], val: any): any {
    if (cases.includes(val)) return val
    return invalidValue(cases, val)
  }

  function transformArray (typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue('array', val)
    return val.map(el => transform(el, typ, getProps))
  }

  function transformDate (val: any): any {
    if (val === null) {
      return null
    }
    const d = new Date(val)
    if (isNaN(d.valueOf())) {
      return invalidValue('Date', val)
    }
    return d
  }

  function transformObject (props: { [k: string]: any }, additional: any, val: any): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue('object', val)
    }
    const result: any = {}
    Object.getOwnPropertyNames(props).forEach(key => {
      const prop = props[key]
      const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined
      result[prop.key] = transform(v, prop.typ, getProps, prop.key)
    })
    Object.getOwnPropertyNames(val).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key)
      }
    })
    return result
  }

  if (typ === 'any') return val
  if (typ === null) {
    if (val === null) return val
    return invalidValue(typ, val)
  }
  if (typ === false) return invalidValue(typ, val)
  while (typeof typ === 'object' && typ.ref !== undefined) {
    typ = typeMap[typ.ref]
  }
  if (Array.isArray(typ)) return transformEnum(typ, val)
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty('props')
          ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val)
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val)
  return transformPrimitive(typ, val)
}

function cast<T> (val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps)
}

function uncast<T> (val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps)
}

function a (typ: any) {
  return { arrayItems: typ }
}

function u (...typs: any[]) {
  return { unionMembers: typs }
}

function o (props: any[], additional: any) {
  return { props, additional }
}

function m (additional: any) {
  return { props: [], additional }
}

function r (name: string) {
  return { ref: name }
}

const typeMap: any = {
  SessionCreationRequest: o([
    { json: 'requestId', js: 'requestId', typ: '' },
    { json: 'users', js: 'users', typ: a(r('UserProfileInfo')) }
  ], 'any'),
  UserProfileInfo: o([
    { json: 'avatarURL', js: 'avatarURL', typ: u(undefined, '') },
    { json: 'displayName', js: 'displayName', typ: '' },
    { json: 'id', js: 'id', typ: '' }
  ], 'any'),
  SessionCreationRequestResponse: o([
    { json: 'sessionId', js: 'sessionId', typ: '' }
  ], 'any'),
  SocketConnectionInfo: o([
    { json: 'sessionId', js: 'sessionId', typ: '' }
  ], 'any'),
  UserSessionEvent: o([
    { json: 'userId', js: 'userId', typ: '' }
  ], 'any'),
  ScoresUpdateEvent: o([
    { json: 'scores', js: 'scores', typ: a(r('UserScore')) }
  ], 'any'),
  UserScore: o([
    { json: 'score', js: 'score', typ: 3.14 },
    { json: 'userId', js: 'userId', typ: '' }
  ], 'any'),
  UserConnectionStatusEvent: o([
    { json: 'eventName', js: 'eventName', typ: '' },
    { json: 'userId', js: 'userId', typ: '' }
  ], 'any'),
  NotificationFromSessionEvent: o([
    { json: 'eventName', js: 'eventName', typ: '' },
    { json: 'eventPayload', js: 'eventPayload', typ: u(undefined, '') }
  ], 'any'),
  NotificationToSessionEvent: o([
    { json: 'eventName', js: 'eventName', typ: '' },
    { json: 'eventPayload', js: 'eventPayload', typ: u(undefined, '') }
  ], 'any'),
  SessionStateInfo: o([
    { json: 'authenticatedSpeakers', js: 'authenticatedSpeakers', typ: a('') },
    { json: 'connectedSpeakers', js: 'connectedSpeakers', typ: a('') },
    { json: 'requestsToSpeak', js: 'requestsToSpeak', typ: a('') },
    { json: 'sessionName', js: 'sessionName', typ: '' },
    { json: 'userScores', js: 'userScores', typ: a(r('UserScore')) }
  ], 'any'),
  DBUserProfileInfo: o([
    { json: 'avatarUrl', js: 'avatarUrl', typ: '' },
    { json: 'displayName', js: 'displayName', typ: '' },
    { json: 'userId', js: 'userId', typ: '' }
  ], 'any'),
  OmiliaError: o([
    { json: 'errorName', js: 'errorName', typ: '' }
  ], 'any')
}
