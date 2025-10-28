import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从所有章节中随机选择单词
function selectRandomWords(allWords, count) {
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 生成每日单词API
async function generateDailyWords() {
  console.log('📚 开始生成每日单词...\n');

  const dataDir = path.join(__dirname, '../data');
  const apiDir = path.join(__dirname, '../public/api');

  // 确保API目录存在
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  // 读取所有章节文件
  const chaptersDir = path.join(dataDir, 'chapters');
  const chapterFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));

  console.log(`📖 找到 ${chapterFiles.length} 个章节文件`);

  // 收集所有单词
  const allWords = [];
  chapterFiles.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf-8'));
    content.forEach(chapter => {
      chapter.words.forEach(word => {
        allWords.push({
          ...word,
          chapter: chapter.id,
          chapterName: chapter.name
        });
      });
    });
  });

  console.log(`📊 总单词数: ${allWords.length}\n`);

  // 生成每日单词池（20个单词）
  const dailyPoolSize = 20;
  const dailyWords = selectRandomWords(allWords, dailyPoolSize);

  // 生成今日单词池文件
  const dailyPoolData = {
    generated: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    totalWords: dailyWords.length,
    words: dailyWords
  };

  fs.writeFileSync(
    path.join(apiDir, 'daily-words.json'),
    JSON.stringify(dailyPoolData, null, 2)
  );
  console.log(`✅ 已生成 public/api/daily-words.json (${dailyPoolSize} 个单词)`);

  // 生成快速学习API（2个单词，简化格式）
  const quickLearnWords = dailyWords.slice(0, 2).map(word => ({
    word: word.word,
    pronunciation: word.pronunciation?.us || '',
    meanings: word.meanings || [],
    examples: word.examples || [],
    memoryTips: word.memoryTips || {},
    audioUrl: word.audioUrl || '',
    chapter: word.chapterName
  }));

  const quickLearnData = {
    generated: new Date().toISOString(),
    count: quickLearnWords.length,
    words: quickLearnWords
  };

  fs.writeFileSync(
    path.join(apiDir, 'quick-learn.json'),
    JSON.stringify(quickLearnData, null, 2)
  );
  console.log(`✅ 已生成 public/api/quick-learn.json (2 个单词)`);

  // 生成随机2个单词的端点（每次请求可以从池中轮换）
  for (let i = 0; i < 10; i++) {
    const startIdx = i * 2;
    if (startIdx + 2 <= dailyWords.length) {
      const pairWords = dailyWords.slice(startIdx, startIdx + 2).map(word => ({
        word: word.word,
        pronunciation: word.pronunciation?.us || '',
        meanings: word.meanings || [],
        examples: word.examples || [],
        memoryTips: word.memoryTips || {},
        audioUrl: word.audioUrl || '',
        chapter: word.chapterName
      }));

      const pairData = {
        generated: new Date().toISOString(),
        pair: i + 1,
        count: pairWords.length,
        words: pairWords
      };

      fs.writeFileSync(
        path.join(apiDir, `words-pair-${i + 1}.json`),
        JSON.stringify(pairData, null, 2)
      );
    }
  }
  console.log(`✅ 已生成 10 个单词对文件 (words-pair-1.json ~ words-pair-10.json)`);

  console.log('\n🎉 每日单词生成完成！');
  console.log('\nAPI 端点：');
  console.log('  - /api/daily-words.json    (今日20个单词池)');
  console.log('  - /api/quick-learn.json    (快速学习2个单词)');
  console.log('  - /api/words-pair-[1-10].json  (单词对1-10)');
}

generateDailyWords().catch(console.error);
