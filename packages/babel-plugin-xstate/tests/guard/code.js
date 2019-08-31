import { machine } from '@lucy/xstate';

function canProceedFn(ctx) {
  return false;
}

const m = machine`
  guard canProceed = ${canProceedFn}

   initial state start {
    go => canProceed => next
  }

  final state next {}
`;