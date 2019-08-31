
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

  function process(configProps, state, nodes) {
    let statesProps = [];

    for(let node of nodes) {
      if(node.isState()) {
        let stateProps = [];
        let onProps = [];

        if(node.initial) {
          state.initial = node.name;
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
          if(!actionProps) actionProps = [];
          let actionNode = node.left;

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
              t.stringLiteral(node.left.name),
              value
            )
          );

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
  
  let config = t.objectExpression(configProps);
  let options = optionsProps ? t.objectExpression(optionsProps) : null;

  return [config, options, configState];
}