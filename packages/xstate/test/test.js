import { machine } from './modules.js';

import actionTests from './action-tests.js';
import assignTests from './assign-test.js';
import guardTests from './guard-test.js';
import invokeTests from './invoke-test.js';
import stateTests from './state-test.js';

QUnit.module('@lucy/xstate', hooks => {
  QUnit.test('Creates a machine', assert => {
    let helloMachine = machine`
      initial state start {
  
      }
    `;
  
    assert.ok(helloMachine, 'Created a machine');
  });

  stateTests();
  invokeTests();
  actionTests();
  assignTests();
  guardTests();
});


