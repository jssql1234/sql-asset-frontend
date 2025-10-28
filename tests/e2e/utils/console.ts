import type { Page, ConsoleMessage } from '@playwright/test';

export interface ParsedLogMessage {
  level: 'info' | 'warn' | 'error';
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  componentStack?: string;
  context?: {
    scope?: string;
    component?: string;
    route?: string;
    [key: string]: unknown;
  };
}

/**
 * Helper to parse console messages from the app's logger
 */
export async function parseAppLog(msg: ConsoleMessage): Promise<ParsedLogMessage | null> {
  try {
    const text = msg.text();
    
    // Check if this is an [App] log
    if (!text.startsWith('[App]')) {
      return null;
    }

    // Try to get the actual object from console args first
    // console.log("[App]", payload) sends two args
    const args = msg.args();
    if (args.length >= 2) {
      try {
        const value = await args[1].jsonValue();
        // Verify it has the expected structure
        if (value && typeof value === 'object' && 'level' in value) {
          return value as ParsedLogMessage;
        }
      } catch {
        // Fall through to try parsing from text
      }
    }

    // Fallback: try to parse from text
    const jsonStr = text.substring(6).trim();
    
    // Handle case where the message is "[App] [object Object]"
    if (jsonStr === '[object Object]' || jsonStr.startsWith('[object')) {
      return null;
    }
    
    const parsed = JSON.parse(jsonStr);
    
    return parsed as ParsedLogMessage;
  } catch {
    return null;
  }
}

/**
 * Set up console listener to capture app logs
 */
export function setupConsoleListener(page: Page) {
  const logs: ParsedLogMessage[] = [];
  const allMessages: ConsoleMessage[] = [];
  const pendingParses: Promise<void>[] = [];

  page.on('console', async (msg) => {
    allMessages.push(msg);
    
    // Track the parsing promise
    const parsePromise = parseAppLog(msg).then(parsed => {
      if (parsed) {
        logs.push(parsed);
      }
    });
    
    pendingParses.push(parsePromise);
    
    // Clean up completed promises
    parsePromise.finally(() => {
      const index = pendingParses.indexOf(parsePromise);
      if (index > -1) {
        pendingParses.splice(index, 1);
      }
    });
  });

  return {
    logs,
    allMessages,
    clear: () => {
      logs.length = 0;
      allMessages.length = 0;
    },
    waitForLogs: async () => {
      // Wait for all pending log parsing to complete
      await Promise.all(pendingParses);
    },
    getErrorLogs: () => logs.filter(log => log.level === 'error'),
    getInfoLogs: () => logs.filter(log => log.level === 'info'),
    getWarnLogs: () => logs.filter(log => log.level === 'warn'),
    findLog: (predicate: (log: ParsedLogMessage) => boolean) => logs.find(predicate),
    findAllLogs: (predicate: (log: ParsedLogMessage) => boolean) => logs.filter(predicate),
  };
}

export type ConsoleListener = ReturnType<typeof setupConsoleListener>;

