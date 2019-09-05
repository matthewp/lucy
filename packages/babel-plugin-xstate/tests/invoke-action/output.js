import { Machine, assign } from "xstate";

let loadAge = async () => 11;

let asyncMachine = Machine({
  id: "unknown",
  context: {
    age: 0
  },
  states: {
    "start": {
      invoke: {
        src: loadAge,
        onDone: {
          target: "pass",
          actions: ["setAge"]
        }
      }
    },
    "pass": {}
  },
  initial: "start"
}, {
  actions: {
    "setAge": assign({
      "age": (c, ev) => ev.data
    })
  }
});