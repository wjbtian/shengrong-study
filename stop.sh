#!/bin/bash
PID=$(lsof -ti:3200 2>/dev/null)
if [ -n "$PID" ]; then
  kill -9 $PID 2>/dev/null
  echo "✅ 已停止 (PID: $PID)"
else
  echo "⚠️  服务未运行"
fi
