// ready gate
document.addEventListener('DOMContentLoaded',()=>document.body.classList.add('ready'));

// year
const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

// nav toggle
const t=document.querySelector('.nav-toggle'), l=document.getElementById('nav-list');
if(t&&l){t.addEventListener('click',()=>{const o=l.classList.toggle('open');t.setAttribute('aria-expanded',o?'true':'false')})}

// theme
const KEY='jh-theme', apply=t=>document.documentElement.setAttribute('data-theme',t);
apply(localStorage.getItem(KEY)||'dark');
document.getElementById('themeBtn')?.addEventListener('click',()=>{
  const n=(document.documentElement.getAttribute('data-theme')==='dark')?'light':'dark';
  apply(n); localStorage.setItem(KEY,n);
});

// spotlight parallax (hero)
(()=>{
  const hero=document.querySelector('.hero'), inner=document.querySelector('.hero-inner');
  if(!hero || !inner) return;
  const upd=(x,y)=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--mx',((x-r.left)/r.width)*100+'%');hero.style.setProperty('--my',((y-r.top)/r.height)*100+'%')};
  window.addEventListener('pointermove',e=>upd(e.clientX,e.clientY));
  let raf=0;
  inner.addEventListener('pointermove',e=>{
    const r=inner.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{inner.style.transform=`perspective(900px) rotateY(${px*6}deg) rotateX(${-py*6}deg)`})
  });
  inner.addEventListener('pointerleave',()=>inner.style.transform='perspective(900px)');
})();

// typewriter (home)
(()=>{
  const el=document.getElementById('typewriter'); if(!el) return;
  const roles=['Data Engineer','Analytics Engineer','Real-time Pipeline Builder','Warehouse & OLAP'];
  let i=0,pos=0,dir=1,cur=roles[0],tim;
  const step=()=>{el.textContent=cur.slice(0,pos);pos+=dir;
    if(dir>0&&pos>cur.length+6){dir=-1}else if(dir<0&&pos<=0){dir=1;i=(i+1)%roles.length;cur=roles[i]}
    tim=setTimeout(step,dir>0?60:30)};
  const start=()=>{if(!tim) step()}, stop=()=>{clearTimeout(tim);tim=null};
  document.addEventListener('visibilitychange',()=>{document.hidden?stop():start()}); start();
})();

// reveal on view
(()=>{
  const nodes=[...document.querySelectorAll('.reveal')];
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}})
  },{threshold:.15});
  nodes.forEach(n=>io.observe(n));
})();

// back to top
(()=>{
  const btn=document.createElement('button');btn.className='scrolltop';btn.innerHTML='↑';btn.title='Back to top';
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));document.body.appendChild(btn);
  const s=()=>btn.classList.toggle('show',(window.scrollY||document.documentElement.scrollTop)>400);
  window.addEventListener('scroll',s,{passive:true}); s();
})();
