import { makeSprite, t } from "@replay/core";
import { iOSInputs } from "@replay/swift";
import { WebInputs } from "@replay/web";

export const weapons: Record<string, {id: string, filename: string, width: number, height: number, speed: number, swingAngle: number}> = {
  sickle: {
    id: "sickle",
    filename: "sickle",
    width: 45,
    height: 15,
    speed: 720,
    swingAngle: 360
  },
  fist: {
    id: "fist",
    filename: "fist",
    width: 30,
    height: 10,
    speed: 360,
    swingAngle: 180
  }
}

export type WeaponCustomProps = {
  filename: string;
  width: number;
  height: number;
  speed: number;
  swingAngle: number;
  mapX: number;
  mapY: number;
  cameraX: number;
  cameraY: number;
  paused: boolean;
  tryAttack: boolean;
  facing: {x: number, y: number};
  stopAttacking: () => void;
}

export type WeaponState = {
  rotation: number;
  swinging: boolean;
  startAngle: number;
}

const findAngleFromFacing = (facing: {x: number, y: number}) => {
  const {x, y} = facing;
  let angle = 0;
  if (x > 0) {
    angle = 270;
  } else if (x < 0) {
    angle = 90;
  } else if (y > 0) {
    angle = 180;
  } else if (y < 0) {
    angle = 0;
  }
  console.log(facing);
  console.log(angle);

  return angle;
}

export const Weapon = makeSprite<WeaponCustomProps,  WeaponState, WebInputs | iOSInputs>({
  init() {
    return {
      rotation: 0,
      startAngle: 0,
      swinging: false
    };
  },
  loop({props, state}) {
    if (props.paused) return state;

    let {swinging, rotation, startAngle} = state;

    // start new swing
    if (props.tryAttack && !swinging) {
      swinging = true;
      startAngle = findAngleFromFacing(props.facing);
      rotation = startAngle;
    }
    if (swinging) {
      rotation += (props.speed * 0.0167);
      if (rotation > state.startAngle + props.swingAngle) {
        rotation = state.startAngle;
        swinging = false;
        // stop wielder from attacking
        props.stopAttacking();
      }
    }
    return {
      ...state,
      rotation,
      swinging,
      startAngle
    }

  },
  render({props, state}) {
    if (!state.swinging) return [];
    return [
      // t.image({fileName: props.filename, width: props.width, height: props.height, anchorX: 0, anchorY: -props.height/2, x: props.mapX - props.cameraX, y: props.mapY - props.cameraY, rotation: state.rotation } ),
      t.rectangle({width: props.width, height: props.height, color: state.swinging ? 'red' : 'grey', anchorX: -(props.width/2), anchorY: 0, x: props.mapX - props.cameraX, y: props.mapY - props.cameraY, rotation: state.rotation})
    ]
  }
})
