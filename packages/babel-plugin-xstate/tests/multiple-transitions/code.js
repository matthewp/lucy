import { machine } from '@lucy/xstate';

const m = machine`
  initial state one {
    foo => two
    bar => three
  }

  state two {}
  state three {}
`;