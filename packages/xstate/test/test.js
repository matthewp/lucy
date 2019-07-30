import { machine } from '../bundle.js';

QUnit.module('@lucy/xstate');

QUnit.test('Creates a machine', assert => {
  let helloMachine = machine`
    initial state start {

    }
  `;

  assert.ok(helloMachine, 'Created a machine');
});