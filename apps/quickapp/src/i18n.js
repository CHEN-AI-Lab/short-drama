const zh = {
  title: '短剧工坊',
  home: '生成',
  history: '历史',
  settings: '设置',
  login: '登录',
  register: '注册',
  generate: '生成剧本',
  genres: '选择题材',
  episodes: '集数',
  characters: '角色',
  arcs: '人物弧光',
  dailyLimit: '今日免费次数已用完',
  upgrade: '升级Pro',
}

const en = {
  title: 'Short Drama Studio',
  home: 'Create',
  history: 'History',
  settings: 'Settings',
  login: 'Sign In',
  register: 'Sign Up',
  generate: 'Generate',
  genres: 'Select Genres',
  episodes: 'Episodes',
  characters: 'Characters',
  arcs: 'Character Arcs',
  dailyLimit: 'Daily limit reached',
  upgrade: 'Upgrade to Pro',
}

export function getLocale() {
  try {
    const app = require('@system.app')
    const info = app.getInfo()
    return info.language === 'zh' ? 'zh-CN' : 'en'
  } catch (e) {
    return 'zh-CN'
  }
}

export function t(key) {
  const lang = getLocale()
  const messages = lang === 'zh-CN' ? zh : en
  return messages[key] || key
}