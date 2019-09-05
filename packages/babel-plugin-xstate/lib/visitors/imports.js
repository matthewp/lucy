
function hasImportName(imp, name) {
  return imp.node.specifiers.some(spec => {
    return spec.imported.name === name;
  });
}

module.exports = function(t, path, state) {
  if(!state.lucyXstateImport) {
    return;
  }

  const { needsXstateAssign } = state;

  function maybeAddAssign(imp) {
    if(needsXstateAssign) {
      let hasAssign = hasImportName(imp, 'assign');
      if(!hasAssign) {
        imp.node.specifiers.push(
          t.importSpecifier(t.identifier('assign'), t.identifier('assign'))
        );
      }
    }
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

    maybeAddAssign({ node: imp });
    state.lucyXstateImport.replaceWith(imp);
  } else {
    let imp = state.xstateImport;
    let hasMachine = hasImportName(imp, 'Machine');

    if(!hasMachine) {
      imp.node.specifiers.unshift(
        t.importSpecifier(t.identifier('Machine'), t.identifier('Machine'))
      );
    }

    maybeAddAssign(imp);

    // Remove @lucy/xstate import
    state.lucyXstateImport.remove();
  }
};