<template>
  <div class="vocabulary-page">
    <div class="nav-bar">
      <router-link to="/" class="nav-back">← 返回</router-link>
      <div class="nav-title">词汇表</div>
      <div></div>
    </div>

    <div class="container">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else>
        <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item card">
          <div class="chapter-header">
            <div>
              <div class="chapter-name">{{ chapter.name }}</div>
              <div class="chapter-info">{{ chapter.wordCount }} 词</div>
            </div>
            <div class="chapter-status">
              <span v-if="isCompleted(chapter.id)">✓</span>
              <span v-else-if="isCurrent(chapter.id)">→</span>
            </div>
          </div>
          <router-link
            v-if="isCurrent(chapter.id) || isCompleted(chapter.id)"
            :to="`/study/${chapter.id}`"
            class="btn btn-secondary mt-16"
            style="display: block; text-align: center"
          >
            {{ isCompleted(chapter.id) ? '复习' : '继续学习' }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="bottom-nav">
      <router-link to="/" class="nav-item">🏠 学习</router-link>
      <router-link to="/vocabulary" class="nav-item active">📖 词汇</router-link>
      <router-link to="/settings" class="nav-item">⚙️ 设置</router-link>
    </div>
  </div>
</template>

<script>
import storageService from '../services/storage.js'

export default {
  data() {
    return {
      loading: true,
      chapters: [],
      userData: null
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const response = await fetch('/words-daily/data/meta.json')
        const meta = await response.json()
        this.chapters = meta.chapters

        this.userData = storageService.loadData()
      } catch (e) {
        console.error('Failed to load:', e)
      }

      this.loading = false
    },

    isCompleted(chapterId) {
      const chNum = parseInt(chapterId.replace('ch', ''))
      return chNum < this.userData.progress.currentChapter
    },

    isCurrent(chapterId) {
      const chNum = parseInt(chapterId.replace('ch', ''))
      return chNum === this.userData.progress.currentChapter
    }
  }
}
</script>

<style scoped>
.vocabulary-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 80px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.chapter-item {
  margin-bottom: 16px;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-name {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 4px;
}

.chapter-info {
  font-size: 15px;
  color: var(--text-secondary);
}

.chapter-status {
  font-size: 24px;
  color: var(--success);
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
