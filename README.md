# WAVELAB

`wavelab.my`에서 운영할 웨이블랩 웹사이트의 기본 정적 사이트 프로젝트입니다.

## 현재 구성
- 웨이블랩 기본 브랜드명 및 도메인 메타태그
- 블루 포인트 컬러 `#245BFF`
- 반응형 헤더와 모바일 메뉴
- 향후 기획을 확장하기 위한 기본 섹션 구조
- GitHub Pages 커스텀 도메인용 `CNAME`
- 외부 라이브러리 없는 HTML/CSS/JavaScript 구성

## 로컬 실행
```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속합니다.

## 주요 파일
- `index.html`: 기본 페이지 구조와 메타태그
- `styles.css`: 컬러 토큰, 레이아웃 및 반응형 스타일
- `script.js`: 모바일 메뉴와 연도 표시
- `assets/favicon.svg`: 웨이블랩 임시 파비콘
- `CNAME`: `wavelab.my` 커스텀 도메인 설정
- `.nojekyll`: GitHub Pages 정적 파일 호환 설정

## 배포
GitHub Pages에서 배포 소스를 `main` 브랜치의 `/ (root)`로 지정한 뒤, DNS에서 `wavelab.my`를 GitHub Pages에 연결합니다.
