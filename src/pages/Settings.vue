<template>
  <div class="settings-page">
    <div class="nav-bar">
      <router-link to="/" class="nav-back">← 返回</router-link>
      <div class="nav-title">设置</div>
      <div></div>
    </div>

    <div class="container">
      <div class="card">
        <h2 class="card-title">数据管理</h2>
        <div class="setting-item">
          <button @click="exportData" class="btn btn-secondary" style="width: 100%">
            📥 导出学习数据
          </button>
        </div>
        <div class="setting-item">
          <input
            type="file"
            ref="fileInput"
            accept=".json"
            style="display: none"
            @change="importData"
          />
          <button @click="$refs.fileInput.click()" class="btn btn-secondary" style="width: 100%">
            📤 导入学习数据
          </button>
        </div>
        <div class="setting-item">
          <button @click="clearData" class="btn btn-secondary" style="width: 100%">
            🔄 重置所有数据
          </button>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">外观</h2>
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="darkMode" @change="toggleDarkMode" />
            深色模式
          </label>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">关于</h2>
        <p class="text-secondary">Words Daily v1.0</p>
        <p class="text-secondary mt-8">基于艾宾浩斯遗忘曲线的个人英语学习应用</p>
        <a
          href="https://github.com/onlinefchen/words-daily"
          target="_blank"
          class="btn btn-secondary mt-16"
          style="display: block; text-align: center"
        >
          GitHub 仓库
        </a>
      </div>
    </div>

    <div class="bottom-nav">
      <router-link to="/" class="nav-item">🏠 学习</router-link>
      <router-link to="/vocabulary" class="nav-item">📖 词汇</router-link>
      <router-link to="/settings" class="nav-item active">⚙️ 设置</router-link>
    </div>
  </div>
</template>

<script>
import storageService from '../services/storage.js'

export default {
  data() {
    return {
      darkMode: false
    }
  },
  mounted() {
    const theme = localStorage.getItem('theme')
    this.darkMode = theme === 'dark'
  },
  methods: {
    exportData() {
      storageService.exportData()
      alert('✅ 数据导出成功！')
    },

    async importData(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        await storageService.importData(file)
        alert('✅ 数据导入成功！页面即将刷新...')
        setTimeout(() => location.reload(), 1000)
      } catch (e) {
        alert('❌ 导入失败：' + e.message)
      }
    },

    clearData() {
      if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
        storageService.clearAll()
        alert('✅ 数据已重置！页面即将刷新...')
        setTimeout(() => location.reload(), 1000)
      }
    },

    toggleDarkMode() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark-mode')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark-mode')
        localStorage.setItem('theme', 'light')
      }
    }
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 80px;
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
}

.setting-item {
  margin-bottom: 12px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  cursor: pointer;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--bg-card);
  border-top: 1px solid var(--separator);
  padding: 8px;
}

.nav-item {
  flex: 1;
  padding: 12px;
  text-align: center;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 15px;
}

.nav-item.active {
  color: var(--accent);
  font-weight: 500;
}
</style>
