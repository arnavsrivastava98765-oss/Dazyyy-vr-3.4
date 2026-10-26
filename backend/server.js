const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const {
  getPersonality,
  updatePersonality,
  getHistory,
  clearHistory
} = require('./personality');
const { runAgentTurn } = require('./agent');

const pendingApprovals = new Map();

function requestHumanApproval(socket, { id, toolName, args }) {
  return new Promise(resolve => {
    pendingApprovals.set(id, resolve);
    socket.emit('approval_required', { id, toolName, args });
  });
}

function startBackendServer(port = 4000) {
  return new Promise(resolve => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: '*' }
    });

    io.on('connection', socket => {
      // Send initial personality & chat history on connect
      socket.emit('init:state', {
        personality: getPersonality(),
        history: getHistory().filter(m => m.role === 'user' || (m.role === 'assistant' && m.content))
      });

      socket.on('user:prompt', async ({ text }) => {
        if (!text || !text.trim()) return;
        await runAgentTurn({
          userMessage: text.trim(),
          socket,
          requestHumanApproval
        });
      });

      socket.on('approval:response', ({ id, approved }) => {
        const resolver = pendingApprovals.get(id);
        if (resolver) {
          pendingApprovals.delete(id);
          resolver(Boolean(approved));
        }
      });

      socket.on('personality:update', newConfig => {
        const updated = updatePersonality(newConfig);
        socket.emit('personality:updated', updated);
      });

      socket.on('memory:clear', () => {
        clearHistory();
        socket.emit('memory:cleared');
      });
    });

    server.listen(port, () => {
      console.log(`[Dazyyy Backend] Listening on http://localhost:${port}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startBackendServer(4000);
}

module.exports = { startBackendServer };
