// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Copy buttons in code samples (if present)
  document.querySelectorAll('.copy').forEach(btn => {
    const targetSel = btn.getAttribute('data-copy');
    btn.setAttribute('tabindex', '0');
    const copyHandler = async () => {
      const el = document.querySelector(targetSel);
      if (!el) return;
      const text = el.innerText || '';
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');
        const prev = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => { btn.classList.remove('copied'); btn.textContent = prev || 'Copy'; }, 2000);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
    };
    btn.addEventListener('click', copyHandler);
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyHandler(); }
    });
  });

  // Last updated stamp (friendly format)
  const t = document.getElementById('last-updated');
  if (t) {
    const d = new Date();
    const friendly = d.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'2-digit'});
    t.setAttribute('datetime', d.toISOString().split('T')[0]);
    t.textContent = friendly;
  }
});
