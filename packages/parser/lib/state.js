import { HOLE, currentNodeSymbol } from './constants.js';
import { setValue } from './value.js';

const stateProto = {
  currentNode() {
    let nodes = this.nodes;
    let fn = nodes[currentNodeSymbol];
    if(fn) {
      return fn();
    }
    return null;
  },
  lastNode() {
    let nodes = this.nodes;
    let lastIndex = nodes.length - 1;
    return nodes[lastIndex];
  }
};

export function createState() {
  return Object.assign(Object.create(stateProto), {
    nodes: [],
    parentNodes: null,
    parentNodeMap: new WeakMap(),
    scope: null,
    word: '',
    line: 0,
    column: 0,
    modifiers: new Set(),
    expressions: '',
    inTransition: false,
    transitionQueue: null,
    transitionEvent: null,
    inMethodInvocation: false
  });
}

export function resetWord(state) {
  state.word = '';
}

export function inWord(state) {
  return state.word.length > 0;
}

export function isHole(state) {
  return state.word === HOLE;
}

export function addModifier(state, name) {
  state.modifiers.add(name);
}

export function addExpression(state, name) {
  state.expressions = name;
}

export function addBinding(state, name) {
  addExpression(state, name);
}

export function clearModifiers(state) {
  state.modifiers.clear();
}

export function startTransition(state) {
  if(!state.inTransition) {
    let transitionEvent = state.word;
    
    state.inTransition = true;
    state.transitionQueue = [];
    state.transitionEvent = transitionEvent;
    state.expressions = '';
    resetWord(state);
  }
}

export function resetTransition(state) {
  state.inTransition = false;
  state.transitionQueue = null;
  state.transitionEvent = null;
}

export function addNode(state, node) {
  state.nodes.push(node);
}

export function endStatement(state) {
  let node = state.currentNode();
  if(node && node.isAssignment()) {
    state.nodes = state.parentNodes;
    state.parentNodes = null;

    setValue(node.left, node.right);
  }
}