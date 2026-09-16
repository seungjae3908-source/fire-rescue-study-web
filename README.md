# 구급 합격AI

소방공무원 구급 경채 필기시험 학습을 위한 local-first PWA입니다.

- Replit 미사용
- 유료 AI API 미사용 / 유료 fallback 없음
- WebLLM 기반 브라우저 로컬 LLM
- PDF.js 기반 PDF 텍스트 추출
- Tesseract.js 기반 OCR (인쇄체 우선, 손글씨는 교정 필요)
- 개인 자료는 기본적으로 서버에 업로드하지 않고 브라우저에서 처리
- PWA 설치 및 오프라인 정적 화면 지원

## 배포
정적 파일이므로 Vercel / GitHub Pages / Cloudflare Pages 등에서 배포 가능합니다.
