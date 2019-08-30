import { machine } from '@lucy/xstate';

const m = machine`
   state enabled {
    toggle => disabled
  }

  initial state disabled {
    toggle => enabled
  }
`;