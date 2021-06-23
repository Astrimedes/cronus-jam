import { Device } from "@replay/core";
import { normalizeDiagonal } from "../mathUtil";

type vector2 = {
  x: number;
  y: number;
}

export function seek(myPos: vector2, targetPos: vector2, senseRange: number, moveRate: number, device: Device) {
  const move = {x: 0, y: 0};

  // check (manhattan) distance to player
  const distance = Math.abs(targetPos.x - myPos.x) + Math.abs(targetPos.y - myPos.y);
  if (distance < (moveRate * 0.75)) {
    move.x = targetPos.x - myPos.x;
    move.y = targetPos.y - myPos.y;
    return move;
  }

  if (distance < senseRange || distance > (senseRange * 10)) {
    move.x = Math.sign(targetPos.x - myPos.x);
    move.y = Math.sign(targetPos.y - myPos.y);
  } else {
    // move randomly
    const choice = device.random();
    if (choice < 0.334) {
      move.x += device.random() > 0.5 ? 1 : -1;
    } else if (choice < 0.667) {
      move.y += device.random() > 0.5 ? 1 : -1;
    } else {
      move.x += device.random() > 0.5 ? 1 : -1;
      move.y += device.random() > 0.5 ? 1 : -1;
    }
  }

  normalizeDiagonal(move);
  move.x *= moveRate;
  move.y *= moveRate;

  return move;
}
