import { Machine } from "xstate";
const m = Machine({
  id: "unknown",
  context: {
    amount: 0
  },
  states: {
    "start": {
      on: {
        "pour": {
          actions: ["addWater"]
        }
      }
    }
  },
  initial: "start"
}, {
  actions: {
    "addWater": assign({
      "amount": context => context.amount + 1
    })
  }
});