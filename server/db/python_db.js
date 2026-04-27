/**
 * Python SQLite 数据库接口
 * 通过子进程调用 Python 脚本操作数据库
 */

const { spawn } = require('child_process');
const path = require('path');

const PYTHON_SCRIPT = path.join(__dirname, 'db_service.py');

class PythonDB {
  constructor() {
    this.process = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.ready = false;
    this.initPromise = this.start();
  }

  start() {
    return new Promise((resolve, reject) => {
      console.log('🐍 启动 Python 数据库服务...');
      
      this.process = spawn('python3', [PYTHON_SCRIPT], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let buffer = '';

      this.process.stdout.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留不完整的最后一行

        for (const line of lines) {
          if (line.trim()) {
            this.handleResponse(line.trim());
          }
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error('Python DB Error:', data.toString());
      });

      this.process.on('close', (code) => {
        console.log(`Python DB 进程退出，代码: ${code}`);
        this.ready = false;
      });

      // 等待 Python 初始化完成
      setTimeout(() => {
        this.ready = true;
        console.log('✅ Python 数据库服务已就绪');
        resolve();
      }, 500);
    });
  }

  handleResponse(line) {
    try {
      const response = JSON.parse(line);
      // 找到对应的请求并 resolve
      for (const [id, resolver] of this.pendingRequests) {
        resolver(response);
        this.pendingRequests.delete(id);
        break; // 按顺序处理
      }
    } catch (e) {
      console.error('解析响应失败:', line);
    }
  }

  async sendCommand(action, sql, params = []) {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      if (!this.ready || !this.process) {
        reject(new Error('Python DB 未就绪'));
        return;
      }

      const cmd = JSON.stringify({ action, sql, params });
      this.pendingRequests.set(this.requestId++, resolve);
      
      this.process.stdin.write(cmd + '\n');

      // 超时处理
      setTimeout(() => {
        if (this.pendingRequests.has(this.requestId - 1)) {
          this.pendingRequests.delete(this.requestId - 1);
          reject(new Error('数据库请求超时'));
        }
      }, 5000);
    });
  }

  // 查询接口
  async all(sql, params = []) {
    const result = await this.sendCommand('query', sql, params);
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  async get(sql, params = []) {
    const rows = await this.all(sql, params);
    return rows.length ? rows[0] : null;
  }

  // 执行接口
  async run(sql, params = []) {
    const result = await this.sendCommand('execute', sql, params);
    if (!result.success) throw new Error(result.error);
    return { lastInsertRowid: result.lastInsertRowid };
  }

  // 关闭连接
  close() {
    if (this.process) {
      this.process.stdin.end();
      this.process.kill();
    }
  }
}

// 单例模式
let dbInstance = null;

async function initDB() {
  if (!dbInstance) {
    dbInstance = new PythonDB();
    await dbInstance.initPromise;
  }
  return dbInstance;
}

function getDB() {
  if (!dbInstance) {
    throw new Error('数据库未初始化，请先调用 initDB()');
  }
  return dbInstance;
}

module.exports = { initDB, getDB, PythonDB };
