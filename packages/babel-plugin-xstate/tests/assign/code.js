import { machine } from '@lucy/xstate';

const m = machine`
  context ${{ amount: 0 }}

  action addWater = assign amount ${(context) => context.amount + 1}

  initial state start {
    pour => addWater
  }
`;