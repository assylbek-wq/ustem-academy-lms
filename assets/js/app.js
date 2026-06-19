// USTEM Academy LMS — shared UI helpers
// Reusable navigation, footer, toast, modal helpers.

function ustemLogo() {
  return `<img src="assets/img/logo-symbol.png" alt="USTEM Academy">`;
}

const Icons = {
  arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
};

const Covers = {
  announcement: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  update: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  event: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
  story: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  news: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
  fll: 'linear-gradient(135deg, #d40000 0%, #ffd400 100%)',
  ftc: 'linear-gradient(135deg, #00a8e8 0%, #ff6900 100%)',
  wso: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
  robotics: 'linear-gradient(135deg, #0f766e 0%, #10b981 100%)',
  arduino: 'linear-gradient(135deg, #00979d 0%, #0ea5e9 100%)',
  hanym: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
  legoedu: 'linear-gradient(135deg, #ffd400 0%, #0066cc 100%)',
  ros: 'linear-gradient(135deg, #22577a 0%, #57cc99 100%)',
  unitree: 'linear-gradient(135deg, #18181b 0%, #3b82f6 100%)',
  python: 'linear-gradient(135deg, #3776ab 0%, #ffd43b 100%)',
  ai: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  web: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  data: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  math: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
};

const CoverIcons = {
  announcement: '📣',
  update: '🚀',
  event: '🎉',
  story: '⭐',
  news: '📰',
  fll: '🧱',
  ftc: '🔧',
  wso: '🏆',
  robotics: '🤖',
  arduino: '🔌',
  hanym: '👩‍🔬',
  legoedu: '🟦',
  ros: '🐢',
  unitree: '🦿',
  python: '🐍',
  ai: '🤖',
  web: '🌐',
  data: '📊',
  math: '∑',
};

const LANG_LABELS = { ru: 'РУ', kk: 'ҚАЗ', en: 'EN' };

function renderLangSwitcher() {
  const cur = i18n.lang;
  return `
    <div class="lang-switcher flex items-center gap-1 bg-white/10 border border-white/15 rounded-lg p-1">
      ${['ru', 'kk', 'en'].map(l => `
        <button onclick="setLang('${l}')" class="px-2.5 py-1 rounded-md text-xs font-semibold transition ${cur === l ? 'bg-white text-purple-700' : 'text-white/80 hover:text-white hover:bg-white/10'}">${LANG_LABELS[l]}</button>
      `).join('')}
    </div>
  `;
}

function setLang(lang) {
  i18n.setLang(lang);
  // Re-render dynamic UI on the current page
  document.dispatchEvent(new CustomEvent('lang:change', { detail: { lang } }));
  // Re-render header/footer (they hold links and labels)
  const headerEl = document.getElementById('header-root');
  const footerEl = document.getElementById('footer-root');
  if (headerEl) headerEl.innerHTML = renderHeader(headerEl.dataset.active || '');
  if (footerEl) footerEl.innerHTML = renderFooter();
  i18n.apply();
}

function renderHeader(active = '') {
  const user = Store.getSession();
  const isAdmin = user?.role === 'admin';

  const links = [
    { href: 'index.html', labelKey: 'nav.home', key: 'home' },
    { href: 'courses.html', labelKey: 'nav.courses', key: 'courses' },
    { href: 'blog.html', labelKey: 'nav.blog', key: 'blog' },
    { href: 'dashboard.html', labelKey: 'nav.dashboard', key: 'dashboard', auth: true },
    { href: 'admin.html', labelKey: 'nav.admin', key: 'admin', adminOnly: true },
  ];

  const navHtml = links
    .filter(l => (!l.auth || user) && (!l.adminOnly || isAdmin))
    .map(l => `<a href="${l.href}" class="nav-link ${active === l.key ? 'active' : ''}">${t(l.labelKey)}</a>`)
    .join('');

  return `
<header class="absolute top-0 left-0 right-0 z-30">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
    <a href="index.html" class="flex items-center gap-3 group flex-shrink-0">
      <span class="brand-mark group-hover:scale-105 transition-transform">${ustemLogo()}</span>
      <div class="hidden sm:block">
        <div class="font-display font-bold text-white text-lg leading-none tracking-tight">USTEM</div>
        <div class="text-xs text-sky-200 leading-none mt-1">${t('brand.tagline')}</div>
      </div>
    </a>
    <nav class="hidden md:flex items-center gap-8 flex-1 justify-center">
      ${navHtml}
    </nav>
    <div class="flex items-center gap-2 flex-shrink-0">
      ${renderLangSwitcher()}
      ${
        user
          ? `<a href="dashboard.html" class="flex items-center gap-2 text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-sm">${user.avatar}</div>
              <span class="hidden lg:block text-sm font-medium">${user.name.split(' ')[0]}</span>
            </a>
            <button onclick="logout()" class="btn-ghost text-sm hidden sm:inline-flex">${t('nav.logout')}</button>`
          : `<a href="auth.html" class="text-white hover:text-purple-200 text-sm font-medium px-2 py-1.5 hidden sm:inline-flex">${t('nav.login')}</a>
             <a href="auth.html?mode=register" class="btn-primary text-sm">${t('nav.register')}</a>`
      }
      <button onclick="toggleMobileMenu()" class="md:hidden text-white">${Icons.menu}</button>
    </div>
  </div>
  <div id="mobile-menu" class="hidden md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-white/10">
    <nav class="px-6 py-4 flex flex-col gap-3">
      ${links
        .filter(l => (!l.auth || user) && (!l.adminOnly || isAdmin))
        .map(l => `<a href="${l.href}" class="text-white py-2 ${active === l.key ? 'font-semibold' : ''}">${t(l.labelKey)}</a>`)
        .join('')}
    </nav>
  </div>
</header>
  `;
}

function renderFooter() {
  return `
<footer class="bg-slate-900 text-slate-300 mt-24">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-16">
    <div class="grid md:grid-cols-4 gap-10">
      <div class="md:col-span-2">
        <div class="flex items-center gap-3 mb-4">
          <span class="brand-mark">${ustemLogo()}</span>
          <div>
            <div class="font-display font-bold text-white text-lg">USTEM Academy</div>
            <div class="text-xs text-slate-400">STEM education for everyone</div>
          </div>
        </div>
        <p class="text-sm text-slate-400 max-w-md leading-relaxed">${t('footer.desc')}</p>
        <div class="flex gap-3 mt-6">
          <a href="#" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
          </a>
          <a href="#" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
          </a>
          <a href="#" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          </a>
        </div>
      </div>
      <div>
        <div class="text-white font-semibold mb-4">${t('footer.learn')}</div>
        <ul class="space-y-2 text-sm">
          <li><a href="courses.html" class="hover:text-white transition">${t('footer.allCourses')}</a></li>
          <li><a href="courses.html?cat=competitions" class="hover:text-white transition">${t('cat.competitions')}</a></li>
          <li><a href="courses.html?cat=robotics" class="hover:text-white transition">${t('cat.robotics')}</a></li>
          <li><a href="courses.html?cat=electronics" class="hover:text-white transition">${t('cat.electronics')}</a></li>
          <li><a href="courses.html?cat=initiatives" class="hover:text-white transition">${t('cat.initiatives')}</a></li>
        </ul>
      </div>
      <div>
        <div class="text-white font-semibold mb-4">${t('footer.about')}</div>
        <ul class="space-y-2 text-sm">
          <li><a href="blog.html" class="hover:text-white transition">${t('nav.blog')}</a></li>
          <li><a href="#" class="hover:text-white transition">${t('footer.aboutUs')}</a></li>
          <li><a href="#" class="hover:text-white transition">${t('footer.scholarships')}</a></li>
          <li><a href="#" class="hover:text-white transition">${t('footer.partners')}</a></li>
          <li><a href="#" class="hover:text-white transition">${t('footer.contact')}</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="text-sm text-slate-500">${t('footer.rights')}</div>
      <div class="text-sm text-slate-500">${t('footer.location')}</div>
    </div>
  </div>
</footer>
  `;
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

function logout() {
  Store.clearSession();
  showToast(t('auth.loggedOut'), 'success');
  setTimeout(() => (location.href = 'index.html'), 600);
}

function requireAuth() {
  if (!Store.getSession()) {
    location.href = 'auth.html?next=' + encodeURIComponent(location.pathname + location.search);
    return false;
  }
  return true;
}

function requireAdmin() {
  const user = Store.getSession();
  if (!user || user.role !== 'admin') {
    showToast(t('auth.adminOnly'), 'error');
    setTimeout(() => (location.href = 'index.html'), 1000);
    return false;
  }
  return true;
}

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function courseProgress(course, user) {
  if (!user || !course?.lessons?.length) return 0;
  const completed = user.progress?.[course.id]?.length || 0;
  return Math.round((completed / course.lessons.length) * 100);
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  const d = new Date(iso);
  const locale = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-US' }[i18n.lang] || 'ru-RU';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatNumber(n) {
  const locale = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-US' }[i18n.lang] || 'ru-RU';
  return n.toLocaleString(locale);
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

// Localized duration string. course.duration can be like "6 недель"; for clean i18n
// we expect course.durationWeeks number; fallback to course.duration string.
function formatDuration(course) {
  if (course.durationWeeks != null) {
    return `${course.durationWeeks} ${t('common.weeks')}`;
  }
  return loc(course.duration);
}

function renderCourseCard(course, user) {
  const progress = user ? courseProgress(course, user) : 0;
  const enrolled = user?.enrolled?.includes(course.id);
  const title = loc(course.title);
  const tagline = loc(course.tagline);
  const category = loc(course.category);
  return `
<a href="course.html?id=${course.id}" class="card overflow-hidden flex flex-col group">
  <div class="h-40 relative flex items-center justify-center text-5xl" style="background:${Covers[course.cover] || Covers.python}">
    <span class="filter drop-shadow-lg">${CoverIcons[course.cover] || '📚'}</span>
    <div class="absolute top-3 left-3 tag tag-purple bg-white/90 backdrop-blur">${escapeHtml(category)}</div>
    ${course.featured ? `<div class="absolute top-3 right-3 tag tag-amber bg-white/90 backdrop-blur">${t('courses.card.top')}</div>` : ''}
  </div>
  <div class="p-5 flex flex-col flex-1">
    <h3 class="font-display font-semibold text-lg mb-2 text-slate-900 group-hover:text-purple-700 transition">${escapeHtml(title)}</h3>
    <p class="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">${escapeHtml(tagline)}</p>
    <div class="flex items-center gap-3 text-xs text-slate-500 mb-3">
      <span class="flex items-center gap-1">${Icons.clock} ${escapeHtml(formatDuration(course))}</span>
      <span class="flex items-center gap-1">${Icons.users} ${formatNumber(course.students)}</span>
      <span class="flex items-center gap-1 text-amber-500">${Icons.star} ${course.rating}</span>
    </div>
    ${
      enrolled
        ? `<div>
            <div class="flex items-center justify-between text-xs mb-1.5">
              <span class="text-slate-500">${t('courses.card.progress')}</span>
              <span class="font-semibold text-purple-700">${progress}%</span>
            </div>
            <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
          </div>`
        : `<div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <span class="text-sm font-semibold text-green-700">${t('common.free')}</span>
            <span class="text-purple-700 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">${t('courses.card.more')} ${Icons.arrow}</span>
          </div>`
    }
  </div>
</a>
  `;
}

function renderPostCard(post, opts = {}) {
  const title = loc(post.title);
  const excerpt = loc(post.excerpt);
  const cover = Covers[post.cover] || Covers.news;
  const icon = CoverIcons[post.cover] || '📰';
  const dateStr = formatDate(post.date);
  const minutes = Math.max(1, Math.ceil((loc(post.body) || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).length / 180));
  const featured = opts.featured;
  return `
<a href="post.html?id=${post.id}" class="card overflow-hidden flex flex-col group ${featured ? 'h-full' : ''}">
  <div class="${featured ? 'h-52' : 'h-40'} relative flex items-center justify-center text-5xl" style="background:${post.coverImage ? `url('${escapeHtml(post.coverImage)}') center/cover, ${cover}` : cover}">
    ${!post.coverImage ? `<span class="filter drop-shadow-lg">${icon}</span>` : ''}
    <div class="absolute top-3 left-3 tag bg-white/90 backdrop-blur" style="color:#0f172a">${t(post.categoryKey)}</div>
  </div>
  <div class="p-5 flex flex-col flex-1">
    <h3 class="font-display font-semibold ${featured ? 'text-xl' : 'text-lg'} mb-2 text-slate-900 group-hover:text-purple-700 transition line-clamp-2">${escapeHtml(title)}</h3>
    <p class="text-sm text-slate-600 mb-4 line-clamp-3 flex-1">${escapeHtml(excerpt)}</p>
    <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
      <span>${dateStr}</span>
      <span>${minutes} ${t('blog.minRead')}</span>
    </div>
  </div>
</a>
  `;
}

// expose
window.USTEM = {
  Icons, Covers, CoverIcons, renderHeader, renderFooter, toggleMobileMenu,
  logout, requireAuth, requireAdmin, showToast, courseProgress,
  escapeHtml, formatDate, formatNumber, formatDuration, getParam,
  renderCourseCard, renderPostCard, ustemLogo, renderLangSwitcher,
};
window.setLang = setLang;
