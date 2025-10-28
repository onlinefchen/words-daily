# iOS Shortcuts 集成指南

本指南将帮助你配置 iOS Shortcuts，在碎片化时间快速学习英语单词。

## 功能特点

- 📱 随时随地通过 Shortcuts 获取单词
- 🎯 每次获取 2 个精选单词
- 🔄 支持多种学习模式
- ⏰ 可设置定时提醒学习

## API 端点

所有 API 基于 GitHub Pages，无需认证即可访问：

### 基础 URL
```
https://onlinefchen.github.io/words-daily/api/
```

### 可用端点

1. **快速学习（推荐）**
   - URL: `https://onlinefchen.github.io/words-daily/api/quick-learn.json`
   - 说明: 返回 2 个每日推荐单词
   - 更新频率: 每天 6:00 AM (北京时间)

2. **今日单词池**
   - URL: `https://onlinefchen.github.io/words-daily/api/daily-words.json`
   - 说明: 返回今天的 20 个单词池
   - 更新频率: 每天 6:00 AM (北京时间)

3. **单词对系列**
   - URL: `https://onlinefchen.github.io/words-daily/api/words-pair-[1-10].json`
   - 说明: 10 组不同的单词对，可轮换学习
   - 示例: `words-pair-1.json`, `words-pair-2.json`, ...
   - 更新频率: 每天 6:00 AM (北京时间)

## iOS Shortcuts 配置步骤

### 方案 1: 简单快速学习（推荐新手）

1. 打开 iOS **快捷指令** App
2. 点击右上角 **+** 创建新快捷指令
3. 添加以下操作：

```
【操作步骤】

1. 添加操作：「获取 URL 内容」
   - URL: https://onlinefchen.github.io/words-daily/api/quick-learn.json

2. 添加操作：「从输入获取词典」
   - 输入: 上一步的 URL 内容

3. 添加操作：「获取词典值」
   - 键: words

4. 添加操作：「快速查看」
   - 输入: 上一步的词典值
```

4. 点击快捷指令名称，重命名为 "每日学单词"
5. 完成！现在运行这个快捷指令就能看到 2 个单词

### 方案 2: 高级通知版（碎片化学习）

这个版本会以通知形式展示单词，更适合碎片化时间学习。

```
【操作步骤】

1. 添加操作：「获取 URL 内容」
   - URL: https://onlinefchen.github.io/words-daily/api/quick-learn.json

2. 添加操作：「从输入获取词典」

3. 添加操作：「获取词典值」
   - 键: words

4. 添加操作：「重复每一项」
   - 输入: 上一步的结果

5. 在重复块内添加：
   a. 「获取词典值」- 键: word
   b. 「获取词典值」- 键: pronunciation
   c. 「获取词典值」- 键: meanings
   d. 「获取词典值」- 键: examples

   e. 「文本」操作，组合内容：
      【单词】重复项目.word
      【发音】重复项目.pronunciation
      【释义】重复项目.meanings
      【例句】重复项目.examples

   f. 「显示通知」
      - 标题: 📚 今日单词
      - 内容: 上一步的文本

6. 添加操作：「等待」
   - 时间: 5 秒（给你时间阅读第一个单词）
```

### 方案 3: 轮换学习版

每次运行获取不同的单词对（从 10 组中轮换）：

```
【操作步骤】

1. 添加操作：「数字」
   - 输入: 1-10 之间的随机数

2. 添加操作：「文本」
   - 内容: https://onlinefchen.github.io/words-daily/api/words-pair-

3. 添加操作：「合并文本」
   - 将步骤1的数字和步骤2的文本合并
   - 再添加 .json

4. 添加操作：「获取 URL 内容」
   - URL: 上一步合并的文本

5. （后续步骤同方案1或方案2）
```

## 自动化设置

### 定时提醒学习

1. 在快捷指令 App 中，点击底部 **自动化** 标签
2. 点击右上角 **+** 创建个人自动化
3. 选择 **特定时间**
4. 设置你想学习的时间（如: 早上 7:00, 中午 12:00, 晚上 8:00）
5. 选择重复频率（建议每天）
6. 添加操作：**运行快捷指令** → 选择你创建的学单词快捷指令
7. 关闭 **运行前询问** 开关，实现自动运行
8. 完成！

### 建议的学习时间点

- 🌅 早上 7:00 - 起床后
- 🍽️ 中午 12:00 - 午休时
- 🌆 下午 18:00 - 下班路上
- 🌙 晚上 21:00 - 睡前复习

## 数据格式说明

### quick-learn.json 返回格式

```json
{
  "generated": "2025-10-28T10:47:44.886Z",
  "count": 2,
  "words": [
    {
      "word": "abandon",
      "pronunciation": "/əˈbændən/",
      "meanings": [
        {
          "pos": "v.",
          "zh": "放弃；抛弃",
          "en": "to leave someone or something completely"
        }
      ],
      "examples": [
        {
          "en": "The crew were forced to abandon the ship.",
          "zh": "船员被迫弃船。"
        }
      ],
      "memoryTips": {
        "etymology": "词根：a- (away) + bandon (control)"
      },
      "audioUrl": "https://dict.youdao.com/dictvoice?audio=abandon&type=2",
      "chapter": "基本词汇 动词200 Unit 1"
    }
  ]
}
```

### 字段说明

- `word`: 单词
- `pronunciation`: 美式发音（IPA格式）
- `meanings`: 释义列表（包含词性、中文、英文）
- `examples`: 例句（中英对照）
- `memoryTips`: 记忆技巧（词源、联想、助记）
- `audioUrl`: 发音音频URL
- `chapter`: 所属章节

## 进阶玩法

### 1. 集成 Siri

给你的快捷指令设置一个简短的名称，如 "学单词"，然后直接对 Siri 说：
> "嘿 Siri，学单词"

### 2. 锁屏小组件

iOS 14+ 可以将快捷指令添加到锁屏小组件：
1. 长按锁屏
2. 点击 **自定义**
3. 添加 **快捷指令** 小组件
4. 选择你的学单词快捷指令

### 3. 背景模式（Apple Watch）

如果你有 Apple Watch，可以在手表上添加快捷指令 Complication，随时学习。

### 4. 与提醒事项结合

创建快捷指令，学完单词后自动在提醒事项中打卡：

```
（在方案1或2的最后添加）

添加操作：「添加新提醒事项」
- 列表: 学习打卡
- 标题: 完成今日英语学习
- 标记为已完成: 开
```

## 更新频率

- 每日单词池每天北京时间 **早上 6:00** 自动更新
- 使用 GitHub Actions 自动生成
- 从 5271 个单词中随机选择
- 无需手动操作

## 常见问题

### Q: 为什么有时候请求失败？
A: 可能是网络问题或 GitHub Pages 临时不可用。建议在快捷指令中添加"获取 URL 内容"失败时的重试逻辑。

### Q: 可以自定义学习的单词数量吗？
A: 可以！使用 `daily-words.json` 端点获取 20 个单词池，然后在快捷指令中自己筛选需要的数量。

### Q: 单词会重复吗？
A: 每天的单词池是随机生成的，可能会有重复。建议在本地记录已学习的单词ID。

### Q: 如何播放发音？
A: 使用快捷指令中的"打开 URL"操作，传入 `audioUrl` 字段的值即可播放。

### Q: 支持离线使用吗？
A: 目前不支持。但你可以在快捷指令中添加"存储到文件"操作，缓存数据供离线使用。

## 反馈与建议

如有问题或建议，欢迎在 GitHub 提 Issue：
https://github.com/onlinefchen/words-daily/issues

---

**祝你学习愉快！🎉**
