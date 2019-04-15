/**
 * A performant way to find the appropriate line for the given position.
 *
 * This is key to making the yaml line mapping performant.
 */
export const lineForPosition = (pos: number, lines: number[], start: number = 0, end?: number): number => {
  // position 0 is always line 0
  if (pos === 0 || lines.length === 0 || pos < lines[0]) {
    return 0;
  }

  // start with max range, 0 - lines.length
  if (typeof end === 'undefined') {
    end = lines.length;
  }

  // target should be the halfway point between start and end
  const target = Math.floor((end - start) / 2) + start;
  if (pos >= lines[target] && !lines[target + 1]) {
    return target + 1;
  }

  // if pos is between target and the next line's position, we're good!
  const nextLinePos = lines[Math.min(target + 1, lines.length)];

  if (pos === lines[target]) {
    return target;
  }

  if (pos >= lines[target] && pos <= nextLinePos) {
    if (pos === nextLinePos) {
      return target + 2;
    }

    return target + 1;
  }

  // if pos is above the current line position, then we need to go "up"
  if (pos > lines[target]) {
    return lineForPosition(pos, lines, target + 1, end);
  } else {
    // else we take the bottom half
    return lineForPosition(pos, lines, start, target - 1);
  }
};
