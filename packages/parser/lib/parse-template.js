import { HOLE } from './constants.js';
import { parse } from './parser.js';

function parseTemplate(strings, ...args) {
  let string = strings.join(HOLE);
  let holeIndex = 0;
  let ast = parse(string, node => {
    let index = holeIndex;
    holeIndex++;
    return args[index];
  });

  return ast;
}

export {
  parseTemplate
};