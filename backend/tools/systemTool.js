const si = require('systeminformation');

const systemToolSchema = {
  type: 'function',
  function: {
    name: 'get_system_telemetry',
    description: 'Fetch real-time CPU load, RAM usage, battery status, OS info, and top active processes.',
    parameters: {
      type: 'object',
      properties: {
        includeProcesses: {
          type: 'boolean',
          description: 'Whether to include the top 5 CPU-consuming processes.'
        }
      },
      required: []
    }
  }
};

async function executeSystemTool({ includeProcesses = true } = {}) {
  try {
    const [cpuLoad, mem, battery, osInfo, procs] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.battery(),
      si.osInfo(),
      includeProcesses ? si.processes() : Promise.resolve(null)
    ]);

    const topProcesses = procs
      ? procs.list
          .sort((a, b) => b.cpu - a.cpu)
          .slice(0, 5)
          .map(p => ({ name: p.name, pid: p.pid, cpuPercent: Number(p.cpu.toFixed(1)), memPercent: Number(p.mem.toFixed(1)) }))
      : [];

    return {
      status: 'success',
      os: `${osInfo.distro} (${osInfo.platform} ${osInfo.arch})`,
      cpuLoadPercent: Number(cpuLoad.currentLoad.toFixed(1)),
      memory: {
        totalGB: Number((mem.total / 1073741824).toFixed(2)),
        usedGB: Number((mem.active / 1073741824).toFixed(2)),
        usagePercent: Number(((mem.active / mem.total) * 100).toFixed(1))
      },
      battery: battery.hasBattery
        ? { percent: battery.percent, isCharging: battery.isCharging }
        : 'No battery detected (Desktop/AC)',
      topProcesses
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

module.exports = {
  systemToolSchema,
  executeSystemTool
};
