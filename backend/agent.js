const crypto = require('crypto');
const {
  getPersonality,
  buildSystemPrompt,
  getHistory,
  saveHistory
} = require('./personality');
const { systemToolSchema, executeSystemTool } = require('./tools/systemTool');
const {
  fileManageSchema,
  fileExecuteSchema,
  executeFileManage,
  executeWorkspaceCommand
} = require('./tools/fileTool');
const { webToolSchema, executeWebTool } = require('./tools/webTool');
const { whatsappToolSchema, executeWhatsappTool } = require('./tools/whatsappTool');

const OLLAMA_URL = 'http://localhost:11434/api/chat';

// Tools that MUST trigger Human-in-the-Loop approval before running
const SENSITIVE_TOOLS = new Set(['execute_workspace_command', 'send_whatsapp_message']);

const ALL_TOOL_SCHEMAS = [
  systemToolSchema,
  fileManageSchema,
  fileExecuteSchema,
  webToolSchema,
  whatsappToolSchema
];

function getActiveToolSchemas() {
  const { enabledTools } = getPersonality();
  return ALL_TOOL_SCHEMAS.filter(t => enabledTools[t.function.name] !== false);
}

async function dispatchTool(toolName, args) {
  switch (toolName) {
    case 'get_system_telemetry':
      return await executeSystemTool(args);
    case 'manage_workspace_file':
      return await executeFileManage(args);
    case 'execute_workspace_command':
      return await executeWorkspaceCommand(args);
    case 'web_search_and_scrape':
      return await executeWebTool(args);
    case 'send_whatsapp_message':
      return await executeWhatsappTool(args);
    default:
      return { status: 'error', message: `Unknown tool: ${toolName}` };
  }
}

const GREETING_OR_CHITCHAT_REGEX = /^(hi|hello|hey|yo|greetings|good\s+(morning|afternoon|evening|day)|sup|what's\s+up|howdy|dazyyy|who\s+are\s+you|what\s+can\s+you\s+do|test|ping)[.!?\s]*$/i;
const ACTION_KEYWORDS_REGEX = /(cpu|ram|memory|battery|system|telemetry|process|hardware|file|write|create|read|delete|list|script|run|execute|search|google|scrape|duckduckgo|web|whatsapp|message|text|send)/i;

function determineToolsForPrompt(userMessage) {
  const trimmed = (userMessage || '').trim();
  // If user is greeting or having casual conversation, do not pass tools so model talks naturally like ChatGPT
  if (GREETING_OR_CHITCHAT_REGEX.test(trimmed)) {
    return [];
  }
  // Only pass tools if the prompt mentions an action keyword
  if (ACTION_KEYWORDS_REGEX.test(trimmed)) {
    return getActiveToolSchemas();
  }
  // Default to pure conversational mode for general knowledge questions
  return [];
}

async function runAgentTurn({ userMessage, socket, requestHumanApproval }) {
  const personality = getPersonality();
  const model = personality.model || 'llama3.1';
  const history = getHistory();

  history.push({ role: 'user', content: userMessage });
  socket.emit('agent:state', 'THINKING');

  const toolsForTurn = determineToolsForPrompt(userMessage);

  const MAX_ITERATIONS = 6;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    const payload = {
      model,
      stream: false,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        ...history
      ]
    };

    // Only inject tools if the prompt genuinely requested actions
    if (toolsForTurn.length > 0) {
      payload.tools = toolsForTurn;
    }

    let responseData;
    try {
      const res = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Ollama API HTTP ${res.status}: ${errText}`);
      }
      responseData = await res.json();
    } catch (err) {
      socket.emit('agent:state', 'IDLE');
      const errorReply = `Cannot reach local Ollama instance at ${OLLAMA_URL}. Make sure Ollama is running (\`ollama run ${model}\`). Error: ${err.message}`;
      socket.emit('agent:message', { role: 'assistant', content: errorReply, isError: true });
      return;
    }

    const assistantMsg = responseData.message;
    history.push(assistantMsg);

    const toolCalls = assistantMsg.tool_calls || [];

    // If no tool calls, the model produced its final response
    if (toolCalls.length === 0) {
      saveHistory(history);
      socket.emit('agent:state', 'SUCCESS');
      socket.emit('agent:message', {
        role: 'assistant',
        content: assistantMsg.content || 'Task completed.'
      });
      setTimeout(() => socket.emit('agent:state', 'IDLE'), 2200);
      return;
    }

    // Process tool calls sequentially
    for (const call of toolCalls) {
      const toolName = call.function.name;
      const rawArgs = call.function.arguments || {};
      const parsedArgs = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;

      // Safety check: Prevent unprompted WhatsApp calls if user never requested it
      if (toolName === 'send_whatsapp_message' && !/(whatsapp|message|text)/i.test(userMessage)) {
        console.log('[Dazyyy Guard] Blocked unprompted WhatsApp tool call.');
        history.push({
          role: 'tool',
          content: JSON.stringify({
            status: 'ignored',
            message: 'WhatsApp tool was not requested by user. Please answer conversationally.'
          })
        });
        continue;
      }

      // Human-in-the-loop gate for sensitive tools
      if (SENSITIVE_TOOLS.has(toolName)) {
        const approvalId = crypto.randomUUID();
        socket.emit('agent:state', 'WORKING');

        const approved = await requestHumanApproval(socket, {
          id: approvalId,
          toolName,
          args: parsedArgs
        });

        if (!approved) {
          const deniedResult = {
            status: 'denied_by_user',
            message: `User explicitly rejected execution of ${toolName}. Do not retry without permission.`
          };
          socket.emit('agent:tool_log', {
            toolName,
            args: parsedArgs,
            result: deniedResult
          });
          history.push({
            role: 'tool',
            content: JSON.stringify(deniedResult)
          });
          continue;
        }
      }

      socket.emit('agent:state', 'WORKING');
      socket.emit('agent:status_text', `Executing ${toolName}...`);

      const toolOutput = await dispatchTool(toolName, parsedArgs);

      socket.emit('agent:tool_log', {
        toolName,
        args: parsedArgs,
        result: toolOutput
      });

      history.push({
        role: 'tool',
        content: JSON.stringify(toolOutput)
      });
    }

    socket.emit('agent:state', 'THINKING');
  }

  saveHistory(history);
  socket.emit('agent:state', 'IDLE');
  socket.emit('agent:message', {
    role: 'assistant',
    content: 'Reached maximum autonomous tool iterations. Please review the workspace output.'
  });
}

module.exports = { runAgentTurn };
