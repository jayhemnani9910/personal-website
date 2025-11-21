// year
document.getElementById('year').textContent = new Date().getFullYear();

// mobile nav
const toggle = document.querySelector('.nav-toggle');
const list = document.getElementById('nav-list');
if (toggle) {
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// theme (simple dark-only placeholder; ready for future light theme)
const themeBtn = document.getElementById('themeBtn');
themeBtn?.addEventListener('click', () => {
  document.body.classList.toggle('light'); // add a light theme later if you want
});

// typewriter
const roles = [
  'Data Engineer',
  'Analytics Engineer',
  'Real-time Pipeline Builder',
  'Dashboard Craftsman',
  'Kafka + Airflow Enjoyer'
];
const el = document.getElementById('typewriter');

let idx = 0, pos = 0, dir = 1, current = roles[0];

function tick(){
  if(!el) return;
  el.textContent = current.slice(0, pos);
  pos += dir;

  if (dir > 0 && pos > current.length + 6){
    dir = -1; // start deleting
  } else if (dir < 0 && pos <= 0){
    dir = 1;
    idx = (idx + 1) % roles.length;
    current = roles[idx];
  }
  const delay = dir > 0 ? 60 : 30;
  setTimeout(tick, delay);
}
tick();
