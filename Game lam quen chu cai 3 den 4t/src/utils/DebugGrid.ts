import Phaser from "phaser";

export class DebugGrid {
    private scene: Phaser.Scene;
    private graphics: Phaser.GameObjects.Graphics | null = null;
    private texts: Phaser.GameObjects.Text[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    draw(options: { showGrid?: boolean; showReadingLines?: boolean; spacing?: number } = {}) {
        const spacing = options.spacing || 100;
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        this.clear();

        if (!options.showGrid && !options.showReadingLines) return;

        this.graphics = this.scene.add.graphics();
        this.graphics.setDepth(9999);

        if (options.showGrid) {
            this.graphics.lineStyle(1, 0x00ff00, 0.3);
            for (let x = 0; x < width; x += spacing) {
                this.graphics.moveTo(x, 0);
                this.graphics.lineTo(x, height);
                this.texts.push(this.scene.add.text(x, 0, `${x}`, { fontSize: '10px', color: '#00ff00' }).setDepth(9999));
            }
            for (let y = 0; y < height; y += spacing) {
                this.graphics.moveTo(0, y);
                this.graphics.lineTo(width, y);
                this.texts.push(this.scene.add.text(0, y, `${y}`, { fontSize: '10px', color: '#00ff00' }).setDepth(9999));
            }
            this.graphics.strokePath();
            
            this.graphics.lineStyle(2, 0xff0000, 0.5);
            this.graphics.moveTo(width/2, 0);
            this.graphics.lineTo(width/2, height);
            this.graphics.moveTo(0, height/2);
            this.graphics.lineTo(width, height/2);
            this.graphics.strokePath();
        }
    }

    clear() {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
        this.texts.forEach(t => t.destroy());
        this.texts = [];
    }
}
