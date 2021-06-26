import { makeSprite, t } from "@replay/core";
import { iOSInputs } from "@replay/swift";
import { WebInputs } from "@replay/web";

type DialogState = {
}

export type DialogCustomProps = {
  width?: number;
  height?: number;
  text: string;
  bgColor?: string;
  textColor?: string;
  minTime?: number;
  dismissDialog: () => void;
}

export const Dialog = makeSprite<DialogCustomProps,  DialogState, WebInputs | iOSInputs>({
  init({props, device }) {
    device.timer.start(() => {
      props.dismissDialog();
    }, props.minTime || 500);

    return {
      dismissable: false
    };
  },
  render({props, device}) {
    return [
      t.rectangle({width: props.width || device.size.width * 0.75, height: props.height || device.size.height * 0.5, x: 0, y: 0, color: props.bgColor || 'grey', }),
      t.text({text: props.text, color: props.textColor || 'white', x: 0, y: 0}),
    ]
  }
});
