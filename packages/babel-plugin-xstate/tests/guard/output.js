import { Machine } from "xstate";

function canProceedFn(ctx) {
  return false;
}

const m = Machine({
  id: "unknown",
  context: {},
  states: {
    "start": {
      on: {
        "go": {
          target: "next",
          cond: "canProceed",
          actions: []
        }
      }
    },
    "next": {
      type: "final"
    }
  },
  initial: "start"
}, {
  guards: {
    "canProceed": canProceedFn
  }
});