const wrapper = document.getElementById('videosWrapper');
const sections = document.querySelectorAll('.video-section');
const totalSections = sections.length;
let currentSection = 0;
let isAnimating = false;

function W() { return window.innerWidth; }

function setPosition(offset) {
  offset = offset || 0;
  sections.forEach((s, i) => {
    s.style.transform = `translateX(${(i - currentSection) * W() + offset}px)`;
  });
}

function goToSection(index) {
  if (isAnimating || index === currentSection || index < 0 || index >= totalSections) return;
  isAnimating = true;
  currentSection = index;

  sections.forEach(s => {
    s.classList.add('dragging');
    s.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
  });
  setPosition(0);

  setTimeout(() => {
    sections.forEach((s, i) => {
      s.classList.remove('dragging');
      s.style.transition = '';
      const v = s.querySelector('video');
      if (i === currentSection) v.play().catch(() => {});
      else v.pause();
    });
    document.body.setAttribute('data-theme', sections[currentSection].getAttribute('data-theme'));
    isAnimating = false;
  }, 500);
}

// Galeria
function abrirGaleria(id) {
  const modal = document.getElementById(id);
  modal.classList.add('ativo');
  galeriaInitDrag(modal);
  updateGaleriaCounter(modal);
}

function fecharGaleria(id) {
  document.getElementById(id).classList.remove('ativo');
}

function contatoAlert() {
  alert('Site de demonstração! Entre em contato pelo WhatsApp do programador abaixo no rodapé.');
  window.open('https://wa.me/5500000000000', '_blank');
}

function updateGaleriaCounter(modal) {
  const track = modal.querySelector('.galeria-track');
  const items = track.querySelectorAll('.galeria-item');
  const counter = modal.querySelector('.galeria-counter');
  const index = parseInt(track.dataset.current || '0');
  counter.textContent = `${index + 1} / ${items.length}`;
}

function galeriaInitDrag(modal) {
  const track = modal.querySelector('.galeria-track');
  const items = track.querySelectorAll('.galeria-item');
  const counter = modal.querySelector('.galeria-counter');
  const total = items.length;
  let current = parseInt(track.dataset.current || '0');
  let dragging = false;
  let startX = 0;
  let dragOffset = 0;
  let hasMoved = false;

  function galW() { return items[0] ? items[0].offsetWidth + parseFloat(getComputedStyle(track).gap || 30) : W(); }

  function centerOffset() { return (W() - (items[0] ? items[0].offsetWidth : W())) / 2; }

  function setGalPos(offset) {
    offset = offset || 0;
    const x = centerOffset() - current * galW() + offset;
    track.style.transform = `translate(${x}px, -50%)`;
  }

  function goToGal(index) {
    if (index < 0 || index >= total) return;
    current = index;
    track.dataset.current = current;
    track.classList.remove('dragging');
    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    setGalPos(0);
    updateGaleriaCounter(modal);
    setTimeout(() => { track.style.transition = ''; }, 400);
  }

  // Touch
  track.ontouchstart = (e) => {
    dragging = true;
    hasMoved = false;
    startX = e.touches[0].clientX;
    dragOffset = 0;
    track.classList.add('dragging');
  };

  track.ontouchmove = (e) => {
    if (!dragging) return;
    dragOffset = e.touches[0].clientX - startX;
    if (Math.abs(dragOffset) > 5) hasMoved = true;
    let d = dragOffset;
    if (current === 0 && d > 0) d *= 0.25;
    else if (current === total - 1 && d < 0) d *= 0.25;
    setGalPos(d);
  };

  track.ontouchend = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('dragging');
    if (!hasMoved) return;
    const threshold = galW() * 0.2;
    if (dragOffset < -threshold && current < total - 1) goToGal(current + 1);
    else if (dragOffset > threshold && current > 0) goToGal(current - 1);
    else {
      track.style.transition = 'transform 0.3s ease';
      setGalPos(0);
      setTimeout(() => { track.style.transition = ''; }, 300);
    }
  };

  // Mouse
  track.onmousedown = (e) => {
    if (e.target.closest('.galeria-close')) return;
    dragging = true;
    hasMoved = false;
    startX = e.clientX;
    dragOffset = 0;
    track.classList.add('dragging');
    e.preventDefault();
  };

  document.onmousemove = (e) => {
    if (!dragging || !modal.classList.contains('ativo')) return;
    dragOffset = e.clientX - startX;
    if (Math.abs(dragOffset) > 5) hasMoved = true;
    let d = dragOffset;
    if (current === 0 && d > 0) d *= 0.25;
    else if (current === total - 1 && d < 0) d *= 0.25;
    setGalPos(d);
  };

  document.onmouseup = () => {
    if (!dragging || !modal.classList.contains('ativo')) return;
    dragging = false;
    track.classList.remove('dragging');
    if (!hasMoved) return;
    const threshold = galW() * 0.2;
    if (dragOffset < -threshold && current < total - 1) goToGal(current + 1);
    else if (dragOffset > threshold && current > 0) goToGal(current - 1);
    else {
      track.style.transition = 'transform 0.3s ease';
      setGalPos(0);
      setTimeout(() => { track.style.transition = ''; }, 300);
    }
  };

  setGalPos(0);
}

// Fechar galeria
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.galeria-modal.ativo').forEach(m => m.classList.remove('ativo'));
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goToSection(currentSection + 1);
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goToSection(currentSection - 1);
});

document.querySelectorAll('.galeria-modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('ativo');
  });
});

// Dragging vídeos
let dragging = false;
let dragStartX = 0;
let dragOffset = 0;
let hasMoved = false;

function onDragStart(x) {
  if (isAnimating || document.querySelector('.galeria-modal.ativo')) return;
  dragging = true;
  hasMoved = false;
  dragStartX = x;
  dragOffset = 0;
  sections.forEach(s => s.classList.add('dragging'));
}

function onDragMove(x) {
  if (!dragging) return;
  dragOffset = x - dragStartX;
  if (Math.abs(dragOffset) > 5) hasMoved = true;
  let d = dragOffset;
  if (currentSection === 0 && d > 0) d *= 0.25;
  else if (currentSection === totalSections - 1 && d < 0) d *= 0.25;
  setPosition(d);
}

function onDragEnd() {
  if (!dragging) return;
  dragging = false;
  sections.forEach(s => s.classList.remove('dragging'));
  if (!hasMoved) return;
  const threshold = W() * 0.2;
  if (dragOffset < -threshold && currentSection < totalSections - 1) goToSection(currentSection + 1);
  else if (dragOffset > threshold && currentSection > 0) goToSection(currentSection - 1);
  else {
    sections.forEach(s => { s.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'; });
    setPosition(0);
    setTimeout(() => { sections.forEach(s => s.style.transition = ''); }, 400);
  }
}

wrapper.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), { passive: true });
wrapper.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientX), { passive: true });
wrapper.addEventListener('touchend', () => onDragEnd());

wrapper.addEventListener('mousedown', (e) => { e.preventDefault(); onDragStart(e.clientX); });
document.addEventListener('mousemove', (e) => onDragMove(e.clientX));
document.addEventListener('mouseup', () => onDragEnd());

let wheelTimeout;
wrapper.addEventListener('wheel', (e) => {
  e.preventDefault();
  clearTimeout(wheelTimeout);
  wheelTimeout = setTimeout(() => {
    if (e.deltaY > 20) goToSection(currentSection + 1);
    else if (e.deltaY < -20) goToSection(currentSection - 1);
  }, 50);
}, { passive: false });

window.addEventListener('resize', () => setPosition(0));

sections.forEach((s) => { s.querySelector('video').play().catch(() => {}); });
document.body.setAttribute('data-theme', sections[0].getAttribute('data-theme'));