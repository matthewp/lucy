import { Machine, assign } from 'xstate';
import { parseTemplate } from '@lucy/parser';

const invokeEventMap = new Map([
  ['done', 'onDone'],
  ['error', 'onError']
]);

function createConfig(ast) {
  let config = {
    id: 'unknown',
    context: {},
    states: {}
  };

  let options = {
    actions: {},
    guards: {}
  };

  for(let node of ast.body) {
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
            src: child.callback
          };
          for(let { event, target } of child.children) {
            invoke[invokeEventMap.get(event)] = { target };
          }
          state.invoke = invoke;
        } else {
          throw new Error('Unknown child of state: ' + child.type);
        }
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
      config.context = node.value;
    } else if(node.isGuard()) {
      options.guards[node.name] = node.callback;
    }
  }

  return [config, options];
}

function createFromAST(ast) {
  let [config, options] = createConfig(ast);
  return Machine(config, options);
}

function machine() {
  let ast = parseTemplate.apply(null, arguments);
  return createFromAST(ast);
}

export {
  machine
};