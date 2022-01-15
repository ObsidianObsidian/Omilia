import {VoiceConnection} from "@discordjs/voice";
import {VoiceChannel} from "discord.js";
import {Subject, timer} from "rxjs";
import {Observable, Subscription} from "rxjs/dist/types";
import {MAXIMUM_INACTIVITY_THRESHOLD} from "../constants/session-constants";
import {SessionSettings} from "../interfaces/session-settings";
import {InterventionsRecord} from "./InterventionsRecord";

export class ChannelActivityTracker {
    public settings: SessionSettings;
    private voiceConnection: VoiceConnection;
    private voiceChannel: VoiceChannel;
    private voiceInterventionsRecord: InterventionsRecord;
    private connectionsRecord: InterventionsRecord;

    private inactivityTimeoutSubject = new Subject<void>();
    private timeoutTimerSubscription: Subscription | null;

    constructor(voiceChannel: VoiceChannel, voiceConnection: VoiceConnection, settings: SessionSettings | null) {
        this.voiceChannel = voiceChannel;
        this.voiceConnection = voiceConnection;
        this.settings = settings;
        this.voiceInterventionsRecord = new InterventionsRecord(settings.timeWindowDuration?.valueOf());
        this.connectionsRecord = new InterventionsRecord();
        this.start();
    }

    public getUserRelevantSpeakTime(userId: string): number {
        console.log("connection time", this.connectionsRecord.getUserRelevantSpeakTime(userId));
        return this.voiceInterventionsRecord.getUserRelevantSpeakTime(userId); // TODO implement options for other units;
    }

    public getInactivityTimeoutObservable(): Observable<void> {
        return this.inactivityTimeoutSubject.asObservable();
    }

    public end(): void {
        this.voiceConnection.receiver.speaking.removeAllListeners();
        this.timeoutTimerSubscription.unsubscribe();
    }

    public setPrivilegedSpeakers(privilegedSpeakers: string[]): void {
        this.voiceInterventionsRecord.setPrivilegedSpeakers(privilegedSpeakers);
    }

    public getPrivilegedSpeakers(): Set<string> {
        return this.voiceInterventionsRecord.getPrivilegedSpeakers();
    }

    public onUserParticipationStatusChange(userId: string, becomingActive: boolean): void {
        becomingActive ? this.connectionsRecord.onStartSpeaking(userId) : this.connectionsRecord.onStopSpeaking(userId);
    }

    private start(): void {
        this.voiceConnection.receiver.speaking.on("start", ((userId) => {
            this.refreshInactivityTimeoutTimer();
            this.voiceInterventionsRecord.onStartSpeaking(userId);
        }));
        this.voiceConnection.receiver.speaking.on("end", ((userId) => {
            this.refreshInactivityTimeoutTimer();
            this.voiceInterventionsRecord.onStopSpeaking(userId);
        }));
        this.registerAllConnectedUsers();
        this.refreshInactivityTimeoutTimer();
    }

    private registerAllConnectedUsers(): void {
        const humanUsersInChannel = Array.from(this.voiceChannel.members).filter(([_, user]) => !user.user.bot);
        humanUsersInChannel.forEach(([userId, _]) => this.connectionsRecord.onStartSpeaking(userId));
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
