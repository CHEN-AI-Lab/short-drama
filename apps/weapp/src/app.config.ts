export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/history/index',
    'pages/auth/index',
    'pages/settings/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '短剧工坊',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#7c3aed',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '生成',
        iconPath: 'assets/generate.png',
        selectedIconPath: 'assets/generate-active.png',
      },
      {
        pagePath: 'pages/history/index',
        text: '历史',
        iconPath: 'assets/history.png',
        selectedIconPath: 'assets/history-active.png',
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置',
        iconPath: 'assets/settings.png',
        selectedIconPath: 'assets/settings-active.png',
      },
    ],
  },
})
