import {Collection, GuildMember, Message, Snowflake, VoiceChannel} from "discord.js";

// tslint:disable-next-line:no-var-requires
const {joinVoiceChannel} = require("@discordjs/voice");
import {VoiceConnection} from "@discordjs/voice";
import {Subject, timer} from "rxjs";
import {Observable, Subscription} from "rxjs/dist/types";
import {
    HIDE_NAME_ON_SPEAKERBOARD_EMOJI,
    PAUSE_COUNTS_EMOJI,
    REQUEST_TO_SPEAK_EMOJI,
} from "../constants/interaction-constants";
import {InactivityTimeoutError, notifyOmiliaError, NotInVoiceChannelError} from "../constants/omilia-error";
import {SessionSettings} from "../interfaces/session-settings";
import {Formatter} from "./formatter";
import {VoiceTracker} from "./voice-tracker";

export class OmiliaSession {

    public get settings(): SessionSettings {
        return this.voiceTracker.settings;
    }

    private get humanVoiceChannelMembers(): Collection<Snowflake, GuildMember> {
        return this.voiceChannel.members.filter((member) => !member.user.bot);
    }
    private activationMessage: Message;
    private statusMessages: Message[] = [];

    private voiceConnection: VoiceConnection | null;
    private voiceChannel: VoiceChannel | null;
    private voiceTracker: VoiceTracker | null;

    private refreshMessageSubscription: Subscription | null;
    private inactivityTimeoutSubscription: Subscription | null;
    private candidateSpeakers = new Set<string>();
    private hiddenSpeakers = new Set<string>();

    private endSubject = new Subject<void>();

    constructor(activationMessage: Message) {
        this.activationMessage = activationMessage;
    }

    public getCandidateSpeakersInChannel(): Set<string> {
        const speakersInChannel = Array.from(this.humanVoiceChannelMembers.keys())
            .filter((channelMember) => this.candidateSpeakers.has(channelMember));
        return new Set<string>(speakersInChannel);
    }

    public getEndObservable(): Observable<void> {
        return this.endSubject.asObservable();
    }

    public async start(settings: SessionSettings) {
        try {
            this.voiceChannel = await this.joinUserChannel();
        } catch (e) {
            notifyOmiliaError(e, this.activationMessage.channel);
        }
        this.voiceTracker = new VoiceTracker(this.voiceConnection, settings);
        this.inactivityTimeoutSubscription = this.voiceTracker.getInactivityTimeoutObservable().subscribe(() => {
            notifyOmiliaError(new InactivityTimeoutError(), this.activationMessage.channel);
            this.end();
        });
        await this.setup();
    }

    public end() {
        if (this.voiceConnection) {
            this.voiceConnection.destroy();
        }
        this.refreshMessageSubscription.unsubscribe();
        this.inactivityTimeoutSubscription.unsubscribe();
        this.voiceTracker.end();
        this.endSubject.next();
    }

    public setCandidateSpeakers(candidateSpeakers: string[]): void {
        this.candidateSpeakers = new Set<string>(candidateSpeakers);
    }

    public setHiddenSpeakers(hiddenSpeakers: string[]): void {
        this.hiddenSpeakers = new Set<string>(hiddenSpeakers);
    }

    public onPrivilegedSpeakersChange(privilegedSpeakers: string[]): void {
        this.voiceTracker.setPrivilegedSpeakers(privilegedSpeakers);
    }

    public getStatusMessagesIds(): string[] {
        return this.statusMessages.map((msg) => msg.id);
    }

    public getGuildMemberFromId(userId: string): GuildMember | null {
        return this.voiceChannel.members.get(userId);
    }

    public getGuildId(): string {
        return this.activationMessage.guildId;
    }

    public getSortedCandidateSpeakerTimes(): Array<[string, number]> {
        return this.getSortedSpeakerTimes().filter(([userId, _]) => this.getCandidateSpeakersInChannel().has(userId));
    }

    public getSortedVisibleSpeakerTimes(): Array<[string, number]> {
        return this.getSortedSpeakerTimes().filter(([userId, _]) => !this.hiddenSpeakers.has(userId));
    }

    public getSortedSpeakerTimes(): Array<[string, number]> {
        const speakerTimes: Array<[string, number]> = Array.from(this.humanVoiceChannelMembers.keys())
            .map((candidateSpeakerId) =>
                [candidateSpeakerId, this.voiceTracker.getUserRelevantSpeakTime(candidateSpeakerId)]);
        return speakerTimes.sort(([_, aTime], [__, bTime]) => aTime - bTime);
    }

    private async setup(): Promise<void> {
        // @ts-ignore
        await this.activationMessage.channel.send(Formatter.getSessionStatusMessage(this))
            .then((message: Message) => {
                this.registerStatusMessage(message);
            });
        this.refreshMessageSubscription = timer(0, this.settings.refreshDelay).subscribe(() => {
            const newStatusMessage = Formatter.getSessionStatusMessage(this);
            this.statusMessages.forEach((statusMessage) => {
                statusMessage.edit(newStatusMessage);
            });
        });
    }

    private registerStatusMessage(message: Message): void {
        this.statusMessages.push(message);
        message.react(REQUEST_TO_SPEAK_EMOJI);
        message.react(HIDE_NAME_ON_SPEAKERBOARD_EMOJI);
        message.react(PAUSE_COUNTS_EMOJI);
    }

    private async joinUserChannel(): Promise<VoiceChannel | null> {
        const channels = await this.activationMessage.guild.channels.fetch();
        const userChannel: VoiceChannel = channels.find((channel) =>
            channel.isVoice() && channel.members.has(this.activationMessage.author.id)) as VoiceChannel;

        if (userChannel) {
            this.voiceConnection = joinVoiceChannel({
                adapterCreator: this.activationMessage.guild.voiceAdapterCreator,
                channelId: userChannel.id,
                guildId: this.activationMessage.guildId,
            });
        } else {
            throw new NotInVoiceChannelError();
        }
        return userChannel;
    }
}
