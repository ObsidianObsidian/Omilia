import {InterventionsRecord} from "../InterventionsRecord";
import {SpeakerScore} from "../speaker-score/speaker-score";

export abstract class SpeakerScorer {
    protected connectionsRecord: InterventionsRecord;
    protected voiceInterventionsRecord: InterventionsRecord;

    constructor(connectionsRecord: InterventionsRecord, voiceInterventionsRecord: InterventionsRecord) {
        this.connectionsRecord = connectionsRecord;
        this.voiceInterventionsRecord = voiceInterventionsRecord;
    }

    public abstract getSpeakerScore(userId: string): SpeakerScore;

}
