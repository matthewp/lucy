import type { AssignmentNode, Node, Nodes } from './types.js';
import type { Scope } from './scope.js';
import { HOLE, currentNodeSymbol } from './constants.js';
import { setValue } from './value.js';


interface StateProtoType {
  nodes: Nodes | null;
  currentNode: () => null | Node;
  lastNode: () => Node;
}

const stateProto = {
  currentNode() {
    let nodes = this.nodes;
    let fn = nodes && nodes[currentNodeSymbol];
    if(fn) {
      return fn();
    }
    return null;
  },
  lastNode() {
    let nodes = this.nodes;
    if(!nodes) return null;
    let lastIndex = nodes.length - 1;
    return nodes[lastIndex];
  }
} as StateProtoType;

export type State = typeof stateProto & {
  args: any[];
  parentNodes: Nodes | null;
  parentNodeMap: WeakMap<object, Nodes | null>;
  scope: Scope | null;
  word: string;
  line: number;
  column: number;
  modifiers: Set<string>;
  expressions: string;
  inMethodInvocation: boolean;
  inTransition: boolean;
  transitionQueue: null | string[];
  transitionEvent: null | string;
}

export function createState(): State {
  return Object.assign(Object.create(stateProto), {
    args: [],
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

export function resetWord(state: State) {
  state.word = '';
}

export function inWord(state: State) {
  return state.word.length > 0;
}

export function isHole(state: State) {
  return state.word === HOLE;
}

export function addModifier(state: State, name: string) {
  state.modifiers.add(name);
}

export function addExpression(state: State, name: string) {
  state.expressions = name;
}

export function addBinding(state: State, name: string) {
  addExpression(state, name);
}

export function clearModifiers(state: State) {
  state.modifiers.clear();
}

export function startTransition(state: State) {
  if(!state.inTransition) {
    let transitionEvent = state.word;
    
    state.inTransition = true;
    state.transitionQueue = [];
    state.transitionEvent = transitionEvent;
    state.expressions = '';
    resetWord(state);
  }
}

export function resetTransition(state: State) {
  state.inTransition = false;
  state.transitionQueue = null;
  state.transitionEvent = null;
}

export function addNode(state: State, node: Node) {
  if(state.nodes) {
    state.nodes.push(node);
  }
}

export function endStatement(state: State) {
  let node = state.currentNode();
  if(node && node.isAssignment()) {
    let anode = node as AssignmentNode;
    state.nodes = state.parentNodes;
    state.parentNodes = null;

    if(!anode.left || !anode.right) {
      throw new Error('No right or left');
    }

    setValue(anode.left, anode.right);
  }
}