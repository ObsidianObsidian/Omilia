import {TotalTimeScore} from "../speaker-score/total-time-score";
import {SpeakerScorer} from "./speaker-scorer";

export class TotalTimeScorer extends SpeakerScorer {
    public getSpeakerScore(userId: string): TotalTimeScore {
        const interventionTime = this.voiceInterventionsRecord.getMemberRelevantInterventionTime(userId);
        return new TotalTimeScore(interventionTime);
    }

    public getScoreModeName(): string {
        return "total time";
    }

}
