import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PROMPT_TEMPLATE = `You are an experienced IELTS vocabulary teacher and memory expert.
Please generate comprehensive learning materials for the following word.

Word: {WORD}

Generate a JSON response with these fields:

1. **pronunciation** (object)
   - us: American pronunciation in IPA format

2. **meanings** (array, 1-2 most common meanings)
   Each meaning object should include:
   - pos: Part of speech (v. / n. / adj. / adv. / phr.)
   - zh: Chinese definition (concise and clear)
   - en: English definition using simple, IELTS-level vocabulary

3. **examples** (array, exactly 2 examples)
   Each example object should include:
   - en: Natural English sentence at IELTS level (8-15 words)
   - zh: Clear Chinese translation

4. **memoryTips** (object, ONLY include if genuinely helpful)
   Fields (omit if not applicable):
   - etymology: Real word root/origin analysis (if etymologically sound)
   - association: Creative but logical association method
   - mnemonic: Sound-based memory aid (ONLY if it sounds natural)

CRITICAL: Memory tips must be genuinely useful, NOT forced. If no good technique exists, omit the field entirely.

Return ONLY valid JSON, no additional text.`;

// 调用 ChatGPT 生成单词详情
async function generateWordDetails(word) {
  try {
    const prompt = PROMPT_TEMPLATE.replace('{WORD}', word);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates vocabulary learning materials in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const data = JSON.parse(content);

    // 添加音频 URL
    data.audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;

    return data;
  } catch (error) {
    console.error(`   ❌ 生成失败 "${word}":`, error.message);
    return null;
  }
}

// 批量并发生成（优化版）
async function generateBatch(words, startIndex = 0) {
  const results = [];
  const failed = [];
  const BATCH_SIZE = 50; // 每批并发处理 50 个

  for (let i = startIndex; i < words.length; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, words.length);
    const batch = words.slice(i, batchEnd);

    console.log(`\n   📦 批次 ${Math.floor(i / BATCH_SIZE) + 1}: 处理 ${i + 1}-${batchEnd} (共 ${batch.length} 个)`);

    // 并发处理这一批
    const batchPromises = batch.map(async (word, idx) => {
      const globalIdx = i + idx;
      console.log(`   [${globalIdx + 1}/${words.length}] 正在生成: ${word.word}`);

      try {
        const details = await generateWordDetails(word.word);
        if (details) {
          return { success: true, word: { ...word, ...details } };
        } else {
          return { success: false, word };
        }
      } catch (error) {
        console.error(`   ❌ 批次错误 "${word.word}":`, error.message);
        return { success: false, word };
      }
    });

    // 等待这一批全部完成
    const batchResults = await Promise.all(batchPromises);

    // 分类结果
    batchResults.forEach(result => {
      if (result.success) {
        results.push(result.word);
      } else {
        failed.push(result.word);
      }
    });

    // 保存进度
    console.log(`   💾 保存进度... (${results.length} 个成功, ${failed.length} 个失败)`);
    saveProgress(results, failed, batchEnd);

    // 批次之间短暂延迟，避免过载
    if (batchEnd < words.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { results, failed };
}

// 保存进度
function saveProgress(results, failed, processedCount) {
  const dataDir = path.join(__dirname, '../data');
  const progressFile = path.join(dataDir, 'generation-progress.json');

  fs.writeFileSync(
    progressFile,
    JSON.stringify({
      processedCount,
      successCount: results.length,
      failedCount: failed.length,
      lastUpdated: new Date().toISOString(),
      results,
      failed
    }, null, 2)
  );
}

// 主函数
async function main() {
  console.log('🤖 开始生成词库（使用 ChatGPT）...\n');

  // 检查 API Key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ 缺少 OPENAI_API_KEY 环境变量');
    process.exit(1);
  }

  // 读取基础词汇文件
  const dataDir = path.join(__dirname, '../data');
  const basicFile = path.join(dataDir, 'words-basic.json');

  if (!fs.existsSync(basicFile)) {
    console.error('❌ 请先运行 npm run parse 生成基础词汇文件');
    process.exit(1);
  }

  const basicData = JSON.parse(fs.readFileSync(basicFile, 'utf-8'));
  const allWords = basicData.chapters.flatMap(ch =>
    ch.words.map(w => ({ ...w, chapter: ch.id, chapterName: ch.name }))
  );

  console.log(`📊 总单词数: ${allWords.length}`);
  console.log(`⏱️  预计耗时: ${Math.ceil(allWords.length / 60)} - ${Math.ceil(allWords.length / 50)} 分钟\n`);

  // 检查是否有进度文件
  const progressFile = path.join(dataDir, 'generation-progress.json');
  let startIndex = 0;

  if (fs.existsSync(progressFile)) {
    const progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
    startIndex = progress.processedCount || 0;
    console.log(`📦 检测到进度文件，从第 ${startIndex + 1} 个单词继续...\n`);
  }

  // 开始生成
  const startTime = Date.now();
  const { results, failed } = await generateBatch(allWords, startIndex);
  const endTime = Date.now();

  // 统计
  console.log('\n' + '='.repeat(50));
  console.log('✅ 生成完成！');
  console.log(`   成功: ${results.length} 个`);
  console.log(`   失败: ${failed.length} 个`);
  console.log(`   耗时: ${Math.ceil((endTime - startTime) / 1000 / 60)} 分钟`);

  if (failed.length > 0) {
    console.log('\n⚠️  失败的单词:');
    failed.forEach(w => console.log(`   - ${w.word}`));
  }

  // 保存完整词库
  const chaptersDir = path.join(dataDir, 'chapters');
  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true });
  }

  // 按章节分组并打包（每 10 章一个文件）
  const chapterGroups = {};
  results.forEach(word => {
    const chNum = parseInt(word.chapter.replace('ch', ''));
    const groupKey = Math.floor((chNum - 1) / 10) * 10 + 1;
    const groupEnd = groupKey + 9;
    const groupId = `ch${String(groupKey).padStart(3, '0')}-${String(groupEnd).padStart(3, '0')}`;

    if (!chapterGroups[groupId]) {
      chapterGroups[groupId] = {};
    }

    if (!chapterGroups[groupId][word.chapter]) {
      const chapterInfo = basicData.chapters.find(c => c.id === word.chapter);
      chapterGroups[groupId][word.chapter] = {
        id: word.chapter,
        name: chapterInfo.name,
        category: chapterInfo.category,
        subcategory: chapterInfo.subcategory,
        words: []
      };
    }

    chapterGroups[groupId][word.chapter].words.push(word);
  });

  // 保存章节文件
  Object.entries(chapterGroups).forEach(([groupId, chapters]) => {
    const chaptersArray = Object.values(chapters);
    fs.writeFileSync(
      path.join(chaptersDir, `${groupId}.json`),
      JSON.stringify(chaptersArray, null, 2)
    );
    console.log(`   ✅ 已生成 data/chapters/${groupId}.json`);
  });

  console.log('\n🎉 所有文件生成完成！可以运行 npm run dev 启动开发服务器');
}

main();
