import {TotalTimeScorer} from "../utils/speaker-scorer/total-time-scorer";
import {VoicePresenceScorer} from "../utils/speaker-scorer/voice-presence-scorer";

export const COMMAND_PREFIX = "-o";

// Available commands
export const HELP_CMD = "help";
export const START_MONITORING_CMD = "start";
export const STOP_CMD = "stop";
export const LEAVE_CMD = "leave";
export const DETAILS_CMD = "info";
export const AVAILABLE_COMMANDS = new Set([HELP_CMD, START_MONITORING_CMD, STOP_CMD, LEAVE_CMD, DETAILS_CMD]);

// Available args
export const TIME_WINDOW_DURATION = "--timewindow";
export const STATUS_MESSAGE_REFRESH_DELAY = "--refreshdelay";
export const SCORING_MODE = "--mode";

export const AVAILABLE_COMMAND_ARGS = new Map<string, string[]>([
    [START_MONITORING_CMD, [TIME_WINDOW_DURATION, STATUS_MESSAGE_REFRESH_DELAY, SCORING_MODE]],
]);

// Available arg values
export const TOTAL_TIME_SCORE_ARG = "time";
export const VOICE_PRESENCE_SCORE_ARG = "presence";

export const ARG_TO_SCORING_MODE = new Map<string, typeof TotalTimeScorer| typeof VoicePresenceScorer>([
    [TOTAL_TIME_SCORE_ARG, TotalTimeScorer],
    [VOICE_PRESENCE_SCORE_ARG, VoicePresenceScorer],
]);

export const SCORING_MODE_TO_ARG = new Map<typeof TotalTimeScorer| typeof VoicePresenceScorer, string>
(Array.from(ARG_TO_SCORING_MODE.keys()).map((arg) => [ARG_TO_SCORING_MODE.get(arg), arg]));
