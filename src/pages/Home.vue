<template>
  <div class="home-page">
    <div class="nav-bar">
      <div class="nav-title">Words Daily</div>
      <router-link to="/settings" class="nav-link">⚙️</router-link>
    </div>

    <div class="container">
      <h1 class="page-title">今日学习</h1>

      <div class="card" v-if="todayTasks.newChapter">
        <h2 class="card-title">📖 新章节</h2>
        <p class="chapter-name">{{ todayTasks.newChapter.name }}</p>
        <p class="text-secondary">{{ todayTasks.newChapter.wordCount }} 个单词 · 预计 {{ todayTasks.newChapter.estimatedMinutes }} 分钟</p>
        <router-link
          :to="`/study/${todayTasks.newChapter.id}`"
          class="btn btn-primary mt-16"
          style="display: block; text-align: center"
        >
          开始学习
        </router-link>
      </div>

      <div class="card" v-if="todayTasks.reviewWords.length > 0">
        <h2 class="card-title">🔄 复习任务</h2>
        <p class="text-secondary">{{ todayTasks.reviewWords.length }} 个单词待复习</p>
        <button @click="startReview" class="btn btn-secondary mt-16" style="width: 100%">
          开始复习
        </button>
      </div>

      <div class="stats-card card">
        <p class="text-secondary text-small">学习进度</p>
        <p class="text-large mt-8">{{ progress.currentChapter }}/{{ totalChapters }}</p>
        <p class="text-secondary text-small mt-8">已学 {{ progress.totalWordsLearned }} 词</p>
      </div>
    </div>

    <div class="bottom-nav">
      <router-link to="/" class="nav-item active">🏠 学习</router-link>
      <router-link to="/vocabulary" class="nav-item">📖 词汇</router-link>
      <router-link to="/settings" class="nav-item">⚙️ 设置</router-link>
    </div>
  </div>
</template>

<script>
import storageService from '../services/storage.js'
import reviewService from '../services/review.js'

export default {
  data() {
    return {
      meta: null,
      userData: null,
      todayTasks: {
        newChapter: null,
        reviewWords: []
      }
    }
  },
  computed: {
    progress() {
      return this.userData?.progress || { currentChapter: 1, totalWordsLearned: 0 }
    },
    totalChapters() {
      return this.meta?.totalChapters || 0
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      // 加载元数据
      try {
        const response = await fetch('/words-daily/data/meta.json')
        this.meta = await response.json()
      } catch (e) {
        console.error('Failed to load meta:', e)
        return
      }

      // 加载用户数据
      this.userData = storageService.loadData()

      // 计算今日任务
      this.todayTasks = reviewService.getTodayTasks(this.meta, this.userData)
    },
    startReview() {
      // TODO: 实现复习功能
      alert('复习功能开发中')
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 80px;
}

.page-title {
  font-size: 34px;
  font-weight: 600;
  margin-bottom: 24px;
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 12px;
}

.chapter-name {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.stats-card {
  text-align: center;
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

.nav-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 20px;
}
</style>
