import { Machine } from "xstate";
const m = Machine({
  id: "unknown",
  context: {},
  states: {
    "one": {
      on: {
        "foo": {
          target: "two",
          actions: []
        },
        "bar": {
          target: "three",
          actions: []
        }
      }
    },
    "two": {},
    "three": {}
  },
  initial: "one"
});