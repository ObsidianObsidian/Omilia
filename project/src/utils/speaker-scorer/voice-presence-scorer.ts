import {VoicePresenceScore} from "../speaker-score/voice-presence-score";
import {SpeakerScorer} from "./speaker-scorer";

export class VoicePresenceScorer extends SpeakerScorer {
    public getSpeakerScore(userId: string): VoicePresenceScore {
        const memberPresenceTime = this.connectionsRecord.getMemberRelevantInterventionTime(userId);
        const totalSpeakerTime = this.voiceInterventionsRecord.getMemberRelevantInterventionTime(userId);
        return new VoicePresenceScore( totalSpeakerTime / memberPresenceTime);
    }

    public getScoreModeName(): string {
        return "voice presence";
    }
}
