---
layout: page.njk
title: Language Overview
tags: page
permalink: language-overview.html
---

This page gives an overview of the language. Once you understand the few concepts on this page you'll be able to build any type of machine needed.

__Table of Contents__

@[toc]

# State

A Finite State Machine is made up of states that the machine can transition between. This classic stop light example shows the different states of this machine:

```lucy
state red {
}

state green {
}

state yellow {
}
```

Adding transitions allows us to now change states.

```lucy
state red {
  next => green
}

state green {
  next => yellow
}

state yellow {
  next => red
}
```

States have 2 important modifiers, `initial` and `final`. The __initial__ state is the state the application will be in when the machine starts. We can update our stoplight machine to start off in the red light:

```lucy
initial state red {
  next => green
}

state green {
  next => yellow
}

state yellow {
  next => red
}
```

If no __initial__ state is provided the runtime will usually use the first state declared. Defining your initial state is still good practice for readability.

Conversely a machine can have a __final__ state, which is a state in which the machine cannot transition out of.

Not all machines need a final state. The stoplight example does not, because we want the stoplight to continue indefinitely. Machines with final states are usually those with a limited lifespan.

This example is a washing machine, which starts, washes, and finishes.

```lucy
action beep

initial state off {
  start => wash
}

state wash {
  done => rinse
}

state rinse {
  done => dry
}

state dry {
  done => clean
}

final state clean {
  => beep
}
```

## Nested state

States can contain their own states. This allows better grouping of states within your application. Just as with top-level states, nested states can be marked as __initial__ and __final__.

```lucy
state lunch {
  initial state cook {
    done => eating
  }

  state eat {
    done => loadDiswasher
  }

  final state loadDiswasher {}
}
```

# Transitions

In Lucy you can define a transition between states. The fat-arrow (`=>`) symbol is used to pipe from one step to the other. A transition can contain:

* __events__: Sent from outside of the machine that start a transition.
* __guards__: A way to stop a transition from occuring.
* __actions__: Side-effects that run during the transition.
* __states__: The desired state at the end of the transition.

The ordering of these steps is determined by the runtime, but most of the time the ordering should be: `event => action or guard => state`.

Many transitions don't contain actions or guards, and are simply a mapping of events to states. For example this toggle machine:

```lucy
initial state disabled {
  toggle => enabled
}

state enabled {
  toggle => disable
}
```

Here the event `toggle` is send outside of the machine and immediately transitions to the next state (either `enabled` or `disabled`).

## Immediate transitions

If no __event__ is provided for a transition it will occur immediately when the state is entered. Here's a machine for a daily schedule where breakfast is skipped.

```lucy
initial state sleep {
  wake => breakfast
}

state breakfast {
  => working
}

state working {
  // More stuff here...
}
```

In the above example the `breakfast` state immediate transitions to `working`.

Immediate transitions are good for modeling states that only exist for side-effects, such as assigning to the context. The following machine is used to display an error message when a form contains an error, and to clear the error when not.

```lucy
action clearError
action updateSubmissionError
action thankUser

guard hasError
guard canSubmit

initial state form {
  keyup => input
  submit => complete
}

state input {
  => hasError => clearError => form
  => form
}

state validate {
  => canSubmit => complete
  => updateSubmissionError => form
}

final state complete {
  => thankUser
}
```

This machine allows you to fill out a login form. When the user `submit`s the form it goes into a `validate` state, which checks if it can be submitted (if there are no errors). If that condition does not pass it moves to the next __immediate transition__ which updates the error message.

Whenever the user starts typing again the error message is cleared out and isn't shown until the form is submitted again.

When the user submits the form and the `canSubmit` guard passes, it moves to the `complete` state where it immediately runs the `thankUser` action.

# Context

Finite state machines allow modeling known states, but real applications contain data such as from user input that must be placed outside of the states. Statecharts include [extended state](https://en.wikipedia.org/wiki/UML_state_machine#Extended_states) as an answer for this.

In Lucy extended state is modeled as __context__. An initial context value can be declared for a machine, and assignment actions can modify the context.

```js
import { machine } from '@lucy/xstate';

const nameMachine = machine`
  context ${ { name: 'world' } }

  state form {
    // Transitions here might modify the context  
  }
`;
```

# Actions

An __action__ is a side-effect taken within a transition. The following is an action that logs whenever the `increment` event is sent through the machine:

```js
import { machine } from '@lucy/xstate';

const counterMachine = machine`
  action logIncrement = ${() => console.log('Incremented')}

  initial state counter {
    inc => logIncrement
  }
`;
```

## Assign

The __assign__ keyword is used within an action to assign a __context__ value as part of an action. This is useful to keep [extended state](https://en.wikipedia.org/wiki/UML_state_machine#Extended_states).

The above counter machine is missing keeping the count. The following adds an `incrementCount` action with an assignment.

```js
import { machine } from '@lucy/xstate';

const counterMachine = machine`
  context ${ { count: 0 } }

  action logIncrement = ${() => console.log('Incremented')}

  action incrementCount = assign count ${({ count }) => count + 1}

  initial state counter {
    inc => logIncrement => incrementCount
  }
`;
```

Assign takes the signature of `assign prop ${fn}` where `prop` is a property on the __context__ object, and `fn` is a function that returns a new value for `prop`.

# Guards

__Guards__ control the ability to exit or enter a state. In the following example we only want to enter the `submit` state if the machine state is valid.

```lucy
guard invalidPassword

initial state form {
  done => submit
}

final state submit {
  => invalidPassword => form
}
```

We could also model this as part of the form transition. When the `done` event fires, check for the passwords validity before proceeding:

```lucy
guard validPassword

initial state form {
  done => validPassword => submit
}

final state submit {
  // We are all done
}
```

# Comments

Comments can be added using the `//` syntax, as in C-like languages:

```lucy
// Wait for the race to start
initial state waiting {
  // When the gun goes off, start running
  start => running
}

state running {
  // When the race is finished, rest
  finish => rest
}

// When in the rest state the race is over
final state rest {

}
```