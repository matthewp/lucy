
module.exports = createConfig;

function createConfig(t, ast) {
  let id = t.stringLiteral('unknown');
  let context = t.objectExpression([]);

  let configProps = [
    t.objectProperty(t.identifier('id'), id),
    t.objectProperty(t.identifier('context'), context)
  ];

  let optionsProps = [];

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
            let transProps = [
              t.objectProperty(t.identifier('target'),
                t.stringLiteral(child.target))
            ];


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
  
  let config = t.objectExpression(configProps);
  let options = t.objectExpression(optionsProps);

  return [config, options];

  /*

  let config = {
    id: 'unknown',
    context: {},
    states: {}
  };

  let options = {
    actions: {},
    guards: {}
  };

  function addGuard(node) {
    options.guards[node.name] = node.getValue();
  }

  function addAction(actionNode, rightNode) {
    let value = actionNode.getValue();
    if(value && value.isAssign && value.isAssign()) {
      value = assign({
        [rightNode.property]: rightNode.value.value
      });
    }

    options.actions[actionNode.name] = value;
  }

  function process(config, nodes) {
    for(let node of nodes) {
      if(node.isState()) {
        let state = {
          on: {},
          entry: []
        };
  
        for(let child of node.children) {
          if(child.isTransition()) {
            let transition;
            if(child.actions) {
              transition = {
                actions: Array.from(child.actions),
                cond: child.cond
              };
  
              if(child.target) {
                transition.target = child.target;
              }
            } else {
              transition = {
                target: child.target,
                cond: child.cond
              }
            }
  
            if(state.on[child.event]) {
              if(Array.isArray(state.on[child.event])) {
                state.on[child.event].push(transition);
              } else {
                let e = state.on[child.event];
                state.on[child.event] = [e, transition];
              }
            } else {
              state.on[child.event] = transition;
            }
          } else if(child.isTransitionAction()) {
            state[child.transitionType].push(child.name);
          } else if(child.isInvoke()) {
            let invoke = {
              src: child.value.getValue()
            };
            for(let { event, target } of child.children) {
              invoke[invokeEventMap.get(event)] = { target };
            }
            state.invoke = invoke;
          } else if(child.isState()) {
            process(state, [child]);
          } else {
            throw new Error('Unknown child of state: ' + child.type);
          }
        }
  
        if(node.final) {
          state.type = 'final';
        }

        if(!config.states) {
          config.states = {};
        }
  
        config.states[node.name] = state;
  
        if(node.initial) {
          config.initial = node.name;
        }
      } else if(node.isAction()) {
        let actionValue = node.isAssignAction() ? assign({
          [node.assign]: node.assignCallback
        }) : node.value; // TODO we don't support non-assigns yet.
        options.actions[node.name] = actionValue;
      } else if(node.isContext()) {
        config.context = node.getValue();
      } else if(node.isGuard()) {
        addGuard(node);
      } else if(node.isAssignment()) {
        if(node.left.isGuard()) {
          addGuard(node.left);
        } else if(node.left.isAction()) {
          addAction(node.left, node.right); 
        }
      } else {
        throw new Error('Unknown type ' + node.type);
      }
    }
  }

  process(config, ast.body);

  return [config, options];
  */
}