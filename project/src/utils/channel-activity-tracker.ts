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
    private connectionsRecord: InterventionsRecord;
    private voiceInterventionsRecord: InterventionsRecord;

    private inactivityTimeoutSubject = new Subject<void>();
    private timeoutTimerSubscription: Subscription | null;

    constructor(voiceChannel: VoiceChannel, voiceConnection: VoiceConnection, settings: SessionSettings | null) {
        this.voiceChannel = voiceChannel;
        this.voiceConnection = voiceConnection;
        this.settings = settings;
        this.connectionsRecord = new InterventionsRecord();
        this.voiceInterventionsRecord = new InterventionsRecord(settings.timeWindowDuration?.valueOf());
        this.start();
    }

    public getUserRelevantSpeakTime(userId: string): number {
        return this.voiceInterventionsRecord.getMemberRelevantInterventionTime(userId); // TODO implement options for other units;
    }

    public getInactivityTimeoutObservable(): Observable<void> {
        return this.inactivityTimeoutSubject.asObservable();
    }

    public end(): void {
        this.voiceConnection.receiver.speaking.removeAllListeners();
        this.timeoutTimerSubscription.unsubscribe();
    }

    public setPrivilegedSpeakers(privilegedSpeakers: string[]): void {
        this.voiceInterventionsRecord.setExemptedMembers(privilegedSpeakers);
    }

    public getPrivilegedSpeakers(): Set<string> {
        return this.voiceInterventionsRecord.getExemptedMembers();
    }

    public onUserParticipationStatusChange(userId: string, becomingActive: boolean): void {
        becomingActive ? this.connectionsRecord.onInterventionStart(userId)
            : this.connectionsRecord.onInterventionStop(userId);
    }

    private start(): void {
        this.voiceConnection.receiver.speaking.on("start", ((userId) => {
            this.refreshInactivityTimeoutTimer();
            this.voiceInterventionsRecord.onInterventionStart(userId);
        }));
        this.voiceConnection.receiver.speaking.on("end", ((userId) => {
            this.refreshInactivityTimeoutTimer();
            this.voiceInterventionsRecord.onInterventionStop(userId);
        }));
        this.registerAllConnectedUsers();
        this.refreshInactivityTimeoutTimer();
    }

    private registerAllConnectedUsers(): void {
        const humanUsersInChannel = Array.from(this.voiceChannel.members).filter(([_, user]) => !user.user.bot);
        humanUsersInChannel.forEach(([userId, _]) => this.connectionsRecord.onInterventionStart(userId));
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
