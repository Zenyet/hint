import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';

const WS_PORT = 8765;
const RELOAD_DELAY = 300; // 300ms 防抖，避免多次重载

console.log('🔄 Starting extension reload server...');

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ port: WS_PORT });

let clients = new Set();
let reloadTimer = null;

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('📱 Client connected, total clients:', clients.size);

  ws.on('close', () => {
    clients.delete(ws);
    console.log('📱 Client disconnected, remaining clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
    clients.delete(ws);
  });
});

// 通知所有客户端重新加载
function notifyReload(changedFile) {
  if (clients.size === 0) {
    return; // 没有客户端连接，跳过
  }

  // 防抖：避免短时间内多次重载
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    console.log('🔄 Triggering reload due to:', changedFile);
    clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({ type: 'reload', file: changedFile }));
      }
    });
  }, RELOAD_DELAY);
}

// 监听 dist 目录的文件变化
const watcher = chokidar.watch('dist', {
  ignored: /(^|[\/\\])\../, // 忽略隐藏文件
  persistent: true,
  ignoreInitial: true, // 忽略初始扫描
  awaitWriteFinish: {
    stabilityThreshold: 200,
    pollInterval: 100
  }
});

watcher
  .on('change', (path) => notifyReload(path))
  .on('add', (path) => notifyReload(path))
  .on('ready', () => {
    console.log('✅ Reload server ready on ws://localhost:' + WS_PORT);
    console.log('👀 Watching dist/ for changes...');
  })
  .on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down reload server...');
  watcher.close();
  wss.close();
  process.exit(0);
});
