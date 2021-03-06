import { Machine } from "xstate";
const m = Machine({
  id: "unknown",
  context: {},
  states: {
    "outer": {
      states: {
        "innerOne": {
          on: {
            "go": {
              target: "innerTwo",
              actions: []
            }
          }
        },
        "innerTwo": {
          type: "final"
        }
      },
      initial: "innerOne"
    }
  },
  initial: "outer"
});