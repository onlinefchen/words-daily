// localStorage 管理
export class StorageService {
  constructor() {
    this.STORAGE_KEY = 'words-daily-data'
    this.LAST_RESET_KEY = 'words-daily-last-reset'
  }

  // 加载学习数据
  loadData() {
    const json = localStorage.getItem(this.STORAGE_KEY)
    if (!json) {
      return this.createEmptyData()
    }

    try {
      const data = JSON.parse(json)
      // 转换日期字符串为 Date 对象
      if (data.words) {
        data.words.forEach(word => {
          if (word.nextReviewAt) word.nextReviewAt = new Date(word.nextReviewAt)
          if (word.lastReviewedAt) word.lastReviewedAt = new Date(word.lastReviewedAt)
        })
      }
      return data
    } catch (e) {
      console.error('Failed to parse data:', e)
      return this.createEmptyData()
    }
  }

  // 保存学习数据
  saveData(data) {
    const json = JSON.stringify(data)
    localStorage.setItem(this.STORAGE_KEY, json)
  }

  // 创建空数据结构
  createEmptyData() {
    return {
      version: '1.0',
      words: [],
      progress: {
        currentChapter: 1,
        completedChapters: 0,
        totalWordsLearned: 0,
        lastSyncAt: null
      }
    }
  }

  // 检查是否需要每日重置
  checkDailyReset() {
    const lastReset = localStorage.getItem(this.LAST_RESET_KEY)
    const today = new Date().toDateString()

    if (lastReset !== today) {
      localStorage.setItem(this.LAST_RESET_KEY, today)
      return true
    }
    return false
  }

  // 导出数据
  exportData() {
    const data = this.loadData()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `words-daily-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导入数据
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          this.saveData(data)
          resolve(data)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // 清除所有数据
  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.LAST_RESET_KEY)
  }
}

export default new StorageService()
