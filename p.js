const CONFIG = {
  namaMempelai: 'Anton & Tanisha',
  tanggalAcara: '2026-12-20T09:00:00+07:00',   
  durasiJam: 8,                               
  lokasi: 'Kaliandra Resort, Pasuruan, Jawa Timur, Indonesia',
};

document.documentElement.classList.add('js');

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (sel, evt, fn) => { const el = $(sel); if (el) el.addEventListener(evt, fn); };
const setText = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };

const eventDate = new Date(CONFIG.tanggalAcara);
const tanggalPanjang = eventDate.toLocaleDateString('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

$$('[data-bride-groom]').forEach(el => el.textContent = CONFIG.namaMempelai);
$$('[data-event-date]').forEach(el => el.textContent = tanggalPanjang);
setText('#coverDate', tanggalPanjang);
setText('#heroDate', tanggalPanjang);
document.title = `Undangan Pernikahan ${CONFIG.namaMempelai}`;

const tamu = new URLSearchParams(window.location.search).get('to');
if (tamu) {
  setText('#guestName', tamu);
  const inputNama = $('#nama');
  if (inputNama) inputNama.value = tamu;
}

const bgm = $('#bgm');
const musicBtn = $('#musicBtn');
const tapMusic = $('#tapMusic');

function setPlaying(isPlaying) {
  [tapMusic, musicBtn].forEach(el => el && el.classList.toggle('playing', isPlaying));
  setText('#tapText', isPlaying ? 'Music playing · tap to pause' : 'Tap to play music');
}

function toggleMusic() {
  if (!bgm) return;
  if (bgm.paused) {
    bgm.play().then(() => {
      setPlaying(true);
      if (musicBtn) musicBtn.classList.remove('d-none');
    }).catch(() => setPlaying(false));
  } else {
    bgm.pause();
    setPlaying(false);
  }
}
on('#tapMusic', 'click', toggleMusic);
on('#musicBtn', 'click', toggleMusic);

on('#openBtn', 'click', () => {
  $('#cover').classList.add('hide');
  document.body.classList.remove('locked');
  $('#mainContent').classList.remove('d-none');
  $('#bottomNav').classList.remove('d-none');
  window.scrollTo(0, 0);
  initReveal();
});

function initReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));
}

function updateCountdown() {
  const box = $('#countdown');
  if (!box) return;
  const diff = eventDate - new Date();
  if (diff <= 0) {
    box.innerHTML = '<p class="fs-5 mb-0">Hari bahagia telah tiba 🎉</p>';
    return;
  }
  const s = Math.floor(diff / 1000);
  setText('#cd-days',    Math.floor(s / 86400));
  setText('#cd-hours',   Math.floor((s % 86400) / 3600));
  setText('#cd-minutes', Math.floor((s % 3600) / 60));
  setText('#cd-seconds', s % 60);
}
updateCountdown();
setInterval(updateCountdown, 1000);

(function setupCalendar() {
  const btn = $('#calendarBtn');
  if (!btn) return;
  const fmt = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const end = new Date(eventDate.getTime() + CONFIG.durasiJam * 3600 * 1000);
  btn.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + `&text=${encodeURIComponent('Pernikahan ' + CONFIG.namaMempelai)}`
    + `&dates=${fmt(eventDate)}/${fmt(end)}`
    + `&details=${encodeURIComponent('Undangan pernikahan ' + CONFIG.namaMempelai)}`
    + `&location=${encodeURIComponent(CONFIG.lokasi)}`;
})();

$$('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const target = $('#' + btn.dataset.copy);
    if (!target) return;
    const text = target.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    const old = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check2 me-1"></i>Tersalin!';
    setTimeout(() => btn.innerHTML = old, 1500);
  });
});

on('#rsvpForm', 'submit', (e) => {
  e.preventDefault();
  const nama = $('#nama').value.trim();
  const hadir = $('#kehadiran').value;
  const jumlah = $('#jumlah').value;
  const msg = $('#formMsg');

  if (!nama || !hadir) {
    msg.className = 'text-center small mt-3 mb-0 text-danger';
    msg.textContent = 'Mohon isi nama dan konfirmasi kehadiran.';
    return;
  }
  try {
    const list = JSON.parse(localStorage.getItem('rsvp_tanisha_anton') || '[]');
    list.push({ nama, hadir, jumlah, waktu: new Date().toISOString() });
    localStorage.setItem('rsvp_tanisha_anton', JSON.stringify(list));
  } catch {}
  msg.className = 'text-center small mt-3 mb-0 text-success';
  msg.textContent = 'Terima kasih, konfirmasi Anda sudah kami terima.';
});

$$('#gallery img').forEach(img => {
  img.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(20,40,45,.9);z-index:3000;display:flex;' +
      'align-items:center;justify-content:center;cursor:zoom-out;padding:16px';
    const big = document.createElement('img');
    big.src = img.src;
    big.style.cssText = 'max-width:100%;max-height:100%;border-radius:12px';
    overlay.appendChild(big);
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  });
});