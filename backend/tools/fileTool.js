const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { WORKSPACE_DIR, ensureWorkspace, getPersonality } = require('../personality');

// Safe resolve: when fullLaptopAccess is granted, supports absolute & home paths; otherwise restricts to ~/DazyyyWorkspace
function resolveSafePath(relativePath = '') {
  ensureWorkspace();
  const personality = getPersonality();
  if (personality && personality.fullLaptopAccess) {
    if (path.isAbsolute(relativePath)) return relativePath;
    if (relativePath.startsWith('~')) {
      return path.join(require('os').homedir(), relativePath.slice(1));
    }
    return path.resolve(WORKSPACE_DIR, relativePath);
  }

  const resolved = path.resolve(WORKSPACE_DIR, relativePath);
  const normalizedTarget = path.normalize(resolved).toLowerCase();
  const normalizedRoot = path.normalize(WORKSPACE_DIR).toLowerCase();

  if (normalizedTarget !== normalizedRoot && !normalizedTarget.startsWith(normalizedRoot + path.sep)) {
    throw new Error('Access denied: Path traversal outside ~/DazyyyWorkspace is strictly forbidden.');
  }
  return resolved;
}

const fileManageSchema = {
  type: 'function',
  function: {
    name: 'manage_workspace_file',
    description: 'Create, read, update, or list files inside the sandboxed ~/DazyyyWorkspace directory.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['write', 'read', 'list'],
          description: 'Action to perform: write a file, read a file, or list files in a directory.'
        },
        filepath: {
          type: 'string',
          description: 'Relative file or folder path inside ~/DazyyyWorkspace (e.g., "project/index.js").'
        },
        content: {
          type: 'string',
          description: 'File content to write when action is "write".'
        }
      },
      required: ['action', 'filepath']
    }
  }
};

const fileExecuteSchema = {
  type: 'function',
  function: {
    name: 'execute_workspace_command',
    description: 'Execute a shell command or script (e.g. node, python, npm) inside ~/DazyyyWorkspace and capture stdout/stderr for debugging. Requires Human-in-the-loop approval.',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The terminal command to execute inside ~/DazyyyWorkspace (e.g., "node script.js" or "python3 app.py").'
        }
      },
      required: ['command']
    }
  }
};

async function executeFileManage({ action, filepath = '.', content = '' }) {
  try {
    const targetPath = resolveSafePath(filepath);

    if (action === 'write') {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, content, 'utf-8');
      return {
        status: 'success',
        action: 'write',
        path: targetPath,
        bytesWritten: Buffer.byteLength(content, 'utf-8')
      };
    }

    if (action === 'read') {
      if (!fs.existsSync(targetPath)) {
        return { status: 'error', message: `File not found: ${filepath}` };
      }
      const data = fs.readFileSync(targetPath, 'utf-8');
      return { status: 'success', action: 'read', path: targetPath, content: data };
    }

    if (action === 'list') {
      if (!fs.existsSync(targetPath)) {
        return { status: 'error', message: `Directory not found: ${filepath}` };
      }
      const items = fs.readdirSync(targetPath, { withFileTypes: true }).map(d => ({
        name: d.name,
        type: d.isDirectory() ? 'directory' : 'file'
      }));
      return { status: 'success', action: 'list', path: targetPath, items };
    }

    return { status: 'error', message: `Unknown action: ${action}` };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function executeWorkspaceCommand({ command }) {
  return new Promise(resolve => {
    exec(
      command,
      { cwd: WORKSPACE_DIR, timeout: 25000, maxBuffer: 1024 * 1024 * 2 },
      (error, stdout, stderr) => {
        resolve({
          status: error ? 'failed' : 'success',
          command,
          exitCode: error ? error.code || 1 : 0,
          stdout: (stdout || '').trim(),
          stderr: (stderr || (error ? error.message : '')).trim()
        });
      }
    );
  });
}

module.exports = {
  fileManageSchema,
  fileExecuteSchema,
  executeFileManage,
  executeWorkspaceCommand
};
