/**
 * @typedef { import('xstate').MachineConfig } MachineConfig
 * @typedef { import('xstate').MachineOptions } MachineOptions
 * 
 * @typedef { import('@lucy/parser').ActionNode } ActionNode
 * @typedef { import('@lucy/parser').GuardNode } GuardNode
 */

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

  /**
   * 
   * @param {GuardNode} node 
   */
  function addGuard(node) {
    options.guards[node.name] = node.getValue();
  }

  /**
   * Add an action
   * @param {ActionNode} actionNode 
   * @param {*} rightNode 
   */
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
              transition = {};

              if(child.actions) {
                transition.actions = Array.from(child.actions);
              }

              if(child.cond) {
                transition.cond = child.cond;
              }
  
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
          } else if(child.isInvoke()) {
            let invoke = {
              src: child.value.getValue()
            };
            for(let { actions, event, target } of child.children) {
              invoke[invokeEventMap.get(event)] = { target, actions };
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
      } else if(node.isContext()) {
        config.context = node.getValue();
      } else if(node.isGuard()) {
        /** @type {GuardNode} */
        let guardNode = node;
        addGuard(guardNode);
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
}

function machineConfig(...args) {
  let ast = parseTemplate(...args);
  return createConfig(ast);
}

/**
 * 
 * @param  {string[]} strings
 * @param  {...any} values 
 */
function machine(...args) {
  let [config, options] = machineConfig(...args)
  return Machine(config, options);
}

export {
  machine
};