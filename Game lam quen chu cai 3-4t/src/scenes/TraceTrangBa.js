import Phaser from "phaser"

import enableDevTools from "../dev/DevTool"



export default class TraceTrangBa extends Phaser.Scene {



    constructor() {

        super("TraceTrangBa")

    }



    preload() {

        this.load.image("bg3", "/assets/bg3_main.jpg")

        this.load.image("panel4", "/assets/panel4_ui.png")

        this.load.image("ellipse10", "/assets/Ellipse 10.png")

        this.load.image("ellipse11", "/assets/Ellipse 11.png")

        this.load.image("color1", "/assets/Ellipse 3.png")

        this.load.image("color2", "/assets/Ellipse 4.png")

        this.load.image("color3", "/assets/Ellipse 5.png")

        this.load.image("color4", "/assets/Ellipse 6.png")

        this.load.image("color5", "/assets/Ellipse 7.png")

        this.load.image("color6", "/assets/Ellipse 8.png")

        this.load.image("color7", "/assets/Ellipse 9.png")

        this.load.image("eraser", "/assets/eraser.png")

        this.load.image("replay", "/assets/replay.png")

        this.load.audio("tracecaio", "/assets/audio/trace-caio.mp3")

        this.load.audio("success_audio", "/assets/audio/totlam.mp3")

    }



    create() {

        const screenWidth = this.scale.width
        const screenHeight = this.scale.height

        enableDevTools(this)

        /* BACKGROUND */

        const bg = this.add.image(screenWidth / 2, screenHeight / 2, "bg3")

        const scale = Math.max(screenWidth / bg.width, screenHeight / bg.height)

        bg.setScale(scale)

        /* UI */

        const DESIGN_WIDTH = 1920
        const DESIGN_HEIGHT = 1080

        const uiScale = Math.min(screenWidth / DESIGN_WIDTH, screenHeight / DESIGN_HEIGHT) * 0.69

        const ui = this.add.container(screenWidth / 2, -500)

        ui.setScale(uiScale)

        const panel = this.add.image(0, 0, "panel4")

        ui.add(panel)

        /* REPLAY */

        const replay = this.add.image(836, -680, "replay")

        replay.setInteractive()

        ui.add(replay)

        replay.on("pointerdown", () => {
            this.scene.restart()
        })

        /* CIRCLES – hình nét đứt làm mốc vị trí */

        this.circle1 = this.add.image(23, -277, "ellipse10")

        this.circle2 = this.add.image(-446, -101, "ellipse11")

        ui.add(this.circle1)

        ui.add(this.circle2)

        /* PAINT RENDER TEXTURE (mask sẽ được gán sau khi panel settled) */

        this.paintRT = this.add.renderTexture(0, 0, screenWidth, screenHeight)

        this.paintRT.setOrigin(0, 0)

        /* BRUSH */

        this.brushRadius = 18

        this.brush = this.add.circle(0, 0, this.brushRadius, 0xffffff)

        this.brush.setVisible(false)

        /* ERASER */

        this.eraserBrush = this.add.circle(0, 0, 24, 0xffffff)

        this.eraserBrush.setVisible(false)

        this.eraserCursor = this.add.image(0, 0, "eraser")

        this.eraserCursor.setScale(0.35)

        this.eraserCursor.setVisible(false)

        /* STATE */

        this.currentColor = null
        this.isErasing = false
        this.finished = false
        this.lastX = null
        this.lastY = null

        /* COLORS */

        this.colorButtons = []

        this.createColor(ui, -767, 649, "color1", 0xff5b5b)
        this.createColor(ui, -546, 649, "color2", 0xffd700)
        this.createColor(ui, -322, 649, "color3", 0x7aa37a)
        this.createColor(ui, -99, 649, "color4", 0x4a90e2)
        this.createColor(ui, 126, 649, "color5", 0xff7a00)
        this.createColor(ui, 350, 649, "color6", 0xe0668b)
        this.createColor(ui, 574, 649, "color7", 0x006400)

        /* ERASER BUTTON */

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

                // Setup mask sau khi panel đã ở đúng vị trí
                this.setupPaintSystem()

                if (this.sound && this.cache.audio.exists("tracecaio")) {
                    this.sound.play("tracecaio")
                }
            }
        })

        /* INPUT */

        this.input.on("pointermove", this.draw, this)

    }



    /* ============================================================
       COLORS
       ============================================================ */

    createColor(ui, x, y, key, color) {

        const c = this.add.image(x, y, key)

        c.setInteractive()

        this.colorButtons.push(c)

        c.on("pointerdown", () => {

            this.currentColor = color
            this.isErasing = false
            this.eraserCursor.setVisible(false)

            this.colorButtons.forEach(btn => btn.setScale(1))

            this.tweens.add({ targets: c, scale: 1.25, duration: 150, ease: "Back.easeOut" })

        })

        ui.add(c)

    }



    /* ============================================================
       SETUP PAINT SYSTEM
       ============================================================ */

    setupPaintSystem() {

        // Vị trí world của 2 ellipse sau khi panel đã ở đúng chỗ
        const m1 = this.circle1.getWorldTransformMatrix()
        const m2 = this.circle2.getWorldTransformMatrix()

        const rw1 = this.circle1.displayWidth / 2
        const rh1 = this.circle1.displayHeight / 2
        const rw2 = this.circle2.displayWidth / 2
        const rh2 = this.circle2.displayHeight / 2

        // Thu nhỏ kích thước một nửa bán kính, và tăng tỷ lệ chiều cao thêm một chút. Thêm góc nghiêng rotation bằng radian.
        this.u1 = {
            cx: m1.tx - 5,        // dx = -5
            cy: m1.ty + 50.04,    // dy = 50.04...
            rw: rw1 * 0.5,
            rh: rh1 * 0.75,
            rotation: Math.PI / 10
        }
        this.u2 = {
            cx: m2.tx + 1,        // dx = 1
            cy: m2.ty + 46.04,    // dy = 46.04...
            rw: rw2 * 0.5,
            rh: rh2 * 0.75,
            rotation: -Math.PI / 10
        }

        /* DEBUG OVERLAY – nhìn thấy được để chỉnh tay */

        this.debugOverlay = this.add.graphics()

        this.updateMaskAndDebugOverlay()

        /* TRACKING */

        this.u1Cells = new Set()
        this.u2Cells = new Set()

        const CELL = 16
        this.u1Total = this._countEllipseCells(this.u1, CELL)
        this.u2Total = this._countEllipseCells(this.u2, CELL)

        console.log("[MASK] u1:", this.u1Total, "cells | u2:", this.u2Total, "cells")

    }

    updateMaskAndDebugOverlay() {
        if (!this.maskShape) {
            this.maskShape = this.make.graphics({ add: false })
            const geomMask = this.maskShape.createGeometryMask()
            this.paintRT.setMask(geomMask)
        }

        this.maskShape.clear()
        this.maskShape.fillStyle(0xffffff, 1)
        this._fillSemiCircle(this.maskShape, this.u1)
        this._fillSemiCircle(this.maskShape, this.u2)
    }



    /* ============================================================
       DRAW
       ============================================================ */

    draw(pointer) {

        if (this.finished) return

        if (this.isErasing) {
            this.eraserCursor.setPosition(pointer.x, pointer.y)
        }

        if (!pointer.isDown) {
            this.lastX = null
            this.lastY = null
            return
        }

        // Chỉ xử lý khi pointer trong vùng ô
        const inU1 = this._inEllipse(pointer.x, pointer.y, this.u1)
        const inU2 = this._inEllipse(pointer.x, pointer.y, this.u2)

        if (!inU1 && !inU2) return

        /* ERASER */

        if (this.isErasing) {
            this.eraserBrush.setPosition(pointer.x, pointer.y)
            this.paintRT.erase(this.eraserBrush)
            return
        }

        if (this.currentColor === null) return

        /* PAINT với interpolation mịn */

        const paintAt = (x, y) => {
            this.brush.fillColor = this.currentColor
            this.brush.setPosition(x, y)
            this.paintRT.draw(this.brush)
            this._trackCells(x, y)
        }

        if (this.lastX !== null) {

            const dist = Phaser.Math.Distance.Between(this.lastX, this.lastY, pointer.x, pointer.y)
            const steps = Math.max(1, Math.ceil(dist / (this.brushRadius * 0.8)))

            for (let i = 0; i < steps; i++) {
                const t = i / steps
                const x = Phaser.Math.Interpolation.Linear([this.lastX, pointer.x], t)
                const y = Phaser.Math.Interpolation.Linear([this.lastY, pointer.y], t)
                paintAt(x, y)
            }

        } else {

            paintAt(pointer.x, pointer.y)

        }

        this.lastX = pointer.x
        this.lastY = pointer.y

        /* CHECK PASS */

        if (!this.u1 || !this.u2 || !this.u1Total || !this.u2Total) return

        const FILL_RATIO = 1.0

        const f1 = this.u1Cells.size / this.u1Total
        const f2 = this.u2Cells.size / this.u2Total

        if (f1 >= FILL_RATIO && f2 >= FILL_RATIO && !this.finished) {

            this.finished = true

            this.sound.play("success_audio")

            this.time.delayedCall(730, () => {

                this.cameras.main.fadeOut(350, 0, 0, 0)

                this.cameras.main.once("camerafadeoutcomplete", () => {
                    this.scene.start("EndScene")
                })

            })

        }

    }



    /* ============================================================
       HELPERS
       ============================================================ */

    /** Kiểm tra điểm (px, py) có nằm trong NỬA TRÊN của ellipse u không (bề lõm hướng xuống) */
    _inEllipse(px, py, u) {
        // Dịch tâm về gốc tọa độ
        const dx0 = px - u.cx
        const dy0 = py - u.cy

        // Xoay điểm ngược lại góc nghiêng của ellipse
        const cosA = Math.cos(-u.rotation || 0)
        const sinA = Math.sin(-u.rotation || 0)

        const dx = dx0 * cosA - dy0 * sinA
        const dy = dx0 * sinA + dy0 * cosA

        // Nửa trên (dy <= 0) tương đương arc hướng lên ∩
        return dy <= 0 && (dx * dx) / (u.rw * u.rw) + (dy * dy) / (u.rh * u.rh) <= 1
    }

    /** Helper xoay 1 điểm (x, y) quanh (cx, cy) một góc angle */
    _rotatePoint(x, y, cx, cy, angle) {
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        const dx = x - cx
        const dy = y - cy
        return {
            x: cx + dx * cosA - dy * sinA,
            y: cy + dx * sinA + dy * cosA
        }
    }

    /** Vẽ nửa hình tròn có viền + fill lên graphics g (để debug) */
    _drawSemiCircle(g, u, color, alpha) {

        const { cx, cy, rw, rh, rotation = 0 } = u
        const steps = 64

        const pts = []
        for (let i = 0; i <= steps; i++) {
            const angle = Math.PI * i / steps // 0 -> π
            // Tọa độ hình thang cung hướng lên tại gốc (chưa xoay)
            const px = cx + Math.cos(Math.PI - angle) * rw
            const py = cy - Math.sin(Math.PI - angle) * rh
            pts.push(this._rotatePoint(px, py, cx, cy, rotation))
        }

        pts.push(this._rotatePoint(cx + rw, cy, cx, cy, rotation))
        pts.push(this._rotatePoint(cx - rw, cy, cx, cy, rotation))

        g.lineStyle(4, color, 1)
        g.fillStyle(color, alpha)
        g.fillPoints(pts, true, false)
        g.strokePoints(pts, true, false)

    }

    /** Fill nửa hình tròn lên graphics g (dùng cho mask) */
    _fillSemiCircle(g, u) {

        const { cx, cy, rw, rh, rotation = 0 } = u
        const steps = 64

        const pts = []
        for (let i = 0; i <= steps; i++) {
            const angle = Math.PI * i / steps
            const px = cx + Math.cos(Math.PI - angle) * rw
            const py = cy - Math.sin(Math.PI - angle) * rh
            pts.push(this._rotatePoint(px, py, cx, cy, rotation))
        }
        pts.push(this._rotatePoint(cx + rw, cy, cx, cy, rotation))
        pts.push(this._rotatePoint(cx - rw, cy, cx, cy, rotation))

        g.fillPoints(pts, true, false)

    }

    /** Đăng ký tất cả ô CELL×CELL có tâm nằm trong disc brush tại (cx, cy) */
    _trackCells(cx, cy) {

        const CELL = 16
        const r = this.brushRadius

        const gi0 = Math.floor((cx - r) / CELL)
        const gi1 = Math.ceil((cx + r) / CELL)
        const gj0 = Math.floor((cy - r) / CELL)
        const gj1 = Math.ceil((cy + r) / CELL)

        for (let gi = gi0; gi <= gi1; gi++) {

            for (let gj = gj0; gj <= gj1; gj++) {

                const pcx = (gi + 0.5) * CELL
                const pcy = (gj + 0.5) * CELL

                if (Math.hypot(pcx - cx, pcy - cy) > r) continue

                const key = gi + "_" + gj

                if (this._inEllipse(pcx, pcy, this.u1)) this.u1Cells.add(key)
                if (this._inEllipse(pcx, pcy, this.u2)) this.u2Cells.add(key)

            }

        }

    }

    /** Đếm tổng số ô CELL×CELL có tâm nằm trong ellipse u */
    _countEllipseCells(u, CELL) {

        let count = 0

        const gi0 = Math.floor((u.cx - u.rw) / CELL)
        const gi1 = Math.ceil((u.cx + u.rw) / CELL)
        const gj0 = Math.floor((u.cy - u.rh) / CELL)
        const gj1 = Math.ceil((u.cy + u.rh) / CELL)

        for (let gi = gi0; gi <= gi1; gi++) {

            for (let gj = gj0; gj <= gj1; gj++) {

                const pcx = (gi + 0.5) * CELL
                const pcy = (gj + 0.5) * CELL

                if (this._inEllipse(pcx, pcy, u)) count++

            }

        }

        return count

    }

}