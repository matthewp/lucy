import { HOLE } from './constants.js';
import { parse } from './parser2.js';

function parseTemplate(strings: string[], ...args: string[]) {
  let string = strings.join(HOLE);
  let holeIndex = 0;
  let ast = parse(string, () => {
    let index = holeIndex;
    holeIndex++;
    return args[index];
  });

  return ast;
}

export {
  parseTemplate
};