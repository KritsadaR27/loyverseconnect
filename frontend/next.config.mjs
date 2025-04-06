/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // ปิดการตรวจสอบ ESLint ในขั้นตอนการ build
      ignoreDuringBuilds: true,
    },
  };
  
  export default nextConfig;