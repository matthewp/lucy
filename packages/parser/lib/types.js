const type = {
  isEvent() {
    return this.type === 'event';
  },
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
  isTransitionAction() {
    return this.type === 'transition-action';
  },
  isContext() {
    return this.type === 'context';
  },
  isInvoke() {
    return this.type === 'invoke';
  }
};

function valueEnumerable(value) {
  return {
    enumerable: true,
    value
  };
}

function extendType(typeName, desc) {
  desc.type = valueEnumerable(typeName);
  return Object.create(type, desc);
}

const eventType = extendType('event', {});
const actionType = extendType('action', {});
const stateType = extendType('state', {});
const guardType = extendType('guard', {});
const transitionType = extendType('transition', {});
const transitionActionType = extendType('transition-action', {});
const contextType = extendType('context', {});
const invokeType = extendType('invoke', {});

export function createEvent(name) {
  return Object.create(eventType, {
    name: valueEnumerable(name)
  });
}

export function createAction(name, assign) {
  return Object.create(actionType, {
    name: valueEnumerable(name),
    assign: valueEnumerable(assign)
  });
}

export function createState(name, initial = false) {
  return Object.create(stateType, {
    name: valueEnumerable(name),
    initial: valueEnumerable(initial),
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

export function createTransitionAction(name, type) {
  return Object.create(transitionActionType, {
    name: valueEnumerable(name),
    transitionType: valueEnumerable(type)
  });
}

export function createContext() {
  return Object.create(contextType);
}

export function createInvoke(fn) {
  return Object.create(invokeType, {
    callback: valueEnumerable(fn),
    children: valueEnumerable([])
  });
}