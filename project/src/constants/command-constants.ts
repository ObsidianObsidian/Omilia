import {TotalTimeScorer} from "../utils/speaker-scorer/total-time-scorer";
import {VoicePresenceScorer} from "../utils/speaker-scorer/voice-presence-scorer";

export const COMMAND_PREFIX = "-o";

// Available commands
export const HELP_CMD = "help";
export const START_MONITORING_CMD = "start";
export const EDIT_SETTINGS_CMD = "edit";
export const STOP_CMD = "stop";
export const LEAVE_CMD = "leave";
export const DETAILS_CMD = "info";
export const AVAILABLE_COMMANDS = new Set([
    HELP_CMD,
    START_MONITORING_CMD,
    EDIT_SETTINGS_CMD,
    STOP_CMD,
    LEAVE_CMD,
    DETAILS_CMD,
]);

// Available args
export const TIME_WINDOW_DURATION_ARG = "--timewindow";
export const STATUS_MESSAGE_REFRESH_DELAY_ARG = "--refreshdelay";
export const SCORING_MODE_ARG = "--mode";

export const AVAILABLE_COMMAND_ARGS = new Map<string, string[]>([
    [START_MONITORING_CMD, [TIME_WINDOW_DURATION_ARG, STATUS_MESSAGE_REFRESH_DELAY_ARG, SCORING_MODE_ARG]],
]);
AVAILABLE_COMMAND_ARGS.set(EDIT_SETTINGS_CMD, AVAILABLE_COMMAND_ARGS.get(START_MONITORING_CMD));

// Available arg values
export const TOTAL_TIME_SCORE_OPT = "time";
export const VOICE_PRESENCE_SCORE_OPT = "presence";

export const OPT_TO_SCORING_MODE = new Map<string, typeof TotalTimeScorer| typeof VoicePresenceScorer>([
    [TOTAL_TIME_SCORE_OPT, TotalTimeScorer],
    [VOICE_PRESENCE_SCORE_OPT, VoicePresenceScorer],
]);

export const SCORING_MODE_TO_OPT = new Map<typeof TotalTimeScorer| typeof VoicePresenceScorer, string>
(Array.from(OPT_TO_SCORING_MODE.keys()).map((arg) => [OPT_TO_SCORING_MODE.get(arg), arg]));
