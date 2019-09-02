---
layout: page.njk
title: Babel Plugin XState
tags: page
permalink: babel-plugin-xstate.html
---

A [Babel plugin](https://babeljs.io/docs/en/plugins/) that compiles Lucy machines into [XState](https://xstate.js.org/docs/), for zero-overhead production usage.

Code like:

```js
import { machine } from '@lucy/xstate';
import { interpret } from 'xstate';

const toggleMachine = machine`
   state enabled {
    toggle => disabled
  }

  initial state disabled {
    toggle => enabled
  }
`;

interpret(toggleMachine); // ...
```

Will be transformed into:

```js
import { Machine, interpret } from "xstate";
const toggleMachine = Machine({
  id: "unknown",
  context: {},
  states: {
    "enabled": {
      on: {
        "toggle": {
          target: "disabled"
        }
      }
    },
    "disabled": {
      on: {
        "toggle": {
          target: "enabled"
        }
      }
    }
  },
  initial: "disabled"
});

interpret(toggleMachine); // ...
```

So that Lucy is completely removed. Get the benefits of Lucy's declarative and readable state machines with no runtime cost.

# Installation

Install `@lucy/babel-plugin-xstate` from npm:

```bash
npm install @lucy/babel-plugin-xstate
```

Or with Yarn:

```bash
yarn add @lucy/babel-plugin-xstate
```

# Usage

Include `@lucy/babel-plugin-xstate` as a babel plugin in the normal places to put babel configuration. For example, in a `.babelrc` file:

__.babelrc__

```json
{
  "plugins": [
    "@lucy/babel-plugin-xstate"
  ]
}
```