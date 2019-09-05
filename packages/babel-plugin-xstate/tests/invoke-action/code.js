import { machine } from '@lucy/xstate';

let loadAge = async () => 11;

let asyncMachine = machine`
  context ${{age: 0}}
  action setAge = assign age ${(c, ev) => ev.data}

  initial state start {
    invoke ${loadAge} {
      done => setAge => pass
    }
  }

  state pass {}
`;
