import { machine } from '../dist/lucy-xstate.js';
import { interpret } from '../../../node_modules/xstate/dist/xstate.web.js';

function withService(machine, cb) {
  const service = interpret(machine).start();
  let p = cb(service);
  if(p && p.then)
    return p.then(() => service.stop());
  else
    service.stop();
}

QUnit.module('@lucy/xstate');

QUnit.test('Creates a machine', assert => {
  let helloMachine = machine`
    initial state start {

    }
  `;

  assert.ok(helloMachine, 'Created a machine');
});

QUnit.test('Can change simple states', assert => {
  let toggleMachine = machine`
    initial state enabled {
      toggle => disabled
    }

    state disabled {
      toggle => enabled
    }
  `;

  withService(toggleMachine, service => {
    assert.equal(service.state.value, 'enabled');
    service.send('toggle');
    assert.equal(service.state.value, 'disabled');
    service.send('toggle');
    assert.equal(service.state.value, 'enabled');
  });
});

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