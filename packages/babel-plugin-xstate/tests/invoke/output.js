import { Machine } from "xstate";

let causeHavok = () => Promise.reject(new Error('oh no'));

let asyncMachine = Machine({
  id: "unknown",
  context: {},
  states: {
    "start": {
      invoke: {
        src: causeHavok,
        onDone: {
          target: "pass"
        },
        onError: {
          target: "fail"
        }
      }
    },
    "pass": {},
    "fail": {}
  },
  initial: "start"
});