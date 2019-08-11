import { machine } from './modules.js';
import { withService } from './helpers.js';

export default function() {
  QUnit.module('guards');

  QUnit.test('Can prevent changing state', assert => {
    let proceed = false;

    let m = machine`
      guard canChange = ${() => proceed}

      initial state one {
        go => canChange => two
      }

      state two {
        go => canChange => one
      }
    `;

    withService(m, service => {
      service.send('go');
      assert.equal(service.state.value, 'one', 'still in one');
      proceed = true;
      service.send('go');
      assert.equal(service.state.value, 'two', 'Now did change');
      proceed = false;
      service.send('go');
      assert.equal(service.state.value, 'two', 'still in two');
    });
  });
};