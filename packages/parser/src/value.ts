import type { ExternalNode, Node } from './types.js';

const values = new WeakMap();

export function setValue(node: Node, nodeWithValue: ExternalNode | Node) {
  let value;
  if(nodeWithValue.isExternal()) {
    value = (nodeWithValue as ExternalNode).value;
  } else if(nodeWithValue.isAssign()) {
    value = nodeWithValue;
  } else {
    throw new Error('Cannot assign value from ' + nodeWithValue.type);
  }

  values.set(node, value);
}

export function getValue(node: Node) {
  if(values.has(node)) {
    return values.get(node);
  }
  return undefined;
}