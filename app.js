document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      menuToggle.textContent = isOpen ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
      menuToggle.textContent = '☰';
    }));
  }

  const filters = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('#news-grid .news-card');
  filters.forEach(button => {
    button.addEventListener('click', () => {
      filters.forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      const category = button.dataset.filter;
      cards.forEach(card => {
        card.hidden = category !== 'Todas' && card.dataset.category !== category;
      });
    });
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});
