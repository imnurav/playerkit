export type LogLevel = "debug" | "info" | "warn" | "error" | "none";

class CentralizedLogger {
  private level: LogLevel = "debug";

  constructor() {
    if (typeof window !== "undefined") {
      (window as any).setPlayerLogLevel = (level: LogLevel) => {
        this.setLevel(level);
        console.log(`[Player] Global log level set to: "${level}"`);
      };
      (window as any).togglePlayerLogs = () => {
        const cur = this.getLevel();
        const next = cur === "none" ? "info" : "none";
        this.setLevel(next);
        console.log(`[Player] Global logs toggled. Current level: "${next}"`);
      };
    }
  }

  /**
   * Set the global logging verbosity level.
   * Setting this to "none" disables all logs.
   */
  setLevel(level: LogLevel) {
    this.level = level;
  }

  /**
   * Get the current global logging verbosity level.
   */
  getLevel(): LogLevel {
    return this.level;
  }

  private shouldLog(msgLevel: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error", "none"];
    const currentIdx = levels.indexOf(this.level);
    const msgIdx = levels.indexOf(msgLevel);
    return msgIdx >= currentIdx && this.level !== "none";
  }

  debug(message: string, ...args: unknown[]) {
    if (this.shouldLog("debug")) {
      console.debug(
        `%c[Player] %cDEBUG: ${message}`,
        "color: #8a8a8a; font-weight: bold;",
        "color: inherit;",
        ...args,
      );
    }
  }

  log(message: string, ...args: unknown[]) {
    this.info(message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    if (this.shouldLog("info")) {
      console.log(
        `%c[Player] %cINFO: ${message}`,
        "color: #3b82f6; font-weight: bold;",
        "color: inherit;",
        ...args,
      );
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.shouldLog("warn")) {
      console.warn(
        `%c[Player] %cWARN: ${message}`,
        "color: #eab308; font-weight: bold;",
        "color: inherit;",
        ...args,
      );
    }
  }

  error(message: string, ...args: unknown[]) {
    if (this.shouldLog("error")) {
      console.error(
        `%c[Player] %cERROR: ${message}`,
        "color: #ef4444; font-weight: bold;",
        "color: inherit;",
        ...args,
      );
    }
  }
}

export const logger = new CentralizedLogger();
export type { CentralizedLogger };
