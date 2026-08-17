(()=>{
  const titles={
    'magazine-daangn-seed-design-system-v3.html':'당근 SEED, 디자인 시스템은 어떻게 하나의 브랜드가 되었나',
    'magazine-63-building-studio-fnt-identity.html':'63빌딩, 물리적 상징을 정서적 브랜드로 다시 설계하다',
    'magazine-matcha-society-modern-tradition.html':'말차 소사이어티, 전통 차 문화를 위한 가장 현대적인 포맷',
    'magazine-montana-hannam-color-modular.html':'몬타나, 컬러와 모듈로 완성한 취향의 시스템',
    'magazine-ferrari-yoonseul-korean-craft.html':'페라리 12칠린드리 ‘윤슬’, 한국 공예를 품은 제작 방식',
    'magazine-muds-global-cultural-brand.html':'뮷즈, 한국 문화를 세계인의 일상으로 번역하다',
    'magazine-fold-studio-room-divider.html':'Fold Studio, 벽 없이 공간을 나누는 부드러운 파티션',
    'magazine-luxury-wellness-lifestyle.html':'디올·에르메스·발렌시아가가 설계한 웰니스 라이프',
    'magazine-apple-liquid-glass-usability.html':'애플 리퀴드 글래스, 아름다움과 사용성 사이의 선택',
    'magazine-sk-broadband-giga-wifi7.html':'SK브로드밴드 기가 와이파이 7, 보이지 않는 서비스를 디자인하다',
    'magazine-hyundai-motorstudio-culture-platform.html':'현대 모터스튜디오, 자동차 브랜드를 문화 플랫폼으로 확장하다',
    'magazine-shinhan-visual-system.html':'신한은행, 신뢰를 움직이는 비주얼 시스템',
    'magazine-bugatti-blanc-eternel.html':'부가티 블랑 에테르넬, 도자기의 미학을 달리는 조형으로',
    'magazine-prada-gentle-monster.html':'프라다 × 젠틀몬스터, 절제된 브랜드가 공간이 되는 순간',
    'magazine-acne-studios-pink-library.html':'아크네 스튜디오 핑크 라이브러리, 패션과 독서가 만나는 공간',
    'magazine-braun-proportion-system.html':'브라운, 기능을 이해시키는 비율의 디자인',
    'magazine-concept-car-future-design.html':'제네시스 X 그란 이퀘이터, 미래를 보여주는 콘셉트카',
    'magazine-rolls-royce-phantom-arabesque.html':'롤스로이스 팬텀 아라베스크, 문화를 번역한 비스포크',
    'magazine-the-hyundai-gift-story-curation.html':'더현대 기프트, 선물을 관계의 이야기로 큐레이션하다',
    'magazine-braun-beams-color-classic.html':'브라운 × 빔스, 클래식에 컬러를 더한 협업',
    'magazine-peach-air-rebranding.html':'피치항공, 저가를 넘어 신뢰를 설계한 리브랜딩',
    'magazine-coca-cola-visual-system.html':'코카콜라, 핵심 자산을 다시 정렬한 글로벌 비주얼 시스템'
  };
  const page=location.pathname.split('/').pop();
  const title=titles[page];
  if(!title)return;
  const h1=document.querySelector('.article-hero h1');
  if(h1)h1.textContent=title;
  document.title=`${title} — AESOST`;
  const og=document.querySelector('meta[property="og:title"]');
  if(og)og.content=title;
  document.body.dataset.articleTitle=title;
})();