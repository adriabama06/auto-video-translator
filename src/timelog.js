export class TimeLog {
    constructor(total) {
        this.total = total;
        this.current = 0;
        this.startTime = Date.now();
        process.stdout.write(`[0/${total}]`);
    }

    next() {
        this.current++;
        const elapsed = (Date.now() - this.startTime) / 1000;
        const avg = elapsed / this.current;
        const remaining = avg * (this.total - this.current);
        const fmt = (s) => {
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
        };
        const line = `[${this.current}/${this.total}] ${fmt(elapsed)} elapsed, ~${fmt(remaining)} remaining`;
        process.stdout.write(`\r${line.padEnd(80)}`);
        if (this.current === this.total) {
            process.stdout.write("\n");
        }
    }
}
