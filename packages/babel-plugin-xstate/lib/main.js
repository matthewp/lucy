const imports = require('./visitors/imports.js');
const taggedTemplates = require('./visitors/tagged-template.js');

module.exports = function({ types: t }) {
  return {
    name: '@lucy/babel-plugin-xstate',
    visitor: {
      Program: {
        exit(path, state) {
          imports(t, path, state);
        }
      },
      ImportDeclaration(path, state) {
        let source = path.get('source.value').node;

        if(source === 'xstate') {
          state.xstateImport = path;
        } else if(source === '@lucy/xstate') {
          state.lucyXstateImport = path;
        }
      },
      TaggedTemplateExpression(path, state) {
        taggedTemplates(t, path, state);
      }
    }
  };
};