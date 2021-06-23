import { makeSprite, t } from "@replay/core";
import { iOSInputs } from "@replay/swift";
import { WebInputs } from "@replay/web";

type TitanState = {
}

type TitanProps = {
  weapon: null;
  size: number;
  color: string;
  name: string;
  mapX: number,
  mapY: number,
  cameraX: number,
  cameraY: number
}

export const Titan = makeSprite<TitanProps,  TitanState, WebInputs | iOSInputs>({
  init({props}) {
    return {
      weapon: props.weapon,
      size: props.size,
      color: props.color
    };
  },
  render({props}) {
    return [
      t.circle({radius: props.size, color: props.color, x: props.mapX - props.cameraX, y: props.mapY - props.cameraY}),
      t.text({text: props.name, color: props.color, x: props.mapX - props.cameraX, y: (props.mapY + props.size + 2) - props.cameraY})
    ]
  }
});
