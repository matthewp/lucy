import { machine } from '../dist/lucy-xstate.js';

QUnit.module('@lucy/xstate');

QUnit.test('Creates a machine', assert => {
  let helloMachine = machine`
    initial state start {

    }
  `;

  assert.ok(helloMachine, 'Created a machine');
});
