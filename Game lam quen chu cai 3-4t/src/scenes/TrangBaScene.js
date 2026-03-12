import Phaser from "phaser"
import enableDevTools from "../dev/DevTool"
import { game, voice, configureSdkContext } from "@iruka-edu/mini-game-sdk"
import { sdk } from "../main.ts"
import { startRecording } from "../voice/recorder"

export default class TrangBaScene extends Phaser.Scene {

    constructor() {
        super("TrangBaScene")
    }

    preload() {

        this.load.image("bg3", "/assets/bg3_main.jpg")
        this.load.image("replay", "/assets/replay.png")
        this.load.image("mic", "/assets/mic.png")
        this.load.image("speaker", "/assets/speaker.png")
        this.load.image("panel3", "/assets/panel3_ui.png")

        this.load.audio("intro_audio2", "/assets/audio/cungcogoiten2.mp3")
        this.load.audio("success_audio", "/assets/audio/totlam.mp3")
        this.load.audio("fail_audio", "/assets/audio/lamlainhe.mp3")


    }

    create() {

        enableDevTools(this)


        /* ================= SDK INIT ================= */

        this.score = 0
        this.currentLevelIndex = 0

        configureSdkContext({
            fallback: {
                gameId: "local-game-001",
                lessonId: "local-lesson-001",
                gameVersion: "0.0.0"
            }
        })

        game.setTotal(1)

        window.irukaGameState = {
            startTime: Date.now(),
            currentScore: 0
        }

        sdk.score(0, 0)

        sdk.progress({
            levelIndex: 0,
            total: 1
        })

        /* ================= BACKGROUND ================= */

        const screenWidth = this.scale.width
        const screenHeight = this.scale.height

        const bg = this.add.image(screenWidth / 2, screenHeight / 2, "bg3")

        const scale = Math.max(
            screenWidth / bg.width,
            screenHeight / bg.height
        )

        bg.setScale(scale)

        /* ================= PANEL SCALE (GIỮ NGUYÊN LOGIC GỐC) ================= */

        const DESIGN_WIDTH = 1920
        const DESIGN_HEIGHT = 1080

        const uiScale = Math.min(
            screenWidth / DESIGN_WIDTH,
            screenHeight / DESIGN_HEIGHT
        ) * 0.69

        const ui = this.add.container(screenWidth / 2, -500)

        ui.setScale(uiScale)

        /* ================= PANEL ================= */

        const panel = this.add.image(0, 0, "panel3")
        ui.add(panel)

        /* ================= SPEAKER ================= */

        const speaker = this.add.image(807, 549, "speaker")
        speaker.setInteractive()

        ui.add(speaker)

        const expectedText = "Cái ô"

        speaker.on("pointerdown", () => {

            try {
                if (this.sound && this.cache.audio.exists("intro_audio2")) {
                    
                    this.sound.removeByKey("intro_audio2");

                    const s = this.sound.add("intro_audio2")
                    s.play()
                    return
                }
            } catch (e) { }

            window.speechSynthesis.cancel()

            const speech = new SpeechSynthesisUtterance(expectedText)

            speech.lang = "vi-VN"
            speech.rate = 0.85
            speech.pitch = 1

            window.speechSynthesis.speak(speech)

        })

        /* ================= MIC ================= */

        const mic = this.add.image(2, 551, "mic")

        mic.setScale(1.01)
        mic.setInteractive()

        ui.add(mic)

        /* ================= REPLAY ================= */

        const replay = this.add.image(834, -693, "replay")
        replay.setInteractive()

        ui.add(replay)

        /* ================= FEEDBACK TEXT ================= */

        const feedbackText = this.add.text(
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

        feedbackText.setOrigin(0.5, 0.5)
        feedbackText.setAlpha(0)

        ui.add(feedbackText)

        /* ================= PANEL DROP ANIMATION ================= */

        this.tweens.add({
            targets: ui,
            y: screenHeight / 2,
            duration: 900,
            ease: "Bounce.easeOut",
            onComplete: () => {

                // Tự động phát âm thanh khi vào màn hình
                if (this.sound && this.cache.audio.exists("intro_audio2")) {
                    this.sound.play("intro_audio2")
                }

            }
        })

        game.startQuestionTimer()

        /* ================= VOICE ================= */

        this.sessionId = null
        this.index = 0
        this.isRecording = false
        this._recHandle = null

        const PASS_SCORE = window.VOICE_PASS_SCORE || 65

        async function startSession() {

            const resp = await voice.StartSession({
                testmode: true
            })

            this.sessionId = resp.sessionId
            this.index = resp.index || 0

            console.log("VOICE SESSION", resp)

        }

        startSession.call(this)

        /* ================= STOP AND SUBMIT RECORD ================= */

        const stopAndSubmit = async () => {
            if (!this.isRecording) return;
            
            if (this.recordTimeout) {
                clearTimeout(this.recordTimeout);
                this.recordTimeout = null;
            }

            mic.clearTint()

            this.isRecording = false

            const { blob, durationMs } = await this._recHandle.stop()

            const audioFile = new File([blob], "answer.webm", { type: blob.type || "audio/webm" })

            try {

                const submitResp = await voice.Submit({

                    audioFile: audioFile,
                    questionIndex: this.index + 1,
                    targetText: { text: "Cái ô" },
                    durationMs: durationMs,
                    exerciseType: "NURSERY_RHYME",
                    testmode: true

                })

                console.log("VOICE RESULT", submitResp)

                let score = submitResp.score ?? submitResp?.result?.score ?? 0

                console.log("SCORE =", score)

                if (score >= PASS_SCORE) {

                    this.score += 1

                    game.recordCorrect({ scoreDelta: 1 })

                    feedbackText.setText("Tốt lắm!")
                    feedbackText.setAlpha(1)

                    this.sound.play("success_audio")

                    this.time.delayedCall(500, () => {

                        this.cameras.main.fadeOut(350, 0, 0, 0)

                        this.cameras.main.once("camerafadeoutcomplete", () => {
                            this.scene.start("CongratsScene", {
                                nextScene: "TraceTrangBa"
                            })
                        })

                    })

                }


                /* ================= FAIL ================= */

                else {

                    game.recordWrong()

                    feedbackText.setText("Thử lại nhé!")
                    
                    this.sound.play("fail_audio")

                }

            } catch (err) {

                console.error("submit error", err)

            }

        }

        /* ================= MIC CLICK ================= */

        mic.on("pointerdown", async () => {

            if (!this.isRecording) {

                try {

                    this._recHandle = await startRecording()

                    this.isRecording = true

                    mic.setTint(0xff0000)
                    
                    this.recordTimeout = setTimeout(() => {
                        stopAndSubmit();
                    }, 5000);

                } catch (e) {
                    console.error("Recording error", e)
                }

                return
            }

            stopAndSubmit()

        })

        /* ================= REPLAY ================= */

        replay.on("pointerdown", () => {

            game.retryFromStart()

            this.scene.restart()

        })

    }

}