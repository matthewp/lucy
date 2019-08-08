import { machine } from '../dist/lucy-xstate.js';
import { interpret } from '../../../node_modules/xstate/dist/xstate.web.js';

function withService(machine, cb) {
  const service = interpret(machine).start();
  cb(service);
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