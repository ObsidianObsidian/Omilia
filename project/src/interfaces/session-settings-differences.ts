import {OmiliaDuration} from "../utils/omilia-duration";
import {SpeakerScorer} from "../utils/speaker-scorer/speaker-scorer";

// tslint:disable-next-line:interface-name
export interface SessionSettingsDifferences {
    timeWindowDuration?: OmiliaDuration | null; // time (ms) before forgetting
    refreshDelay?: OmiliaDuration; // time (ms) before refreshing session / speaker board message(s)
    speakerScorer?: SpeakerScorer;
}
