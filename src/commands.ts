export class CommandDef {
  x: number;
  y: number;
  action: number;

  constructor(x = 0, y = 0, action = 0) {
    this.x = x;
    this.y = y;
    this.action = action;
  }
}

export const enum Command {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
  ACTIVATE = 4,
  SHIFT = 5
}

const directions = {
  0: new CommandDef(0, 1, 0),
  1: new CommandDef(1, 0, 0),
  2: new CommandDef(0, -1, 0),
  3: new CommandDef(-1, 0, 0),
  4: undefined,
  5: undefined
}

export function getDirection(command: Command): CommandDef | undefined {
  return directions[command]
}
