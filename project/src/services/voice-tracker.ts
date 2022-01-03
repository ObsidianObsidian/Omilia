import {VoiceConnection} from "@discordjs/voice";
import {Subject, timer} from "rxjs";
import {Observable, Subscription} from "rxjs/dist/types";
import {MAXIMUM_INACTIVITY_THRESHOLD, MINIMUM_SPEAK_TIME_THRESHOLD} from "../constants/session-constants";
import {SessionSettings} from "../interfaces/session-settings";

export class VoiceTracker {
    public settings: SessionSettings;
    private voiceConnection: VoiceConnection;
    // Map<userId, [[start, duration], ...]
    private speakingRecords = new Map<string, Array<[number, number]>>();
    // Map<userId, start>
    private latestVoiceStartTimes = new Map<string, number>();
    private birthTime = Date.now();

    private inactivityTimeoutSubject = new Subject<void>();
    private timeoutTimerSubscription: Subscription | null;

    constructor(voiceConnection: VoiceConnection, settings: SessionSettings | null) {
        this.voiceConnection = voiceConnection;
        this.settings = settings;
        this.setup();
    }

    public getUserRelevantSpeakTime(userId: string): number {
        let oldestAllowedIntervention = this.birthTime;
        if (this.settings.timeWindowDuration) {
            oldestAllowedIntervention = Date.now() - this.settings.timeWindowDuration.valueOf();
        }

        const interventionsArray = this.speakingRecords.get(userId);
        if (!interventionsArray) { // user never spoke
            return 0;
        }
        let totalInterventionDuration = 0;

        for (let i = interventionsArray.length - 1; i >= 0; i--) {
            const [interventionTime, duration] = interventionsArray[i];
            if (interventionTime < oldestAllowedIntervention) {
                break;
            }
            totalInterventionDuration += duration;
        }

        return totalInterventionDuration;
    }

    public getInactivityTimeoutObservable(): Observable<void> {
        return this.inactivityTimeoutSubject.asObservable();
    }

    public end(): void {
        this.voiceConnection.receiver.speaking.removeAllListeners();
        this.timeoutTimerSubscription.unsubscribe();
    }

    private setup(): void {
        this.voiceConnection.receiver.speaking.on("start", ((userId) => {
            this.refreshInactivityTimeoutTimer();
            this.onStartSpeaking(userId);
        }));
        this.voiceConnection.receiver.speaking.on("end", ((userId) => {
            this.refreshInactivityTimeoutTimer();
            this.onStopSpeaking(userId);
        }));
        this.refreshInactivityTimeoutTimer();
    }

    private onStartSpeaking(userId: string): void {
        const start = Date.now();
        if (!this.speakingRecords.has(userId)) {
            this.speakingRecords.set(userId, []);
        }
        this.latestVoiceStartTimes.set(userId, start);
    }

    private onStopSpeaking(userId: string): void {
        if (!this.latestVoiceStartTimes.has(userId)) { // user was never seen starting
            return;
        }
        const end = Date.now();
        const start = this.latestVoiceStartTimes.get(userId);
        const duration = end - start;
        if (duration < MINIMUM_SPEAK_TIME_THRESHOLD) {
            return;
        }
        this.speakingRecords.get(userId).push([end, duration]);
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
