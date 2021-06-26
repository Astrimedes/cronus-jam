/* eslint-disable prefer-const */
import { makeSprite, t } from "@replay/core";
import { iOSInputs } from "@replay/swift";
import { WebInputs } from "@replay/web";
import { Weapon, weapons } from "./weapon";

type TitanState = {
  attacking: boolean;
  allowedAttack: boolean;
  moving: boolean;
  facing: {x: number, y: number}
}

export type TitanCustomProps = {
  weapon?: string;
  size: number;
  color: string;
  name: string;
  mapX: number,
  mapY: number,
  cameraX: number,
  cameraY: number,
  paused: boolean,
  tryAttack: boolean,
  tryMove: {x: number, y: number}
}

type updateTitanState = (update: (state: TitanState) => TitanState) => void;

const stopAttacking = (updateState: updateTitanState) => {
  updateState(state => {
    return {
      ...state,
      attacking: false
    }
  })
}

export const Titan = makeSprite<TitanCustomProps,  TitanState, WebInputs | iOSInputs>({
  init() {
    return {
      attacking: false,
      allowedAttack: true,
      moving: false,
      facing: {x: 0, y: 0}
     };
  },
  loop({props, state}) {
    let {attacking, facing} = state;
    const {tryMove, tryAttack} = props;
    if (!attacking) {
      attacking = tryAttack;
    }

    facing.x = Math.sign(tryMove.x);
    facing.y = Math.sign(tryMove.y);

    return {
      ...state,
      attacking,
      facing: {...facing}
    }
  },
  render({props, state, updateState}) {
    return [
      // t.circle({radius: props.size, color: props.color, x: props.mapX - props.cameraX, y: props.mapY - props.cameraY}),
      t.rectangle({width: props.size, height: props.size, color: props.color, x: props.mapX - props.cameraX, y: props.mapY - props.cameraY}),
      t.text({text: props.name, color: props.color, x: props.mapX - props.cameraX, y: (props.mapY + (props.size/2)) - props.cameraY, anchorY: -4}),
      state.attacking && props.weapon ? Weapon({...weapons[props.weapon], stopAttacking: () => stopAttacking(updateState), facing: state.facing, tryAttack: props.tryAttack, mapX: props.mapX, mapY: props.mapY, cameraX: props.cameraX, cameraY: props.cameraY, paused: props.paused}) : null
      // t.text({text: `(${Math.round(props.mapX)}, ${Math.round(props.mapY)})`, color: props.color, x: props.mapX - props.cameraX, y: (props.mapY - props.size - 10) - props.cameraY})
    ]
  }
});
