import type { Node } from './types.js';
import type { State } from './state.js';

type ScopeBaseType = {
  addBinding: (arg0: string, arg1: Node) => void;
  find: (arg0: string) => Node | null;
}

let scopeBase = Object.create(Object.prototype, {
  addBinding: {
    value(name: string, node: Node) {
      this.bindings.set(name, node);
    }
  },
  find: {
    value(identifier: string) {
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
}) as ScopeBaseType;

export type Scope = typeof scopeBase & {
  bindings: Map<string, Node>;
  parent: Scope | null;
}

export function createScope(state: State): void {
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