import { machine } from './modules.js';
import { withService } from './helpers.js';

export default function() {
  QUnit.module('state');
    
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

  QUnit.test('initial is used to denote the first state', assert => {
    let m = machine`
      state one {}
      state two {}
      initial state three {}
    `;

    withService(m, service => {
      assert.equal(service.state.value, 'three', 'initial state set');
    });
  });
}