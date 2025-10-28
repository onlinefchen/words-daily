import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 解析词汇文件
function parseDictFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  const chapters = [];
  let currentChapter = null;
  let wordIndex = 0;

  for (const line of lines) {
    // 章节标题以 # 开头
    if (line.startsWith('#')) {
      if (currentChapter) {
        chapters.push(currentChapter);
      }

      const chapterName = line.substring(1).trim();
      const chapterId = `ch${String(chapters.length + 1).padStart(3, '0')}`;

      // 解析章节分类
      let category = '基本词汇';
      let subcategory = '';

      if (chapterName.includes('基本词汇')) {
        category = '基本词汇';
        if (chapterName.includes('动词')) subcategory = '动词';
        else if (chapterName.includes('名词')) subcategory = '名词';
        else if (chapterName.includes('形容词')) subcategory = '形容词和副词';
      } else if (chapterName.includes('核心词汇')) {
        category = '核心词汇';
        const parts = chapterName.split(' ');
        subcategory = parts[parts.length - 1];
      } else if (chapterName.includes('阅读真题')) {
        category = '阅读真题认知词汇';
        const parts = chapterName.split(' ');
        subcategory = parts[parts.length - 1];
      }

      currentChapter = {
        id: chapterId,
        name: chapterName,
        category,
        subcategory,
        words: []
      };
    } else {
      // 单词行
      if (currentChapter) {
        wordIndex++;
        const wordId = `w${String(wordIndex).padStart(5, '0')}`;
        const isPhrase = line.includes(' ');

        currentChapter.words.push({
          id: wordId,
          word: line,
          type: isPhrase ? 'phrase' : 'single',
          chapterIndex: currentChapter.words.length + 1,
          globalIndex: wordIndex
        });
      }
    }
  }

  // 添加最后一个章节
  if (currentChapter) {
    chapters.push(currentChapter);
  }

  return chapters;
}

// 主函数
function main() {
  console.log('📚 开始解析词汇文件...\n');

  const dictDir = path.join(__dirname, '../dict');
  const dictFile = path.join(dictDir, '剑桥雅思词汇精典.txt');

  if (!fs.existsSync(dictFile)) {
    console.error('❌ 词汇文件不存在:', dictFile);
    process.exit(1);
  }

  // 解析文件
  const chapters = parseDictFile(dictFile);

  // 统计信息
  const totalWords = chapters.reduce((sum, ch) => sum + ch.words.length, 0);
  console.log(`✅ 解析完成:`);
  console.log(`   章节数: ${chapters.length}`);
  console.log(`   单词数: ${totalWords}\n`);

  // 创建输出目录
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 生成 meta.json
  const meta = {
    version: '1.0',
    source: '剑桥雅思词汇精典',
    totalChapters: chapters.length,
    totalWords: totalWords,
    lastUpdated: new Date().toISOString(),
    chapters: chapters.map(ch => ({
      id: ch.id,
      name: ch.name,
      category: ch.category,
      subcategory: ch.subcategory,
      wordCount: ch.words.length,
      estimatedMinutes: Math.ceil(ch.words.length * 1.5)
    }))
  };

  fs.writeFileSync(
    path.join(dataDir, 'meta.json'),
    JSON.stringify(meta, null, 2)
  );
  console.log('✅ 已生成 data/meta.json');

  // 生成基础单词文件
  const wordsBasic = {
    version: '1.0',
    totalWords: totalWords,
    chapters: chapters
  };

  fs.writeFileSync(
    path.join(dataDir, 'words-basic.json'),
    JSON.stringify(wordsBasic, null, 2)
  );
  console.log('✅ 已生成 data/words-basic.json');

  console.log('\n🎉 解析完成！可以运行 npm run generate 生成完整词库');
}

main();
