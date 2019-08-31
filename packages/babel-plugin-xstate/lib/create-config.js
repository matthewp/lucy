
module.exports = createConfig;

function createConfig(t, ast) {
  let configState = {};
  let id = t.stringLiteral('unknown');
  let context = t.objectExpression([]);
  let contextProp = t.objectProperty(t.identifier('context'), context);

  let configProps = [
    t.objectProperty(t.identifier('id'), id),
    contextProp
  ];

  let optionsProps;
  let actionProps;
  let guardProps;

  function addAction(node) {
    if(!actionProps) actionProps = [];
    let actionNode = node.left;
    let { name: actionName } = actionNode;

    let value = actionNode.getValue();
    if(value && value.isAssign && value.isAssign()) {
      configState.needsXstateAssign = true;

      let { property, value: { value: rawValue } } = value;

      value = t.callExpression(t.identifier('assign'), [
        t.objectExpression([
          t.objectProperty(
            t.stringLiteral(property),
            rawValue
          )
        ])
      ]);
    }

    actionProps.push(
      t.objectProperty(
        t.stringLiteral(actionName),
        value
      )
    );
  }

  function addGuard(node) {
    if(!guardProps) guardProps = [];

    let guardNode = node.left;
    let value = guardNode.getValue();

    guardProps.push(
      t.objectProperty(
        t.stringLiteral(guardNode.name),
        value
      )
    );
  }

  function process(configProps, state, nodes) {
    let statesProps = [];

    for(let node of nodes) {
      if(node.isState()) {
        let stateProps = [];
        let onProps = [];

        if(node.initial) {
          state.initial = node.name;
        }

        if(node.final) {
          stateProps.push(
            t.objectProperty(
              t.identifier('type'),
              t.stringLiteral('final')
            )
          );
        }

        for(let child of node.children) {
          if(child.isTransition()) {
            let transProps = [];

            // If there is a target to go to
            if(child.target) {
              transProps.push(
                t.objectProperty(
                  t.identifier('target'),
                  t.stringLiteral(child.target)
                )
              );
            }

            if(child.cond) {
              transProps.push(
                t.objectProperty(
                  t.identifier('cond'),
                  t.stringLiteral(child.cond)
                )
              );
            }

            if(child.actions) {
              transProps.push(
                t.objectProperty(
                  t.identifier('actions'),
                  t.arrayExpression(
                    child.actions.map(str => t.stringLiteral(str))
                  )
                )
              );
            }

            onProps.push(
              t.objectProperty(
                t.stringLiteral(child.event),
                t.objectExpression(transProps)
              )
            );
          }
        }

        // If there are any ons, add them
        if(onProps.length) {
          stateProps.push(
            t.objectProperty(
              t.identifier('on'),
              t.objectExpression(onProps)
            )
          );
        }

        if(stateProps.length) {
          statesProps.push(
            t.objectProperty(
              t.stringLiteral(node.name),
              t.objectExpression(stateProps)
            )
          );
        }
      } else if(node.isAssignment()) {
        if(node.left.isAction()) {
          addAction(node);
        } else if(node.left.isGuard()) {
          addGuard(node);
        }
      } else if(node.isContext()) {
        let context = node.getValue();
        configProps.splice(
          configProps.indexOf(contextProp),
          1,
          t.objectProperty(t.identifier('context'), context)
        )
      }
    }

    if(statesProps.length) {
      configProps.push(t.objectProperty(
        t.identifier('states'),
        t.objectExpression(statesProps)
      ));
    }

    if(state.initial) {
      configProps.push(
        t.objectProperty(t.identifier('initial'), t.stringLiteral(state.initial))
      );
    }
  }

  process(configProps, {}, ast.body);

  if(actionProps) {
    if(!optionsProps) optionsProps = [];
    optionsProps.push(
      t.objectProperty(
        t.identifier('actions'),
        t.objectExpression(actionProps)
      )
    );
  }

  if(guardProps) {
    if(!optionsProps) optionsProps = [];
    optionsProps.push(
      t.objectProperty(
        t.identifier('guards'),
        t.objectExpression(guardProps)
      )
    );
  }
  
  let config = t.objectExpression(configProps);
  let options = optionsProps ? t.objectExpression(optionsProps) : null;

  return [config, options, configState];
}