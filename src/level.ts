import { makeSprite, t } from "@replay/core";
import { iOSInputs } from "@replay/swift";
import { WebInputs } from "@replay/web";
import { seek } from "./ais/seek";
import { Command, getDirection } from "./commands";
import { normalizeDiagonal } from "./mathUtil";
import { Titan } from "./titan";

type Enemy = {
  id: string;
  acting: boolean;
  action: {x: number, y: number, action: number}
}

const levelBounds = {
  width: 1920,
  height: 1080
}

type Friendly = {

}

type Location = {

}

export type LevelState = {
  timers: Record<string, string>;
  cronusX: number;
  cronusY: number;
  uranusX: number;
  uranusY: number;
  cameraX: number;
  cameraY: number;
  enemies: Enemy[];
  friendlies: Friendly[];
  locations: Location[];
  uranusMoving: boolean;
  uranusMove: {x: number, y: number};
};

export type LevelProps = {
  commands: Command[];
  exFactor: number;
};


export const Level = makeSprite<LevelProps, LevelState, WebInputs | iOSInputs>({
  init() {
    return {
      timers: {},
      cronusX: 0,
      cronusY: 0,
      uranusX: 60,
      uranusY: 60,
      cameraX: 0,
      cameraY: 0,
      enemies: [],
      friendlies: [],
      locations: [],
      uranusMoving: false,
      uranusMove: {x: 0, y: 0}
    }
  },

  loop({props, state, device, updateState}) {

    // state
    const { cameraX, cameraY, cronusX, cronusY } = state;
    const commands = props.commands;

    // process commands
    const hasShift = commands.indexOf(Command.SHIFT) > -1;

    let cameraMove = { x: 0, y: 0 };
    const cronusMove = { x: 0, y: 0 };
    commands.forEach(c => {
      const dir = getDirection(c);
      const speed = 4;
      if (!dir) return;
      if (hasShift) {
        cameraMove.x += dir.x * speed;
        cameraMove.y += dir.y * speed;
      } else {
        cronusMove.x += dir.x * speed;
        cronusMove.y += dir.y * speed;
      }
      normalizeDiagonal(cameraMove);
    });

    // camera movement
    if (!cameraMove.x && !cameraMove.y) {
      cameraMove.x = cameraX;
      cameraMove.y = cameraY;
      cameraMove = seek(cameraMove, {x: cronusX, y: cronusY}, Infinity, 3.8, levelBounds, {width: device.size.deviceWidth, height: device.size.deviceHeight}, device);
    }


    // normalize diagonal movement
    normalizeDiagonal(cronusMove);


    // move Uranus
    let { uranusMoving, uranusMove, uranusX, uranusY } = state;

    if (!uranusMoving) {
      uranusMoving = true;

      uranusMove = seek({x: uranusX, y: uranusY}, {x: cronusX, y: cronusY}, 600, 1.5, levelBounds, {width: 40, height: 40}, device);

      // reset 'moving' flag after delay
      const delay = (device.random() * 1500) + 300;

      // store timer id
      state.timers['uranus'] = device.timer.start(() => {
        updateState(state => {return {...state, uranusMoving: false}})
      }, delay);

    }
    if (uranusMoving) {
      uranusX += uranusMove.x;
      uranusY += uranusMove.y;
    }

    // new state
    return {
      ...state,
      uranusMove,
      uranusMoving,
      uranusX,
      uranusY,
      cameraX: cameraX + cameraMove.x,
      cameraY: cameraY + cameraMove.y,
      cronusX: cronusX + cronusMove.x,
      cronusY: cronusY + cronusMove.y
    }
  },

  render({ state }) {
    return [
      t.image({
        fileName: "11_bonus.png",
        width: levelBounds.width,
        height: levelBounds.height,
        x: -state.cameraX,
        y: -state.cameraY}),
      Titan({
        id: "uranus",
        name: "Uranus",
        mapX: state.uranusX,
        mapY: state.uranusY,
        cameraX: state.cameraX,
        cameraY: state.cameraY,
        color: 'red',
        size: 40,
        weapon: null
      }),
      Titan({
        id: 'Cronus',
        name: 'Cronus',
        mapX: state.cronusX,
        mapY: state.cronusY,
        cameraX: state.cameraX,
        cameraY: state.cameraY,
        color: 'blue',
        size: 20,
        weapon: null
      }),

    ]
  }
});
