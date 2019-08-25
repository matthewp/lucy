import { machine } from './modules.js';
import { withService } from './helpers.js';

export default function() {
  QUnit.module('assign');

  QUnit.test('assigns values to the context', assert => {
    let m = machine`
      context ${{count: 5}}
      action plusOne = assign count ${(ctx) => {
        return ctx.count + 1
      }}

      initial state start {
        add => plusOne => start
      }
    `;

    withService(m, service => {
      assert.equal(service.state.context.count, 5, 'initial value set');
      service.send('add');
      assert.equal(service.state.context.count, 6, 'assignment ran');
      assert.equal(service.state.value, 'start', 'still in the initial state');
    });
  })
}