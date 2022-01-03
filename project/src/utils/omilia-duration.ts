import {InvalidTimeFormatError} from "../constants/omilia-error";

export class OmiliaDuration {

    public static fromFormattedTimeString(formattedTime: string, alwaysPositive: boolean = false): OmiliaDuration {
        const duration = new OmiliaDuration(OmiliaDuration.getMsTimeFromFormatted(formattedTime));
        if (alwaysPositive && duration.valueOf() === 0) {
            throw new InvalidTimeFormatError(formattedTime);
        }
        return duration;
    }

    private static getMsTimeFromFormatted(formattedTime: string): number {
        const unitStrings: Array<[string, number]> = [["h", 60 * 60 * 1000], ["m", 60 * 1000], ["s", 1000]];
        let totalTime = 0;
        try {
            for (const [unitStr, toMsConstant] of unitStrings) {
                const unitIdx = formattedTime.indexOf(unitStr);
                if (unitIdx === -1) {
                    continue;
                }
                let numStart = unitIdx;
                while (!isNaN(Number(formattedTime[numStart - 1]))) {
                    numStart--;
                }
                totalTime += Number(formattedTime.substring(numStart, unitIdx)) * toMsConstant;
                if (!(numStart < unitIdx)) {
                    throw new Error();
                }
            }
        } catch (e) {
            throw new InvalidTimeFormatError(formattedTime);
        }
        return totalTime;
    }

    private readonly durationMs: number; // duration (milliseconds)

    constructor(durationMs: number) {
        this.durationMs = durationMs;
    }

    public toString(): string {
        const date = new Date(this.durationMs).toISOString().substr(11, 8);
        const timeUnits = date.split(":");
        const unitStrings = ["h", "m", "s"];
        const displayStrings = [];
        timeUnits.forEach((unitStr, idx) => {
            const unit = Number(unitStr);
            if ((unit)) {
                displayStrings.push(`${unit}${unitStrings[idx]}`);
            }
        });
        return displayStrings.join(" ");
    }

    public valueOf(): number {
        return this.durationMs;
    }
}
