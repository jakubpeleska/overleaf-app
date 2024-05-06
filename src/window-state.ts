import { BrowserWindow, screen } from "electron";
import settings from "electron-settings";

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized?: boolean;
}

export const windowStateKeeper = (windowName: string) => {
  const size = screen.getPrimaryDisplay().workAreaSize;
  let windowState: WindowState = settings.hasSync(`windowState.${windowName}`)
    ? (settings.getSync(`windowState.${windowName}`) as any)
    : {
        x: undefined,
        y: undefined,
        width: size.width,
        height: size.height,
      };

  const saveState = async (win: BrowserWindow) => {
    // bug: lots of save state events are called. they should be debounced
    if (!windowState.isMaximized) {
      windowState = win.getBounds();
    }
    windowState.isMaximized = win.isMaximized();
    await settings.set(`windowState.${windowName}`, windowState as any);
  };

  const track = async (win: BrowserWindow) => {
    win.on("resize", () => saveState(win));
    win.on("move", () => saveState(win));
    win.on("close", () => saveState(win));
  };

  return {
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    isMaximized: windowState.isMaximized,
    track,
  };
};
