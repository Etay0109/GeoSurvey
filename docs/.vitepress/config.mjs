import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'GeoSurvey',
  description: 'Mobile Survey & Analytics Platform',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/get-started' },
      { text: 'Screenshots', link: '/screenshots' },
      { text: 'GitHub', link: 'https://github.com/Etay0109/GeoSurvey' }
    ],

    sidebar: [
      {
        text: 'GeoSurvey Docs',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Get Started', link: '/get-started' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'SDK Usage', link: '/sdk-usage' },
          { text: 'API Reference', link: '/api-reference' },
          { text: 'Database Design', link: '/database-design' },
          { text: 'Analytics', link: '/analytics' },
          { text: 'Screenshots', link: '/screenshots' },
          { text: 'Demo Video', link: '/demo-video' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Etay0109/GeoSurvey' }
    ]
  }
})