<template>
  <div class="study-page">
    <div class="nav-bar">
      <router-link to="/" class="nav-back">← 返回</router-link>
      <div class="nav-title">{{ chapterName }}</div>
      <div class="progress-text">{{ completedCount }}/{{ totalWords }}</div>
    </div>

    <div class="container">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else>
        <div v-for="word in words" :key="word.id" class="word-card card">
          <!-- 单词标题行 -->
          <div class="word-header">
            <div class="word-title-section">
              <span class="word-text">{{ word.word }}</span>
              <button @click="playAudio(word)" class="audio-btn">🔊</button>
            </div>
            <div class="level-buttons">
              <button
                @click="markLevel(word, 1)"
                class="level-btn"
                :class="{ 'active-1': word.level === 1 }"
              >
                一般
              </button>
              <button
                @click="markLevel(word, 2)"
                class="level-btn"
                :class="{ 'active-2': word.level === 2 }"
              >
                熟悉
              </button>
              <button
                @click="markLevel(word, 3)"
                class="level-btn"
                :class="{ 'active-3': word.level === 3 }"
              >
                掌握
              </button>
            </div>
          </div>

          <!-- 发音与释义 -->
          <div class="content-section">
            <div class="section-title">📖 发音与释义</div>
            <div class="pronunciation">{{ word.pronunciation?.us || '/未知/' }}</div>
            <div v-for="(meaning, idx) in word.meanings" :key="idx" class="meaning-item">
              <div class="meaning-zh">• {{ meaning.pos }} {{ meaning.zh }}</div>
              <div class="meaning-en">• {{ meaning.en }}</div>
            </div>
          </div>

          <!-- 例句 -->
          <div class="content-section" v-if="word.examples">
            <div v-for="(example, idx) in word.examples" :key="idx" class="example-item">
              <div class="section-title">💬 例句{{ idx + 1 }}</div>
              <div class="example-en">{{ example.en }}</div>
              <div class="example-zh">{{ example.zh }}</div>
            </div>
          </div>

          <!-- 记忆技巧 -->
          <div class="content-section memory-tips" v-if="hasMemoryTips(word)">
            <div class="section-title">💡 记忆技巧</div>
            <div v-if="word.memoryTips?.etymology" class="tip-item">
              • {{ word.memoryTips.etymology }}
            </div>
            <div v-if="word.memoryTips?.association" class="tip-item">
              • {{ word.memoryTips.association }}
            </div>
            <div v-if="word.memoryTips?.mnemonic" class="tip-item">
              • {{ word.memoryTips.mnemonic }}
            </div>
          </div>

          <div class="separator"></div>
        </div>

        <button
          v-if="completedCount === totalWords"
          @click="completeChapter"
          class="btn btn-primary"
          style="width: 100%; padding: 16px; font-size: 18px"
        >
          完成本章
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import storageService from '../services/storage.js'
import reviewService from '../services/review.js'

export default {
  data() {
    return {
      loading: true,
      chapterName: '',
      words: [],
      userData: null,
      totalWords: 0,
      completedCount: 0
    }
  },
  async mounted() {
    await this.loadChapter()
  },
  methods: {
    async loadChapter() {
      const chapterId = this.$route.params.chapterId

      // 加载用户数据
      this.userData = storageService.loadData()

      // 计算章节组ID
      const chNum = parseInt(chapterId.replace('ch', ''))
      const groupKey = Math.floor((chNum - 1) / 10) * 10 + 1
      const groupEnd = groupKey + 9
      const groupId = `ch${String(groupKey).padStart(3, '0')}-${String(groupEnd).padStart(3, '0')}`

      // 加载章节数据
      try {
        const response = await fetch(`/words-daily/data/chapters/${groupId}.json`)
        const chapters = await response.json()
        const chapter = chapters.find(ch => ch.id === chapterId)

        if (chapter) {
          this.chapterName = chapter.name
          this.words = chapter.words.map(word => {
            // 合并用户数据
            const userWord = this.userData.words.find(w => w.id === word.id)
            return { ...word, ...userWord }
          })
          this.totalWords = this.words.length
          this.updateCompletedCount()
        }
      } catch (e) {
        console.error('Failed to load chapter:', e)
        alert('加载失败，请刷新重试')
      }

      this.loading = false
    },

    markLevel(word, level) {
      // 更新单词等级
      const updatedWord = reviewService.markWordLevel(word, level, word)

      // 更新本地显示
      const index = this.words.findIndex(w => w.id === word.id)
      if (index !== -1) {
        this.words[index] = { ...this.words[index], ...updatedWord }
      }

      // 更新用户数据
      const userWordIndex = this.userData.words.findIndex(w => w.id === word.id)
      if (userWordIndex !== -1) {
        this.userData.words[userWordIndex] = updatedWord
      } else {
        this.userData.words.push(updatedWord)
      }

      // 更新统计
      this.userData.progress.totalWordsLearned = this.userData.words.length

      // 保存
      storageService.saveData(this.userData)
      this.updateCompletedCount()
    },

    updateCompletedCount() {
      this.completedCount = this.words.filter(w => w.level).length
    },

    playAudio(word) {
      const audio = new Audio(word.audioUrl)
      audio.play().catch(e => console.error('Audio play failed:', e))
    },

    hasMemoryTips(word) {
      const tips = word.memoryTips
      return tips && (tips.etymology || tips.association || tips.mnemonic)
    },

    completeChapter() {
      // 更新进度
      this.userData.progress.currentChapter++
      this.userData.progress.completedChapters++
      storageService.saveData(this.userData)

      // 返回首页
      this.$router.push('/')
      alert('🎉 恭喜完成本章！')
    }
  }
}
</script>

<style scoped>
.study-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.progress-text {
  font-size: 15px;
  color: var(--text-secondary);
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.word-card {
  margin-bottom: 24px;
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.word-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.word-text {
  font-size: 32px;
  font-weight: 600;
}

.content-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pronunciation {
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.meaning-item {
  margin-bottom: 12px;
}

.meaning-zh {
  font-size: 18px;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 4px;
}

.meaning-en {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  font-style: italic;
}

.example-item {
  margin-bottom: 16px;
  padding-left: 20px;
  border-left: 3px solid var(--accent);
}

.example-en {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.7;
  margin-bottom: 6px;
}

.example-zh {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.memory-tips {
  background: var(--bg-primary);
  border-radius: 10px;
  padding: 20px;
}

.tip-item {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.8;
  margin-bottom: 10px;
}

.tip-item:last-child {
  margin-bottom: 0;
}
</style>
