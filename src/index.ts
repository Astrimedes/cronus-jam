import { makeSprite, t, GameProps } from "@replay/core";
import { WebInputs, RenderCanvasOptions } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Level } from "./level";
import { Command } from "./commands";

export const options: RenderCanvasOptions = {
  dimensions: "scale-up",
};

export const gameProps: GameProps = {
  id: "Game",
  size: {
    landscape: {
      width: 600,
      height: 400,
      maxWidthMargin: 150,
    },
    portrait: {
      width: 400,
      height: 600,
      maxHeightMargin: 150,
    },
  },
  defaultFont: {
    family: "Courier",
    size: 10,
  },
};

type GameState = {
  loaded: boolean;
  commands: Command[];
};


export const Game = makeSprite<GameProps, GameState, WebInputs | iOSInputs>({
  init({ updateState, preloadFiles }) {
    preloadFiles({
      audioFileNames: ["boop.wav"],
      imageFileNames: ["icon.png", "11_bonus.png"],
    }).then(() => {
      updateState((state) => ({ ...state, loaded: true }));
    });

    return {
      loaded: false,
      commands: []
    };
  },

  loop({ state, getInputs }) {
    if (!state.loaded) return state;

    // interpret commands to pass to level
    const nextCommands = [];
    const { keysDown } = getInputs();
    if (keysDown['ArrowUp']) {
      nextCommands.push(Command.UP);
    }
    if (keysDown['ArrowRight']) {
      nextCommands.push(Command.RIGHT);
    }
    if (keysDown['ArrowDown']) {
      nextCommands.push(Command.DOWN);
    }
    if (keysDown['ArrowLeft']) {
      nextCommands.push(Command.LEFT);
    }
    if (keysDown[' ']) {
      nextCommands.push(Command.ACTIVATE);
    }
    if (keysDown['Shift']) {
      nextCommands.push(Command.SHIFT)
    }

    return {
      ...state,
      loaded: true,
      commands: nextCommands
    };
  },

  render({ state, extrapolateFactor }) {
    if (!state.loaded) {
      return [
        t.text({
          text: "Loading...",
          color: "black",
        }),
      ];
    }
    return [
      Level({id: "level1",  commands: state.commands, exFactor: extrapolateFactor}),
    ];
  },
});
