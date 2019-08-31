import { Machine } from "xstate";
const m = Machine({
  id: "unknown",
  context: {},
  states: {
    "start": {
      on: {
        "ping": {
          actions: ["pong"]
        }
      }
    }
  },
  initial: "start"
}, {
  actions: {
    "pong": () => console.log('something')
  }
});