import Phaser from "phaser";
import { sdk } from "../main";
import { game, configureSdkContext } from "@iruka-edu/mini-game-sdk";
import AudioManager from "../audio/AudioManager";
import { SceneKeys } from "../consts/Keys";


export class SceneBase extends Phaser.Scene {
    protected score: number = 0;
    protected currentLevelIndex: number = 0;
    protected uiContainer!: Phaser.GameObjects.Container;
    protected uiScale: number = 1;

    constructor(key: SceneKeys | string) {
        super(key);
    }

    create() {
        // Dev logic hook placeholder, you might want to wire your e2e/dev tools here.
    }

    protected initSdk(levelTotal: number = 1) {
        this.score = 0;
        this.currentLevelIndex = 0;

        // Setup irukaGameState as per docs/TichHopSDK.md
        (window as any).irukaGameState = {
            startTime: Date.now(),
            currentScore: 0
        };

        // Standard SDK calls
        game.setTotal(levelTotal);
        sdk.score(0, 0);
        sdk.progress({
            levelIndex: 0,
            total: levelTotal
        });
    }

    protected recordPass(passScoreDelta: number = 1) {
        this.score += passScoreDelta;
        
        // Standard score recording as per docs/TichHopSDK.md
        game.recordCorrect({ scoreDelta: passScoreDelta });
        
        if ((window as any).irukaGameState) {
            (window as any).irukaGameState.currentScore = this.score;
        }

        sdk.score(this.score, passScoreDelta);
        sdk.progress({
            levelIndex: this.currentLevelIndex,
            score: this.score,
            total: (this as any).levels?.length // Fallback if info exists
        });
        
        game.finishQuestionTimer();
    }

    protected recordFail() {
        game.recordWrong();
    }

    protected finalizeSdkAttempt() {
        game.finalizeAttempt();
        sdk.complete({
            timeMs: Date.now() - ((window as any).irukaGameState?.startTime ?? Date.now()),
            extras: { 
                reason: "hub_quit", // Standardizing extra keys
                stats: game.prepareSubmitData() 
            }
        });
    }

    // A helpful helper for Hub State if required
    public applyHubState(payload: any) {
        console.log("Received Hub State: ", payload);
    }
}
