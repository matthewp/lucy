import { machine } from './modules.js';
import { withService } from './helpers.js';

export default function() {
  QUnit.module('action');

  QUnit.test('actions after an event take place after the event', assert => {
    let count = 0;

    let m = machine`
      action pong = ${() => count++}

      initial state start {
        ping => pong
      }
    `;

    withService(m, service => {
      assert.equal(count, 0);
      service.send('ping');
      assert.equal(count, 1);
      service.send('ping');
      assert.equal(count, 2);
    });
  });
}