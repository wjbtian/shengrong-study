<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">📝 错题本</h1>
        <p class="page-subtitle">每一次错误都是进步的阶梯 · 共 {{ stats.total || 0 }} 条记录</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddDialog = true">＋ 录入错题</button>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.total || 0 }}</div>
          <div class="stat-label">错题总数</div>
        </div>
      </div>
      <div class="stat-card" v-for="s in stats.bySubject || []" :key="s.subject">
        <div class="stat-icon">{{ {语文:'📖',数学:'🔢',英语:'🔤',科学:'🔬','道德与法治':'⚖️'}[s.subject] || '📝' }}</div>
        <div class="stat-body">
          <div class="stat-value">{{ s.count }}</div>
          <div class="stat-label">{{ s.subject }}</div>
        </div>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-group">
        <button class="filter-btn" :class="{active:activeFilter==='all'}" @click="activeFilter='all';loadErrors()">全部</button>
        <button class="filter-btn" :class="{active:activeFilter==='语文'}" @click="activeFilter='语文';loadErrors()">📖 语文</button>
        <button class="filter-btn" :class="{active:activeFilter==='数学'}" @click="activeFilter='数学';loadErrors()">🔢 数学</button>
        <button class="filter-btn" :class="{active:activeFilter==='英语'}" @click="activeFilter='英语';loadErrors()">🔤 英语</button>
        <button class="filter-btn" :class="{active:activeFilter==='科学'}" @click="activeFilter='科学';loadErrors()">🔬 科学</button>
      </div>
    </div>
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="errors.length===0" class="empty-state"><div class="empty-icon">🎉</div><p>还没有错题记录，继续保持！</p></div>
    <div v-else class="errors-list">
      <div v-for="err in errors" :key="err.id" class="error-card">
        <div class="error-header">
          <div class="error-tags">
            <span class="tag tag-subject">{{ err.subject }}</span>
            <span class="tag tag-cat">{{ err.category }}</span>
            <span class="tag" :class="err.error_reason==='粗心'?'tag-orange':'tag-red'">{{ err.error_reason }}</span>
            <span class="tag" :class="err.mastery?.includes('未')?'tag-red':err.mastery?.includes('已')?'tag-green':'tag-blue'">{{ err.mastery || '⚪ 未掌握' }}</span>
          </div>
          <button class="icon-btn" @click="deleteErr(err.id)" title="删除">🗑</button>
        </div>
        <h3 class="error-title">{{ err.title }}</h3>
        <div class="error-detail">
          <div class="detail-row wrong"><span class="dl">❌ 错误</span><span>{{ err.error_text }}</span></div>
          <div class="detail-row correct"><span class="dl">✅ 正确</span><span>{{ err.correct_text }}</span></div>
        </div>
        <div v-if="err.analysis" class="error-analysis"><strong>📌 分析：</strong>{{ err.analysis }}</div>
        <div class="error-footer"><span class="pt">🎯 {{ err.practice_type }}</span><span class="ed">{{ err.error_date }}</span></div>
      </div>
    </div>
    <!-- 录入弹窗 -->
    <div v-if="showAddDialog" class="modal-overlay" @click.self="showAddDialog=false">
      <div class="modal-dialog">
        <div class="modal-header"><h3>📝 录入错题</h3><button class="modal-close" @click="showAddDialog=false">✕</button></div>
        <div class="modal-body">
          <div class="fg"><label>学科</label><select v-model="form.subject" class="fi"><option>语文</option><option>数学</option><option>英语</option><option>科学</option><option>道德与法治</option></select></div>
          <div class="fg"><label>类型</label><select v-model="form.category" class="fi"><option>字词</option><option>病句</option><option>概念</option><option>计算</option><option>标点</option><option>其他</option></select></div>
          <div class="fg"><label>题目名称</label><input v-model="form.title" class="fi" placeholder="例：【字词】火眼金睛" /></div>
          <div class="fg"><label>错误内容</label><textarea v-model="form.error_text" class="fi" rows="2"></textarea></div>
          <div class="fg"><label>正确内容</label><textarea v-model="form.correct_text" class="fi" rows="2"></textarea></div>
          <div class="fg"><label>错误原因</label><select v-model="form.error_reason" class="fi"><option>概念不清</option><option>粗心</option><option>审题不清</option><option>方法不对</option><option>其他</option></select></div>
          <div class="fg"><label>练习方向</label><input v-model="form.practice_type" class="fi" placeholder="例：字词默写" /></div>
          <div class="form-actions"><button class="btn btn-cancel" @click="showAddDialog=false">取消</button><button class="btn btn-primary" @click="addError">{{ saving?'保存中...':'保存到错题本' }}</button></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { api } from '../../utils/api';
const errors = ref([]), stats = ref({}), loading = ref(true), showAddDialog = ref(false), saving = ref(false), activeFilter = ref('all');
const form = reactive({subject:'语文',category:'字词',title:'',error_text:'',correct_text:'',error_reason:'概念不清',practice_type:'通用'});
async function loadErrors(){loading.value=true;try{const p=activeFilter.value==='all'?'':'?subject='+activeFilter.value;errors.value=await api('GET','/errors'+p)}catch(e){}loading.value=false}
async function loadStats(){try{stats.value=await api('GET','/errors/stats')}catch(e){}}
async function addError(){if(!form.title)return;saving.value=true;try{await api('POST','/errors',{...form});showAddDialog.value=false;Object.assign(form,{title:'',error_text:'',correct_text:'',practice_type:'通用'});await loadErrors();await loadStats()}catch(e){alert('保存失败')}saving.value=false}
async function deleteErr(id){if(!confirm('删除这条？'))return;try{await api('DELETE','/errors/'+id);await loadErrors();await loadStats()}catch(e){}}
onMounted(()=>{loadErrors();loadStats()});
</script>
<style scoped>
.page-container{max-width:900px;margin:0 auto}.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px}
.page-title{font-size:24px;font-weight:700;color:var(--text);margin:0}.page-subtitle{font-size:13px;color:var(--text2);margin-top:4px}
.stats-grid{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}.stat-card{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 18px;min-width:130px;flex:1}
.stat-icon{font-size:24px}.stat-value{font-size:22px;font-weight:700;color:var(--text)}.stat-label{font-size:12px;color:var(--text2)}
.filter-bar{margin-bottom:16px}.filter-group{display:flex;gap:8px;flex-wrap:wrap}.filter-btn{padding:6px 14px;border:1px solid var(--border2);border-radius:8px;background:transparent;color:var(--text2);font-size:13px;cursor:pointer}.filter-btn:hover{background:var(--surface2)}.filter-btn.active{background:var(--accent-dim);border-color:var(--accent);color:var(--accent)}
.errors-list{display:flex;flex-direction:column;gap:12px}.error-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px 20px}
.error-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}.error-tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600}.tag-subject{background:var(--accent-dim);color:var(--accent)}.tag-cat{background:rgba(251,191,36,0.15);color:#fbbf24}.tag-red{background:rgba(248,113,113,0.15);color:#f87171}.tag-blue{background:rgba(96,165,250,0.15);color:#60a5fa}.tag-green{background:rgba(74,222,128,0.15);color:#4ade80}.tag-orange{background:rgba(251,146,60,0.15);color:#fb923c}
.icon-btn{background:none;border:none;cursor:pointer;font-size:16px;opacity:0.5}.icon-btn:hover{opacity:1}
.error-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:10px}.error-detail{display:flex;flex-direction:column;gap:6px;margin-bottom:8px}.detail-row{display:flex;gap:8px;font-size:13px}.dl{font-weight:600;min-width:64px}.detail-row.wrong .dl{color:#f87171}.correct .dl{color:#4ade80}.wrong span:last-child{color:#f87171}.correct span:last-child{color:#4ade80}
.error-analysis{font-size:13px;color:var(--text2);background:var(--surface2);padding:10px 12px;border-radius:8px;margin-bottom:10px;line-height:1.6}
.error-footer{display:flex;justify-content:space-between;font-size:12px;color:var(--text3)}.pt{color:var(--accent)}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px}
.modal-dialog{background:var(--surface);border:1px solid var(--border);border-radius:16px;width:100%;max-width:520px;max-height:80vh;overflow-y:auto}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border)}
.modal-header h3{font-size:16px;font-weight:600;color:var(--text);margin:0}.modal-close{background:none;border:none;color:var(--text2);font-size:18px;cursor:pointer}
.modal-body{padding:20px}.fg{margin-bottom:14px}.fg label{display:block;font-size:13px;font-weight:600;color:var(--text2);margin-bottom:4px}
.fi{width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;background:var(--surface2);color:var(--text);font-size:14px;outline:none;font-family:inherit;box-sizing:border-box}
.fi:focus{border-color:var(--accent)}.form-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
.btn{padding:8px 18px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none}.btn-primary{background:var(--accent);color:#080810}.btn-cancel{background:var(--surface2);color:var(--text2);border:1px solid var(--border2)}
.loading-state,.empty-state{text-align:center;padding:60px 20px;color:var(--text2)}.empty-icon{font-size:48px;margin-bottom:12px}
</style>