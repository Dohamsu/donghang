/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trip: {
          primary: '#287dfa',   // 대표 블루 (로고 및 버튼)
          primaryDark: '#1967d2', // hover 상태
          accent: '#00bcd4',    // 강조형 청록색 (보조 CTA)
          success: '#34c759',   // 성공 상태
          warning: '#ffb300',   // 경고
          error: '#ff4b4b',     // 오류
          gray: {
            50:  '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          },
          text: {
            primary: '#1a1a1a',
            secondary: '#4a4a4a',
            link: '#287dfa',
          },
          bg: {
            light: '#ffffff',
            muted: '#f7f9fb',
            card: '#f0f4fa',
          },
        },
      },
    },
  },
  plugins: [],
}