import * as vscode from "vscode";
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

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "ts-add-to-debug.add",
    async () => {
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

export function deactivate() {}
