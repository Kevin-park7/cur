/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  // 정적 페이지 생성 비활성화
  staticPageGenerationTimeout: 0,
  // 동적 렌더링 사용
  dynamicParams: true,
  // 서버 사이드 렌더링 설정
  reactStrictMode: true,
  swcMinify: true
}

module.exports = nextConfig 