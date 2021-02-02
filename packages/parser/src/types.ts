import type { State } from './state.js';
import { getValue } from './value.js';
import { currentNodeSymbol } from './constants.js';

export interface Node {
  type: string; // TODO better type
  assign?: null;
  children?: Nodes;
  isAction: () => boolean;
  isAssignAction: () => boolean;
  isGuard: () => boolean;
  isState: () => boolean;
  isTransition: () => boolean;
  isContext: () => boolean;
  isInvoke: () => boolean;
  isAssignment: () => boolean;
  isExternal: () => boolean;
  isAssign: () => boolean;
  getValue: () => any;
}

const type = {
  isAction() {
    return this.type === 'action';
  },
  isAssignAction() {
    return this.isAction() && !!this.assign;
  },
  isGuard() {
    return this.type === 'guard';
  },
  isState() {
    return this.type === 'state';
  },
  isTransition() {
    return this.type === 'transition';
  },
  isContext() {
    return this.type === 'context';
  },
  isInvoke() {
    return this.type === 'invoke';
  },
  isAssignment() {
    return this.type === 'assignment';
  },
  isExternal() {
    return this.type === 'external';
  },
  isAssign() {
    return this.type === 'assign';
  },
  getValue() {
    return getValue(this);
  }
} as Node;

function valueEnumerable(value: any) {
  return {
    enumerable: true,
    value
  };
}

function valueEnumerableWritable(value: any) {
  return {
    enumerable: true,
    writable: true,
    value
  };
}

function extendType(typeName: string, desc: PropertyDescriptorMap) {
  desc.type = valueEnumerable(typeName);
  return Object.create(type, desc) as Node;
}


const stateType = extendType('state', {});

const transitionType = extendType('transition', {});
const contextType = extendType('context', {
  getValue: {
    value() {
      return this.value.value;
    }
  }
});
const invokeType = extendType('invoke', {});
const assignmentType = extendType('assignment', {});
const assignType = extendType('assign', {});

export type ActionNode = Omit<Node, 'type'> & {
  type: 'action',
  name: string;
  assign: string | null;
};

const actionType = extendType('action', {});

export function createAction(name: string): ActionNode {
  return Object.create(actionType, {
    name: valueEnumerable(name),
    assign: valueEnumerableWritable(null)
  });
}

export function createAssign({ args: [ property, value ] }: State) {
  return Object.create(assignType, {
    property: valueEnumerable(property),
    value: valueEnumerable(value)
  });
}

export function createState(name: string, { modifiers }: { modifiers: Set<'initial' | 'final'> }) {
  let initial = modifiers.has('initial');
  let final = modifiers.has('final');

  return Object.create(stateType, {
    name: valueEnumerable(name),
    initial: valueEnumerable(initial),
    final: valueEnumerable(final),
    children: valueEnumerable([])
  });
}

export type GuardNode = Omit<Node, 'type'> & {
  type: 'guard',
  name: string;
};

const guardType = extendType('guard', {});

export function createGuard(name: string): GuardNode {
  return Object.create(guardType, {
    name: valueEnumerable(name)
  });
}

export function createTransition(event: string, target: string, actions: any[] = [], cond?: string) {
  return Object.create(transitionType, {
    event: valueEnumerable(event),
    target: valueEnumerable(target),
    actions: valueEnumerable(actions),
    cond: valueEnumerable(cond)
  });
}

export function createContext(n: any, s: any, externalNode: ExternalNode) {
  return Object.create(contextType, {
    value: valueEnumerable(externalNode)
  });
}

type InvokeNode = Node & {
  children: Node[]
}

export function createInvoke({ args: [ value ] }: State): InvokeNode {
  return Object.create(invokeType, {
    value: valueEnumerable(value),
    children: valueEnumerable([])
  });
}

export interface AssignmentNode extends Node {
  type: 'assignment';
  left: Node | null;
  right: Node | null;
}

export function createAssignment(): AssignmentNode {
  return Object.create(assignmentType, {
    left: valueEnumerableWritable(null),
    right: valueEnumerableWritable(null)
  });
}

export interface ExternalNode extends Node {
  type: 'external',
  value: any;
  getValue: () => any;
}

const externalType = extendType('external', {
  getValue: {
    value() {
      return this.value;
    }
  }
});

export function createExternal(value: any): ExternalNode {
  return Object.create(externalType, {
    value: valueEnumerable(value)
  });
}

export interface Nodes extends Array<Node> {
  [currentNodeSymbol]: () => Node;
}