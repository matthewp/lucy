const { parseTemplate } = require('@lucy/parser');
const createConfig = require('../create-config.js');

function isMachine(t, tag) {
  return t.isIdentifier(tag) && tag.name === 'machine';
}

function transform(t, path) {
  let {
    quasi: { quasis, expressions }
  } = path.node;

  let strings = quasis.map(node => node.value.cooked);
  let args = expressions;

  let lucyAst = parseTemplate(strings, ...args);
  let [configAst, optionsAst] = createConfig(t, lucyAst);

  let machineArgs = [ configAst ];

  if(optionsAst) {
    machineArgs.push(optionsAst);
  }

  path.replaceWith(t.callExpression(t.identifier('Machine'), machineArgs));
}

module.exports = function(t, path, state) {
  if(state.lucyXstateImport && isMachine(t, path.node.tag)) {
    transform(t, path);
  }
};