// 艾宾浩斯遗忘曲线算法
const REVIEW_INTERVALS = {
  1: [0.5, 1, 3, 7, 15, 30, 60],        // 一般
  2: [1, 3, 7, 15, 30, 60, 90],         // 熟悉
  3: [3, 7, 15, 30, 90, 180, 365]       // 掌握
}

export class ReviewService {
  // 计算下次复习时间
  calculateNextReview(word, level) {
    const intervals = REVIEW_INTERVALS[level] || REVIEW_INTERVALS[1]
    const reviewCount = word.reviewCount || 0
    const intervalDays = intervals[Math.min(reviewCount, intervals.length - 1)]

    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + intervalDays)
    return nextDate
  }

  // 标记单词等级
  markWordLevel(word, level, wordDetails) {
    return {
      ...wordDetails,
      id: word.id,
      word: word.word,
      chapter: word.chapter,
      level: level,
      reviewCount: (word.reviewCount || 0) + 1,
      lastReviewedAt: new Date(),
      nextReviewAt: this.calculateNextReview(word, level),
      history: [
        ...(word.history || []),
        {
          date: new Date().toISOString(),
          level: level
        }
      ]
    }
  }

  // 获取今日需要复习的单词
  getTodayReviewWords(allWords) {
    const now = new Date()
    return allWords.filter(word => {
      if (!word.nextReviewAt) return false
      return new Date(word.nextReviewAt) <= now
    })
  }

  // 获取今日任务（新词 + 复习词）
  getTodayTasks(meta, userData) {
    const currentChapterIndex = userData.progress.currentChapter - 1
    const currentChapterInfo = meta.chapters[currentChapterIndex]

    return {
      newChapter: currentChapterInfo,
      reviewWords: this.getTodayReviewWords(userData.words)
    }
  }

  // 检查章节是否完成
  isChapterCompleted(chapterId, userData) {
    const chapterWords = userData.words.filter(w => w.chapter === chapterId)
    if (chapterWords.length === 0) return false
    return chapterWords.every(w => w.level && w.level >= 1)
  }
}

export default new ReviewService()
