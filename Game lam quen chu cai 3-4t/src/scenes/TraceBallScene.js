import Phaser from "phaser"

export default class TraceBallScene extends Phaser.Scene {

    constructor() {
        super("TraceBallScene")
    }

    preload() {

        this.load.image("bg2", "/assets/bg_main.jpg")
        this.load.image("panel2", "/assets/panel2_ui.png")
        this.load.image("ellipse1", "/assets/Ellipse 1.png")
        this.load.image("ellipse2", "/assets/Ellipse 2.png")

        this.load.image("color1", "/assets/Ellipse 3.png")
        this.load.image("color2", "/assets/Ellipse 4.png")
        this.load.image("color3", "/assets/Ellipse 5.png")
        this.load.image("color4", "/assets/Ellipse 6.png")
        this.load.image("color5", "/assets/Ellipse 7.png")
        this.load.image("color6", "/assets/Ellipse 8.png")
        this.load.image("color7", "/assets/Ellipse 9.png")

        this.load.image("eraser", "/assets/eraser.png")
        this.load.image("replay", "/assets/replay.png")
        this.load.audio("traceball_audio", "/assets/audio/trace-ball.mp3")
        this.load.audio("success-color", "/assets/audio/correct_color.mp3")

    }

    create() {


        const screenWidth = this.scale.width
        const screenHeight = this.scale.height

        const bg = this.add.image(screenWidth / 2, screenHeight / 2, "bg2")

        const scale = Math.max(
            screenWidth / bg.width,
            screenHeight / bg.height
        )

        bg.setScale(scale)

        const bgHeight = bg.displayHeight
        const bgTop = bg.y - bgHeight / 2

        /* UI */

        const DESIGN_WIDTH = 1920
        const DESIGN_HEIGHT = 1080

        const uiScale = Math.min(
            screenWidth / DESIGN_WIDTH,
            screenHeight / DESIGN_HEIGHT
        ) * 0.69

        const ui = this.add.container(screenWidth / 2, -500)
        ui.setScale(uiScale)

        const panel = this.add.image(0, 0, "panel2")
        ui.add(panel)

        /* REPLAY */

        const replay = this.add.image(836, -680, "replay")
        replay.setInteractive()
        ui.add(replay)

        replay.on("pointerdown", () => {
            this.scene.restart()
        })

        /* CIRCLES */

        this.circle1 = this.add.image(-432, -82, "ellipse1")
        this.circle2 = this.add.image(511, -273, "ellipse2")

        ui.add(this.circle1)
        ui.add(this.circle2)

        /* DRAW LAYER */

        this.drawLayer = this.add.renderTexture(0, 0, screenWidth, screenHeight)
        this.drawLayer.setOrigin(0, 0)

        /* BRUSH */

        this.brushRadius = 14
        this.brush = this.add.circle(0, 0, this.brushRadius, 0xffffff)
        this.brush.setVisible(false)

        /* ERASER */

        this.eraserBrush = this.add.circle(0, 0, 16, 0xffffff)
        this.eraserBrush.setVisible(false)

        /* ERASER ICON */

        this.eraserCursor = this.add.image(0, 0, "eraser")
        this.eraserCursor.setScale(0.35)
        this.eraserCursor.setVisible(false)

        /* STATE */

        this.currentColor = null
        this.isErasing = false

        this.lastX = null
        this.lastY = null
        this.canDraw = false // Cờ khóa vẽ khi UI chưa rớt xuống xong

        /* PAINT PROGRESS */

        this.circle1Pixels = new Set()
        this.circle2Pixels = new Set()

        this.circleThreshold = 410
        this.finished = false

        /* COLORS */

        this.colorButtons = []
        this.createColor(ui, -767, 649, "color1", 0xff5b5b)
        this.createColor(ui, -546, 649, "color2", 0xffd700)
        this.createColor(ui, -322, 649, "color3", 0x7aa37a)
        this.createColor(ui, -99, 649, "color4", 0x4a90e2)
        this.createColor(ui, 126, 649, "color5", 0xff7a00)
        this.createColor(ui, 350, 649, "color6", 0xe0668b)
        this.createColor(ui, 574, 649, "color7", 0x006400)

        /* ERASER */

        const eraser = this.add.image(786, 649, "eraser")
        eraser.setInteractive()

        eraser.on("pointerdown", () => {
            this.isErasing = true
            this.currentColor = null
            this.eraserCursor.setVisible(true)
        })

        ui.add(eraser)

        /* PANEL ANIMATION */

        this.tweens.add({
            targets: ui,
            y: screenHeight / 2,
            duration: 900,
            ease: "Bounce.easeOut",
            onComplete: () => {

                // Tự động phát âm thanh khi vào màn hình
                if (this.sound && this.cache.audio.exists("traceball_audio")) {
                    this.sound.play("traceball_audio")
                }

                // --- TẠO MASK SAU KHI UI ĐÃ DỪNG LẠI ---
                const maskGraphics = this.make.graphics();
                maskGraphics.fillStyle(0xffffff);

                // Tính toán kích thước thực tế trên màn hình (đã bao gồm scale của container cha)
                const w1 = this.circle1.getWorldTransformMatrix();
                const globalWidth1 = this.circle1.width * w1.scaleX;
                const globalHeight1 = this.circle1.height * w1.scaleY;
                maskGraphics.fillEllipse(w1.tx, w1.ty, globalWidth1, globalHeight1);

                const w2 = this.circle2.getWorldTransformMatrix();
                const globalWidth2 = this.circle2.width * w2.scaleX;
                const globalHeight2 = this.circle2.height * w2.scaleY;
                maskGraphics.fillEllipse(w2.tx, w2.ty, globalWidth2, globalHeight2);

                // Áp dụng Geometry Mask lên drawLayer
                this.drawLayer.setMask(maskGraphics.createGeometryMask());

                // Mở khóa cho phép vẽ
                this.canDraw = true;

            }
        })

        /* INPUT */

        this.input.on("pointermove", this.draw, this)

        /* DEV */

        this.input.keyboard.on("keydown-THREE", () => {
            this.scene.start("TrangBaScene")
        })

    }

    /* COLOR */

    createColor(ui, x, y, key, color) {

        const c = this.add.image(x, y, key)

        c.setInteractive()

        this.colorButtons.push(c)

        c.on("pointerdown", () => {

            this.currentColor = color
            this.isErasing = false
            this.eraserCursor.setVisible(false)

            /* reset scale tất cả màu */

            this.colorButtons.forEach(btn => {
                btn.setScale(1)
            })

            /* scale màu được chọn */

            this.tweens.add({
                targets: c,
                scale: 1.25,
                duration: 150,
                ease: "Back.easeOut"
            })

        })

        ui.add(c)

    }

    /* CHECK ELLIPSE */

    insideCircle(pointer, circle) {

        const world = circle.getWorldTransformMatrix()

        const cx = world.tx
        const cy = world.ty

        // Dùng world.scaleX và world.scaleY để tính bán kính thực trên màn hình
        const rx = (circle.width * world.scaleX) / 2
        const ry = (circle.height * world.scaleY) / 2

        const dx = pointer.x - cx
        const dy = pointer.y - cy

        // Tăng vùng kiểm tra lên <= 1.2 để người dùng lướt cọ sát viền thoải mái, Mask sẽ tự động cắt
        return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.2

    }

    /* DRAW */

    draw(pointer) {

        if (this.finished || !this.canDraw) return // Kiểm tra canDraw

        if (this.isErasing) {
            this.eraserCursor.setPosition(pointer.x, pointer.y)
        }

        if (!pointer.isDown) {

            this.lastX = null
            this.lastY = null
            return

        }

        const inside1 = this.insideCircle(pointer, this.circle1)
        const inside2 = this.insideCircle(pointer, this.circle2)

        if (!inside1 && !inside2) return

        if (this.isErasing) {

            this.eraserBrush.setPosition(pointer.x, pointer.y)
            this.drawLayer.erase(this.eraserBrush)

            return

        }

        if (this.currentColor === null) return

        if (this.lastX !== null) {

            const dist = Phaser.Math.Distance.Between(
                this.lastX,
                this.lastY,
                pointer.x,
                pointer.y
            )

            const steps = Math.min(6, Math.ceil(dist / 25))

            for (let i = 0; i < steps; i++) {

                const x = Phaser.Math.Interpolation.Linear([this.lastX, pointer.x], i / steps)
                const y = Phaser.Math.Interpolation.Linear([this.lastY, pointer.y], i / steps)

                this.brush.fillColor = this.currentColor
                this.brush.setPosition(x, y)

                this.drawLayer.draw(this.brush)

                const key = Math.floor(x / 6) + "_" + Math.floor(y / 6)

                const p = { x: x, y: y }

                if (this.insideCircle(p, this.circle1)) {
                    this.circle1Pixels.add(key)
                }

                if (this.insideCircle(p, this.circle2)) {
                    this.circle2Pixels.add(key)
                }

            }

        } else {

            this.brush.fillColor = this.currentColor
            this.brush.setPosition(pointer.x, pointer.y)

            this.drawLayer.draw(this.brush)

            const key = Math.floor(pointer.x / 6) + "_" + Math.floor(pointer.y / 6)

            if (this.insideCircle(pointer, this.circle1)) {
                this.circle1Pixels.add(key)
            }

            if (this.insideCircle(pointer, this.circle2)) {
                this.circle2Pixels.add(key)
            }

        }

        this.lastX = pointer.x
        this.lastY = pointer.y

        /* COMPLETE */

        if (
            this.circle1Pixels.size > this.circleThreshold &&
            this.circle2Pixels.size > this.circleThreshold &&
            !this.finished
        ) {

            this.finished = true

            if (this.sound && this.cache.audio.exists("success-color")) {
                this.sound.play("success-color")
            }

            this.time.delayedCall(400, () => {

                this.cameras.main.fadeOut(350, 0, 0, 0)

                this.cameras.main.once("camerafadeoutcomplete", () => {
                    this.scene.start("CongratsScene", {
                        nextScene: "TrangBaScene"
                    })
                })

            })

        }

    }

}