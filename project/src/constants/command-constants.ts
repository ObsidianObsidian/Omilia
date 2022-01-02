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

export const AVAILABLE_COMMAND_ARGS = new Map<string, string[]>();
AVAILABLE_COMMAND_ARGS.set(START_MONITORING_CMD, [TIME_WINDOW_DURATION, STATUS_MESSAGE_REFRESH_DELAY]);
