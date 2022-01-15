// Session time thresholds
// Minimum time required for a user intervention to be accounted for (a debounce of sorts)
import {SessionSettings} from "../interfaces/session-settings";
import {OmiliaDuration} from "../utils/omilia-duration";
import {VoicePresenceScorer} from "../utils/speaker-scorer/voice-presence-scorer";

export const MINIMUM_SPEAK_TIME_THRESHOLD = 500;
export const MAXIMUM_INACTIVITY_THRESHOLD = 15 * 60 * 1000;

// Session settings
export const DEFAULT_SESSION_REFRESH_DELAY = 5000;
export const MINIMUM_REFRESH_DELAY = 5000;
export const DEFAULT_SCORER_TYPE = VoicePresenceScorer;

export function getDefaultSessionSettings(): SessionSettings {
    return {refreshDelay: new OmiliaDuration(DEFAULT_SESSION_REFRESH_DELAY), speakerScorer: new DEFAULT_SCORER_TYPE()};
}
