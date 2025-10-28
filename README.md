# Words Daily

Personal English vocabulary learning app based on Ebbinghaus forgetting curve.

## Features

- 📚 Cambridge IELTS Vocabulary (5271 words, 163 chapters)
- 🧠 Spaced Repetition System (3 levels: 一般, 熟悉, 掌握)
- 📱 iOS Shortcuts Integration (碎片化时间学习)
- 🔄 Daily Words API (每天自动更新)
- 💾 Local storage + GitHub Gist backup
- 🎨 Apple-style minimalist design
- 🖥️ Desktop-first responsive design

## Tech Stack

- Vue 3 + Vite
- Pure CSS (Apple style)
- localStorage + Gist API
- GitHub Pages

## Usage

### Web App
Visit: https://onlinefchen.github.io/words-daily/

### iOS Shortcuts (碎片化学习)

通过 iOS Shortcuts 随时随地学习单词：

**API 端点：**
- Quick Learn: `https://onlinefchen.github.io/words-daily/api/quick-learn.json`
- Daily Pool: `https://onlinefchen.github.io/words-daily/api/daily-words.json`
- Word Pairs: `https://onlinefchen.github.io/words-daily/api/words-pair-[1-10].json`

**完整配置指南：** [iOS Shortcuts 集成指南](docs/IOS_SHORTCUTS_GUIDE.md)

**特点：**
- 📱 每次获取 2 个精选单词
- ⏰ 支持定时自动提醒
- 🎙️ Siri 语音启动
- ⌚ Apple Watch 集成
- 🔄 每天 6:00 自动更新

## Development

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build
npm run build
```

## License

MIT
