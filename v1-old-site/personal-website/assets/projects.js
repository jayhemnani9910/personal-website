const grid = document.getElementById('grid');
const q = document.getElementById('q');
const tagsEl = document.getElementById('tags');
const modal = document.getElementById('modal');
const box = document.querySelector('#modal .modal-box');
const mTitle = document.getElementById('mTitle');
const mClose = document.getElementById('mClose');
const DATA = window.PROJECTS || [];

// build unique tags
const allTags = [...new Set(DATA.flatMap(p => p.tags || []))].sort();
let active = new Set();

function tagChip(name){
  const b = document.createElement('button');
  b.className = 'tag';
  b.textContent = name;
  b.addEventListener('click', ()=>{ active.has(name) ? active.delete(name) : active.add(name); b.classList.toggle('active'); render(); });
  return b;
}
allTags.forEach(t => tagsEl.appendChild(tagChip(t)));

function pill(text){ return `<span>${text}</span>`; }

function card(p, i){
  const el = document.createElement('article');
  el.className = 'proj-card reveal';
  const th = document.createElement('div');
  th.className = 'thumb';
  th.textContent = (p.tags?.[0] || 'preview').toUpperCase();
  th.addEventListener('click', ()=>openModal(p));
  el.appendChild(th);

  el.insertAdjacentHTML('beforeend', `
    <h3>${p.title}</h3>
    <p class="meta">${p.role || ''} ${p.period ? ' • ' + p.period : ''}</p>
    <p>${p.headline || ''}</p>
    <div class="badges">${(p.tags||[]).slice(0,6).map(pill).join('')}</div>
    <p class="links">
      <a class="btn primary" href="javascript:void(0)" onclick="openModal(DATA[${i}])">View case study</a>
      ${p.links?.code ? `<a class="btn ghost" target="_blank" rel="noopener" href="${p.links.code}">Code</a>` : ''}
      ${p.links?.demo ? `<a class="btn ghost" target="_blank" rel="noopener" href="${p.links.demo}">Demo</a>` : ''}
      ${p.links?.paper ? `<a class="btn ghost" target="_blank" rel="noopener" href="${p.links.paper}">Paper</a>` : ''}
    </p>
  `);
  return el;
}

function render(){
  grid.innerHTML = '';
  const qv = (q.value || '').toLowerCase();
  const list = DATA.filter(p => {
    const text = [p.title, p.headline, p.role, (p.tags||[]).join(' '), (p.tech||[]).join(' ')]
                  .join(' ').toLowerCase();
    const tagOK = active.size ? (p.tags||[]).some(t => active.has(t)) : true;
    const qOK = !qv || text.includes(qv);
    return tagOK && qOK;
  });
  list.forEach((p,i)=>grid.appendChild(card(p,i)));
  observe();
}

q?.addEventListener('input', render);

// intersection reveal
function observe(){
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}})
  },{threshold:.15});
  [...document.querySelectorAll('.reveal')].forEach(n=>io.observe(n));
}

render();

// Modal
mClose?.addEventListener('click', ()=>modal.classList.remove('open'));
modal?.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('open'); });

function sec(title, inner){
  return `<div class="section"><h4>${title}</h4>${inner}</div>`;
}
function list(items){ return `<ul class="check">${items.map(x=>`<li>${x}</li>`).join('')}</ul>`; }

window.openModal = function(p){
  mTitle.textContent = p.title;

  const left = [
    sec('Overview', `<p>${p.headline||''}</p>${p.challenge?`<p class="muted"><strong>Challenge:</strong> ${p.challenge}</p>`:''}`),
    p.solution?.length ? sec('Solution', list(p.solution)) : '',
    p.impact?.length ? sec('Impact', list(p.impact)) : '',
  ].join('');

  const right = [
    p.tech?.length ? sec('Tech Stack', `<div class="pills">${p.tech.map(t=>`<span>${t}</span>`).join('')}</div>`) : '',
    p.diagram ? sec('Architecture', `<pre class="arch">${p.diagram}</pre>`) : '',
    (p.images?.length||p.video) ? sec('Gallery', `
        ${p.video ? `<div style="aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;margin-bottom:8px"><iframe width="100%" height="100%" src="${p.video}" frameborder="0" allowfullscreen></iframe></div>`:``}
        ${p.images?.length? `<div class="gallery">${p.images.map(src=>`<img src="${src}" alt="">`).join('')}</div>`:''}
      `) : '',
    (p.links && (p.links.code || p.links.demo || p.links.paper)) ? sec('Links',
      `<p class="links inline">
        ${p.links.code? `<a class="btn ghost" target="_blank" rel="noopener" href="${p.links.code}">Code</a>`:''}
        ${p.links.demo? `<a class="btn ghost" target="_blank" rel="noopener" href="${p.links.demo}">Demo</a>`:''}
        ${p.links.paper? `<a class="btn ghost" target="_blank" rel="noopener" href="${p.links.paper}">Paper</a>`:''}
      </p>`
    ) : ''
  ].join('');

  const html = `
    <header>
      <div class="modal-title">${p.title}</div>
      <button id="mClose" class="btn ghost">Close</button>
    </header>
    <div class="case">
      <div>${left}</div>
      <aside>${right}</aside>
    </div>
  `;

  box.innerHTML = html;
  box.querySelector('#mClose')?.addEventListener('click', ()=>modal.classList.remove('open'));
  modal.classList.add('open');
};
