import {VoiceConnection} from "@discordjs/voice";
import {Subject, timer} from "rxjs";
import {Observable, Subscription} from "rxjs/dist/types";
import {MAXIMUM_INACTIVITY_THRESHOLD} from "../constants/session-constants";
import {SessionSettings} from "../interfaces/session-settings";
import {InterventionsRecord} from "./InterventionsRecord";

export class ActivityTracker {
    public settings: SessionSettings;
    private voiceConnection: VoiceConnection;
    private voiceRecords: InterventionsRecord;

    private inactivityTimeoutSubject = new Subject<void>();
    private timeoutTimerSubscription: Subscription | null;

    constructor(voiceConnection: VoiceConnection, settings: SessionSettings | null) {
        this.voiceConnection = voiceConnection;
        this.settings = settings;
        this.voiceRecords = new InterventionsRecord(settings.timeWindowDuration?.valueOf());
        this.start();
    }

    public getUserRelevantSpeakTime(userId: string): number {
        return this.voiceRecords.getUserRelevantSpeakTime(userId); // TODO implement options for other units;
    }

    public getInactivityTimeoutObservable(): Observable<void> {
        return this.inactivityTimeoutSubject.asObservable();
    }

    public end(): void {
        this.voiceConnection.receiver.speaking.removeAllListeners();
        this.timeoutTimerSubscription.unsubscribe();
    }

    public setPrivilegedSpeakers(privilegedSpeakers: string[]): void {
        this.voiceRecords.setPrivilegedSpeakers(privilegedSpeakers);
    }

    public getPrivilegedSpeakers(): Set<string> {
        return this.voiceRecords.getPrivilegedSpeakers();
    }

    private start(): void {
        this.voiceConnection.receiver.speaking.on("start", ((userId) => {
            this.refreshInactivityTimeoutTimer();
            this.voiceRecords.onStartSpeaking(userId);
        }));
        this.voiceConnection.receiver.speaking.on("end", ((userId) => {
            this.refreshInactivityTimeoutTimer();
            this.voiceRecords.onStopSpeaking(userId);
        }));
        this.refreshInactivityTimeoutTimer();
    }

    private refreshInactivityTimeoutTimer(): void {
        if (this.timeoutTimerSubscription) {
            this.timeoutTimerSubscription.unsubscribe();
        }

        this.timeoutTimerSubscription = timer(MAXIMUM_INACTIVITY_THRESHOLD).subscribe(() => {
            this.inactivityTimeoutSubject.next();
        });
    }
}
