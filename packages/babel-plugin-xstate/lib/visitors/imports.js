
module.exports = function(t, path, state) {
  if(!state.lucyXstateImport) {
    return;
  }

  if(!state.xstateImport) {
    let imp = t.importDeclaration([
        t.importSpecifier(
          t.identifier('Machine'),
          t.identifier('Machine')
        )
      ],
      t.stringLiteral('xstate')
    );

    state.lucyXstateImport.replaceWith(imp);
  } else {
    let imp = state.xstateImport;
    let hasMachine = imp.node.specifiers.some(spec => {
      return spec.imported.name === 'Machine'
    });

    if(!hasMachine) {
      imp.node.specifiers.unshift(
        t.importSpecifier(t.identifier('Machine'), t.identifier('Machine'))
      );
    }

    // Remove @lucy/xstate import
    state.lucyXstateImport.remove();
  }
};