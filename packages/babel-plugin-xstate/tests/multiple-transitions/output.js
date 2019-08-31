import { Machine } from "xstate";
const m = Machine({
  id: "unknown",
  context: {},
  states: {
    "one": {
      on: {
        "foo": {
          target: "two"
        },
        "bar": {
          target: "three"
        }
      }
    },
    "two": {},
    "three": {}
  },
  initial: "one"
});