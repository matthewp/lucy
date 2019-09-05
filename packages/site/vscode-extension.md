---
layout: page.njk
title: VSCode Extension
tags: page
permalink: vscode-extension.html
---

Syntax highlighting and code completion for [Lucy](./).

# Installation

Search for Lucy in the vscode marketplace install the extension.

# Highlighting

The VSCode Lucy plugin is able to highlight files with the `.lucy` file extension and JavaScript using the `machine` tagged template function.

For example:

__example.lucy__

```lucy
initial state start {
  complete => end
}

final state end {}
```

And when embedded in JavaScript:

__example.js__

```js
import { machine } from '@lucy/xstate';

const exampleMachine = machine`
  initial state start {
    complete => end
  }

  final state end {}
`;
```

> Important: The tagged template function *must* be named `machine` for highlighting to work in embedded JavaScript.

# Code Completion

Coming Soon!