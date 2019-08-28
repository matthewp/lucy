import { machine, Machine } from './modules.js';
import { withService } from './helpers.js';

export default function() {
  QUnit.module('state', hooks => {
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
  
    QUnit.test('States can immediately transition', assert => {
      let m = machine`
        initial state one {
          => two
        }
  
        state two {}
      `;
  
      withService(m, service => {
        assert.equal(service.state.value, 'two', 'went straight to two');
      });
    });

    QUnit.module('Nested');

    QUnit.test('Able to transition', assert => {
      let m = machine`
        initial state outer {
          initial state first {
            next => second
          }

          state second {
            next => first
          }
        }
      `;

      withService(m, service => {
        assert.equal(service.state.value.outer, 'first');
        service.send('next');
        assert.equal(service.state.value.outer, 'second');
        service.send('next');
        assert.equal(service.state.value.outer, 'first');
      });
    });
  });
}