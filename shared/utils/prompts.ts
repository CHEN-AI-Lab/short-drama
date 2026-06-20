/**
 * System prompt builders for AI drama generation.
 * Varies JSON output structure per generation type.
 */

export interface BuildGenerationPromptParams {
  genres: string[]
  episodeCount: number
  locale: string
  autoEpisodeCount?: boolean
  generationType: string
  startEpisode?: number
  existingSummary?: string
  existingCharacters?: string[]
}

export function buildGenerationPrompt(params: BuildGenerationPromptParams): string {
  const { genres, episodeCount, locale, autoEpisodeCount, generationType, startEpisode, existingSummary, existingCharacters } = params
  const isChinese = locale === 'zh-CN'
  const genreList = genres.join(', ')

  const epCountStr = autoEpisodeCount
    ? (isChinese ? '由AI根据题材和剧情需要决定' : 'decided by AI based on the story')
    : (isChinese
      ? `严格生成 ${episodeCount} 集${startEpisode ? '（从第 ' + startEpisode + ' 集开始）' : ''}`
      : `${episodeCount} episodes${startEpisode ? ' (starting from ep ' + startEpisode + ')' : ''}`)

  // ── Character cap ──
  const MAX_CHARS = 10

  // ── Per-type JSON structures ──
  const zhStructure: Record<string, string> = {
    outline: `{
  "title": "剧本标题",
  "premise": "核心设定（100-200字）",
  "characters": [
    { "name": "角色名", "role": "主角/配角/反派" }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "第1集标题",
      "hook": "悬念钩子",
      "summary": "剧情概要（100-200字）"
    }
  ]
}`,
    scene: `{
  "title": "剧本标题",
  "premise": "核心设定（100-200字）",
  "characters": [
    { "name": "角色名", "age": "28", "personality": "性格描述", "background": "背景故事", "role": "主角/配角/反派" }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "第1集标题",
      "hook": "悬念钩子",
      "summary": "剧情概要（100-200字）",
      "scenes": [
        { "location": "场景地点", "description": "场景描述", "duration": "约30秒-2分钟", "characters": ["角色名"] }
      ]
    }
  ]
}`,
    character: `{
  "title": "剧本标题",
  "premise": "核心设定（100-200字）",
  "characters": [
    {
      "name": "角色名", "age": "28",
      "personality": "详细性格描述",
      "background": "完整的背景故事",
      "role": "主角/配角/反派",
      "relationship": "与其他角色的关系",
      "arc": "角色成长弧光"
    }
  ],
  "episodes": [
    { "episodeNumber": 1, "title": "第1集标题", "summary": "剧情概要" }
  ],
  "characterArcs": [
    {
      "name": "角色名",
      "arc": "整体成长弧光：从初始状态到最终蜕变的完整描述",
      "episodes": [
        { "episode": 1, "change": "本集中的角色心态/认知/能力关键转变" }
      ],
      "finalState": "角色最终结局与改变总结"
    }
  ]
}`,
    full_script: `{
  "title": "剧本标题",
  "premise": "核心设定（200-300字，包含世界观、故事背景和核心冲突）",
  "characters": [
    {
      "name": "角色名", "age": "28",
      "personality": "性格描述（20-50字）",
      "background": "背景故事（50-100字）",
      "role": "主角/配角/反派",
      "relationship": "与其他角色的关系"
    }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "第1集标题",
      "hook": "悬念钩子",
      "summary": "剧情概要（100-200字）",
      "scenes": [
        {
          "location": "场景地点",
          "description": "场景描述（150-300字，含角色动作、表情、环境细节）",
          "duration": "约30秒-2分钟",
          "characters": ["角色名"],
          "dialogue": "角色名：对白内容
角色名：对白内容
（每场景至少3-5轮对白，每句对白需体现角色性格）"
        }
      ]
    }
  ],
  "characterArcs": [
    {
      "name": "角色名",
      "arc": "整体成长弧光：从初始状态到最终蜕变的完整描述",
      "episodes": [
        { "episode": 1, "change": "本集中的角色心态/认知/能力关键转变" }
      ],
      "finalState": "角色最终结局与改变总结"
    }
  ]
}`,
  }

  const enStructure: Record<string, string> = {
    outline: `{
  "title": "Script title",
  "premise": "Core premise (100-200 words)",
  "characters": [
    { "name": "Character name", "role": "protagonist/supporting/antagonist" }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Episode 1 title",
      "hook": "Cliffhanger",
      "summary": "Plot summary (100-200 words)"
    }
  ]
}`,
    scene: `{
  "title": "Script title",
  "premise": "Core premise (100-200 words)",
  "characters": [
    { "name": "Character name", "age": "28", "personality": "Description", "background": "Background", "role": "protagonist/supporting/antagonist" }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Episode 1 title",
      "hook": "Cliffhanger",
      "summary": "Plot summary",
      "scenes": [
        { "location": "Location", "description": "Scene description", "duration": "30s-2min", "characters": ["Character names"] }
      ]
    }
  ]
}`,
    character: `{
  "title": "Script title",
  "premise": "Core premise (100-200 words)",
  "characters": [
    {
      "name": "Character name", "age": "28",
      "personality": "Detailed personality",
      "background": "Complete backstory",
      "role": "protagonist/supporting/antagonist",
      "relationship": "Relationships",
      "arc": "Character growth arc"
    }
  ],
  "episodes": [
    { "episodeNumber": 1, "title": "Episode 1 title", "summary": "Plot summary" }
  ],
  "characterArcs": [
    {
      "name": "Character name",
      "arc": "Complete transformation arc from initial state to final outcome",
      "episodes": [
        { "episode": 1, "change": "Key shift in character's mindset/knowledge/power in this episode" }
      ],
      "finalState": "Character's final outcome and growth summary"
    }
  ]
}`,
    full_script: `{
  "title": "Script title",
  "premise": "Core premise (200-300 words, includes world-building and central conflict)",
  "characters": [
    {
      "name": "Character name", "age": "28",
      "personality": "Detailed personality (20-50 words)",
      "background": "Backstory (50-100 words)",
      "role": "protagonist/supporting/antagonist",
      "relationship": "Relationships"
    }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Episode 1 title",
      "hook": "Cliffhanger",
      "summary": "Plot summary (100-200 words)",
      "scenes": [
        {
          "location": "Location",
          "description": "Scene description (150-300 words, includes character actions, expressions, environment details)",
          "duration": "30s-2min",
          "characters": ["Character names"],
          "dialogue": "CharacterName: dialogue line
CharacterName: dialogue line
(At least 3-5 exchanges per scene, each line must reflect character personality)"
        }
      ]
    }
  ],
  "characterArcs": [
    {
      "name": "Character name",
      "arc": "Complete transformation arc from initial state to final outcome",
      "episodes": [
        { "episode": 1, "change": "Key shift in character's mindset/knowledge/power in this episode" }
      ],
      "finalState": "Character's final outcome and growth summary"
    }
  ]
}`,
}

  const typename: Record<string, string> = isChinese
    ? { outline: '分集大纲', scene: '场景拆分', character: '人物弧光', full_script: '完整剧本' }
    : { outline: 'Outline', scene: 'Scene Breakdown', character: 'Character Arc', full_script: 'Full Script' }

  const typedesc: Record<string, string> = isChinese
    ? {
        outline: '只需要每集的标题、悬念钩子和剧情概要，不要场景和对白',
        scene: '需要每集的场景拆分（地点、时长、角色），不需要对白',
        character: '重点刻画角色性格、背景、关系和成长弧光，集数概要即可',
        full_script: '完整的剧本，包含所有场景的详细对白',
      }
    : {
        outline: 'Only episode titles, hooks and summaries — no scenes or dialogue',
        scene: 'Include scene breakdowns (location, duration, characters) — no dialogue',
        character: 'Focus on character profiles, backgrounds, relationships and arcs',
        full_script: 'Complete script with full dialogue for all scenes',
      }

  const jsonStructure = (isChinese ? zhStructure : enStructure)[generationType] || (isChinese ? zhStructure.full_script : enStructure.full_script)
  const tn = typename[generationType] || typename.full_script
  const td = typedesc[generationType] || typedesc.full_script

  if (isChinese) {
    const existingNames = existingCharacters?.length
      ? `\n已有角色：${existingCharacters.join('、')}。后续剧情**优先使用以上角色**，如剧情需要可以新增（每集新增不超过 1 人）。`
      : ''
    const batchHeader = startEpisode
      ? `\n## 分批生成说明\n这是第 ${startEpisode} 集起后续部分的生成请求。之前已生成：${existingSummary || '剧情已展开'}。${existingNames}\n请继续推进剧情，保持已有角色的性格和行为一致。`
      : ''

    const autoSignal = autoEpisodeCount
      ? `\n\n## 自动集数模式\n请根据剧情自然走向决定故事长度。每次输出的 JSON 中必须额外包含 "storyComplete" 字段：\n- 如果剧情已到自然结尾（所有主要冲突已解决，故事有完整收尾），设为 true\n- 如果故事仍需继续（还有悬念未解、新冲突即将展开），设为 false\n- 该字段在 JSON 顶层，与 title、episodes 同级`
      : ''

    return `你是一位专业的短剧剧本创作大师。请根据用户需求${tn === '分集大纲' ? '生成一份分集大纲' : tn === '场景拆分' ? '进行场景拆分' : tn === '人物弧光' ? '设计人物弧光' : '创作完整剧本'}。${batchHeader}${autoSignal}

## 当前模式：${tn}
${td}

## 输出格式要求
严格按照以下 JSON 结构输出，不要添加多余字段：

${jsonStructure}

## ⚠️ 硬性要求（必须遵守）
1. 题材：${genreList}
2. 集数：${epCountStr}
3. **角色数量上限 ${MAX_CHARS} 人**（主角 1-2 人、反派 0-1 人），在此范围内根据剧情自由决定。已有角色优先复用，新角色需剧情支撑。
4. **场景必须详细**：每场景描述 150-300 字（含动作、表情、环境），对白至少 3-5 轮，体现角色性格和冲突。禁止敷衍的简略描述。
5. 剧情有悬念和反转，节奏紧凑
6. 角色性格鲜明，行为一致
7. 每集结尾有悬念钩子
8. 全部中文输出

确保输出是有效 JSON，不要包含额外说明文字。`
  }

  const existingNamesEn = existingCharacters?.length
    ? `\nExisting characters: ${existingCharacters.join(', ')}. **Prioritize these characters** — only add new ones when the story requires it (max 1 new character per batch).`
    : ''
  const batchHeaderEn = startEpisode
    ? `\n\n## Batch Generation\nThis is a continuation request starting from episode ${startEpisode}. Previously generated: ${existingSummary || 'the story has started'}.${existingNamesEn}\nContinue the plot naturally, keeping character personalities and behaviors consistent.`
    : ''

  const autoSignalEn = autoEpisodeCount
    ? `\n\n## Auto Episode Mode\nDecide the story length naturally. Each JSON response must include a "storyComplete" field at the top level:\n- Set to true if the story has reached its natural conclusion (all major conflicts resolved, proper ending)\n- Set to false if the story continues (unresolved cliffhangers, new conflicts brewing)`
    : ''

  return `You are a professional short drama scriptwriter. Generate content based on user request.${batchHeaderEn}${autoSignalEn}

## Current Mode: ${tn}
${td}

## Output Format Requirements
Strictly follow this JSON structure, no extra fields:

${jsonStructure}

## ⚠️ Hard Rules (must follow)
1. Genres: ${genreList}
2. Episodes: ${epCountStr}
3. **Up to ${MAX_CHARS} characters** (1-2 protagonists, 0-1 antagonist). AI decides the exact count within this range based on the story.
4. **Scenes must be detailed**: Each scene description 150-300 words (actions, expressions, environment). At least 3-5 dialogue exchanges per scene showing character personality and conflict. No敷衍 minimal descriptions.
5. Plot must have suspense and twists
6. Characters must have distinct, consistent personalities
7. Each episode ends with a cliffhanger
8. Output in English

Ensure valid JSON output only.`
}

export interface BuildUserPromptParams {
  genres: string[]
  episodeCount: number
  generationType: string
  locale?: string
  additionalInstructions?: string
}

export function buildUserPrompt(params: BuildUserPromptParams): string {
  const { genres, episodeCount, generationType, locale, additionalInstructions } = params
  const isChinese = locale === 'zh-CN'
  const genreList = genres.join(' + ')

  const typeInstructions: Record<string, string> = isChinese
    ? {
        outline: '生成详细的每集大纲（含标题、悬念钩子和剧情概要），不需要场景和对白。',
        scene: '每集提供场景拆分（地点、时长、出场角色），不需要对白。',
        character: '重点刻画角色发展弧光，包含详细的性格档案、背景故事以及角色在各集中的变化。',
        full_script: '生成完整的剧本，包含所有场景的详细对白。',
      }
    : {
        outline: 'Generate a detailed episode-by-episode outline with hooks and summaries only (no full dialogue, no scene details).',
        scene: 'For each episode, provide a complete scene breakdown including locations, durations, and character appearances (no dialogue).',
        character: 'Focus on character development arcs. Include detailed personality profiles, backstories, and how each character changes across the episodes.',
        full_script: 'Generate the complete script with full dialogue for all scenes across all episodes.',
      }

  const baseInstruction = typeInstructions[generationType] || typeInstructions.outline

  let prompt = isChinese
    ? `生成一部 ${genres.join('、')} 题材的短剧，共 ${episodeCount} 集。`
    : `Generate a ${genreList} short drama with ${episodeCount} episodes.`
  prompt += isChinese
    ? `\n\n生成类型：${generationType === 'outline' ? '分集大纲' : generationType === 'scene' ? '场景拆分' : generationType === 'character' ? '人物弧光' : '完整剧本'}`
    : `\n\nGeneration type: ${generationType}`
  prompt += `\n${baseInstruction}`

  if (additionalInstructions) {
    prompt += isChinese
      ? `\n\n额外指令：${additionalInstructions}`
      : `\n\nAdditional instructions: ${additionalInstructions}`
  }

  return prompt
}
