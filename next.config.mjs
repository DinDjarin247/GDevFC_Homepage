/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 export: `next build` 실행 시 out/ 디렉터리에 순수 HTML/CSS/JS 생성
  output: 'export',
  // GitHub Pages 등 정적 호스팅에서 /about → /about/index.html 로 매칭되도록
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
