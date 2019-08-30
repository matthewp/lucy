import { machine } from '@lucy/xstate';
import { interpret } from 'xstate';

const m = machine`
   state enabled {
    toggle => disabled
  }

  initial state disabled {
    toggle => enabled
  }
`;