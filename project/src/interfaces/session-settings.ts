import {OmiliaDuration} from "../utils/omilia-duration";

// tslint:disable-next-line:interface-name
export interface SessionSettings {
    timeWindowDuration?: OmiliaDuration | null; // time (ms) before forgetting
    refreshDelay: OmiliaDuration; // time (ms) before refreshing session/speakerboard message(s)
}
