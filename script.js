const categories = {
  architecture: [
    { src: 'assets/images/torremolinos.webp', alt: 'Architecture photograph' },
    { src: 'assets/images/madrid.webp', alt: 'Architecture photograph' },
    { src: 'assets/images/carvajal.webp', alt: 'Architecture photograph' },
    { src: 'assets/images/gecko.webp', alt: 'Architecture photograph' },
    { src: 'assets/images/torremolinos-2.webp', alt: 'Architecture photograph' },
    { src: 'assets/images/correos.webp', alt: 'Architecture photograph' },
    { src: 'assets/images/opera.webp', alt: 'Architecture photograph' },
    { src: 'assets/images/puzzle.webp', alt: 'Architecture photograph' },
    { src: 'assets/images/calamar.webp', alt: 'Architecture photograph' },
    { src: 'assets/images/albufera.webp', alt: 'Architecture photograph' }
  ],
  portrait: []
};

const gallery = document.getElementById('gallery');
const viewer = document.getElementById('viewer');
const viewerImage = document.getElementById('viewer-image');
const closeButton = document.querySelector('.close');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
const categoryButtons = [...document.querySelectorAll('.category')];
const modeButtons = [...document.querySelectorAll('[data-mode]')];

let currentCategory = 'architecture';
let currentPhotos = categories[currentCategory];
let currentIndex = 0;
let touchStartX = 0;

function renderGallery() {
  currentPhotos = categories[currentCategory];
  gallery.innerHTML = '';

  if (!currentPhotos.length) {
    gallery.classList.add('empty');
    return;
  }
  gallery.classList.remove('empty');

  currentPhotos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.className = `photo photo-${index + 1}`;
    button.type = 'button';
    button.setAttribute('aria-label', `Open photograph ${index + 1}`);
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.loading = index < 2 ? 'eager' : 'lazy';
    img.decoding = 'async';
    button.appendChild(img);
    button.addEventListener('click', () => openViewer(index));
    gallery.appendChild(button);
  });
}

function setCategory(category) {
  if (!categories[category]) return;
  currentCategory = category;
  categoryButtons.forEach(button => button.classList.toggle('active', button.dataset.category === category));
  renderGallery();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setMode(mode) {
  gallery.classList.remove('mode-s', 'mode-m', 'mode-l');
  gallery.classList.add(`mode-${mode}`);
  modeButtons.forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
  localStorage.setItem('by-camera-ro-mode', mode);
}

function openViewer(index) {
  if (!currentPhotos.length) return;
  currentIndex = index;
  updateViewer();
  viewer.classList.add('open');
  viewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('viewer-open');
}

function closeViewer() {
  viewer.classList.remove('open');
  viewer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('viewer-open');
}

function updateViewer() {
  viewerImage.src = currentPhotos[currentIndex].src;
  viewerImage.alt = currentPhotos[currentIndex].alt;
}

function step(delta) {
  if (!currentPhotos.length) return;
  currentIndex = (currentIndex + delta + currentPhotos.length) % currentPhotos.length;
  updateViewer();
}

categoryButtons.forEach(button => button.addEventListener('click', () => setCategory(button.dataset.category)));
modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
closeButton.addEventListener('click', closeViewer);
prevButton.addEventListener('click', () => step(-1));
nextButton.addEventListener('click', () => step(1));

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeViewer();
  if (!viewer.classList.contains('open')) return;
  if (event.key === 'ArrowLeft') step(-1);
  if (event.key === 'ArrowRight') step(1);
});

document.addEventListener('wheel', event => {
  if (!viewer.classList.contains('open')) return;
  if (Math.abs(event.deltaY) < 8) return;
  event.preventDefault();
  step(event.deltaY > 0 ? 1 : -1);
}, { passive: false });

viewer.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });
viewer.addEventListener('touchend', event => {
  const dx = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(dx) < 45) return;
  step(dx < 0 ? 1 : -1);
}, { passive: true });

const savedMode = localStorage.getItem('by-camera-ro-mode');
setMode(['s', 'm', 'l'].includes(savedMode) ? savedMode : 'm');
renderGallery();
