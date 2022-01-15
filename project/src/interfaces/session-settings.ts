import {Observable, Subject} from "rxjs";
import {getDefaultSessionSettings} from "../constants/session-constants";
import {OmiliaDuration} from "../utils/omilia-duration";
import {SpeakerScorer} from "../utils/speaker-scorer/speaker-scorer";
import {SessionSettingsDifferences} from "./session-settings-differences";

// tslint:disable-next-line:interface-name
export class SessionSettings implements SessionSettingsDifferences {

    public set speakerScorer(speakerScorer) {
        const scorerChanged = speakerScorer !== this._speakerScorer;
        this._speakerScorer = speakerScorer;
        if (scorerChanged) {
            this.scorerChangeSubject.next();
        }
    }

    public get speakerScorer() {
        return this._speakerScorer;
    }

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

    private constructor() {
    }

    public update(newSettings: SessionSettingsDifferences): void {
        this.refreshDelay = this.getNewAttribute(this.refreshDelay, newSettings.refreshDelay);
        this.speakerScorer = this.getNewAttribute(this.speakerScorer, newSettings.speakerScorer);
        this.timeWindowDuration = this.getNewAttribute(this.timeWindowDuration, newSettings.timeWindowDuration);
    }

    public getScorerChangeObservable(): Observable<void> {
        return this.scorerChangeSubject.asObservable();
    }

    private getNewAttribute<T>(backupVal: T, newVal: T | null): T {
        return newVal ? newVal : backupVal;
    }
}
