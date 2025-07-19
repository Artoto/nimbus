/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/:path*", // ใช้กับทุก path
        headers: [
          // 1. Content Security Policy (CSP)
          // ป้องกัน XSS และการโหลดทรัพยากรที่ไม่ได้รับอนุญาต
          // ต้องปรับ 'self' และแหล่งที่มาอื่นๆ ให้ตรงกับที่คุณใช้จริง
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' https://example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';`,
          },
          // 2. X-Frame-Options
          // ป้องกัน Clickjacking โดยการฝังหน้าเว็บของคุณใน iframe
          {
            key: "X-Frame-Options",
            value: "DENY", // หรือ 'SAMEORIGIN' หากต้องการให้ฝังได้จากโดเมนเดียวกัน
          },
          // 3. X-Content-Type-Options
          // ป้องกัน MIME-type sniffing (ทำให้ browser ตีความ content type ผิด)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // 4. Referrer-Policy
          // ควบคุมข้อมูล Referrer ที่จะส่งไปเมื่อผู้ใช้คลิกลิงก์
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // หรือ 'no-referrer'
          },
          // 5. Strict-Transport-Security (HSTS)
          // บังคับให้ browser ใช้ HTTPS เสมอสำหรับโดเมนของคุณ
          // ควรใช้เมื่อคุณมั่นใจว่าเว็บของคุณเป็น HTTPS ตลอดไป
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // 6. X-XSS-Protection (ส่วนใหญ่ถูกแทนที่ด้วย CSP)
          // เปิดใช้งาน XSS filter ใน browser เก่าๆ
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // 7. Permissions-Policy (Feature Policy เดิม)
          // ควบคุม API และฟีเจอร์ของ browser ที่หน้าเว็บสามารถใช้ได้
          // ตัวอย่าง: ไม่อนุญาตให้ใช้ microphone
          {
            key: "Permissions-Policy",
            value: "microphone=()", // หรือ 'geolocation=(self "https://example.com")'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
