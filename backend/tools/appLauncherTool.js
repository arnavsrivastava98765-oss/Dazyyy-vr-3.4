const { exec } = require('child_process');
const path = require('path');
const os = require('os');

const APP_ALIASES = {
  notepad: 'notepad.exe',
  calculator: 'calc.exe',
  calc: 'calc.exe',
  chrome: 'start chrome',
  browser: 'start msedge',
  edge: 'start msedge',
  explorer: 'explorer.exe',
  files: 'explorer.exe',
  file_explorer: 'explorer.exe',
  terminal: 'start wt.exe || start powershell.exe',
  powershell: 'start powershell.exe',
  cmd: 'start cmd.exe',
  vscode: 'code',
  code: 'code',
  spotify: 'start spotify:',
  taskmanager: 'taskmgr.exe',
  task_manager: 'taskmgr.exe',
  settings: 'start ms-settings:',
  desktop: `explorer.exe "${path.join(os.homedir(), 'Desktop')}"`,
  downloads: `explorer.exe "${path.join(os.homedir(), 'Downloads')}"`,
  documents: `explorer.exe "${path.join(os.homedir(), 'Documents')}"`,
  workspace: `explorer.exe "${path.join(os.homedir(), 'DazyyyWorkspace')}"`
};

const appLauncherSchema = {
  type: 'function',
  function: {
    name: 'launch_application',
    description: 'Launch an application, system utility, or folder on the user\'s Windows laptop (e.g., notepad, calculator, chrome, vscode, spotify, taskmanager, settings, explorer).',
    parameters: {
      type: 'object',
      properties: {
        appName: {
          type: 'string',
          description: 'The name of the app to launch (e.g. "notepad", "calculator", "chrome", "vscode", "spotify", "explorer", "settings", "taskmanager", or any executable command).'
        },
        targetPath: {
          type: 'string',
          description: 'Optional file or folder path or URL to open with the application.'
        }
      },
      required: ['appName']
    }
  }
};

async function executeAppLauncher({ appName = '', targetPath = '' } = {}) {
  const normalized = appName.toLowerCase().trim();
  let cmd = APP_ALIASES[normalized] || appName;

  if (targetPath) {
    cmd = `${cmd} "${targetPath}"`;
  }

  return new Promise(resolve => {
    exec(cmd, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          status: 'error',
          message: `Failed to launch ${appName}: ${error.message}`
        });
      } else {
        resolve({
          status: 'success',
          message: `Successfully launched ${appName} on your laptop.`,
          output: stdout.trim()
        });
      }
    });
  });
}

module.exports = {
  appLauncherSchema,
  executeAppLauncher
};
