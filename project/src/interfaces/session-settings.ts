import {Observable, Subject} from "rxjs";
import {getDefaultSessionSettings} from "../constants/session-constants";
import {OmiliaDuration} from "../utils/omilia-duration";
import {SpeakerScorer} from "../utils/speaker-scorer/speaker-scorer";
import {SessionSettingsDifferences} from "./session-settings-differences";

// tslint:disable-next-line:interface-name
export class SessionSettings implements SessionSettingsDifferences {

    public static fromSessionSettingsDifference(settingsDifferences: SessionSettingsDifferences): SessionSettings {
        const settings = SessionSettings.defaultSessionSettings();
        settings.update(settingsDifferences);
        return settings;
    }

    public static defaultSessionSettings(): SessionSettings {
        const settings = new SessionSettings();
        settings.update(getDefaultSessionSettings());
        return settings;
    }

    public refreshDelay: OmiliaDuration;
    public timeWindowDuration?: OmiliaDuration | null;
    // tslint:disable-next-line:variable-name
    private _speakerScorer: SpeakerScorer;

    private scorerChangeSubject = new Subject<void>();

    private constructor() {}

    public update(newSettings: SessionSettingsDifferences): void {
        this.refreshDelay = newSettings.refreshDelay ? newSettings.refreshDelay : this.refreshDelay;
        this.speakerScorer = newSettings.speakerScorer ? newSettings.speakerScorer : this.speakerScorer;
        this.timeWindowDuration = newSettings.timeWindowDuration ?
            newSettings.timeWindowDuration : this.timeWindowDuration;
    }

    public set speakerScorer(speakerScorer) {
        this._speakerScorer = speakerScorer;
        this.scorerChangeSubject.next();
    }

    public getScorerChangeObservable(): Observable<void> {
        return this.scorerChangeSubject.asObservable();
    }
}
