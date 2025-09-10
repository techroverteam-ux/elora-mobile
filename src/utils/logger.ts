export let logFn = console.log;

export const stopLogging = () => {
  console.warn = () => { };
  console.log = () => { };
  console.error = () => { };
};

const colors: Record<string, string> = {
  red: "color: red; font-weight: bold;",
  green: "color: green; font-weight: bold;",
  yellow: "color: goldenrod; font-weight: bold;",
  blue: "color: blue; font-weight: bold;",
  magenta: "color: magenta; font-weight: bold;",
  cyan: "color: cyan; font-weight: bold;",
  white: "color: white; font-weight: bold;",
};

export const colorLog = (color: keyof typeof colors, ...args: any[]) => {
  const formattedArgs = args.map(arg =>
    typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
  );

  if (typeof globalThis !== "undefined" && typeof (globalThis as any).window !== "undefined") {
    // Browser logging
    console.log(`%c${formattedArgs.join(" ")}`, colors[color] ?? "");
  } else {
    // Node.js logging
    const ansiColors: Record<string, string> = {
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
    };
    console.log(ansiColors[color] ?? "", ...formattedArgs, "\x1b[0m");
  }
};

export const _log = (result: any, payload?: any) => {
  const url = result.meta?.request?.url;
  const body = result.meta?.request?._bodyText ?? payload;
  const response = result.data ?? result.error;

  console.log("\x1b[33m==================================================================================>>>>>START");
  console.log("\x1b[1m\x1b[32mURL :-\n", url);
  console.log("\x1b[1m\x1b[32mPAYLOAD :-\n", body);
  console.log("\x1b[1m\x1b[32mRESPONSE :-\n", response);
  console.log("\x1b[33m<<<<<<==================================================================================END");
};
