import type {
  EpisodeOutline,
  Character,
  GenerationResponse,
} from '../types'

/**
 * Format a single episode outline into a human-readable string.
 */
export function formatEpisodeOutline(
  episode: EpisodeOutline,
  locale: string
): string {
  const isChinese = locale === 'zh-CN'
  const lines: string[] = []

  if (isChinese) {
    lines.push(`【第 ${episode.episode} 集】${episode.title}`)
    if (episode.hook) {
      lines.push(`悬念：${episode.hook}`)
    }
    lines.push(`概要：${episode.synopsis}`)
    if (episode.scenes && episode.scenes.length > 0) {
      lines.push('')
      lines.push('场景：')
      episode.scenes.forEach((scene, idx) => {
        lines.push(`  ${idx + 1}. ${scene.location} - ${scene.title}`)
        if (scene.description) lines.push(`    描述：${scene.description}`)
        if (scene.duration) lines.push(`    时长：${scene.duration}`)
        if (scene.keyDialogue && scene.keyDialogue.length > 0) {
          scene.keyDialogue.forEach((line) => lines.push(`    对白：${line}`))
        }
      })
    }
  } else {
    lines.push(`[Episode ${episode.episode}] ${episode.title}`)
    if (episode.hook) {
      lines.push(`Hook: ${episode.hook}`)
    }
    lines.push(`Synopsis: ${episode.synopsis}`)
    if (episode.scenes && episode.scenes.length > 0) {
      lines.push('')
      lines.push('Scenes:')
      episode.scenes.forEach((scene, idx) => {
        lines.push(`  ${idx + 1}. ${scene.location} - ${scene.title}`)
        if (scene.description) lines.push(`     Description: ${scene.description}`)
        if (scene.duration) lines.push(`     Duration: ${scene.duration}`)
        if (scene.keyDialogue && scene.keyDialogue.length > 0) {
          scene.keyDialogue.forEach((line) => lines.push(`     Dialogue: ${line}`))
        }
      })
    }
  }

  return lines.join('\n')
}

/**
 * Format a character into a human-readable string.
 */
export function formatCharacter(
  character: Character,
  locale: string
): string {
  const isChinese = locale === 'zh-CN'
  const lines: string[] = []

  if (isChinese) {
    lines.push(`【${character.role === 'protagonist' ? '主角' : character.role === 'antagonist' ? '反派' : character.role === 'supporting' ? '配角' : '其他'}】${character.name}`)
    if (character.age) lines.push(`年龄：${character.age}`)
    if (character.personality && character.personality.length > 0) {
      lines.push(`性格：${character.personality.join('、')}`)
    }
    if (character.background) lines.push(`背景：${character.background}`)
    if (character.arc) lines.push(`弧光：${character.arc}`)
    if (character.relationships && character.relationships.length > 0) {
      lines.push('关系：')
      character.relationships.forEach((rel) => {
        lines.push(`  · ${rel.name}（${rel.relation}）`)
      })
    }
  } else {
    const roleLabel =
      character.role === 'protagonist' ? 'Protagonist' :
      character.role === 'antagonist' ? 'Antagonist' :
      character.role === 'supporting' ? 'Supporting' : 'Other'
    lines.push(`[${roleLabel}] ${character.name}`)
    if (character.age) lines.push(`Age: ${character.age}`)
    if (character.personality && character.personality.length > 0) {
      lines.push(`Personality: ${character.personality.join(', ')}`)
    }
    if (character.background) lines.push(`Background: ${character.background}`)
    if (character.arc) lines.push(`Arc: ${character.arc}`)
    if (character.relationships && character.relationships.length > 0) {
      lines.push('Relationships:')
      character.relationships.forEach((rel) => {
        lines.push(`  · ${rel.name} (${rel.relation})`)
      })
    }
  }

  return lines.join('\n')
}

/**
 * Format a complete script preview (all episodes) into a human-readable string.
 */
export function formatScriptPreview(
  episodes: EpisodeOutline[],
  locale: string
): string {
  const isChinese = locale === 'zh-CN'
  const parts: string[] = []

  if (isChinese) {
    parts.push('=== 剧本预览 ===')
    parts.push(`共 ${episodes.length} 集`)
    parts.push('')
  } else {
    parts.push('=== Script Preview ===')
    parts.push(`Total: ${episodes.length} episodes`)
    parts.push('')
  }

  episodes.forEach((episode) => {
    parts.push(formatEpisodeOutline(episode, locale))
    parts.push('')
  })

  return parts.join('\n')
}

/**
 * Generate shareable text for a complete generation response.
 */
export function generateShareText(
  response: GenerationResponse,
  locale: string
): string {
  const isChinese = locale === 'zh-CN'
  const lines: string[] = []

  if (isChinese) {
    lines.push(`🎬 ${response.title}`)
    lines.push('')
    lines.push(`📖 核心设定：`)
    lines.push(response.premise)
    lines.push('')
    lines.push(`👥 角色（${response.characters.length}个）：`)
    response.characters.forEach((char) => {
      lines.push(`  • ${char.name}（${char.role === 'protagonist' ? '主角' : char.role === 'antagonist' ? '反派' : char.role === 'supporting' ? '配角' : '其他'}）`)
    })
    lines.push('')
    lines.push(`📺 共 ${response.episodes.length} 集`)
    lines.push('')
    lines.push(response.episodes.map((ep) => `  ${ep.episode}. ${ep.title}`).join('\n'))
    lines.push('')
    lines.push('--- 由 短剧工坊 AI 生成 ---')
  } else {
    lines.push(`🎬 ${response.title}`)
    lines.push('')
    lines.push(`📖 Premise:`)
    lines.push(response.premise)
    lines.push('')
    lines.push(`👥 Characters (${response.characters.length}):`)
    response.characters.forEach((char) => {
      lines.push(`  • ${char.name} (${char.role})`)
    })
    lines.push('')
    lines.push(`📺 ${response.episodes.length} episodes`)
    lines.push('')
    lines.push(response.episodes.map((ep) => `  ${ep.episode}. ${ep.title}`).join('\n'))
    lines.push('')
    lines.push('--- Generated by Short Drama AI ---')
  }

  return lines.join('\n')
}
