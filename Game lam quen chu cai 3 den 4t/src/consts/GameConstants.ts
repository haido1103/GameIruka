export const GameConstants = {
    DESIGN_WIDTH: 1920,
    DESIGN_HEIGHT: 1080,
    // Base layout calculation from old IntroScene
    getUiScale: (screenWidth: number, screenHeight: number) => {
        return Math.min(
            screenWidth / 1920,
            screenHeight / 1080
        ) * 0.69;
    },
    VOICE_RECORDING: {
        PASS_SCORE: 65,
        MAX_RECORD_TIME_MS: 5000,
        TEST_MODE: false,
        CALIBRATION_DURATION: 1000,
        NOISE_MARGIN: 5,
        MAX_DURATION: 4000,
        SILENCE_TIMEOUT: 1500
    },
    ENDGAME: {
        ANIM: {
            FIREWORKS_DELAY: 500,
            ICON_FLOAT: 2000,
            ICON_SHAKE: 150
        },
        UI: {
            BANNER_OFFSET: 0.25,
            ICON_OFFSET: 100,
            BTN_SPACING: 250,
            BTN_OFFSET: 0.3
        },
        CONFETTI: {
            DELAY: 150,
            MIN_DUR: 3000,
            MAX_DUR: 5000
        }
    },
    MASCOT_ANIMATIONS: {
        X: 0.85,
        Y: 0.75,
        SCALE: 1,
        FRAME_DURATION: 100,
        REPEAT: -1,
        IDLE: {
            SPRITE_SHEET: { KEY: 'mascot_idle', PATH: 'assets/animation/trang_thai_dung_yen.png', FRAME_WIDTH: 300, FRAME_HEIGHT: 300, START_FRAME: 0, END_FRAME: 10 }
        },
        RECORDING: {
            SPRITE_SHEET: { KEY: 'mascot_recording', PATH: 'assets/animation/spritesheet_trang_thai_1.png', FRAME_WIDTH: 300, FRAME_HEIGHT: 300, START_FRAME: 0, END_FRAME: 10 }
        },
        PROCESSING: {
            SPRITE_SHEET: { KEY: 'mascot_processing', PATH: 'assets/animation/trang_thai_2.png', FRAME_WIDTH: 300, FRAME_HEIGHT: 300, START_FRAME: 0, END_FRAME: 10 }
        },
        RESULT_HAPPY: {
            SPRITE_SHEET: { KEY: 'mascot_result_happy', PATH: 'assets/animation/trang_thai_3_-_vui_ve.png', FRAME_WIDTH: 300, FRAME_HEIGHT: 300, START_FRAME: 0, END_FRAME: 10 }
        },
        RESULT_SAD: {
            SPRITE_SHEET: { KEY: 'mascot_result_sad', PATH: 'assets/animation/trang_thai_3_-_that_vong.png', FRAME_WIDTH: 300, FRAME_HEIGHT: 300, START_FRAME: 0, END_FRAME: 10 }
        }
    }
}
