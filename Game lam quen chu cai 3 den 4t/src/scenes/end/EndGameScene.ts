import { SceneKeys } from '../../consts/Keys';
import { hideGameButtons, sdk, game } from '../../main';
import { phaser } from '@iruka-edu/mini-game-sdk';
import AudioManager from '../../audio/AudioManager';

const { createEndGameScene } = phaser;

export default createEndGameScene({
    sceneKey: SceneKeys.EndGame,
    assets: {
        banner: {
            key: 'banner_congrat',
            url: 'assets/images/bg/banner_congrat.png',
        },
        icon: { key: 'icon', url: 'assets/images/ui/icon_end.png' },
        replayBtn: { key: 'btn_reset', url: 'assets/images/ui/btn_reset.png' },
        exitBtn: { key: 'btn_exit', url: 'assets/images/ui/btn_exit.png' },
    },
    audio: {
        play: (k: string) => AudioManager.play(k),
        stopAll: () => AudioManager.stopAll(),
    },
    sounds: {
        enter: 'complete',
        fireworks: 'fireworks',
        applause: 'applause',
        click: 'sfx-click',
    },
    replaySceneKey: SceneKeys.SpeakScene,
    onEnter: () => {
        hideGameButtons();
        // Prepare BGM for next play if needed
        if (!AudioManager.isPlaying('bgm-nen')) {
            AudioManager.play('bgm-nen');
        }
    },
    reportComplete: (payload) => {
        sdk.complete(payload);
    },
});
