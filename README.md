# WAVELAB

`wavelab.my`에서 운영할 웨이블랩 웹사이트의 기본 정적 사이트 프로젝트입니다.

## 현재 구성
- 블루 포인트 컬러 `#2F64FF`
- 반응형 편집형 아티클 레이아웃
- 검색 패널, 카테고리 필터, 모바일 메뉴
- GitHub Pages 커스텀 도메인용 `CNAME` 포함
- 외부 라이브러리 없이 HTML/CSS/JavaScript로 구성

## 로컬 실행
```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속합니다.

## 주요 파일
- `index.html`: 기본 페이지 구조
- `styles.css`: 공통 디자인 및 반응형 스타일
- `script.js`: 메뉴, 검색, 필터, 폼 인터랙션
- `assets/`: 파비콘 및 임시 커버 이미지
- `CNAME`: GitHub Pages 커스텀 도메인 설정

## 배포
GitHub Pages에서 배포 소스를 `main` 브랜치의 `/ (root)`로 지정한 뒤, DNS에서 `wavelab.my`를 GitHub Pages에 연결합니다.
