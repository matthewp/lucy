---
layout: page.njk
title: Prism Plugin
tags: page
permalink: prism-plugin.html
---

Adds support for Lucy to the [Prism](https://prismjs.com/) syntax highlighter. Highlighting works for Lucy blocks and when Lucy is embedded in JavaScript [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates).

# Installation

Install `@lucy/prism` from npm:

```bash
npm install @lucy/prism
```

Or with Yarn:

```bash
yarn add @lucy/prism
```

# Lucy

To use highlighting with Lucy blocks use the `lucy` export like so:

```js
const { lucy } = require('@lucy/prism');
const Prism = require('prismjs');

lucy(Prism);
```

Once you've down that you can use Prism as normal and code blocks marked with `language-lucy` will be highlighted like so:

```lucy
state writing {
  pause => break
}

state break {
  end => writing  
}
```

# JavaScript

`@lucy/prism` also works withing JavaScript tagged template literals using `machine` like so:

```js
const { lucyTemplate } = require('@lucy/prism');
const Prism = require('prismjs');

lucyTemplate(Prism);
```

Which results in highlighting inside code that uses the `machine` function like so:

```js
import { machine } from '@lucy/xstate';

const codingMachine = machine`
  initial state implement {
    finish => test
  }

  state test {
    finish => release
  }

  final state release {}
`;
```