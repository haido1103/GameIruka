// src/scenes/PreloadScene.ts
import Phaser from 'phaser';
import { SceneKeys, TextureKeys, AudioKeys } from '../consts/Keys';
import { GameConstants } from '../consts/GameConstants';
import { AnimationFactory } from '../utils/AnimationFactory';
import AudioManager from '../audio/AudioManager';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Preload);
    }

    preload() {
        // ========================================
        // 1. UI Chung
        // ========================================
        this.load.image(TextureKeys.BtnExit, 'assets/images/ui/btn_exit.png');
        this.load.image(TextureKeys.BtnReset, 'assets/images/ui/btn_reset.png');
        this.load.image(TextureKeys.HandHint, 'assets/images/ui/hand.png');



        // ========================================
        // 2. SpeakScene Assets
        // ========================================
        this.load.image(TextureKeys.Dog, 'assets/images/bg/concho.png');
        this.load.image(TextureKeys.Message, 'assets/images/bg/messageO.png');
        this.load.image(TextureKeys.S1_Board, 'assets/images/bg/board_game.png');
        this.load.image(TextureKeys.TextDog, 'assets/images/bg/textdog.png');
        this.load.image(TextureKeys.Speak_Banner, 'assets/images/bg/banner.png');
        this.load.image(TextureKeys.Speak_Speaker, 'assets/images/ui/speaker.png');
        this.load.image(TextureKeys.Speak_Micro, 'assets/images/ui/mic.png');

        // ========================================
        // 3. Mascot Animations (Sprite Sheets)
        // ========================================
        const MASCOT = GameConstants.MASCOT_ANIMATIONS;
        AnimationFactory.preload(this, { ...MASCOT, ...MASCOT.RECORDING });
        AnimationFactory.preload(this, { ...MASCOT, ...MASCOT.PROCESSING });
        AnimationFactory.preload(this, { ...MASCOT, ...MASCOT.RESULT_HAPPY });
        AnimationFactory.preload(this, { ...MASCOT, ...MASCOT.RESULT_SAD });
        AnimationFactory.preload(this, { ...MASCOT, ...MASCOT.IDLE });


        // ========================================
        // 5. End Game Assets
        // ========================================
        this.load.image(TextureKeys.End_Icon, 'assets/images/ui/icon_end.png');
        this.load.image(TextureKeys.End_BannerCongrat, 'assets/images/bg/banner_congrat.png');




    }

    async create() {
        // Init audio manager
        await AudioManager.loadAll();

        // Start Global BGM - Auto-play Fix
        // 1. Try playing immediately (might be blocked)
        AudioManager.play('bgm-nen');

        // 2. Add interaction listeners as fallback (Unlock audio)
        const tryStartBgm = () => {
            if (!AudioManager.isPlaying('bgm-nen')) {
                AudioManager.play('bgm-nen');
            }
            // Remove listeners once tried
            this.input.off('pointerdown', tryStartBgm);
            window.removeEventListener('click', tryStartBgm);
        };

        this.input.once('pointerdown', tryStartBgm);
        window.addEventListener('click', tryStartBgm, { once: true });

        // SceneKeys.SpeakScene khi lên production
        this.scene.start(SceneKeys.SpeakScene);
    }
}