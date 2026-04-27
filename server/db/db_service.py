#!/usr/bin/env python3
"""
Python SQLite 数据库服务
为 Node.js 提供数据库操作 API
"""

import sqlite3
import json
import sys
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'shengrong_py.db')

def get_db():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """初始化数据库表"""
    conn = get_db()
    cursor = conn.cursor()
    
    # 日记表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS diary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mood TEXT NOT NULL DEFAULT '😄',
            title TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '',
            date TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    ''')
    
    # 闪光时刻表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT '📸 照片',
            icon TEXT NOT NULL DEFAULT '📸',
            description TEXT NOT NULL DEFAULT '',
            date TEXT NOT NULL,
            photo TEXT,
            likes INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    ''')
    
    # 学习进度表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            unit TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            completed_at TEXT,
            UNIQUE(subject, unit)
        )
    ''')
    
    # 科技新闻表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tech (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            summary TEXT NOT NULL DEFAULT '',
            source TEXT,
            category TEXT DEFAULT '🔬 科学',
            fav INTEGER DEFAULT 0,
            date TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    ''')
    
    # 吉他视频表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS guitar_videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            video_path TEXT NOT NULL,
            duration INTEGER,
            bpm INTEGER,
            key_sig TEXT,
            notes TEXT,
            date TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    ''')
    
    conn.commit()
    conn.close()
    return True

def row_to_dict(row):
    """将 sqlite3.Row 转换为字典"""
    return {key: row[key] for key in row.keys()}

def handle_query(sql, params=None):
    """执行查询（SELECT）"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)
        rows = cursor.fetchall()
        result = [row_to_dict(row) for row in rows]
        conn.close()
        return {"success": True, "data": result}
    except Exception as e:
        conn.close()
        return {"success": False, "error": str(e)}

def handle_execute(sql, params=None):
    """执行修改（INSERT/UPDATE/DELETE）"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)
        conn.commit()
        last_id = cursor.lastrowid
        conn.close()
        return {"success": True, "lastInsertRowid": last_id}
    except Exception as e:
        conn.close()
        return {"success": False, "error": str(e)}

def main():
    """主函数：从 stdin 读取命令，输出到 stdout"""
    # 初始化数据库
    init_db()
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        
        try:
            cmd = json.loads(line)
            action = cmd.get('action')
            sql = cmd.get('sql', '')
            params = cmd.get('params', [])
            
            if action == 'query':
                result = handle_query(sql, params)
            elif action == 'execute':
                result = handle_execute(sql, params)
            elif action == 'init':
                result = {"success": init_db()}
            else:
                result = {"success": False, "error": f"Unknown action: {action}"}
            
            print(json.dumps(result, ensure_ascii=False))
            sys.stdout.flush()
            
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False))
            sys.stdout.flush()

if __name__ == '__main__':
    main()
