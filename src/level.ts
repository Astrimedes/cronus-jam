/* eslint-disable prefer-const */
import { makeSprite, Sprite, t } from "@replay/core";
import { iOSInputs } from "@replay/swift";
import { WebInputs } from "@replay/web";
import { vecDistance, vecNormalize, vecScale } from "math2d";
import { keepInBounds, seek } from "./ais/seek";
import { Command, getDirection } from "./commands";
import { normalizeDiagonal } from "./mathUtil";
import { Titan, TitanCustomProps } from "./titan";

type BackgroundProps = {
  fileName: string,
  width: number;
  height: number;
  x: number;
  y: number;
}

export type LevelProps = {
  commands: Command[];
  exFactor: number;
};

type TitanRenderProps = TitanCustomProps & {id: string};
type ActorEntry = {
  renderProps: TitanRenderProps;
  name: string;
  direction: {x: number, y: number},
  acting: boolean,
  size: {width: number, height: number},
  speed: number;
  dialogs: string[];
  dialogIndex: number;
}

export type LevelState = {
  timers: Record<string, string>;
  cronusX: number;
  cronusY: number;
  cameraX: number;
  cameraY: number;
  enemies: ActorEntry[];
  friendlies: ActorEntry[];
  background: BackgroundProps[];
  locations: Location[];
};

const playerSpeed = 2.5;
const playerSize = {width: 20, height: 20};

const levelSize = {
  width: 1920,
  height: 1080
}

const levelRectangle = {
  top: Math.round(levelSize.height / 2),
  right: Math.round(levelSize.width / 2),
  bottom: -Math.round(levelSize.height / 2),
  left: -Math.round(levelSize.width / 2),
}

const levelBackground = {
  fileName: "11_bonus.png",
  width: levelSize.width,
  height: levelSize.height,
  x: 0,
  y: 0
}

export const Level = makeSprite<LevelProps, LevelState, WebInputs | iOSInputs>({
  init() {
    return {
      timers: {},
      cronusX: 0,
      cronusY: 0,
      cameraX: 0,
      cameraY: 0,
      enemies: [{
        name: "uranus",
        renderProps: {
          id: "uranus",
          name: "Uranus",
          mapX: 60,
          mapY: 60,
          cameraX: 0,
          cameraY: 0,
          color: 'red',
          size: 60,
          weapon: null,
          },
          direction: {x: 0, y: 0},
          acting: false,
          size: {width: 60, height: 60},
          speed: playerSpeed / 2,
          dialogs: ["hello, son"],
          dialogIndex: 0
      }],
      friendlies: [],
      locations: [],
      background: [levelBackground]
    }
  },

  loop({props, state, device, updateState}) {

    // state
    let { cameraX, cameraY, cronusX, cronusY, enemies, timers } = state;
    const commands = props.commands;

    // process commands
    const hasShift = commands.indexOf(Command.SHIFT) > -1;
    let cameraMove = { x: 0, y: 0 };
    let cronusMove = { x: 0, y: 0 };
    let cronusMoved = false;
    commands.forEach(c => {
      const dir = getDirection(c);
      if (!dir) return;
      if (hasShift) {
        cameraMove.x += dir.x * playerSpeed;
        cameraMove.y += dir.y * playerSpeed;
      } else {
        cronusMove.x += dir.x * playerSpeed;
        cronusMove.y += dir.y * playerSpeed;
      }
      normalizeDiagonal(cameraMove);
      cronusMoved = true;
    })

    if (cronusMoved) {
      // apply cronus movement
      cronusX += cronusMove.x;
      cronusY += cronusMove.y;

      let pos = {x: cronusX, y: cronusY};

      // normalize diagonal movement
      cronusMove = vecNormalize(cronusMove);

      // keep in bounds
      pos = keepInBounds(pos, playerSize, levelRectangle);

      // apply position
      cronusX = pos.x;
      cronusY = pos.y;
    }

    // camera movement
    let target = {x: cronusX, y: cronusY};
    const cameraSize = {width: device.size.width + (device.size.widthMargin * 2), height: device.size.height + (device.size.heightMargin * 2)};
    if (!cameraMove.x && !cameraMove.y) {
      cameraMove = seek({x: cameraX, y: cameraY}, target, Infinity, playerSize.width, playerSpeed * 4, cameraSize, device);
      if (cameraMove.x || cameraMove.y) {
        // keep everything in bounds
        let point = {x: cameraX + cameraMove.x, y: cameraY + cameraMove.y};
        point = keepInBounds(point, cameraSize, levelRectangle);
        // adjust movement
        cameraMove.x += point.x - cameraX;
        cameraMove.y += point.y - cameraY;
        // find distance to player
        let distance = vecDistance(point, target);
        let maxRange = 600;
        // always dampen camera movement - based on distance
        cameraMove = vecScale(cameraMove, Math.min(1, Math.max(0, distance / maxRange)));
      }
    }
    // apply to position
    cameraX += cameraMove.x;
    cameraY += cameraMove.y;

    // move enemies
    enemies.forEach(ee => {
      let pos = { x: ee.renderProps.mapX, y: ee.renderProps.mapY };

      if (!ee.acting) {
        ee.acting = true;
        ee.direction = seek(pos, target, 600, ee.size.width, ee.speed, ee.size, device);

        // reset 'moving' flag after delay
        const delay = (device.random() * 1000) + 100;

        // clear previous timers...
        if (state.timers[ee.name]) {
          device.timer.cancel(state.timers[ee.name]);
        }

        // store timer id
        state.timers[ee.name] = device.timer.start(() => {
          updateState(state => {
            const enemy = state.enemies.find(e => e.name == ee.name);
            if (enemy && enemy.acting) {
              enemy.direction.x = 0;
              enemy.direction.y = 0;
              enemy.acting = false;
            }
            return state})
        }, delay);
      }

      // update sprite position
      if (ee.acting) {
        pos.x += ee.direction.x;
        pos.y += ee.direction.y;
        pos = keepInBounds(pos, ee.size, levelRectangle);

        ee.renderProps.mapX = pos.x;
        ee.renderProps.mapY = pos.y;
      }
    });

    // new state
    return {
      ...state,
      enemies,
      timers,
      cameraX,
      cameraY,
      cronusX,
      cronusY
    }
  },

  render({ state }) {
    const sprites: Array<Sprite> = [t.image({
        fileName: levelBackground.fileName,
        width: levelSize.width,
        height: levelSize.height,
        x: levelBackground.x-state.cameraX,
        y: levelBackground.y-state.cameraY})
    ];

    state.friendlies.forEach(entry => sprites.push(
      Titan({...entry.renderProps,
      cameraX: state.cameraX,
      cameraY: state.cameraY})
    ));

    state.enemies.forEach(entry => sprites.push(
      Titan({...entry.renderProps,
      cameraX: state.cameraX,
      cameraY: state.cameraY})
    ));

      sprites.push(Titan({
        id: 'Cronus',
        name: 'Cronus',
        mapX: state.cronusX,
        mapY: state.cronusY,
        cameraX: state.cameraX,
        cameraY: state.cameraY,
        color: 'blue',
        size: playerSize.width,
        weapon: null
      }));


    return sprites;
  }
});
