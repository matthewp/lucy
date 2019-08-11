import { machine } from './modules.js';
import { withService } from './helpers.js';

export default function() {
  QUnit.module('invoke');

  QUnit.test('invoked actions change state when done', async assert => {
    let p = Promise.resolve(2);

    let asyncMachine = machine`
      initial state start {
        invoke ${() => p} {
          done => fin
        }
      }

      state fin {}
    `;

    await withService(asyncMachine, async service => {
      await p;
      assert.equal(service.state.value, 'fin', 'now finished');
    });
  });

  QUnit.test('invoked actions can go to error state', async assert => {
    let causeHavok = () => Promise.reject(new Error('oh no'));

    let asyncMachine = machine`
      initial state start {
        invoke ${causeHavok} {
          done => pass
          error => fail
        }
      }

      state pass {}
      state fail {}
    `;

    await withService(asyncMachine, async service => {
      await Promise.resolve();
      assert.equal(service.state.value, 'fail', 'it failed');
    });
  });
}
