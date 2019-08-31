import { machine } from '@lucy/xstate';

let causeHavok = () => Promise.reject(new Error('oh no'));

let asyncMachine = machine`
  initial state start {
    invoke ${causeHavok} {
      done => pass
      error => fail
    }
  }

  state pass {}
  state fail {}
`;
