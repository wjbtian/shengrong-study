#!/bin/bash
cd "$(dirname "$0")"

# 检查是否已在运行
PID=$(lsof -ti:3200 2>/dev/null)
if [ -n "$PID" ]; then
  echo "⚠️  服务已在运行 (PID: $PID)"
  echo "   访问: http://localhost:3200"
  exit 0
fi

echo "🚀 启动尚融成长网站..."
node server/index.js &
sleep 2

PID=$(lsof -ti:3200 2>/dev/null)
if [ -n "$PID" ]; then
  echo "✅ 启动成功！"
  echo "   本机: http://localhost:3200"
  echo "   局域网: http://192.168.2.101:3200"
else
  echo "❌ 启动失败，查看 server-error.log"
fi
