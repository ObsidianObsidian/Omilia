import {MINIMUM_SPEAK_TIME_THRESHOLD} from "../constants/session-constants";
import {SessionSettings} from "../interfaces/session-settings";

export class InterventionsRecord {
    private readonly sessionSettings: SessionSettings;
    private birthTime = Date.now();
    // Map<memberId, [[start, duration], ...]
    private interventionRecords = new Map<string, Array<[number, number]>>();
    // Map<memberId, start>
    private latestInterventionStartTimes = new Map<string, number>();
    private latestInterventionStopTimes = new Map<string, number>();
    private exemptedMembers = new Set<string>();

    constructor(sessionSettings: SessionSettings) {
        this.sessionSettings = sessionSettings;
    }

    public getExemptedMembers(): Set<string> {
        return this.exemptedMembers;
    }

    public getMemberRelevantInterventionTime(memberId: string): number {
        const currentTime = Date.now();
        if (this.noInterventionsStarted(memberId)) {
            return 0;
        }

        let oldestAllowedIntervention = this.birthTime;
        if (this.sessionSettings.timeWindowDuration) {
            oldestAllowedIntervention = currentTime - this.sessionSettings.timeWindowDuration.valueOf();
        }

        const interventionsArray = this.interventionRecords.get(memberId);
        let totalInterventionDuration = 0;

        for (let i = interventionsArray.length - 1; i >= 0; i--) {
            const [interventionTime, duration] = interventionsArray[i];
            if (interventionTime < oldestAllowedIntervention) {
                break;
            }
            totalInterventionDuration += duration;
        }

        if (this.isCurrentlyIntervening(memberId) && !this.exemptedMembers.has(memberId)) {
            const ongoingInterventionDuration = currentTime - this.latestInterventionStartTimes.get(memberId);
            totalInterventionDuration += ongoingInterventionDuration;
        }

        return totalInterventionDuration;
    }

    public onInterventionStart(memberId: string): void {
        if (this.noInterventionsStarted(memberId)) {
            this.interventionRecords.set(memberId, []);
        }
        this.latestInterventionStartTimes.set(memberId, Date.now());
    }

    public onInterventionStop(memberId: string): void {
        this.latestInterventionStopTimes.set(memberId, Date.now());
        if (this.exemptedMembers.has(memberId) || this.noInterventionsStarted(memberId)) {
            return;
        }
        const start = this.latestInterventionStartTimes.get(memberId);
        const duration = this.latestInterventionStopTimes.get(memberId) - start;
        if (duration < MINIMUM_SPEAK_TIME_THRESHOLD) {
            return;
        }
        this.interventionRecords.get(memberId).push([start, duration]);
    }

    public setExemptedMembers(exemptedMembers: string[]): void {
        const addedExemptedMembers = exemptedMembers
            .filter((speakerId) => !this.exemptedMembers.has(speakerId));
        this.beforeExemptedMembersChange(addedExemptedMembers);
        this.exemptedMembers = new Set<string>(exemptedMembers);
    }

    private isCurrentlyIntervening(memberId: string): boolean {
        if (this.noInterventionsStarted(memberId)) {
            return false;
        }
        if (this.noInterventionsStopped(memberId)) {
            return true;
        }
        return this.latestInterventionStartTimes.get(memberId) > this.latestInterventionStopTimes.get(memberId);
    }

    private noInterventionsStarted(memberId: string) {
        return !this.latestInterventionStartTimes.has(memberId);
    }

    private noInterventionsStopped(memberId: string) {
        return !this.latestInterventionStopTimes.has(memberId);
    }

    private beforeExemptedMembersChange(addedExemptedMembers: string[]): void {
        for (const addedExemptedMember of addedExemptedMembers) {
            this.onInterventionStop(addedExemptedMember);
        }
    }
}
