// persistence.ts
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const SAVE_DIR: string = path.join(os.homedir(), ".agrius");
const SAVE_FILE: string = path.join(SAVE_DIR, "save.json");

export async function loadSave<T>(): Promise<T | null> {
    try {
        const raw: string = await fs.readFile(SAVE_FILE, "utf8");
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export async function saveAtomic<T>(data: T): Promise<void> {
    await fs.mkdir(SAVE_DIR, { recursive: true });
    const tmp: string = SAVE_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(data), "utf8");
    await fs.rename(tmp, SAVE_FILE);
}
