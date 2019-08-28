import { HOLE, currentNodeSymbol } from './constants.js';
import { createScope } from './scope.js';
import {
  createState,
  inWord,
  resetWord,
  addModifier,
  clearModifiers,
  addBinding,
  startTransition,
  resetTransition,
  isHole,
  addNode,
  endStatement
} from './state.js';
import {
  createAction as createActionNode,
  createAssign as createAssignNode,
  createAssignment as createAssignmentNode,
  createContext as createContextNode,
  createExternal as createExternalNode,
  createGuard as createGuardNode,
  createInvoke as createInvokeNode,
  createState as createStateNode,
  createTransition as createTransitionNode
} from './types.js';

const WHITESPACE = /\s/;
const LETTERS = /[a-z]/i;

const bindings = new Map([
  ['context', {
    create: createContextNode
  }],
  ['var', {
    create: () => { throw new Error('var not yet supported') }
  }],
  ['action', {
    create: createActionNode
  }],
  ['guard', {
    create: createGuardNode
  }],
  ['state', {
    modifiers: ['initial', 'final'],
    create: createStateNode
  }]
]);
const modifiers = new Set(['initial', 'final']);
const methods = new Map([
  ['assign', {
    create: createAssignNode
  }],
  ['invoke', {
    create: createInvokeNode
  }]
])

function endExpression(state, name, onExternal) {
  let expression = state.expressions;
  let externalNode;
  if(isHole(state)) {
    externalNode = createExternalNode(onExternal());
  }
  
  if(expression) {
    state.expressions = '';

    if(bindings.has(expression)) {
      let binding = bindings.get(expression);
      let node = binding.create(name, state, externalNode);
      state.scope.addBinding(name, node);
      addNode(state, node);
      clearModifiers(state);
    } else if(methods.has(expression)) {
      if(externalNode) {
        state.args.push(externalNode);
      }

      let method = methods.get(expression);
      let node = method.create(state);
      addNode(state, node);
    } else {
      throw new Error(`Unknown expression ${expression}`);
    }
  } else if(externalNode) {
    addNode(state, externalNode);
  }
  /*else {
    addExpression(state, name);
  }*/
}

function endTransition(state) {
  if(inWord(state)) {
    state.transitionQueue.push(state.word);
  }

  let transitionEvent = state.transitionEvent;
  let queue = state.transitionQueue;
  resetTransition(state);

  let transitionTo;
  let actions;
  let cond;

  for(let identifier of queue) {
    let identifierNode = state.scope.find(identifier);
    if(identifierNode) {
      if(identifierNode.isAction()) {
        transitionTo = null;
        if(!actions) actions = [];
        actions.push(identifier);
      } else if(identifierNode.isGuard()) {
        cond = identifier;
      } else if(identifierNode.isState()) {
        transitionTo = identifier;
      } else {
        throw new Error(`Node type ${identifierNode.type} not supported in transitions.`);
      }
    } else {
      transitionTo = identifier;
    }
  }

  let node = createTransitionNode(transitionEvent, transitionTo, actions, cond);
  addNode(state, node);
}

function assignmentNodes(assignment) {
  return Object.create(Object.prototype, {
    [currentNodeSymbol]: {
      enumerable: false,
      value() {
        return assignment;
      }
    },
    push: {
      enumerable: true,
      value(val) {
        let hasPushedLeft = !!assignment.left;
        assignment[hasPushedLeft ? 'right' : 'left'] = val;
      }
    }
  });
}

function parse(input, onExternal) {
  let current = 0;
  let length = input.length;
  let char;

  let state = createState();
  let body = state.nodes;

  function isNewLine() {
    return char === '\n';
  }

  function peek() {
    return input[current + 1];
  }

  function proceed() {
    state.column++;
    return input[++current];
  }

  function proceedLine() {
    state.column = 0;
    state.line++;
    return input[++current];
  }

  createScope(state);

  while(current < length) {
    char = input[current];

    // Newlines
    if(isNewLine()) {
      if(state.inTransition) {
        endTransition(state);
      } else {
        endExpression(state, state.word, onExternal);
        endStatement(state);
      }

      resetWord(state);
      proceedLine();
      continue;
    }

    // Whitespace
    if(WHITESPACE.test(char)) {
      if(inWord(state)) {
        let word = state.word;

        if(isHole(state)) {
          // TODO should we be doing something with this?
        } else if(modifiers.has(word)) {
          addModifier(state, word);
        } else if(bindings.has(word)) {
          //let node = bindings.get(word).create(word, state);
          addBinding(state, word);
        } else if(state.inTransition) {
          state.transitionQueue.push(word);
          resetWord(state);
        } else if(methods.has(word)) {
          addBinding(state, word);
          state.inMethodInvocation = true;
          state.args = [];
        } else if(state.inMethodInvocation) {
          state.args.push(word);
        }
        else {
          //endExpression(state, word);
        }
      }

      proceed();
      continue;
    }

    // Comments
    if(char === '/' && peek() === '/') {
      current++;
      while(!isNewLine()) {
        char = proceed();
      }
      continue;
    }

    // Begin new scope
    if(char === '{') {
      endExpression(state, state.word, onExternal);
      resetWord(state);
      createScope(state);
      let currentNode = state.lastNode();
      let newNodes = currentNode.children;
      state.parentNodes = state.nodes;
      state.parentNodeMap.set(newNodes, state.parentNodes);
      state.nodes = newNodes;
    }

    // End scope
    if(char === '}') {
      state.scope = state.scope.parent;
      state.nodes = state.parentNodes;
      state.parentNodes = state.parentNodeMap.get(state.nodes)|| null;
    }

    // Special case holes
    if(char === '[') {
      let nextIndex = current + HOLE.length;
      let value = input.slice(current, nextIndex);
      if(value === HOLE) {
        state.word = value;
        current = nextIndex;
        continue;
      }
    }

    // Transitions
    if(char === '=') {
      if(peek() === '>') {
        startTransition(state);
        proceed();
        proceed();
        continue;
      } else {
        let node = createAssignmentNode();
        addNode(state, node);
        state.parentNodes = state.nodes;
        state.nodes = assignmentNodes(node);
        endExpression(state, state.word, onExternal);
      }
    }

    // Letters
    if(LETTERS.test(char)) {
      let value = '';

      while(LETTERS.test(char)) {
        value += char;
        char = proceed();
      }

      state.word = value;
      continue;
    }

    proceed();
  }

  return {
    body
  };
}

export { parse };