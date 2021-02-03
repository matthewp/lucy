import { Machine } from "xstate";
const m = Machine({
  id: "unknown",
  context: {},
  states: {
    "enabled": {
      on: {
        "toggle": {
          target: "disabled",
          actions: []
        }
      }
    },
    "disabled": {
      on: {
        "toggle": {
          target: "enabled",
          actions: []
        }
      }
    }
  },
  initial: "disabled"
});