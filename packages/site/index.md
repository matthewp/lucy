---
layout: index.njk
title: Lucy | A DSL for Finite State Machines
---

A DSL for [finite state machines](https://brilliant.org/wiki/finite-state-machines/) and [statecharts](https://statecharts.github.io/). Declare states and transitions in a format anyone can understand. Compiles to your FSM runtime's native format (currently XState).

A simple toggle machine:

```lucy
initial state active {
  toggle => inactive
}

state inactive {
  toggle => active
}
```

Usually Lucy is used as an embedded language, such as in JavaScript. Lucy works wonderfully with [XState](https://xstate.js.org). Here is a simple counter machine:

```js
import { Fragment } from 'react';
import { useMachine } from '@xstate/react';
import { machine } from '@lucy/xstate';

const counterMachine = machine`
  context ${ { count: 0 } }
 
  action increment = assign count ${({ count }) => count + 1}
  action decrement = assign count ${({ count }) => count - 1}

  guard isNotMax = ${({ count }) => count < 10}
  guard isNotMin = ${({ count }) => count > 0}

  initial state active {
    inc => isNotMax => increment
    dec => isNotMin => decrement
  }
`;

export const Counter = () => {
  const [current, send] = useMachine(counterMachine);
  const { count } = current.context;

  return (
    <Fragment>
      Count: <strong>{count}</strong>

      <button onClick={() => send('inc')}>+ Increment</button>
      <button onClick={() => send('dec')}>- Decrement</button>
    </Fragment>
  );
};
```

## Why a DSL?

Typically we write programs (and components) as a series of mutable variables that are modified over time. Even with a more functional *looking* approach, ultimately it comes down to imperative programming.

This makes it impossible to understand how the application really *works* without understanding all of the code within the program.

Finite state machines (and [startcharts](https://statecharts.github.io/)) allow state to be modeled declaratively. This leads to more readable code, and eliminates the possibility of your application following into a bad state.

__Lucy__ is a [domain-specific language (DSL)](https://en.wikipedia.org/wiki/Domain-specific_language) for state machines. In most FSM libraries you have to model your machine with configuration that difficult to read (config soup). Lucy fixes this with a simplified syntax that includes all of the concepts of statecharts.

Goals are to:

* Allow non-engineers to understand, and even *author* an applications state.
* Provide compile time guarantees that a component's states are all valid.
* Take the lessons from the declarative UI revolution and bring them to application state.
* Make writing application behaviors fun.

## Quick start

First install `@lucy/xstate` and `xstate`:

With npm:

```bash
npm install @lucy/xstate xstate
```

With yarn:

```bash
yarn add @lucy/xstate xstate
```

The toggle demo from [XState's quick start](https://xstate.js.org/docs/#super-quick-start) looks like this:

```js
import { Machine, interpret } from 'xstate';
import { machine } from '@lucy/xstate';

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
const toggleMachine = machine`
  state active {
    toggle => inactive
  }

  initial state inactive {
    toggle => active
  }
`;

// Machine instance with internal state
const toggleService = interpret(toggleMachine)
  .onTransition(state => console.log(state.value))
  .start();
// => 'inactive'

toggleService.send('toggle');
// => 'active'

toggleService.send('toggle');
// => 'inactive'
```

## License

[BSD 2 Clause](https://opensource.org/licenses/BSD-2-Clause)