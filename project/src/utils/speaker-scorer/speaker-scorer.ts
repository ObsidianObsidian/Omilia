import {ARG_TO_SCORING_MODE} from "../../constants/command-constants";
import {InvalidScorerOptionError} from "../../constants/omilia-errors";
import {InterventionsRecord} from "../InterventionsRecord";
import {SpeakerScore} from "../speaker-score/speaker-score";

export abstract class SpeakerScorer {

    public static fromArgString(argString: string): SpeakerScorer {
        if (!ARG_TO_SCORING_MODE.has(argString)) {
            throw new InvalidScorerOptionError(argString);
        }
        const scorerType = ARG_TO_SCORING_MODE.get(argString);
        return new scorerType();
    }
    protected connectionsRecord: InterventionsRecord | null;
    protected voiceInterventionsRecord: InterventionsRecord | null;

    public init(connectionsRecord: InterventionsRecord, voiceInterventionsRecord: InterventionsRecord) {
        this.connectionsRecord = connectionsRecord;
        this.voiceInterventionsRecord = voiceInterventionsRecord;
    }

    public abstract getSpeakerScore(userId: string): SpeakerScore;

    public abstract getScoreModeName(): string;

}
