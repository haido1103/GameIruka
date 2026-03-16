import Phaser from "phaser";
import { SceneBase } from "../SceneBase";
import { showGameButtons } from "../../main";
import AudioManager from "../../audio/AudioManager";
import { VoiceHandler } from "../../utils/VoiceHandler";
import { AnimationFactory } from "../../utils/AnimationFactory";
import { GameConstants } from "../../consts/GameConstants";
import { SceneKeys, TextureKeys, AudioKeys } from "../../consts/Keys";
import { voice } from "@iruka-edu/mini-game-sdk";

export interface SpeakSceneConfig {
    panelKey: string;
    expectedText: string;
    introAudioKey?: string;
    failAudioKey?: string;
    nextSceneKey: SceneKeys;
}

export class SpeakScene extends SceneBase {

    private config!: SpeakSceneConfig;
    private voiceHandler!: VoiceHandler;

    private micBtn!: Phaser.GameObjects.Image;
    private speakerBtn!: Phaser.GameObjects.Image;
    private feedbackText!: Phaser.GameObjects.Text;

    private isRecording: boolean = false;
    private autoStopTimer: Phaser.Time.TimerEvent | null = null;
    private micPulseTween: Phaser.Tweens.Tween | null = null;

    private handHint!: Phaser.GameObjects.Image;
    private handTween: Phaser.Tweens.Tween | null = null;

    constructor() {
        super("SpeakScene");
    }

    init(data: SpeakSceneConfig) {
        this.config = data;

        if (!this.config || !this.config.expectedText) {
            this.config = {
                panelKey: TextureKeys.Message,
                expectedText: "O",
                introAudioKey: '',
                failAudioKey: 'sfx-wrong',
                nextSceneKey: SceneKeys.EndGame
            };
        }
    }

    async create() {
        super.create();
        this.initSdk(1);

        // START VOICE SESSION
        try {
            await voice.StartSession({ testmode: true });
        } catch (e) {
            console.error("Voice StartSession error", e);
        }

        const audioManager = AudioManager;
        audioManager.ensureContextRunning();
        
        // Thử phát âm thanh ngay lập tức
        this.playStartAudio();
        
        showGameButtons();

        this.voiceHandler = new VoiceHandler({
            onStateChange: (state) => {

                if (state === 'recording' || state === 'calibrating') {

                    this.isRecording = true;
                    this.micBtn.setTint(0xff0000);
                    AudioManager.pauseSound('bgm-nen');

                    if (state === 'recording') {
                        this.startAutoStopTimer();
                        this.startMicPulsing();
                    }

                } else if (state === 'processing') {

                    this.isRecording = false;
                    this.micBtn.clearTint();
                    this.stopAutoStopTimer();
                    this.stopMicPulsing();


                    this.feedbackText.setAlpha(1);

                    AudioManager.resumeSound('bgm-nen');

                } else {

                    this.isRecording = false;
                    this.micBtn.clearTint();
                    this.stopAutoStopTimer();
                    this.stopMicPulsing();

                    AudioManager.resumeSound('bgm-nen');
                }
            },

            onComplete: async (blob) => {
                await this.submitRecord(blob);
            },

            onError: (err) => {
                console.error(err);
                this.handleFail();
            }
        });

        this.buildUI();
    }

    private buildUI() {

        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        const uiScale = GameConstants.getUiScale(screenWidth, screenHeight);

        this.uiContainer = this.add.container(screenWidth / 2, -500);
        this.uiContainer.setScale(uiScale);

        const panel = this.add.image(0, 0, this.config.panelKey);
        this.uiContainer.add(panel);

        if (this.textures.exists(TextureKeys.S1_Board)) {
            const board = this.add.image(0, 100, TextureKeys.S1_Board);
            this.uiContainer.add(board);
        }

        if (this.textures.exists(TextureKeys.Message)) {
            const message = this.add.image(639, -264, TextureKeys.Message);
            this.uiContainer.add(message);
        }

        if (this.textures.exists(TextureKeys.Dog)) {
            const dog = this.add.image(-30, 84, TextureKeys.Dog);
            this.uiContainer.add(dog);
        }

        if (this.textures.exists(TextureKeys.TextDog)) {
            const textDog = this.add.image(-431, -310, TextureKeys.TextDog);
            this.uiContainer.add(textDog);
        }

        if (this.textures.exists(TextureKeys.Speak_Banner)) {
            const banner = this.add.image(0, -670, TextureKeys.Speak_Banner);
            this.uiContainer.add(banner);
        }

        this.speakerBtn = this.add.image(807, 549, TextureKeys.Speak_Speaker).setInteractive();
        this.uiContainer.add(this.speakerBtn);
        this.speakerBtn.on("pointerdown", () => {
            this.hideHandHint();
            AudioManager.stop('cungcogoiten');
            AudioManager.play('cungcogoiten');

            // Sau khi nghe xong từ loa, chỉ tay vào Mic
            AudioManager.onceEnd('cungcogoiten', () => {
                this.showHandHint(this.micBtn);
            });
        });

        this.micBtn = this.add.image(2, 551, TextureKeys.Speak_Micro)
            .setScale(1.01)
            .setInteractive();

        this.uiContainer.add(this.micBtn);

        this.micBtn.on("pointerdown", () => {

            this.hideHandHint();
            this.add.tween({
                targets: this.micBtn,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 50,
                yoyo: true
            });

            this.toggleRecording();
        });

        // Khởi tạo bàn tay chỉ dẫn (sử dụng AnimationFactory)
        this.handHint = AnimationFactory.createHandHint(this, TextureKeys.HandHint);
        this.uiContainer.add(this.handHint);

        this.feedbackText = this.add.text(
            0,
            panel.displayHeight / 2 + 40,
            "",
            {
                fontFamily: "Arial",
                fontSize: `${48 * uiScale}px`,
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 6
            }
        )
            .setOrigin(0.5, 0.5)
            .setAlpha(0);

        this.uiContainer.add(this.feedbackText);

        this.tweens.add({
            targets: this.uiContainer,
            y: screenHeight / 2,
            duration: 900,
            ease: "Bounce.easeOut",
            onComplete: () => {
                // Intro audio now handled by playStartAudio() which plays 'cungcogoiten'
            }
        });
    }

    private playStartAudio() {
        if (!AudioManager.isLoaded) return;

        // Nếu audio đã được unlock (đã có tương tác trước đó)
        if (AudioManager.isUnlocked) {
            AudioManager.stop('cungcogoiten');
            AudioManager.play('cungcogoiten');

            // Sau khi phát xong âm thanh mở đầu, chỉ tay vào Mic
            AudioManager.onceEnd('cungcogoiten', () => {
                this.showHandHint(this.micBtn);
            });
        } else {
            // Nếu chưa unlock, đợi tương tác đầu tiên
            const unlockAndPlay = () => {
                AudioManager.stop('cungcogoiten');
                AudioManager.play('cungcogoiten');

                // Sau khi phát xong âm thanh mở đầu, chỉ tay vào Mic
                AudioManager.onceEnd('cungcogoiten', () => {
                    this.showHandHint(this.micBtn);
                });
                
                this.input.off('pointerdown', unlockAndPlay);
                window.removeEventListener('click', unlockAndPlay);
            };

            this.input.once('pointerdown', unlockAndPlay);
            window.addEventListener('click', unlockAndPlay, { once: true });
        }
    }

    private async toggleRecording() {

        if (!this.voiceHandler) return;

        await this.voiceHandler.toggle();
    }

    private async submitRecord(blob: Blob) {

        try {

            const response = await voice.Submit({
                audioFile: blob,
                questionIndex: 1,
                targetText: {
                    text: this.config.expectedText
                },
                durationMs: 5000,
                exerciseType: voice.ExerciseType.NURSERY_RHYME,
                testmode: true
            });

            const score = response?.score || 0;

            if (score >= GameConstants.VOICE_RECORDING.PASS_SCORE) {
                this.handlePass();
            } else {
                this.handleFail();
            }

        } catch (e) {

            console.error("Voice eval error", e);
            this.handleFail();
        }
    }

    private async handlePass() {

        this.recordPass(1);


        this.feedbackText.setAlpha(1);

        AudioManager.play('sfx-correct');

        AudioManager.onceEnd('sfx-correct', async () => {

            try {

                await voice.EndSession({
                    totalQuestionsExpect: 1,
                    isUserAborted: false,
                    testmode: true
                });

            } catch (e) {
                console.error("Voice EndSession error", e);
            }

            this.finalizeSdkAttempt();

            this.cameras.main.fadeOut(350, 0, 0, 0);

            this.cameras.main.once("camerafadeoutcomplete", () => {

                this.scene.start(this.config.nextSceneKey);
            });
        });
    }

    private handleFail() {

        this.recordFail();


        this.feedbackText.setAlpha(1);

        AudioManager.play('sfx-wrong');
        AudioManager.onceEnd('sfx-wrong', () => {
            AudioManager.play('docsai');

            // Sau khi âm thanh "Đọc sai" kết thúc, chỉ tay vào Loa
            AudioManager.onceEnd('docsai', () => {
                this.handTween = AnimationFactory.showHandHint(this, this.handHint, this.speakerBtn);
            });
        });
    }

    private showHandHint(target: any) {
        this.handTween = AnimationFactory.showHandHint(this, this.handHint, target);
    }

    private hideHandHint() {
        AnimationFactory.hideHandHint(this, this.handHint, this.handTween);
        this.handTween = null;
    }

    shutdown() {

        if (this.voiceHandler) {
            this.voiceHandler.destroy();
        }

        this.stopAutoStopTimer();
        this.stopMicPulsing();
    }

    private startAutoStopTimer() {

        this.stopAutoStopTimer();

        this.autoStopTimer = this.time.delayedCall(5000, () => {

            if (this.isRecording && this.voiceHandler) {

                console.log("[SpeakScene] 5s limit reached. Stopping recording.");

                this.voiceHandler.stop();
            }

        });
    }

    private stopAutoStopTimer() {

        if (this.autoStopTimer) {

            this.autoStopTimer.remove();
            this.autoStopTimer = null;
        }
    }

    private startMicPulsing() {

        this.stopMicPulsing();

        this.micPulseTween = this.tweens.add({
            targets: this.micBtn,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private stopMicPulsing() {

        if (this.micPulseTween) {

            this.micPulseTween.stop();
            this.micPulseTween = null;
        }

        this.micBtn.setScale(1.01);
    }
}

