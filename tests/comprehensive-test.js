const assert = require('assert');
const path = require('path');
const fs = require('fs');
const http = require('http');

async function runTestSuite() {
  console.log('====================================================');
  console.log('  DAZYYY COMPREHENSIVE AUTOMATED TEST SUITE        ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, isSuccess, details = '') {
    if (isSuccess) {
      console.log(`[PASS] ${name}${details ? ` -> ${details}` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}${details ? ` -> ${details}` : ''}`);
      failed++;
    }
  }

  // TEST 1: Workspace & Personality Persistence
  try {
    const {
      ensureWorkspace,
      getPersonality,
      updatePersonality,
      buildSystemPrompt,
      getHistory,
      saveHistory,
      clearHistory,
      WORKSPACE_DIR
    } = require('../backend/personality');

    ensureWorkspace();
    report('1. Workspace initialization', fs.existsSync(WORKSPACE_DIR), `Path: ${WORKSPACE_DIR}`);

    const p = getPersonality();
    report('2. Default personality load', p && p.name === 'Dazyyy', `Name: ${p.name}, Model: ${p.model}`);

    const prompt = buildSystemPrompt();
    report('3. System prompt compilation', prompt.includes('Dazyyy') && prompt.includes(WORKSPACE_DIR), `Length: ${prompt.length} chars`);

    // Test history saving & memory
    saveHistory([{ role: 'user', content: 'test-ping' }]);
    const hist = getHistory();
    report('4. Memory persistence', hist.length === 1 && hist[0].content === 'test-ping');

    clearHistory();
    report('5. Memory clear', getHistory().length === 0);
  } catch (err) {
    report('Personality & Memory Suite', false, err.message);
  }

  // TEST 2: System Telemetry Tool
  try {
    const { executeSystemTool } = require('../backend/tools/systemTool');
    const telemetry = await executeSystemTool({ includeProcesses: true });
    const isValid = telemetry.status === 'success' && typeof telemetry.cpuLoadPercent === 'number' && telemetry.memory.totalGB > 0;
    report('6. System Telemetry Tool', isValid, `OS: ${telemetry.os}, CPU: ${telemetry.cpuLoadPercent}%, RAM: ${telemetry.memory.usedGB}/${telemetry.memory.totalGB}GB, TopProcs: ${telemetry.topProcesses.length}`);
  } catch (err) {
    report('System Telemetry Tool', false, err.message);
  }

  // TEST 3: File Tool Sandbox & Security Traversal Check
  try {
    const { executeFileManage, executeWorkspaceCommand } = require('../backend/tools/fileTool');
    
    // Write test file
    const writeRes = await executeFileManage({
      action: 'write',
      filepath: 'test_sandbox/demo.txt',
      content: 'Dazyyy Sandbox Verification Active'
    });
    report('7. Sandboxed File Write', writeRes.status === 'success', `File: ${writeRes.path}`);

    // Read test file
    const readRes = await executeFileManage({
      action: 'read',
      filepath: 'test_sandbox/demo.txt'
    });
    report('8. Sandboxed File Read', readRes.status === 'success' && readRes.content.includes('Dazyyy Sandbox'), `Content: "${readRes.content}"`);

    // List files
    const listRes = await executeFileManage({
      action: 'list',
      filepath: 'test_sandbox'
    });
    report('9. Directory Listing', listRes.status === 'success' && listRes.items.some(i => i.name === 'demo.txt'), `Found ${listRes.items.length} items`);

    // Security Test: Path Traversal Prevention
    const traversalRes = await executeFileManage({
      action: 'read',
      filepath: '../../Windows/win.ini'
    });
    const traversalBlocked = traversalRes.status === 'error' && traversalRes.message.includes('strictly forbidden');
    report('10. Security: Path Traversal Prevention', traversalBlocked, 'Attempts to escape ~/DazyyyWorkspace are securely blocked');

    // Terminal command execution inside sandbox
    const cmdRes = await executeWorkspaceCommand({ command: 'node -e "console.log(12345)"' });
    report('11. Sandboxed Command Runner', cmdRes.status === 'success' && cmdRes.stdout === '12345', `Output: "${cmdRes.stdout}"`);
  } catch (err) {
    report('File Tool Sandbox Suite', false, err.message);
  }

  // TEST 4: Live Web Scraper & DuckDuckGo Search
  try {
    const { executeWebTool } = require('../backend/tools/webTool');
    const searchRes = await executeWebTool({ query: 'NodeJS' });
    report('12. Web Tool Query Handling', searchRes.status === 'success', `Mode: ${searchRes.mode}`);
  } catch (err) {
    report('Web Tool Query Handling', false, err.message);
  }

  // TEST 5: Backend Server & Socket.IO Lifecycle
  let testServer;
  try {
    const { startBackendServer } = require('../backend/server');
    testServer = await startBackendServer(4001); // Use test port 4001
    report('13. Backend Server Boot', true, 'Listening on http://localhost:4001');

    const ioClient = require('socket.io-client');
    const socket = ioClient('http://localhost:4001');

    const connected = await new Promise((resolve) => {
      socket.on('init:state', data => {
        resolve(data.personality && data.personality.name === 'Dazyyy');
      });
      setTimeout(() => resolve(false), 4000);
    });

    report('14. Socket.IO Handshake & State Broadcast', connected, 'Client received initial personality and history');
    socket.disconnect();
  } catch (err) {
    report('Backend Server & Socket.IO Lifecycle', false, err.message);
  } finally {
    if (testServer) {
      testServer.close();
    }
  }

  // TEST 6: Offline Resilience for Agent Loop
  try {
    const { runAgentTurn } = require('../backend/agent');
    let emittedError = false;
    let replyText = '';

    const mockSocket = {
      emit: (event, data) => {
        if (event === 'agent:message' && data.isError) {
          emittedError = true;
          replyText = data.content;
        }
      }
    };

    await runAgentTurn({
      userMessage: 'Hello Dazyyy',
      socket: mockSocket,
      requestHumanApproval: async () => true
    });

    // When Ollama is offline, it should gracefully report instructions without crashing
    report('15. Agent Offline Resilience', emittedError, `Gracefully intercepted: "${replyText.slice(0, 60)}..."`);
  } catch (err) {
    report('Agent Offline Resilience', false, err.message);
  }

  // TEST 7: Frontend Production Bundle Integrity
  try {
    const distIndex = path.join(__dirname, '../dist/index.html');
    const distExists = fs.existsSync(distIndex);
    const htmlContent = distExists ? fs.readFileSync(distIndex, 'utf-8') : '';
    report('16. Frontend Production Build Artifacts', distExists && htmlContent.includes('script'), `dist/index.html size: ${htmlContent.length} bytes`);
  } catch (err) {
    report('Frontend Production Build', false, err.message);
  }

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite();
