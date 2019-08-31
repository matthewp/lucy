import { machine } from '@lucy/xstate';

const m = machine`
  action pong = ${() => console.log('something')}

   initial state start {
    ping => pong
  }
`;