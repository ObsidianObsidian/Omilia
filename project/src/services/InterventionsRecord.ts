import {MINIMUM_SPEAK_TIME_THRESHOLD} from "../constants/session-constants";

export class InterventionsRecord {
    private readonly timeWindowDuration: number | null;
    private birthTime = Date.now();
    // Map<userId, [[start, duration], ...]
    private speakingRecords = new Map<string, Array<[number, number]>>();
    // Map<userId, start>
    private latestVoiceStartTimes = new Map<string, number>();
    private latestVoiceStopTimes = new Map<string, number>();
    private privilegedSpeakers = new Set<string>();

    constructor(timeWindowDuration: number | null = null) {
        this.timeWindowDuration = timeWindowDuration;
    }

    public getPrivilegedSpeakers(): Set<string> {
        return this.privilegedSpeakers;
    }

    public getUserRelevantSpeakTime(userId: string): number {
        const currentTime = Date.now();
        if (this.userNeverSpoke(userId)) {
            return 0;
        }

        let oldestAllowedIntervention = this.birthTime;
        if (this.timeWindowDuration) {
            oldestAllowedIntervention = currentTime - this.timeWindowDuration;
        }

        const interventionsArray = this.speakingRecords.get(userId);
        let totalInterventionDuration = 0;

        for (let i = interventionsArray.length - 1; i >= 0; i--) {
            const [interventionTime, duration] = interventionsArray[i];
            if (interventionTime < oldestAllowedIntervention) {
                break;
            }
            totalInterventionDuration += duration;
        }

        if (this.isCurrentlySpeaking(userId) && !this.privilegedSpeakers.has(userId)) {
            const ongoingInterventionDuration = currentTime - this.latestVoiceStartTimes.get(userId);
            totalInterventionDuration += ongoingInterventionDuration;
        }

        return totalInterventionDuration;
    }

    public onStartSpeaking(userId: string): void {
        if (this.userNeverSpoke(userId)) {
            this.speakingRecords.set(userId, []);
        }
        this.latestVoiceStartTimes.set(userId, Date.now());
    }

    public onStopSpeaking(userId: string): void {
        this.latestVoiceStopTimes.set(userId, Date.now());
        if (this.privilegedSpeakers.has(userId) || this.userNeverSpoke(userId)) {
            return;
        }
        const start = this.latestVoiceStartTimes.get(userId);
        const duration = this.latestVoiceStopTimes.get(userId) - start;
        if (duration < MINIMUM_SPEAK_TIME_THRESHOLD) {
            return;
        }
        this.speakingRecords.get(userId).push([start, duration]);
    }

    public setPrivilegedSpeakers(privilegedSpeakers: string[]): void {
        const addedPrivilegedSpeakers = privilegedSpeakers
            .filter((speakerId) => !this.privilegedSpeakers.has(speakerId));
        this.beforePrivilegedSpeakersChange(addedPrivilegedSpeakers);
        this.privilegedSpeakers = new Set<string>(privilegedSpeakers);
    }

    private isCurrentlySpeaking(userId: string): boolean {
        if (this.userNeverSpoke(userId)) {
            return false;
        }
        if (this.userNeverStoppedSpeaking(userId)) {
            return true;
        }
        return this.latestVoiceStartTimes.get(userId) > this.latestVoiceStopTimes.get(userId);
    }

    private userNeverSpoke(userId: string) {
        return !this.latestVoiceStartTimes.has(userId);
    }

    private userNeverStoppedSpeaking(userId: string) {
        return !this.latestVoiceStopTimes.has(userId);
    }

    private beforePrivilegedSpeakersChange(addedPrivilegedSpeakers: string[]): void {
        for (const addedPrivilegedSpeaker of addedPrivilegedSpeakers) {
            this.onStopSpeaking(addedPrivilegedSpeaker);
        }
    }
}
