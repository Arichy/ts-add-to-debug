# ts-debugger README

This is a simple extension to auto add a configuration to vscode launch.json for debugging a typescript file.
### You need to install `typescript`, `ts-node`, `tsconfig-paths` for real debugging.

usage: run commant `ts-add-to-debug` then input the name. It will add an object as follow to `root/.vscode/launch.json` (create if not exists).

``` javascript
 {
    type: "node",
    request: "launch",
    name: "this is the name you input"
    skipFiles: ["<node_internals>/**"],
    program: "this is file absolute path"
    runtimeArgs: ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
  }
```