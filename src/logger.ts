// keylog.ts
import fs from "node:fs/promises";
import path from "node:path";
import util from "node:util";

const LOG_DIR: string = path.resolve("./");
const LOG_FILE: string = path.join(LOG_DIR, "debug.log");
const KEYLOG_FILE: string = path.join(LOG_DIR, "keys.ndjson");

function safeStringify(value: unknown): string {
    try {
        return JSON.stringify(value);
    } catch {
        // Circular refs / non-serializable fields fallback
        return JSON.stringify({ inspect: util.inspect(value, { depth: 6 }) });
    }
}

export async function logLine(message: unknown): Promise<void> {
    const ts: string = new Date().toISOString();

    // Use safeStringify properly:
    // - if caller passes a string, write it as-is
    // - otherwise stringify safely
    let msg: string;

    if (typeof message === "string") {
        msg = message;
    } else {
        msg = safeStringify(message);
    }

    const record = { ts, message: msg };
    const line: string = safeStringify(record) + "\n";

    try {
        await fs.mkdir(LOG_DIR, { recursive: true });
        await fs.appendFile(LOG_FILE, line, "utf8");
    } catch {
        // If logging fails, don't crash the game.
    }

    // Avoid writing to stderr in TUIs unless you really want it:
    // console.error(line.trimEnd());
}

export async function logKeyEvent(event: unknown): Promise<void> {
    const ts: string = new Date().toISOString();
    const record = { ts, event };
    const line: string = safeStringify(record) + "\n";

    try {
        await fs.mkdir(LOG_DIR, { recursive: true });
        await fs.appendFile(KEYLOG_FILE, line, "utf8");
    } catch {
        // Ignore logging failures for now
    }
}
