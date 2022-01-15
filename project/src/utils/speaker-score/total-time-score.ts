import {OmiliaDuration} from "../omilia-duration";
import {SpeakerScore} from "./speaker-score";

export class TotalTimeScore extends SpeakerScore {

    public toString(): string {
        return OmiliaDuration.msTimeToString(this.scoreVal);
    }
}
