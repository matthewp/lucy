import {
  createEvent,
  createAction,
  createState,
  createGuard, 
  createTransition,
  createTransitionAction,
  createContext,
  createInvoke
} from './types.js';
import { HOLE } from './constants.js';

const WHITESPACE = /\s/;
const LETTERS = /[a-z]/i;

function parse(input, onHole) {
  let current = 0;
  let nodes = [];
  let body = nodes;
  let length = input.length;
  let char, word;

  function peek() {
    return input[current + 1];
  }

  function isNewLine() {
    return char === '\n';
  }

  function isHole() {
    return word === HOLE;
  }

  let state = {
    scopes: [],
    currentScope: new Map(),

    inWord: false,
    inEvent: false,
    inAssignment: false,
    inGuard: false,

    // Actions
    inAction: false,
    actionName: null,
    inAssign: false,
    assignName: null,

    // Guard
    guardName: null,

    // State
    inInitial: false,
    inState: false,
    inStateBody: false,
    inTransition: false,
    transitionQueue: null,
    transitionEvent: null,
    stateParent: null,

    // Invoke
    inInvoke: false,
    inInvokeBody: false,
    invokeParent: null,

    // Action types
    inTransitionAction: false,
    actionType: null,

    // Context
    inContext: false
  };

  while(current < length) {
    char = input[current];

    // Whitespace
    if(WHITESPACE.test(char)) {
      if(state.inWord) {
        switch(word) {
          case 'event': {
            state.inEvent = true;
            break;
          }
          case 'action': {
            state.inAction = true;
            break;
          }
          case 'guard': {
            state.inGuard = true;
            break;
          }
          case 'initial': {
            state.inInitial = true;
          }
          case 'state': {
            state.inState = true;
            break;
          }
          case 'entry':
          case 'exit': {
            state.inTransitionAction = true;
            state.actionType = word;
            break;
          }
          case 'assign': {
            if(!state.inAction) {
              throw new Error('Expect keyword assign in an action');
            }
            state.inAssign = true;
            break;
          }
          case 'context': {
            state.inContext = true;
            break;
          }
          case 'invoke': {
            state.inInvoke = true;
            break;
          }
          default: {
            if(state.inEvent) {
              let eventNode = createEvent(word);
              nodes.push(eventNode);
              state.currentScope.set(word, eventNode);
              state.inEvent = false;
            } else if(state.inInvoke && !state.inInvokeBody) {
              let fn;
              if(isHole()) {
                fn = onHole();
              } else {
                throw new Error('Expected a function declaration');
              }
              let invokeNode = createInvoke(fn);
              state.invokeParent = nodes;
              nodes.push(invokeNode);
              nodes = invokeNode.children;
            } else if(state.inState && !state.inStateBody) {
              let stateNode = createState(word, state.inInitial);
              state.stateNode = stateNode;
              state.stateParent = nodes;
              nodes.push(stateNode);
              nodes = stateNode.children;
            } else if(state.inGuard) {
              if(state.inAssignment) {
                let guardNode = createGuard(state.guardName);
                if(isHole()) {
                  guardNode.callback = onHole(guardNode);
                }
                nodes.push(guardNode);

                state.currentScope.set(state.guardName, guardNode);
                state.inGuard = false;
                state.inAssignment = false;
                state.guardName = null;
              } else {
                state.guardName = word;
              }
            } else if(state.inAction) {
              if(state.inAssign) {
                if(isHole()) {
                  let actionNode = createAction(state.actionName, state.assignName);
                  actionNode.assignCallback = onHole(actionNode);
                  nodes.push(actionNode);

                  state.currentScope.set(state.actionName, actionNode);
                  state.inAssign = false;
                  state.inAssignment = false;
                  state.inAction = false;
                  state.actionName = null;
                  state.assignName = null;
                } else {
                  state.assignName = word;
                }
              } else {
                state.actionName = word;
              }
              
            } else if(state.inAssignment) {
              throw new Error('Unknown assignment ' + word);
            } else if(state.inTransition) {
              state.transitionQueue.push(word);

              if(isNewLine()) {
                let transitionTo;
                let actions;
                let cond;

                for(let identifier of state.transitionQueue) {
                  if(state.currentScope.has(identifier)) {
                    let identifierNode = state.currentScope.get(identifier);

                    if(identifierNode.isAction()) {
                      transitionTo = null;
                      if(!actions) actions = [];
                      actions.push(identifier);
                    } else if(identifierNode.isGuard()) {
                      cond = identifier;
                    }
                  } else {
                    transitionTo = identifier;
                  }
                }

                nodes.push(createTransition(state.transitionEvent, transitionTo, actions, cond));
                state.inTransition = false;
                state.transitionEvent = null;
                state.transitionQueue = null;
              }
            } else if(state.inTransitionAction) {
              nodes.push(createTransitionAction(word, state.actionType));

              // TODO allow multiple
              state.inTransitionAction = false;
              state.actionType = null;
            } else if(state.inContext) {
              if(word === HOLE) {
                let contextNode = createContext();
                contextNode.value = onHole(contextNode);
                nodes.push(contextNode);
                state.onContext = false;
              }
            }
          }
        }
      }

      state.inWord = false;
      if(isNewLine()) {
        word = null;
      }

      current++;
      continue;
    }

    // Comments
    if(char === '/' && peek() === '/') {
      current++;
      while(!isNewLine()) {
        char = input[++current];
      }
      continue;
    }

    // Letters
    if(LETTERS.test(char)) {
      let value = '';

      while(LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      word = value;
      state.inWord = true;
      continue;
    }

    // Transitions
    if(char === '=') {
      if(peek() === '>') {
        if(state.inInvoke || state.inState) {
          if(!state.inTransition) {
            state.transitionEvent = word || '';
            state.inTransition = true;
            state.transitionQueue = [];
          }
        } else {
          throw new Error('Cannot define transitions outside of state');
        }

        current++;
      } else {
        state.inAssignment = true;
      }

      current++;
      continue;
    }

    if(char === '{') {
      if(state.inInvoke) {
        state.inInvokeBody = true;
      } else if(state.inState) {
        state.inStateBody = true;
      } else {
        throw new Error('Unexpected token {');
      }
      
      current++;
      continue;
    }

    if(char === '}') {
      if(state.inInvoke) {
        nodes = state.invokeParent;
        state.inInvoke = false;
        state.inInvokeBody = false;
        state.invokeParent = null;
      } else if(state.inState) {
        // Reset the current node
        nodes = state.stateParent;
        state.stateParent = null;
        state.stateNode = null;
        state.inState = false;
        state.inStateBody = false;
        state.inInitial = false;
      } else {
        throw new Error('Unexpected token }');
      }



      current++;
      continue;
    }

    current++;
  }

  return {
    body
  };
}

export {
  parse
};