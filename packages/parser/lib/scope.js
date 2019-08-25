
let scopeBase = Object.create(Object.prototype, {
  addBinding: {
    value(name, node) {
      this.bindings.set(name, node);
    }
  },
  find: {
    value(identifier) {
      let scope = this;
      while(scope) {
        if(scope.bindings.has(identifier)) {
          return scope.bindings.get(identifier);
        }

        scope = scope.parent;
      }
      return null;
    }
  }
});

export function createScope(state) {
  let scope = Object.create(scopeBase, {
    bindings: {
      value: new Map()
    },
    parent: {
      value: state.scope
    }
  });
  state.scope = scope;
}