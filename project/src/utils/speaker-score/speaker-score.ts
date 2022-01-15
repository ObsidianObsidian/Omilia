export abstract class SpeakerScore {
    protected readonly scoreVal: number;

    constructor(scoreVal: number) {
        this.scoreVal = scoreVal;
    }

    public valueOf(): number {
        return this.scoreVal;
    }

    public abstract toString(): string;
}
