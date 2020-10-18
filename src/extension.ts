// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
// import { readFileSync, writeFileSync, existsSync } from "fs";
import { readFileSync, pathExistsSync, outputFileSync } from "fs-extra";
import { resolve } from "path";
import * as commentJSON from "comment-json";

function configurationCreator(name: string, program: string) {
  return {
    type: "node",
    request: "launch",
    name,
    skipFiles: ["<node_internals>/**"],
    program,
    runtimeArgs: ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
  };
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "ts-debugger" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "ts-add-to-debug.add",
    async () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      // vscode.window.showInformationMessage("Hello World from ts-debugger!");

      let name = await vscode.window.showInputBox({
        placeHolder:
          "please input the name of debug configuration(default is filepath)",
      });

      if (name === undefined) {
        return;
      }

      const currentFileName = vscode.window.activeTextEditor?.document.fileName;

      const { workspaceFolders } = vscode.workspace;

      if (workspaceFolders && currentFileName) {
        const root = workspaceFolders[0].uri.fsPath;

        const launchPath = resolve(root, ".vscode/launch.json");

        const handleJSON = (json: any): string => {
          const { configurations } = json;

          if (Array.isArray(configurations)) {
            const added = configurations.find(
              (item) => item.program === currentFileName
            );
            if (!added) {
              configurations.push(
                configurationCreator(name || currentFileName, currentFileName)
              );
              vscode.window.showInformationMessage(
                `Successfully add ${currentFileName} to debug configurations`,
                {}
              );
            } else {
              vscode.window.showErrorMessage(
                "This file has already been added"
              );
            }
          }
          const result = commentJSON.stringify(json, null, 2);

          return result;
        };

        const launchFileContent = pathExistsSync(launchPath)
          ? readFileSync(launchPath, "utf-8")
          : commentJSON.stringify({
              configurations: [],
            });

        const launchJSON = commentJSON.parse(launchFileContent);
        const result = handleJSON(launchJSON);

        outputFileSync(launchPath, result);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
