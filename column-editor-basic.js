const form=document.querySelector('[data-column-form]');
const editor=document.querySelector('[data-column-editor]');
const hidden=document.querySelector('[data-column-content]');
let savedRange=null;

function syncContent(){if(hidden&&editor)hidden.value=editor.innerHTML.trim()}
function saveSelection(){const selection=window.getSelection();if(selection&&selection.rangeCount&&editor?.contains(selection.anchorNode))savedRange=selection.getRangeAt(0).cloneRange()}
function restoreSelection(){if(!savedRange||!editor)return;const selection=window.getSelection();selection.removeAllRanges();selection.addRange(savedRange)}
function currentBlock(){const selection=window.getSelection();let node=selection?.anchorNode;if(node?.nodeType===3)node=node.parentElement;return node?.closest?.('p,h2,h3,h4,blockquote,li')||null}

if(editor&&hidden){
  editor.setAttribute('contenteditable','true');
  editor.addEventListener('input',syncContent);
  editor.addEventListener('keyup',saveSelection);
  editor.addEventListener('mouseup',saveSelection);
  editor.addEventListener('focus',()=>{if(!editor.innerHTML.trim())editor.innerHTML='<p><br></p>';saveSelection()},{once:true});
  editor.addEventListener('paste',event=>{event.preventDefault();const text=event.clipboardData?.getData('text/plain')||'';document.execCommand('insertText',false,text);syncContent()});

  const hydrate=()=>{if(hidden.value&&!editor.innerHTML.trim()){editor.innerHTML=hidden.value.includes('<')?hidden.value:hidden.value.split(/\n\s*\n/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('');syncContent()}};
  hydrate();
  setTimeout(hydrate,300);
  setTimeout(hydrate,800);

  document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('mousedown',saveSelection));
  document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>{
    let value=null;
    if(button.dataset.command==='createLink'){value=window.prompt('연결할 주소를 입력해 주세요.','https://');if(!value)return}
    editor.focus();restoreSelection();document.execCommand(button.dataset.command,false,value);syncContent();saveSelection();
  }));
  document.querySelector('[data-format-block]')?.addEventListener('change',event=>{editor.focus();restoreSelection();document.execCommand('formatBlock',false,event.target.value);syncContent();saveSelection()});
  document.querySelectorAll('[data-align]').forEach(button=>button.addEventListener('click',()=>{editor.focus();restoreSelection();const name=button.dataset.align;document.execCommand(`justify${name.charAt(0).toUpperCase()}${name.slice(1)}`,false,null);syncContent();saveSelection()}));
  document.querySelector('[data-line-height]')?.addEventListener('change',event=>{editor.focus();restoreSelection();const block=currentBlock();if(block)block.style.lineHeight=event.target.value;syncContent();saveSelection()});
  document.querySelector('[data-letter-spacing]')?.addEventListener('change',event=>{editor.focus();restoreSelection();const block=currentBlock();if(block)block.style.letterSpacing=event.target.value;syncContent();saveSelection()});
  document.querySelector('[data-paragraph-spacing]')?.addEventListener('change',event=>{editor.focus();restoreSelection();const block=currentBlock();if(block)block.style.marginBottom=event.target.value;syncContent();saveSelection()});
  document.querySelector('[data-editor-image]')?.addEventListener('change',event=>{
    const file=event.target.files?.[0];if(!file)return;
    if(editor.querySelectorAll('img').length>=3){alert('본문 이미지는 최대 3장까지 등록할 수 있습니다.');event.target.value='';return}
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){alert('8MB 이하 JPG, PNG, WEBP 이미지만 등록할 수 있습니다.');event.target.value='';return}
    const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{const max=1200,ratio=Math.min(1,max/image.width),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);editor.focus();restoreSelection();document.execCommand('insertImage',false,canvas.toDataURL('image/jpeg',.72));document.execCommand('insertParagraph',false,null);syncContent();saveSelection()};image.src=String(reader.result||'')};reader.readAsDataURL(file);event.target.value='';
  });
  form?.addEventListener('submit',syncContent);
  document.querySelector('[data-save-draft]')?.addEventListener('click',syncContent);
}