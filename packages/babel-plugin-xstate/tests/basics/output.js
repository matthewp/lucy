import { Machine } from "xstate";
const m = Machine({
  id: "unknown",
  context: {},
  states: {
    "enabled": {
      on: {
        "toggle": {
          target: "disabled"
        }
      }
    },
    "disabled": {
      on: {
        "toggle": {
          target: "enabled"
        }
      }
    }
  },
  initial: "disabled"
});