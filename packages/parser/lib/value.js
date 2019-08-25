
const values = new WeakMap();

export function setValue(node, nodeWithValue) {
  let value;
  if(nodeWithValue.isExternal()) {
    value = nodeWithValue.value;
  } else if(nodeWithValue.isAssign()) {
    value = nodeWithValue;
  } else {
    throw new Error('Cannot assign value from ' + nodeWithValue.type);
  }

  values.set(node, value);
}

export function getValue(node) {
  if(values.has(node)) {
    return values.get(node);
  }
  return undefined;
}