export class TimeLog {
    constructor(total) {
        this.total = total;
        this.current = 0;
        this.startTime = Date.now();
        const initial = `[0/${total}]`;
        process.stdout.write(initial);
        this.lastLength = initial.length;
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
        const extra = this.lastLength > line.length ? this.lastLength - line.length : 0;
        if (extra > 0) {
            process.stdout.write(`\r${line}${" ".repeat(extra)}\r${line}`);
        } else {
            process.stdout.write(`\r${line}`);
        }
        this.lastLength = line.length;
        if (this.current === this.total) {
            process.stdout.write("\n");
        }
    }
}
