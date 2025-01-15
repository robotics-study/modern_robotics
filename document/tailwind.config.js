/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // Tailwind가 파일을 스캔할 경로
    theme: {
        extend: {}, // 사용자 정의 스타일 확장
    },
    plugins: [], // 필요시 플러그인 추가
};
