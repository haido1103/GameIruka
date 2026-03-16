/**
 * IdleManager tracks user inactivity and triggers a callback when idle time exceeds a threshold.
 * It does not have visual components; the consumer handles the hint presentation.
 */
export class IdleManager {
    private elapsed: number = 0;
    private readonly threshold: number;
    private readonly onIdle: () => void;
    private isActive: boolean = false;

    constructor(thresholdMs: number, onIdle: () => void) {
        this.threshold = thresholdMs;
        this.onIdle = onIdle;
    }

    start() {
        this.isActive = true;
        this.elapsed = 0;
    }

    reset() {
        this.elapsed = 0;
    }

    stop() {
        this.isActive = false;
        this.elapsed = 0;
    }

    update(delta: number) {
        if (!this.isActive) return;

        this.elapsed += delta;
        if (this.elapsed > this.threshold) {
            this.onIdle();
            this.reset(); // Wait for next tick to avoid spamming
        }
    }
}
