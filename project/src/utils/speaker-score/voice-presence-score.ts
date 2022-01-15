import {SpeakerScore} from "./speaker-score";

export class VoicePresenceScore extends SpeakerScore {
    public toString(): string {
        const asPercentageNb = Math.round(this.valueOf() * 100);
        return `${asPercentageNb}%`;
    }

}
