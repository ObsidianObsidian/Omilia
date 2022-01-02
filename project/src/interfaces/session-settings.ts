// tslint:disable-next-line:interface-name
export interface SessionSettings {
    timeWindowDuration?: number; // time (ms) before forgetting (0 means forever)
    refreshDelay: number; // time (ms) before refreshing session/leaderboard message(s)
}
