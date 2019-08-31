import { machine } from '@lucy/xstate';

const m = machine`
  initial state outer {
    initial state innerOne {
      go => innerTwo
    }

    final state innerTwo {}
  }
`;