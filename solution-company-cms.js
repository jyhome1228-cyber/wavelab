document.body.classList.add('company-cms-light');

if(!document.getElementById('company-cms-light-css')){
  const light=document.createElement('link');
  light.id='company-cms-light-css';
  light.rel='stylesheet';
  light.href='solution-company-cms-light.css?v=20260911-1';
  document.head.appendChild(light);
}

const themeMeta=document.querySelector('meta[name="theme-color"]');
if(themeMeta)themeMeta.setAttribute('content','#ffffff');
else{
  const metaTheme=document.createElement('meta');
  metaTheme.name='theme-color';
  metaTheme.content='#ffffff';
  document.head.appendChild(metaTheme);
}

const heroVisual=document.querySelector('.solution-detail-visual img');
if(heroVisual){
  heroVisual.src='assets/dev/work-company-cms-light.svg?v=20260911-1';
}

const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');

const copy={
  dashboard:{
    title:'Dashboard',
    description:'현재 홈페이지 Preview와 콘텐츠 상태, 포트폴리오·뉴스 수, SEO 상태를 한 화면에서 확인합니다.',
    meta:'WEBSITE · CONTENT · STATUS'
  },
  content:{
    title:'Site Content',
    description:'회사명, Hero 제목, 소개 문장, 사업영역과 Layout Style을 편집하고 오른쪽 홈페이지 Preview에서 즉시 확인합니다.',
    meta:'EDITOR · LIVE PREVIEW · LAYOUT'
  },
  portfolio:{
    title:'Portfolio',
    description:'기업 프로젝트와 구축 사례를 추가하거나 정리해 홈페이지의 Works 영역을 운영합니다.',
    meta:'PROJECT · VISIBILITY · CONTENT'
  },
  news:{
    title:'News',
    description:'회사 소식과 공지 콘텐츠를 추가해 홈페이지의 News 영역을 지속적으로 운영합니다.',
    meta:'NEWS · UPDATE · PUBLISH'
  },
  seo:{
    title:'SEO',
    description:'페이지 제목과 Meta Description을 직접 관리하고 검색결과 Preview로 노출 문구를 확인합니다.',
    meta:'TITLE · DESCRIPTION · SEARCH'
  }
};

function activate(view){
  if(!copy[view]||!frame)return;
  tabs.forEach(tab=>tab.classList.toggle('is-active',tab.dataset.solutionTab===view));
  frame.src=`demo/company-cms/?view=${encodeURIComponent(view)}&guide=1`;
  if(title)title.textContent=copy[view].title;
  if(description)description.textContent=copy[view].description;
  if(meta)meta.textContent=copy[view].meta;
}

tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));
activate('dashboard');
