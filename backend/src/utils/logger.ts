/**
 * Logger utility for formatted console output
 */

export const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

export class Logger {
  static header(title: string): void {
    console.log(`\n${colors.cyan}${"═".repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}${title.padStart((title.length + 60) / 2).padEnd(60)}${colors.reset}`);
    console.log(`${colors.cyan}${"═".repeat(60)}${colors.reset}\n`);
  }

  static section(title: string): void {
    console.log(`\n${colors.blue}▶ ${title}${colors.reset}`);
  }

  static success(message: string, detail?: string): void {
    const icon = `${colors.green}✓${colors.reset}`;
    console.log(`${icon} ${colors.green}${message}${colors.reset}${detail ? ` - ${detail}` : ""}`);
  }

  static error(message: string, detail?: string): void {
    const icon = `${colors.red}✗${colors.reset}`;
    console.log(`${icon} ${colors.red}${message}${colors.reset}${detail ? ` - ${detail}` : ""}`);
  }

  static warning(message: string, detail?: string): void {
    const icon = `${colors.yellow}⚠${colors.reset}`;
    console.log(`${icon} ${colors.yellow}${message}${colors.reset}${detail ? ` - ${detail}` : ""}`);
  }

  static info(message: string, detail?: string): void {
    const icon = `${colors.cyan}ℹ${colors.reset}`;
    console.log(`${icon} ${colors.cyan}${message}${colors.reset}${detail ? ` - ${detail}` : ""}`);
  }

  static endpoint(method: string, path: string): void {
    const methodColors: Record<string, string> = {
      GET: colors.green,
      POST: colors.yellow,
      PATCH: colors.blue,
      DELETE: colors.red,
      PUT: colors.cyan,
    };
    const color = methodColors[method] || colors.white;
    console.log(`  ${color}${method.padEnd(6)}${colors.reset} ${path}`);
  }

  static serviceStatus(serviceName: string, status: boolean, details?: string): void {
    const icon = status ? `${colors.green}●${colors.reset}` : `${colors.red}●${colors.reset}`;
    const statusText = status ? `${colors.green}Connected${colors.reset}` : `${colors.red}Disconnected${colors.reset}`;
    console.log(`  ${icon} ${serviceName.padEnd(15)} ${statusText}${details ? ` - ${details}` : ""}`);
  }

  static divider(): void {
    console.log(`${colors.cyan}${"-".repeat(60)}${colors.reset}`);
  }
}

export default Logger;
