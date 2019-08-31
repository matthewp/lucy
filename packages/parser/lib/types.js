import { getValue } from './value.js';

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
};

function valueEnumerable(value) {
  return {
    enumerable: true,
    value
  };
}

function valueEnumerableWritable(value) {
  return {
    enumerable: true,
    writable: true,
    value
  };
}

function extendType(typeName, desc) {
  desc.type = valueEnumerable(typeName);
  return Object.create(type, desc);
}

const actionType = extendType('action', {});
const stateType = extendType('state', {});
const guardType = extendType('guard', {});
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
const externalType = extendType('external', {
  getValue: {
    value() {
      return this.value;
    }
  }
});
const assignType = extendType('assign', {});

export function createAction(name) {
  return Object.create(actionType, {
    name: valueEnumerable(name),
    assign: valueEnumerableWritable(null)
  });
}

export function createAssign({ args: [ property, value ] }) {
  return Object.create(assignType, {
    property: valueEnumerable(property),
    value: valueEnumerable(value)
  });
}

export function createState(name, { modifiers }) {
  let initial = modifiers.has('initial');
  let final = modifiers.has('final');

  return Object.create(stateType, {
    name: valueEnumerable(name),
    initial: valueEnumerable(initial),
    final: valueEnumerable(final),
    children: valueEnumerable([])
  });
}

export function createGuard(name) {
  return Object.create(guardType, {
    name: valueEnumerable(name)
  });
}

export function createTransition(event, target, actions, cond) {
  return Object.create(transitionType, {
    event: valueEnumerable(event),
    target: valueEnumerable(target),
    actions: valueEnumerable(actions),
    cond: valueEnumerable(cond)
  });
}

export function createContext(n, s, externalNode) {
  return Object.create(contextType, {
    value: valueEnumerable(externalNode)
  });
}

export function createInvoke({ args: [ value ] }) {
  return Object.create(invokeType, {
    value: valueEnumerable(value),
    children: valueEnumerable([])
  });
}

export function createAssignment() {
  return Object.create(assignmentType, {
    left: valueEnumerableWritable(null),
    right: valueEnumerableWritable(null)
  });
}

export function createExternal(value) {
  return Object.create(externalType, {
    value: valueEnumerable(value)
  });
}