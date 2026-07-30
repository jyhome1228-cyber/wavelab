# WAVELAB

디자인, 기획, 개발, 브랜딩과 비즈니스를 연결해 직접 결과물을 만드는 사람들을 위한 실무형 학습 플랫폼입니다.

## 현재 구성
- 디자인 미디어형 에디토리얼 레이아웃
- 블루 포인트 컬러 `#245BFF`
- 데스크톱 4단 / 태블릿 2단 / 모바일 1단 반응형 카드 그리드
- Magazine, Article, Study, About 하위 페이지
- 아티클 상세 페이지 템플릿
- 카테고리 필터, 검색 패널, 모바일 메뉴
- 스크롤 리빌 애니메이션과 뉴스레터 폼 데모
- 외부 라이브러리 없는 HTML/CSS/JavaScript 구성

## 주요 파일
- `index.html`: 메인 랜딩 페이지
- `magazine.html`: 주제별 기획 매거진
- `article.html`: 카테고리 필터가 포함된 아티클 목록
- `article-detail.html`: 아티클 상세 템플릿
- `study.html`: 프로젝트형 스터디 목록과 학습 과정
- `about.html`: 브랜드 소개, 미션, 비전과 핵심 가치
- `styles.css`: 공통 디자인 시스템과 반응형 스타일
- `script.js`: 공통 헤더·푸터, 콘텐츠 렌더링, 검색과 인터랙션
- `assets/favicon.svg`: WAVELAB 파비콘
- `CNAME`: `wavelab.my` 커스텀 도메인 설정

## 로컬 실행
```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속합니다.

## 배포
GitHub Pages에서 배포 소스를 `main` 브랜치의 `/ (root)`로 지정하면 정적 사이트로 배포할 수 있습니다.
