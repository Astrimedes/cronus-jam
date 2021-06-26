import { Device } from "@replay/core";
import { vecDistance, vecNormalize } from "math2d";
// import { normalizeDiagonal } from "../mathUtil";

type vector2 = {
  x: number;
  y: number;
}

type objSize ={
  width: number;
  height: number;
}

type levelRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function seek(myPos: vector2, targetPos: vector2, senseRange: number, minDistance: number, moveRate: number, size: objSize, device: Device) {
  let move = {x: 0, y: 0};

  // check (manhattan) distance to player
  const distance = vecDistance(myPos, targetPos);
  if (distance < minDistance) return move;
  if (distance < moveRate) {
    move.x = targetPos.x - myPos.x;
    move.y = targetPos.y - myPos.y;
    return move;
  }

  if (distance < senseRange) {
    const diffX = targetPos.x - myPos.x;
    const diffY = targetPos.y - myPos.y;

    const min = 1;

    move.x = Math.abs(diffX) > min ? Math.sign(diffX) : 0;
    move.y =  Math.abs(diffY) > min ? Math.sign(diffY) : 0;
    if (move.x != 0 && move.y != 0) {
       move.x = Math.abs(diffY) > (Math.abs(diffX) * 4) ? 0 : move.x;
       move.y = Math.abs(diffX) > (Math.abs(diffY) * 4) ? 0 : move.y;
    }
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

  // normalizeDiagonal(move);
  if (move.x || move.y) {
    move = vecNormalize(move);
    move.x *= moveRate;
    move.y *= moveRate;
  }

  return move;
}

/**
 * Adjust the pos to keep in bounds
 * @param pos position vector - mutated in fn
 * @param levelBounds object with level boundaries/rectangle defined
 */
export function keepInBounds(myPos: vector2, size: objSize, boundaries: levelRect): vector2 {
  const hw = size.width / 2;
  const hh = size.height / 2;

  // keep in bounds
  if (myPos.x + hw > boundaries.right) {
    myPos.x = boundaries.right - hw - 1;
  } else if (myPos.x - hw < boundaries.left) {
    myPos.x = boundaries.left + hw + 1;
  }
  if (myPos.y + hh > boundaries.top) {
    myPos.y = boundaries.top - hh - 1;
  } else if (myPos.y - hh < boundaries.bottom) {
    myPos.y = boundaries.bottom + hh + 1;
  }

  return myPos;
}
