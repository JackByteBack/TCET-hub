/* ===========================
   HERO BACKGROUND SEQUENCE — Smooth Interpolation
=========================== */
(function () {
  const canvas = document.getElementById('heroCanvas');
  const context = canvas?.getContext('2d');
  const frameCount = 139;

  const currentFrameUrl = index => (
    `assets/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
  );

  const images = [];
  const sequence = {
    frame: 0,
    targetFrame: 0,
    isAutoPlaying: true
  };

  // Preload images
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrameUrl(i);
    images.push(img);
  } function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    context.scale(dpr, dpr);
    render();
  }

  function render() {
    if (!context || images.length === 0) return;
    const frameIndex = Math.floor(sequence.frame);
    const img = images[frameIndex];
    if (!img || !img.complete) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const canvasRatio = cw / ch;
    const imgRatio = img.width / img.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      drawWidth = cw;
      drawHeight = cw / imgRatio;
      offsetX = 0;
      offsetY = (ch - drawHeight) / 2;
    } else {
      drawWidth = ch * imgRatio;
      drawHeight = ch;
      offsetX = (cw - drawWidth) / 2;
      offsetY = 0;
    }

    context.clearRect(0, 0, cw, ch);
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  let lastTime = 0;
  function tick(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    if (sequence.isAutoPlaying) {
      // Auto-play at ~24fps (42ms per frame)
      if (elapsed > 40) {
        sequence.frame++;
        render();
        lastTime = timestamp;
        if (sequence.frame >= frameCount - 1) {
          sequence.isAutoPlaying = false;
          sequence.targetFrame = frameCount - 1;
        }
      }
    } else {
      // Chasing interpolation logic (currently static since scroll link is removed)
      const lerp = 0.15;
      const distance = sequence.targetFrame - sequence.frame;
      if (Math.abs(distance) > 0.05) {
        sequence.frame += distance * lerp;
        render();
      }
    }

    requestAnimationFrame(tick);
  }

  window.pauseAllBackgroundVideos = () => {
    // 1. Hero video
    const heroVid = document.getElementById('heroVideo');
    if (heroVid) heroVid.pause();

    // 2. Closer Look inline video
    const closerVid = document.getElementById('closerLookVideo');
    if (closerVid) closerVid.pause();

    // 3. Gallery grid videos
    document.querySelectorAll('.gallery-video').forEach(v => v.pause());
  };

  window.resetHeroAnimation = () => {
    sequence.frame = 0;
    sequence.targetFrame = 0;
    sequence.isAutoPlaying = true;
    lastTime = 0;
    render();

    // Also reset the video if it exists
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
      heroVideo.currentTime = 0;
      heroVideo.play();
    }
  };

  window.addEventListener('resize', resizeCanvas);

  // REMOVED scroll listener to prevent assets from moving on scroll as per user request
  // (Animation only plays automatically on load now)

  // Initial load
  window.addEventListener('load', () => {
    resizeCanvas();
    requestAnimationFrame(tick);
  });
})();

// Logo click handler for fresh "reload" effect
document.querySelectorAll('.nav-logo, .sub-nav-logo').forEach(logo => {
  logo.addEventListener('click', (e) => {
    // If we're already on index.html (or root), just reset instead of reloading
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof window.resetHeroAnimation === 'function') {
        window.resetHeroAnimation();
      }
    }
  });
});




/* ===========================
   NAVBAR — scroll effect
=========================== */
const navbar = document.getElementById('navbar');
const hero = document.getElementById('hero');

let lastScrollY = window.scrollY;
let heroHeight = hero ? hero.offsetHeight : window.innerHeight;
let ticking = false;

// Recalculate hero height on resize
window.addEventListener('resize', () => {
  heroHeight = hero ? hero.offsetHeight : window.innerHeight;
}, { passive: true });

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const currentY = window.scrollY;

      /* --- Navbar darkens slightly at top --- */
      if (currentY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      /* --- Navbar visible ONLY within the hero section ---
           Shows when user is in the top portion of the hero.
           Hides the moment they scroll past the hero.
           Never re-appears mid-page on scroll-up —
           only comes back when they scroll all the way back to the top.
      --- */
      const menuIsOpen = navbar.classList.contains('menu-open') ||
                         navbar.classList.contains('search-active') ||
                         document.getElementById('navLinks')?.classList.contains('open');

      if (!menuIsOpen) {
        if (currentY > heroHeight * 0.85) {
          // Fully past hero — always hide
          navbar.classList.add('hidden');
        } else {
          // Inside hero — always show
          navbar.classList.remove('hidden');
        }
      }

      // Sync sub-nav position
      if (typeof window.updateSubNav === 'function') {
        window.updateSubNav();
      }

      lastScrollY = currentY;
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });


/* ===========================
   CLICK RIPPLE ANIMATION
=========================== */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .click-ripple {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: scale(0);
      animation: ripple-expand 0.55s cubic-bezier(0.2, 0.6, 0.4, 1) forwards;
    }
    @keyframes ripple-expand {
      0%   { transform: scale(0); opacity: 0.55; }
      60%  { opacity: 0.18; }
      100% { transform: scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('click', (e) => {
    const SIZE = 90;
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.cssText = [
      `width:${SIZE}px`,
      `height:${SIZE}px`,
      `left:${e.clientX - SIZE / 2}px`,
      `top:${e.clientY - SIZE / 2}px`,
      `background: radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(41,151,255,0.35) 60%, transparent 100%)`
    ].join(';');
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, { passive: true });
})();


/* ===========================
   DROPDOWN MENUS — click to open/close
=========================== */

// Create a dim overlay element
const overlay = document.createElement('div');
overlay.className = 'dropdown-overlay';
document.body.appendChild(overlay);

const allDropdowns = document.querySelectorAll('.dropdown');
const allNavLinks = document.querySelectorAll('.nav-link[data-menu]');
let currentMenu = null; // currently open menu id

function openMenu(menuId) {
  // Close any currently open menu first (no re-animate if same)
  if (currentMenu === menuId) {
    closeMenu();
    return;
  }
  closeMenuImmediate(); // instantly swap if different menu

  const dropdown = document.getElementById('menu-' + menuId);
  const trigger = document.querySelector(`.nav-link[data-menu="${menuId}"]`);

  if (!dropdown) return;

  dropdown.classList.add('open');
  trigger?.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('menu-open-blur');
  currentMenu = menuId;
}

function closeMenu() {
  if (!currentMenu) return;
  const dropdown = document.getElementById('menu-' + currentMenu);
  const trigger = document.querySelector(`.nav-link[data-menu="${currentMenu}"]`);
  dropdown?.classList.remove('open');
  trigger?.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('menu-open-blur');
  currentMenu = null;
  // Mobile cleanup
  document.querySelectorAll('.has-dropdown').forEach(el => el.classList.remove('expanded'));
  document.getElementById('navLinks')?.classList.remove('submenu-view');
}

function closeMenuImmediate() {
  allDropdowns.forEach(d => d.classList.remove('open'));
  allNavLinks.forEach(l => l.classList.remove('active'));
  overlay.classList.remove('active');
  document.body.classList.remove('menu-open-blur');
  currentMenu = null;
  // Mobile cleanup
  allDropdowns.forEach(d => d.parentElement.classList.remove('expanded'));
  document.getElementById('navLinks')?.classList.remove('submenu-view');
}

// Nav link click and hover handlers
allNavLinks.forEach(link => {
  // Click handler (Desktop/Tablet dropdown logic)
  link.addEventListener('click', (e) => {
    if (window.innerWidth > 833) {
      e.preventDefault();
      closeSearch();
      const menuId = link.dataset.menu;
      openMenu(menuId);
    }
  });

  // Hover handler (For desktop with mouse)
  link.addEventListener('mouseenter', () => {
    if (window.innerWidth > 833 && !searchOpen && window.matchMedia('(hover: hover)').matches) {
      const menuId = link.dataset.menu;
      if (currentMenu !== menuId) {
        openMenu(menuId);
      }
    }
  });
});

// Automatically close menu when mouse leaves the navigation/dropdown area on desktop
// Automatically close menu when mouse leaves the navigation/dropdown area
const navbarEl = document.getElementById('navbar');
navbarEl?.addEventListener('mouseleave', () => {
  if (window.innerWidth > 833 && currentMenu) {
    closeMenu();
  }
});


/* ===========================
   SEARCH PANEL — Full Enhanced
   • ⌘K / Ctrl+K shortcut
   • Animated typewriter placeholder
   • Recent searches (localStorage, max 8)
   • Live autocomplete suggestions
   • Sub-nav search wiring
=========================== */
const searchBtn       = document.getElementById('searchBtn');
const searchPanel     = document.getElementById('searchPanel');
const searchInput     = document.getElementById('searchInput');
const subNavSearchBtn = document.getElementById('subNavSearchBtn');
let searchOpen = false;

/* --- Site search index --- */
const SEARCH_INDEX = [
  // ── Navigation ──
  { label: 'About us',                    tag: 'Nav',         href: '#'                                                        },
  { label: 'Education',                   tag: 'Nav',         href: '#'                                                        },
  { label: 'Examination',                 tag: 'Nav',         href: '#'                                                        },
  { label: 'Research & Dev',              tag: 'Nav',         href: '#'                                                        },
  { label: 'T&P',                         tag: 'Nav',         href: '#'                                                        },
  { label: 'IQAC',                        tag: 'Nav',         href: '#'                                                        },
  { label: 'Contact Us',                  tag: 'Nav',         href: '#'                                                        },
  // ── About dropdown ──
  { label: 'OG Developer',                tag: 'About',       href: '#highlights'                                              },
  { label: 'Official About TCET',         tag: 'About',       href: 'https://www.tcetmumbai.in/about-us.html'                  },
  { label: "Chairman's Message",          tag: 'About',       href: "https://www.tcetmumbai.in/chairman's-message.html"        },
  { label: "CEO's Message",               tag: 'About',       href: "https://www.tcetmumbai.in/ceo's-message.html"             },
  { label: "Principal's Message",         tag: 'About',       href: "https://www.tcetmumbai.in/principal's-message.html"       },
  { label: 'VP & Director IQAC Message',  tag: 'About',       href: 'https://www.tcetmumbai.in/director-IQAC-message.html'     },
  { label: 'Dean (SSW) Message',          tag: 'About',       href: "https://www.tcetmumbai.in/dean's-SSF-message.html"        },
  { label: 'Dean (R & D) Message',        tag: 'Quick Link',  href: "https://www.tcetmumbai.in/dean's-RD-message.html"         },
  { label: 'Dean (Academic) Message',     tag: 'Quick Link',  href: "https://www.tcetmumbai.in/dean's-academic-message.html"   },
  { label: 'Institutional Committees',    tag: 'Quick Link',  href: 'https://www.tcetmumbai.in/institutional-committees.html'  },
  { label: 'Institutional Growth',        tag: 'Quick Link',  href: 'https://www.tcetmumbai.in/institutional-growth.html'      },
  { label: 'Recognition & Awards',        tag: 'Quick Link',  href: 'https://www.tcetmumbai.in/recognition-&-awards.html'      },
  { label: 'DCDC',                        tag: 'Store',       href: 'https://www.tcetmumbai.in/dcdc.html'                      },
  // ── Page sections ──
  { label: 'Get the Highlights',          tag: 'Section',     href: '#highlights'                                              },
  { label: 'Take a closer look',          tag: 'Interactive', href: '#closerLook'                                              },
  { label: 'Random Clicks',               tag: 'Gallery',     href: '#closerLook'                                              },
  { label: 'College Photo',               tag: 'Gallery',     href: '#closerLook'                                              },
  { label: 'Display',                     tag: 'Gallery',     href: '#closerLook'                                              },
  { label: 'Connectivity',                tag: 'Gallery',     href: '#closerLook'                                              },
  { label: 'Playground',                  tag: 'Gallery',     href: '#closerLook'                                              },
  { label: 'Rhythm, engineered',           tag: 'Gallery',     href: '#closerLook'                                              },
  { label: 'Moments That Last',           tag: 'Gallery',     href: '#closerLook'                                              },
  { label: 'Every Moment in Motion',      tag: 'Video',       href: '#cinematicSection'                                        },
  { label: 'Designed for every ambition', tag: 'Gallery',     href: '#gallery'                                                 },
  { label: 'Precision Engineering',       tag: 'Gallery',     href: '#gallery'                                                 },
  { label: 'Official YouTube Channel',    tag: 'Social',      href: 'https://www.youtube.com/@TCETMumbaiOfficial'              },
  { label: 'Official Instagram ID',       tag: 'Social',      href: 'https://www.instagram.com/tcetmumbai/'                   },
  { label: 'Campus Vibes',               tag: 'Gallery',     href: '#gallery'                                                 },
  { label: 'Campus Photography',         tag: 'Gallery',     href: '#gallery'                                                 },
  { label: 'My college teammates',       tag: 'Highlights',  href: '#highlights'                                              },
  { label: 'BCA Hub',                    tag: 'Highlights',  href: '#highlights'                                              },
  { label: 'OG Developer',               tag: 'Highlights',  href: '#highlights'                                              },
  { label: 'Watch the film',             tag: 'Video',       href: '#highlights'                                              },
  { label: 'Every moment in motion',     tag: 'Video',       href: '#cinematicSection'                                        },
  { label: 'Campus life',                tag: 'Video',       href: '#cinematicSection'                                        },
  { label: 'Take a closer look',         tag: 'Interactive', href: '#closerLook'                                              },
  { label: 'View all notices',           tag: 'Notice',      href: '#tcetInfo'                                                },
  { label: 'Built for excellence',       tag: 'Info',        href: '#tcetInfo'                                                },
  { label: 'Built for students. Designed for clarity', tag: 'Info', href: '#highlights'                                       },
  { label: 'Thakur College',             tag: 'Info',        href: '#tcetInfo'                                                },
  { label: 'My college teammates',       tag: 'About',       href: '#highlights'                                              },
  // ── TCET Info ──
  { label: '60+ Years of Legacy',         tag: 'Info',        href: '#tcetInfo'                                                },
  { label: '9 Engineering Branches',      tag: 'Info',        href: '#tcetInfo'                                                },
  { label: '5000+ Students',              tag: 'Info',        href: '#tcetInfo'                                                },
  { label: 'NBA Accredited',              tag: 'Info',        href: '#tcetInfo'                                                },
  { label: '100+ Faculty Members',        tag: 'Info',        href: '#tcetInfo'                                                },
  { label: 'Mumbai University Affiliated',tag: 'Info',        href: '#tcetInfo'                                                },
  { label: 'Notice Board',                tag: 'Notice',      href: '#tcetInfo'                                                },
  { label: 'Official College Website',    tag: 'Notice',      href: 'https://www.tcetmumbai.in'                                },
  { label: 'Placement Events',            tag: 'Notice',      href: 'https://www.tcetmumbai.in/events.html'                    },
  { label: 'Placement Statistics',        tag: 'Notice',      href: 'https://www.tcetmumbai.in/TNP%20placementStatistic.html'  },
  { label: 'Placement',                   tag: 'T&P',         href: 'https://www.tcetmumbai.in/TNP%20placementStatistic.html'  },
  // ── Year selector section ──
  { label: 'Navigate from anywhere',       tag: 'Section',     href: '#hwgSection'                                              },
  { label: 'Discover our college',         tag: 'Section',     href: '#hwgSection'                                              },
  { label: 'Our garden',                   tag: 'Year',        href: '#hwgSection'                                              },
  { label: 'Core engineering',             tag: 'Year',        href: '#hwgSection'                                              },
  { label: 'Planning begins',              tag: 'Year',        href: '#hwgSection'                                              },
  { label: 'Placement',                    tag: 'Year',        href: '#hwgSection'                                              },
  { label: 'First Year',                   tag: 'Year',        href: '#hwgSection'                                              },
  { label: 'Second Year',                  tag: 'Year',        href: '#hwgSection'                                              },
  { label: 'Third Year',                   tag: 'Year',        href: '#hwgSection'                                              },
  { label: 'Final Year',                   tag: 'Year',        href: '#hwgSection'                                              },
  { label: 'Select your current year',     tag: 'Section',     href: '#hwgSection'                                              },
  { label: 'All in from day one',          tag: 'Info',        href: '#hwgSection'                                              },
  // ── Hero ──
  { label: 'Excellence runs in the family', tag: 'Hero',       href: '#hero'                                                    },
  { label: 'Unofficial TCET Hub',          tag: 'Hero',        href: '#hero'                                                    },
  { label: 'BCA student',                  tag: 'Hero',        href: '#hero'                                                    },
  // ── Stats ──
  { label: '60 years of legacy',           tag: 'Info',        href: '#tcetInfo'                                                },
  { label: '9 engineering branches',       tag: 'Info',        href: '#tcetInfo'                                                },
  { label: '5000 students',                tag: 'Info',        href: '#tcetInfo'                                                },
  { label: 'NBA accredited',               tag: 'Info',        href: '#tcetInfo'                                                },
  { label: '100 faculty members',          tag: 'Info',        href: '#tcetInfo'                                                },
  { label: 'Mumbai University',            tag: 'Info',        href: '#tcetInfo'                                                },
  { label: 'Thakur College of Engineering and Technology', tag: 'Info', href: '#tcetInfo'                                       },
  { label: 'Built for excellence',         tag: 'Info',        href: '#tcetInfo'                                                },
  { label: 'Backed by numbers',            tag: 'Info',        href: '#tcetInfo'                                                },
  // ── Gallery ──
  { label: 'Designed for every ambition',  tag: 'Gallery',     href: '#gallery'                                                 },
  { label: 'Campus vibes',                 tag: 'Gallery',     href: '#gallery'                                                 },
  { label: 'YouTube channel',              tag: 'Social',      href: 'https://www.youtube.com/@TCETMumbaiOfficial'              },
  { label: 'Instagram',                    tag: 'Social',      href: 'https://www.instagram.com/tcetmumbai/'                   },
  // ── Footer ──
  { label: 'Privacy Policy',              tag: 'Policy',       href: '#'                                                        },
  { label: 'Terms of Use',               tag: 'Policy',       href: '#'                                                        },
  { label: 'Site Map',                   tag: 'Policy',       href: '#'                                                        },
];

/* --- Recent searches (localStorage) --- */
const RECENT_KEY = 'tcet_recent_searches';
const MAX_RECENT = 8;
function getRecent()      { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } }
function saveRecent(arr)  { try { localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0, MAX_RECENT))); } catch {} }
function addRecent(term)  { if (!term) return; let a = getRecent().filter(t => t.toLowerCase() !== term.toLowerCase()); a.unshift(term); saveRecent(a); }
function removeRecent(t)  { saveRecent(getRecent().filter(x => x !== t)); }
function clearAllRecent() { saveRecent([]); }

/* --- SVG icons --- */
const ICON_CLOCK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const ICON_ARROW = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
const ICON_CLOSE = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

function hl(text, q) {
  if (!q) return text;
  return text.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'), '<mark>$1</mark>');
}

/* --- Render: suggestions --- */
function renderSuggestions(query) {
  const _suggestList    = document.getElementById('searchSuggestionsList');
  const _suggestSection = document.getElementById('searchSuggestionsSection');
  const _suggestLabel   = document.getElementById('searchSuggestionsLabel');
  if (!_suggestList || !_suggestSection) return;

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);
  const matches = SEARCH_INDEX.filter(i => {
    const label = i.label.toLowerCase();
    return label.includes(q) || words.every(w => label.includes(w));
  }).slice(0, 8);

  if (!matches.length) {
    _suggestList.innerHTML = `<li class="search-no-results-msg">No results for <strong>"${query}"</strong></li>`;
  } else {
    _suggestList.innerHTML = matches.map(item => `
      <li class="search-result-item" data-href="${item.href}" data-label="${encodeURIComponent(item.label)}">
        <div class="search-result-icon-wrap">${ICON_ARROW}</div>
        <span class="search-result-text">${hl(item.label, query)}</span>
        <span class="search-result-tag">${item.tag}</span>
      </li>`).join('');
  }

  _suggestSection.style.cssText = 'display:block !important; opacity:1 !important; visibility:visible !important;';
  if (_suggestLabel) _suggestLabel.textContent = matches.length ? 'Suggestions' : 'No results';

  _suggestList.querySelectorAll('.search-result-item[data-href]').forEach(li => {
    li.addEventListener('click', () => {
      const label = decodeURIComponent(li.dataset.label);
      const href  = li.dataset.href;
      addRecent(label);
      closeSearch();
      if (!href || href === '#') return;
      // External links → new tab
      if (href.startsWith('http://') || href.startsWith('https://')) {
        window.open(href, '_blank', 'noopener noreferrer');
      } else {
        // Internal anchor → smooth scroll
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* --- Render: recent list --- */
function renderRecentList() {
  const _recentSection = document.getElementById('searchRecentSection');
  const _recentList    = document.getElementById('searchRecentList');
  const recents = getRecent();
  if (!_recentList || !_recentSection) return;
  if (!recents.length) { _recentSection.style.display = 'none'; return; }
  _recentList.innerHTML = recents.map(term => `
    <li class="search-result-item" data-term="${encodeURIComponent(term)}">
      <div class="search-result-icon-wrap">${ICON_CLOCK}</div>
      <span class="search-result-text">${term}</span>
      <button class="search-result-remove" data-remove="${encodeURIComponent(term)}" aria-label="Remove">${ICON_CLOSE}</button>
    </li>`).join('');
  _recentSection.style.cssText = 'display:block !important; opacity:1 !important; visibility:visible !important;';
  _recentList.querySelectorAll('.search-result-item').forEach(li => {
    li.addEventListener('click', e => {
      if (e.target.closest('.search-result-remove')) return;
      const term = decodeURIComponent(li.dataset.term);
      // Find matching entry in SEARCH_INDEX and navigate directly (one click)
      const match = SEARCH_INDEX.find(i => i.label.toLowerCase() === term.toLowerCase());
      if (match && match.href && match.href !== '#') {
        addRecent(term);
        closeSearch();
        if (match.href.startsWith('http://') || match.href.startsWith('https://')) {
          window.open(match.href, '_blank', 'noopener noreferrer');
        } else {
          const target = document.querySelector(match.href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Fallback: fill input and show suggestions if no direct match
        searchInput.value = term;
        navbar.classList.add('search-typing');
        updateSearchPanel(term);
      }
    });
  });
  _recentList.querySelectorAll('.search-result-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeRecent(decodeURIComponent(btn.dataset.remove));
      renderSearchDefault();
    });
  });
}

/* --- Default state: recent only, no suggestions --- */
function renderSearchDefault() {
  renderRecentList();
  const _suggestSection = document.getElementById('searchSuggestionsSection');
  if (_suggestSection) _suggestSection.style.display = 'none';
}

/* --- Live update while typing --- */
function updateSearchPanel(query) {
  const _recentSection    = document.getElementById('searchRecentSection');
  const _suggestSection   = document.getElementById('searchSuggestionsSection');
  if (!query.trim()) { renderSearchDefault(); return; }
  if (_recentSection)   _recentSection.style.display   = 'none';
  if (_suggestSection)  _suggestSection.style.display  = 'none';
  renderSuggestions(query);
}

/* --- Open / Close --- */
function openSearch() {
  closeMenuImmediate();
  if (navLinksEl.classList.contains('open')) {
    navLinksEl.classList.remove('open');
    hamburgerBtn?.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (!searchPanel) return;
  // Always bring navbar into view when search opens
  navbar.classList.remove('hidden');
  navbar.classList.add('search-active');
  searchPanel.classList.add('open');
  overlay.classList.add('active');
  document.body.classList.add('search-open');
  searchOpen = true;
  renderSearchDefault();
  setTimeout(() => { searchInput?.focus(); startPlaceholderAnim(); }, 100);
}

function closeSearch() {
  if (!searchOpen) return;
  navbar.classList.remove('search-active');
  navbar.classList.remove('search-typing');
  searchPanel?.classList.remove('open');
  overlay.classList.remove('active');
  document.body.classList.remove('search-open');
  searchOpen = false;
  searchInput?.blur();
  if (searchInput) searchInput.value = '';
  stopPlaceholderAnim();
  // Re-hide navbar if user is still past the hero
  if (window.scrollY > heroHeight * 0.85) {
    navbar.classList.add('hidden');
  }
}

/* --- ⌘K / Ctrl+K global shortcut --- */
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    searchOpen ? closeSearch() : openSearch();
    return;
  }
  if (e.key === 'Escape') { closeMenu(); closeSearch(); }
});

/* --- Button wiring --- */
searchBtn?.addEventListener('click', e => { e.preventDefault(); searchOpen ? closeSearch() : openSearch(); });

subNavSearchBtn?.addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (searchOpen) { closeSearch(); return; }
  setTimeout(() => openSearch(), 100);
});

/* --- Input events --- */
searchInput?.addEventListener('input', () => {
  const raw = searchInput.value;
  const query = raw.trim();
  navbar.classList.toggle('search-typing', query.length > 0);
  updateSearchPanel(query);
});

searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      addRecent(query);
      if (query.toLowerCase() === 'og developer') {
        window.location.hash = 'highlights';
        closeSearch();
      }
    }
  }
});

/* --- Clear all recent --- */
document.getElementById('searchClearRecent')?.addEventListener('click', () => { clearAllRecent(); renderSearchDefault(); });

/* --- Clicking nav search bar area opens it --- */
const navSearchBarEl = document.getElementById('navSearchBar');
navSearchBarEl?.addEventListener('click', () => { if (!searchOpen) openSearch(); });

/* --- Overlay click closes both --- */
overlay.addEventListener('click', () => { closeMenu(); closeSearch(); });

/* ===========================
   ANIMATED PLACEHOLDER — Native placeholder cycling
   Zero DOM manipulation: just updates input.placeholder
=========================== */
(function () {
  const PHRASES = [
    'Search information HUB',
    'Try "OG Developer"…',
    'Search Education…',
    'Search Gallery…',
    'Try "Campus Life"…',
    'Search Examination…',
    'Try "Playground"…',
  ];

  let phraseIdx = 0, charIdx = 0, isDeleting = false;
  let animTimer = null, isRunning = false;

  function tick() {
    if (!isRunning || !searchInput) return;
    // Don't animate placeholder when user is typing
    if (searchInput.value.length > 0) {
      animTimer = setTimeout(tick, 300);
      return;
    }

    const current = PHRASES[phraseIdx];
    if (!isDeleting) {
      charIdx++;
      searchInput.placeholder = current.slice(0, charIdx);
      if (charIdx === current.length) {
        isDeleting = true;
        animTimer = setTimeout(tick, 1800);
        return;
      }
      animTimer = setTimeout(tick, 55);
    } else {
      charIdx--;
      searchInput.placeholder = current.slice(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        animTimer = setTimeout(tick, 300);
        return;
      }
      animTimer = setTimeout(tick, 28);
    }
  }

  window.startPlaceholderAnim = function () {
    if (isRunning) return;
    isRunning = true;
    phraseIdx = 0; charIdx = 0; isDeleting = false;
    tick();
  };

  window.stopPlaceholderAnim = function () {
    isRunning = false;
    clearTimeout(animTimer);
    if (searchInput) searchInput.placeholder = 'Search information HUB';
  };
})();

/* ===========================
   SUB-NAVBAR INLINE SEARCH
=========================== */
(function () {
  const subNavbar   = document.getElementById('subNavbar');
  const searchBar   = document.getElementById('subNavSearchBar');
  const sInput      = document.getElementById('subNavSearchInput');
  const closeBtn    = document.getElementById('subNavSearchClose');
  const resultsBox  = document.getElementById('subNavSearchResults');
  if (!subNavbar || !searchBar || !sInput) return;

  const ITEMS = [
    { icon:'📋', title:'Overview',       desc:'Back to top',                   tag:'Page'    },
    { icon:'📚', title:'Education',      desc:'Courses & curriculum',           tag:'Section' },
    { icon:'📝', title:'Examination',    desc:'Exam schedules & resources',     tag:'Section' },
    { icon:'🔬', title:'Research & Dev', desc:'Student R&D projects',           tag:'Section' },
    { icon:'💼', title:'T&P',            desc:'Training & placement details',   tag:'Section' },
    { icon:'🏛️', title:'IQAC',          desc:'Quality assurance',              tag:'Section' },
    { icon:'📸', title:'Gallery',        desc:'Campus photography & videos',    tag:'Gallery' },
    { icon:'📞', title:'Contact Us',     desc:'Get in touch with TCET',         tag:'Info'    },
  ];

  function renderSubResults(q) {
    const filtered = q ? ITEMS.filter(i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)) : ITEMS;
    resultsBox.innerHTML = filtered.length
      ? filtered.map(i => `<div class="hero-search-result-item"><div class="hero-search-result-icon">${i.icon}</div><div class="hero-search-result-body"><div class="hero-search-result-title">${i.title}</div><div class="hero-search-result-desc">${i.desc}</div></div><span class="hero-search-result-tag">${i.tag}</span></div>`).join('')
      : `<div class="hero-search-no-results">No results for <strong>"${q}"</strong></div>`;
    resultsBox.classList.add('active');
  }

  function openSubSearch() { subNavbar.classList.add('search-active'); sInput.focus(); renderSubResults(''); }
  function closeSubSearch() { subNavbar.classList.remove('search-active'); sInput.value = ''; resultsBox.classList.remove('active'); }

  subNavSearchBtn?.addEventListener('click', e => { e.stopPropagation(); subNavbar.classList.contains('search-active') ? closeSubSearch() : openSubSearch(); });
  closeBtn?.addEventListener('click', e => { e.stopPropagation(); closeSubSearch(); });
  sInput.addEventListener('input', () => renderSubResults(sInput.value.trim().toLowerCase()));
  sInput.addEventListener('keydown', e => { if (e.key === 'Escape') closeSubSearch(); });
  document.addEventListener('click', e => { if (subNavbar.classList.contains('search-active') && !subNavbar.contains(e.target)) closeSubSearch(); });
})();

/* ===========================
   MOBILE HAMBURGER MENU
=========================== */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinksEl = document.getElementById('navLinks');

hamburgerBtn?.addEventListener('click', () => {
  const isOpen = navLinksEl.classList.toggle('open');
  hamburgerBtn.classList.toggle('active', isOpen); // Let CSS handle the 'X' animation
  navbar.classList.toggle('menu-open', isOpen);

  if (isOpen) {
    closeSearch(); // close search if open
    document.body.style.overflow = 'hidden'; // prevent scroll when menu is open
  } else {
    document.body.style.overflow = '';
    // Collapse all expanded sections when closing
    navLinksEl.querySelectorAll('.has-dropdown').forEach(el => el.classList.remove('expanded'));
    navLinksEl.classList.remove('submenu-view');
    navLinksEl.style.overflowY = 'auto';
  }
});

// Accordion/Drill-down logic for mobile sub-menus
navLinksEl?.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 833) {
      e.preventDefault();
      const parent = link.parentElement;
      const dropdown = parent.querySelector('.dropdown');
      const isExpanded = parent.classList.toggle('expanded');

      // Toggle a class on the container to hide other top-level links
      navLinksEl.classList.toggle('submenu-view', isExpanded);

      // Optional: close other accordions
      navLinksEl.querySelectorAll('.has-dropdown').forEach(el => {
        if (el !== parent) el.classList.remove('expanded');
      });

      // Add back button if it doesn't exist
      if (isExpanded && dropdown) {
        let backBtn = dropdown.querySelector('.mobile-back-btn');
        if (!backBtn) {
          backBtn = document.createElement('button');
          backBtn.className = 'mobile-back-btn';
          backBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          `;
          backBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            parent.classList.remove('expanded');
            navLinksEl.classList.remove('submenu-view');
            // Allow main menu scroll again
            navLinksEl.style.overflowY = 'auto';
          });
          dropdown.prepend(backBtn);
        }
        // Lock main menu scroll when sub-menu is open
        navLinksEl.style.overflowY = 'hidden';
      } else {
        navLinksEl.style.overflowY = 'auto';
      }
    }
  });
});

// Close mobile menu or desktop menu on any inner link click
document.querySelectorAll('.dropdown-big, .dropdown-small, .nav-link:not([data-menu])').forEach(link => {
  link.addEventListener('click', (e) => {
    // Smooth scroll if it's an anchor link
    const href = link.getAttribute('href');
    if (href && href.startsWith('#') && href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Desktop cleanup
    if (window.innerWidth > 833) {
      closeMenu();
    }

    // Mobile cleanup
    if (window.innerWidth <= 833) {
      if (!link.hasAttribute('data-menu') || link.classList.contains('dropdown-big') || link.classList.contains('dropdown-small')) {
        navLinksEl?.classList.remove('open');
        navLinksEl?.classList.remove('submenu-view');
        hamburgerBtn?.classList.remove('active');
        document.body.style.overflow = '';
        navbar?.classList.remove('menu-open');
        navLinksEl?.querySelectorAll('.has-dropdown').forEach(el => el.classList.remove('expanded'));
      }
    }
  });
});



/* ===========================
   HIGHLIGHTS CAROUSEL
=========================== */
(function () {
  const carousel = document.getElementById('highlightsCarousel');
  const dots = document.querySelectorAll('.carousel-dot');
  const pauseBtn = document.getElementById('carouselPause');
  if (!carousel) return;

  const SLIDES = dots.length;
  const slides = carousel.querySelectorAll('.highlight-slide');
  let currentSlide = 0;
  let isPlaying = true;
  let autoplayTimer = null;

  // Helper: properly restart ::after animation on new active dot
  function activateDot(index) {
    dots.forEach((d, i) => {
      if (i === index) {
        d.classList.remove('active');
        void d.offsetWidth; // force reflow — makes browser restart the ::after animation fresh
        d.classList.add('active');
      } else {
        d.classList.remove('active');
      }
    });
  }

  function goTo(index) {
    currentSlide = (index + SLIDES) % SLIDES;
    const slideOffset = slides[currentSlide].offsetLeft - carousel.offsetLeft;
    carousel.scrollTo({ left: slideOffset, behavior: 'smooth' });
    activateDot(currentSlide);
    slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
  }

  function startAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goTo(currentSlide + 1), 4000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      if (isPlaying) startAutoplay();
    });
  });

  // Pause/play button — toggle SVG icons
  pauseBtn?.addEventListener('click', () => {
    isPlaying = !isPlaying;
    const dotsContainer = document.getElementById('carouselDots');
    dotsContainer?.classList.toggle('paused', !isPlaying);
    const pIcon  = pauseBtn.querySelector('.pause-icon');
    const plIcon = pauseBtn.querySelector('.play-icon');
    if (pIcon)  pIcon.style.display  = isPlaying ? 'block' : 'none';
    if (plIcon) plIcon.style.display = isPlaying ? 'none'  : 'block';
    isPlaying ? startAutoplay() : stopAutoplay();
  });

  // Update dots on manual swipe
  carousel.addEventListener('scroll', () => {
    const scrollLeft = carousel.scrollLeft;
    let nearest = 0;
    let minDiff = Infinity;

    slides.forEach((s, i) => {
      const diff = Math.abs(s.offsetLeft - carousel.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = i;
      }
    });

    if (nearest !== currentSlide) {
      currentSlide = nearest;
      activateDot(currentSlide);
      slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
    }
  });

  // Initial trigger
  goTo(0);

  startAutoplay();
})();

/* ===========================
   M5 CARD INTERACTION
=========================== */
(function () {
  const m5Card = document.querySelector('.highlight-card-chips');
  const m5Bg = m5Card?.querySelector('.highlight-card-bg');
  const learnMoreBtn = document.getElementById('m5LearnMore');
  const infoPanel = document.getElementById('m5InfoPanel');
  const closeBtn = document.getElementById('closeM5Info');

  if (!m5Card) return;

  // Parallax Effect on Desktop
  m5Card.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 1024) return;

    const rect = m5Card.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;

    // Calculate movement (-10px to 10px) - Tighter for face safety
    const moveX = (mouseX - 0.5) * 20;
    const moveY = (mouseY - 0.5) * 20;

    if (m5Bg) {
      m5Bg.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
    }
  });

  m5Card.addEventListener('mouseleave', () => {
    if (m5Bg) {
      m5Bg.style.transform = `scale(1.1) translate(0, 0)`;
      m5Bg.style.transition = 'transform 0.5s ease';
      setTimeout(() => {
        m5Bg.style.transition = 'transform 0.1s linear';
      }, 500);
    }
  });

  // Reveal Interaction
  learnMoreBtn?.addEventListener('click', (e) => {
    infoPanel?.classList.add('active');
  });

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    infoPanel?.classList.remove('active');
  });

  // Close on outside click WITHIN the card
  m5Card.addEventListener('click', (e) => {
    if (!infoPanel?.contains(e.target) && e.target !== learnMoreBtn) {
      infoPanel?.classList.remove('active');
    }
  });
})();


/* ===========================
   SUB-NAVBAR: show after hero
 =========================== */
(function () {
  const subNavbar = document.getElementById('subNavbar');
  const hero = document.getElementById('hero');
  const subNavToggle = document.getElementById('subNavToggle');
  const subNavInner = subNavbar?.querySelector('.sub-nav-inner');
  const subNavOverlay = document.getElementById('subNavOverlay');

  if (!subNavbar || !hero) return;

  function updateSubNav() {
    const mainNav = document.getElementById('navbar');
    const footer = document.querySelector('.footer');
    const mainNavH = mainNav?.offsetHeight || 48;
    const isNavbarHidden = mainNav?.classList.contains('hidden');
    const heroBottom = hero.getBoundingClientRect().bottom;
    const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;

    // Sub-navbar always at top:0 — main navbar is hidden whenever sub-nav shows
    subNavbar.style.top = '0px';
    if (subNavOverlay) subNavOverlay.style.top = '48px';

    // Show only when: past hero, before footer, and main navbar is hidden
    const isPastHero = heroBottom <= mainNavH + 1;
    const isBeforeFooter = footerTop > mainNavH;

    if (isPastHero && isBeforeFooter && isNavbarHidden) {
      subNavbar.classList.add('visible');
    } else {
      subNavbar.classList.remove('visible');
      subNavInner?.classList.remove('menu-open');
      subNavOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  window.updateSubNav = updateSubNav;

  // Handle mobile toggle
  subNavToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = subNavInner?.classList.toggle('menu-open');
    subNavOverlay?.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu on link click
  subNavbar.querySelectorAll('.sub-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      subNavInner?.classList.remove('menu-open');
      subNavOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close sub-nav if clicking outside
  document.addEventListener('click', (e) => {
    if (subNavInner?.classList.contains('menu-open') && !subNavbar.contains(e.target)) {
      subNavInner.classList.remove('menu-open');
      subNavOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  window.addEventListener('scroll', updateSubNav, { passive: true });
  window.addEventListener('resize', () => {
    updateSubNav();
    if (window.innerWidth > 833) {
      subNavInner?.classList.remove('menu-open');
      subNavOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  updateSubNav(); // run once on load
})();






/* ===========================
   VIDEO MODAL — CUSTOM PLAYER LOGIC
=========================== */
(function () {
  const watchFilmBtns = document.querySelectorAll('.highlights-film-link');
  const videoModal = document.getElementById('videoModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalVideo = document.getElementById('modalVideo');
  const videoWrapper = document.getElementById('videoWrapper');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const progressBar = document.getElementById('progressBarInner');
  const progressBg = document.getElementById('progressBarBg');
  const timeCurrent = document.getElementById('timeCurrent');
  const timeRemaining = document.getElementById('timeRemaining');
  const muteBtn = document.getElementById('modalMuteBtn');
  const fullscreenBtn = document.getElementById('modalFullscreenBtn');

  if (watchFilmBtns.length === 0 || !videoModal || !modalVideo) return;

  const PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateProgress() {
    const current = modalVideo.currentTime;
    const duration = modalVideo.duration || 0;
    const percent = (current / duration) * 100;

    progressBar.style.width = `${percent}%`;
    timeCurrent.innerText = formatTime(current);
    timeRemaining.innerText = `-${formatTime(duration - current)}`;
  }

  function togglePlay() {
    if (modalVideo.paused) {
      modalVideo.play();
      videoModal.classList.remove('paused');
      playPauseIcon.innerHTML = PAUSE_ICON;
    } else {
      modalVideo.pause();
      videoModal.classList.add('paused');
      playPauseIcon.innerHTML = PLAY_ICON;
    }
  }

  function seek(e) {
    const rect = progressBg.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    modalVideo.currentTime = pos * modalVideo.duration;
  }

  function openVideoModal(e) {
    if (e && e.preventDefault) e.preventDefault();

    // Global pause
    window.pauseAllBackgroundVideos?.();

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    modalVideo.currentTime = 0;
    modalVideo.muted = false;
    modalVideo.load();

    // Attempt play with error handling
    const playPromise = modalVideo.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log("Video started playing successfully.");
      }).catch(error => {
        console.error("Video play failed initially:", error);
        // Fallback: Try playing muted if browser blocks unmuted play
        modalVideo.muted = true;
        modalVideo.play().catch(e => console.error("Muted playback also failed:", e));
      });
    }

    videoModal.classList.remove('paused');
    playPauseIcon.innerHTML = PAUSE_ICON;
  }

  function closeVideoModal() {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    modalVideo.pause();

    // If we're at the closer look section, we might want to resume its inline video
    // But for simplicity, we'll let the user scroll or interact.
    // However, the hero video usually doesn't resume unless reloaded.

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Exit fullscreen error:", err));
    }
  }

  function toggleFullscreen() {
    const fsIcon = document.getElementById('fullscreenIcon');
    const ENTER_FS_PATH = 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z';
    const EXIT_FS_PATH = 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z';

    const isFS = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

    // iPhone safari Fullscreen hack
    const isiPhone = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (!isFS) {
      if (isiPhone && modalVideo.webkitEnterFullscreen) {
        modalVideo.webkitEnterFullscreen();
        return;
      }

      const requestFS = videoWrapper.requestFullscreen || videoWrapper.webkitRequestFullscreen || videoWrapper.mozRequestFullScreen || videoWrapper.msRequestFullscreen;
      if (requestFS) {
        requestFS.call(videoWrapper).catch(err => console.error("Error attempting to enable full-screen:", err));
      }
    } else {
      const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exitFS) {
        exitFS.call(document).catch(err => console.error("Error attempting to exit full-screen:", err));
      }
    }
  }

  function handleFullscreenChange() {
    const fsIcon = document.getElementById('fullscreenIcon');
    const ENTER_FS_PATH = 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z';
    const EXIT_FS_PATH = 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z';

    const isFS = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (fsIcon) {
      fsIcon.querySelector('path').setAttribute('d', isFS ? EXIT_FS_PATH : ENTER_FS_PATH);
    }
  }

  // Events
  document.addEventListener('click', (e) => {
    // 1. Film Link in Header
    if (e.target.closest('.highlights-film-link')) {
      openVideoModal(e);
      return;
    }
    // Highlights Title click no longer opens video modal
    // Only "Watch the film" link opens the video
  });

  // modalOverlay.addEventListener('click', closeVideoModal); // Disabled per user request
  modalClose.addEventListener('click', closeVideoModal);

  videoWrapper.addEventListener('click', (e) => {
    if (e.target.closest('.video-bottom-controls')) return;
    togglePlay();
  });
  modalVideo.addEventListener('timeupdate', updateProgress);
  progressBg.parentElement.addEventListener('click', seek);

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modalVideo.muted = !modalVideo.muted;
    const muteIcon = document.getElementById('muteIcon');
    const MUTE_PATH = 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z';
    const VOLUME_PATH = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z';
    if (muteIcon) {
      muteIcon.querySelector('path').setAttribute('d', modalVideo.muted ? MUTE_PATH : VOLUME_PATH);
    }
  });

  fullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) closeVideoModal();
    if (e.key === ' ' && videoModal.classList.contains('active')) {
      e.preventDefault();
      togglePlay();
    }
  });

})();

/* ===========================
   TAKE A CLOSER LOOK: MODAL & INLINE
=========================== */
(function () {
  const container = document.querySelector('.closer-look-container');
  const inlineBtns = document.querySelectorAll('.closer-look-btn');
  const inlineImg = document.getElementById('closerLookImg');

  const modal = document.getElementById('clModal');
  const modalSlidesContainer = document.getElementById('clModalSlides');
  const closeBtn = document.getElementById('clModalClose');
  const prevBtn = document.getElementById('clModalPrev');
  const nextBtn = document.getElementById('clModalNext');
  const modalPills = document.querySelectorAll('.cl-modal-btn');
  const descBox = document.getElementById('clModalDesc');

  if (!container || !modal) return;

  const slidesData = [
    { title: 'Random Clicks', img: 'images/IMG_4239.png', desc: '<strong>Our</strong> student click captures every vibrant campus moment with stunning clarity and detail.' },
    { title: 'College Photo', img: 'images/inbound7584718647672897351.png', desc: '<strong>Available</strong> in beautifully captured moments and vibrant campus life.' },
    { title: 'Display', img: 'images/gallery1.png', desc: '<strong>Display.</strong> The brilliant Liquid Retina XDR display delivers 1600 nits peak HDR brightness and a 10,00,000:1 contrast ratio. 4K videos and HDR photos look more true to life with deep blacks, bright highlights and vibrant colours.' },
    { title: 'Connectivity', img: 'images/gallery2.png', desc: '<strong>Connectivity.</strong> Features a MagSafe 3 port, three Thunderbolt 4 ports, an SDXC card slot, an HDMI port and a headphone jack.' },
    { title: 'Playground', src: 'video/IMG_6386.mp4', src2: 'video/IMG_6386.MOV', img: 'images/IMG_6384.png', desc: '<strong>Side Ground.</strong> Where the real game begins. Showcasing the energy, teamwork, and unforgettable moments of students playing together.' },
    { title: 'Rhythm, engineered', src: 'video/IMG_2021.mp4', src2: 'video/IMG_2021.MOV', img: 'images/IMG_5776.png', desc: '<strong>Rhythm, engineered.</strong> Precision is not only in code. Sometimes it lives in the way you move TCET does not just produce engineers — it produces people who show up, stand out, and own the stage.' },
    { title: 'Moments That Last', src: 'video/IMG_3549.mp4', src2: 'video/IMG_3549.MOV', img: 'images/View recent photos.png', desc: '<strong>Moments That Last</strong> Random campus videos. Every moment. In motion.' }
  ];

  const randomClicksPhotos = [
    'inbound7584718647672897351.png',
    'IMG_6364.png',
    'IMG_6360.png',
    'IMG_6326.png',
    'IMG_5455.png',
    'IMG_4239.png',
    'IMG_1486.png',
  ];

  const collegePhotos = [
    '1771320829_CollegeCampus.png',
    '1771320829_CollegeMainGateoutside_.png',
    '1771320829_CollegeMainGateoutside_(1).png',
    'IMG_4973.png',
    'inbound7584718647672897351.png',
    'shaping-future-tech-leaders-practically.png',
    'thakur-college-of-engineering-technology-mumbai-229678.png',
  ];

  const inlineVideo = document.getElementById('closerLookVideo');

  const isVideo = (path) => {
    if (!path) return false;
    const extensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.ogg'];
    return extensions.some(ext => path.toLowerCase().endsWith(ext));
  };

  // Pre-create Modal Slides
  const modalSlideElements = [];
  function initModalSlides() {
    modalSlidesContainer.innerHTML = '';
    for (let i = 0; i < slidesData.length; i++) {
      const data = slidesData[i];
      const slideDiv = document.createElement('div');
      slideDiv.className = 'cl-modal-slide';
      slideDiv.style.cssText = 'position:relative;overflow:hidden;';

      const mediaSrc = data.src || data.img;
      if (isVideo(mediaSrc)) {
        // Poster image behind video while loading
        if (data.img) {
          const posterImg = document.createElement('img');
          posterImg.src = data.img;
          posterImg.className = 'slide-poster';
          posterImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;';
          slideDiv.appendChild(posterImg);
        }
        const video = document.createElement('video');
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.preload = 'auto';
        video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;';
        if (data.img) video.setAttribute('poster', data.img);
        // MP4 first for Android, MOV fallback for Safari
        const src1 = document.createElement('source');
        src1.src = mediaSrc;
        src1.type = 'video/mp4';
        video.appendChild(src1);
        if (data.src2) {
          const src2 = document.createElement('source');
          src2.src = data.src2;
          src2.type = 'video/mp4';
          video.appendChild(src2);
        }
        slideDiv.appendChild(video);
      } else {
        const img = document.createElement('img');
        if (i === 0) {
          const randomPhoto = randomClicksPhotos[Math.floor(Math.random() * randomClicksPhotos.length)];
          img.src = 'images/' + randomPhoto;
        } else if (i === 1) {
          const randomPhoto = collegePhotos[Math.floor(Math.random() * collegePhotos.length)];
          img.src = 'images/' + randomPhoto;
        } else {
          img.src = mediaSrc;
        }
        slideDiv.appendChild(img);
      }
      modalSlidesContainer.appendChild(slideDiv);
      modalSlideElements.push(slideDiv);
    }
  }
  initModalSlides();

  let currentIndex = 0;

  async function setIndex(index) {
    if (index < 0) index = slidesData.length - 1;
    if (index >= slidesData.length) index = 0;
    currentIndex = index;

    // Refresh random photo every time Random Clicks slide (index 0) is shown
    if (currentIndex === 0) {
      const randomPhoto = randomClicksPhotos[Math.floor(Math.random() * randomClicksPhotos.length)];
      const slideImg = modalSlideElements[0] && modalSlideElements[0].querySelector('img');
      if (slideImg) slideImg.src = 'images/' + randomPhoto;
    }

    // Refresh random photo every time College Photo slide (index 1) is shown
    if (currentIndex === 1) {
      const randomPhoto = collegePhotos[Math.floor(Math.random() * collegePhotos.length)];
      const slideImg = modalSlideElements[1] && modalSlideElements[1].querySelector('img');
      if (slideImg) slideImg.src = 'images/' + randomPhoto;
    }

    const data = slidesData[currentIndex];
    const mediaSrc = data.src || data.img;
    const mediaType = isVideo(mediaSrc) ? 'video' : 'image';
    const isModalOpen = modal.classList.contains('open');

    // Update Modal Slider Position and Active State
    modalSlidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    modalSlideElements.forEach((s, i) => s.classList.toggle('active', i === currentIndex));

    // Handle Video Playback in Slider
    modalSlideElements.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (video) {
        if (i === currentIndex && isModalOpen) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });

    // Update Modal UI
    modalPills.forEach((p, i) => p.classList.toggle('active', i === currentIndex));
    descBox.classList.add('hide-desc');
    setTimeout(() => {
      if (window.innerWidth > 833) {
        modalPills[currentIndex].insertAdjacentElement('afterend', descBox);
      } else {
        const modalMenu = document.getElementById('clModalMenu');
        if (modalMenu) modalMenu.appendChild(descBox);
      }
      descBox.innerHTML = data.desc;
      descBox.classList.remove('hide-desc');
    }, 500);

    // Update Inline View — show poster image (video plays in modal)
    inlineBtns.forEach((b, i) => b.classList.toggle('active', i === currentIndex));
    inlineImg.classList.add('fade-out');
    setTimeout(() => {
      inlineVideo.style.display = 'none';
      inlineVideo.pause();
      inlineImg.style.display = 'block';
      if (currentIndex === 0) {
        inlineImg.src = 'images/IMG_4239.png';  // Always fixed outside; random only inside modal
      } else {
        inlineImg.src = data.img || mediaSrc;
      }
      inlineImg.onload = () => inlineImg.classList.remove('fade-out');
      setTimeout(() => inlineImg.classList.remove('fade-out'), 50);
    }, 400);
  }

  // Bind Inline click -> opens Modal at index
  inlineBtns.forEach((btn, i) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setIndex(i);
      openModal();
    });
  });

  // Open modal if user clicks anywhere else in container
  container.addEventListener('click', () => {
    openModal();
  });

  function openModal() {
    window.pauseAllBackgroundVideos?.();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    inlineVideo.pause();
    // Hide the inline closer-look section so it doesn't bleed through
    const closerLookSection = document.getElementById('closerLook');
    if (closerLookSection) closerLookSection.style.visibility = 'hidden';
    // Hide image-cards — their CSS transform creates a stacking context
    // that paints over position:fixed modals regardless of z-index
    document.querySelectorAll('.image-card').forEach(el => el.style.visibility = 'hidden');

    const activeSlide = modalSlideElements[currentIndex];
    const activeVideo = activeSlide ? activeSlide.querySelector('video') : null;
    if (activeVideo) {
      activeVideo.load();
      activeVideo.currentTime = 0;
      const playPromise = activeVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Android may need user interaction — show poster silently
        });
      }
    }
  }

  // Close Modal
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    // Restore the inline closer-look section
    const closerLookSection = document.getElementById('closerLook');
    if (closerLookSection) closerLookSection.style.visibility = '';
    // Restore image-cards
    document.querySelectorAll('.image-card').forEach(el => el.style.visibility = '');
    modalSlideElements.forEach(slide => {
      const v = slide.querySelector('video');
      if (v) v.pause();
    });
  });

  // Prev / Next
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setIndex(currentIndex - 1);
  });
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setIndex(currentIndex + 1);
  });

  // Modal Pills
  modalPills.forEach((btn, i) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setIndex(i);
    });
  });

  // Set initial state
  setIndex(0);
})();

/* ===========================
   PRECISION ENGINEERING — Video Overlay
=========================== */
(function () {
  const precisionItem = document.getElementById('precisionItem');
  const videoOverlay = document.getElementById('videoPageOverlay');
  const overlayVideo = document.getElementById('overlayVideoPlayer');
  const backBtn = document.getElementById('overlayBackBtn');

  if (!precisionItem || !videoOverlay || !overlayVideo || !backBtn) return;

  // Fix 100dvh for older iOS/Android that don't support dvh
  function setOverlayHeight() {
    const vh = window.innerHeight;
    videoOverlay.style.height = vh + 'px';
  }

  function openOverlay() {
    window.pauseAllBackgroundVideos?.();
    setOverlayHeight();
    videoOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    overlayVideo.muted = false;
    overlayVideo.currentTime = 0;
    overlayVideo.play().catch(() => {
      overlayVideo.muted = true;
      overlayVideo.play().then(() => { overlayVideo.muted = false; });
    });
  }

  function closeOverlay() {
    videoOverlay.classList.remove('active');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    overlayVideo.pause();
    overlayVideo.muted = true;
  }

  // Recalculate on orientation change
  window.addEventListener('resize', () => {
    if (videoOverlay.classList.contains('active')) setOverlayHeight();
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(setOverlayHeight, 150);
  });

  precisionItem.addEventListener('click', openOverlay);
  backBtn.addEventListener('click', closeOverlay);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoOverlay.classList.contains('active')) closeOverlay();
  });
})();

/* ===========================
   SCROLL REVEAL ANIMATIONS
=========================== */
(function () {
  const revealCards = document.querySelectorAll('.image-card');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealCards.forEach(card => revealObserver.observe(card));
})();








/* ===========================
   CINEMATIC SCROLL ZOOM + PLAY/PAUSE
=========================== */
(function () {
  const section = document.getElementById('cinematicSection');
  const inner = document.getElementById('cinematicInner');
  const video = document.getElementById('cinematicVideo');
  const btn = document.getElementById('cinematicPlayPause');

  if (!section || !inner || !video || !btn) return;

  const pauseIcon = btn.querySelector('.cin-pause-icon');
  const playIcon = btn.querySelector('.cin-play-icon');

  // iOS requires muted + playsinline set via JS too
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  function tryPlay() {
    if (video.paused) {
      video.play().then(() => {
        pauseIcon.style.display = '';
        playIcon.style.display = 'none';
      }).catch(() => {});
    }
  }

  // Play on load
  window.addEventListener('load', tryPlay, { once: true });
  // iOS unlock — play on first user interaction
  document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
  document.addEventListener('scroll', tryPlay, { once: true, passive: true });
  tryPlay();

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (video.paused) {
      tryPlay();
    } else {
      video.pause();
      pauseIcon.style.display = 'none';
      playIcon.style.display = '';
      btn.setAttribute('aria-label', 'Play video');
    }
  });

  function updateZoom() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(1, Math.max(0,
      (vh - rect.top) / (vh + rect.height)
    ));
    inner.style.transform = 'scale(1)';
    // Skip zoom transform on mobile — causes black screen on iOS
    if (window.innerWidth > 768) {
      const videoScale = 1.08 - (progress * 0.08);
      video.style.transform = `scale(${videoScale.toFixed(4)})`;
    } else {
      video.style.transform = 'scale(1)';
    }
  }

  window.addEventListener('scroll', updateZoom, { passive: true });
  window.addEventListener('resize', updateZoom, { passive: true });
  updateZoom();
})();
(function(){document.addEventListener('DOMContentLoaded',function(){
  const btn=document.getElementById('tcetNoticesCTA'),
        modal=document.getElementById('noticesModal'),
        overlay=document.getElementById('noticesModalOverlay'),
        closeBtn=document.getElementById('noticesModalClose');
  if(!btn||!modal)return;

  function openModal(){
    document.body.style.overflow='hidden';
    modal.classList.remove('closing');
    overlay.classList.remove('closing');
    // Double rAF: ensures browser paints the reset state before adding .open
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      overlay.classList.add('open');
      modal.classList.add('open');
    }));
  }

  function closeModal(){
    modal.classList.add('closing');
    overlay.classList.add('closing');
    // Wait for exit animation to finish before fully hiding
    modal.addEventListener('animationend', function onEnd(){
      modal.classList.remove('open','closing');
      overlay.classList.remove('open','closing');
      document.body.style.overflow='';
      modal.removeEventListener('animationend', onEnd);
    });
  }

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
})})();
(function(){document.addEventListener('DOMContentLoaded',function(){const link=document.getElementById('collegeTeammatesLink');if(!link)return;link.addEventListener('click',function(e){e.preventDefault();document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('open'));document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));const I=2,carousel=document.getElementById('highlightsCarousel'),dots=document.querySelectorAll('.carousel-dot');if(carousel){const slides=carousel.querySelectorAll('.highlight-slide');if(slides[I]){const off=slides[I].offsetLeft-carousel.offsetLeft;carousel.scrollTo({left:off,behavior:'smooth'});dots.forEach((d,i)=>d.classList.toggle('active',i===I));slides.forEach((s,i)=>s.classList.toggle('active',i===I))}}const sec=document.getElementById('highlights');if(sec)setTimeout(()=>sec.scrollIntoView({behavior:'smooth',block:'start'}),80)})})})();
/* ===========================
   POLICY MODALS — Privacy, Terms, Sales, Sitemap
=========================== */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('policyModalOverlay');
    if (!overlay) return;

    const map = {
      footerPrivacy:  'policyModalPrivacy',
      footerTerms:    'policyModalTerms',
      footerSales:    'policyModalSales',
      footerSitemap:  'policyModalSitemap',
    };

    let activeModal = null;

    function openPolicyModal(modalId) {
      if (activeModal) closePolicyModal(activeModal, true);
      const modal = document.getElementById(modalId);
      if (!modal) return;
      activeModal = modal;
      document.body.style.overflow = 'hidden';
      overlay.classList.remove('closing');
      modal.classList.remove('closing');
      overlay.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('open')));
    }

    function closePolicyModal(modal, instant) {
      if (!modal) return;
      modal.classList.add('closing');
      overlay.classList.add('closing');
      modal.addEventListener('animationend', function onEnd() {
        modal.classList.remove('open', 'closing');
        overlay.classList.remove('open', 'closing');
        document.body.style.overflow = '';
        activeModal = null;
        modal.removeEventListener('animationend', onEnd);
      });
    }

    // Wire footer links
    Object.entries(map).forEach(([btnId, modalId]) => {
      const btn = document.getElementById(btnId);
      if (btn) btn.addEventListener('click', e => { e.preventDefault(); openPolicyModal(modalId); });
    });

    // Wire all close buttons inside policy modals
    document.querySelectorAll('.policy-modal .policy-modal-close').forEach(btn => {
      btn.addEventListener('click', () => closePolicyModal(activeModal));
    });

    // Overlay click closes
    overlay.addEventListener('click', () => closePolicyModal(activeModal));

    // Sitemap links close modal then scroll/navigate
    document.querySelectorAll('#policyModalSitemap a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        closePolicyModal(activeModal);
        if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 420);
      });
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && activeModal) closePolicyModal(activeModal);
    });
  });
})();
/* ===========================
   HERE'S WHAT YOU GET — Dropdown interactivity
=========================== */
(function () {
  const select   = document.getElementById('hwgSelect');
  const subtitle = document.getElementById('hwgSubtitle');
  const grid     = document.getElementById('hwgGrid');
  const c1 = document.getElementById('hwgCard1Text');
  const c2 = document.getElementById('hwgCard2Text');
  const c3 = document.getElementById('hwgCard3Text');
  const c4 = document.getElementById('hwgCard4Text');
  if (!select || !grid) return;

  const data = {
    fy: {
      label: 'Our garden.',
      img: 'images/IMG_4239.png',
      c1: 'All in, from day one. Our garden.',
      c2: 'Access to TCET\'s digital library, NPTEL resources, and online course portals.',
      c3: 'A dedicated mentor and faculty advisor to guide your academic journey.',
      c4: 'World-class campus infrastructure — labs, library, courts, and canteen.',
    },
    sy: {
      label: 'Core engineering',
      img: 'images/IMG_5455.png',
      c1: 'Core engineering subjects with hands-on lab sessions every week.',
      c2: 'Mini-project submissions and department-level competitions open to you.',
      c3: 'Internship guidance and industry exposure through T&P cell workshops.',
      c4: 'Elective courses to start building your specialisation early.',
    },
    ty: {
      label: 'planning begins',
      img: 'images/battery.png',
      c1: 'Major project planning begins — choose your domain and team.',
      c2: 'Research paper writing support and conference participation opportunities.',
      c3: 'Pre-placement training, aptitude workshops, and mock interviews.',
      c4: 'Advanced lab access for AI, IoT, cybersecurity, and data science.',
    },
    ly: {
      label: 'placement',
      img: 'images/hero_photo2.png',
      c1: 'Full campus placement drive with 100+ recruiting companies.',
      c2: 'Project expo, publication support, and patent filing guidance.',
      c3: 'Alumni network access and mentorship from TCET graduates worldwide.',
      c4: 'Farewell, convocation, and a lifetime of memories made here.',
    },
  };

  function update(val, animate) {
    const d = data[val];
    if (!d) return;

    subtitle.innerHTML = `Here's what you get as a <strong>${d.label}</strong> student at TCET.`;

    if (animate) {
      // Trigger card-in animation
      grid.classList.remove('transitioning');
      void grid.offsetWidth; // reflow
      grid.classList.add('transitioning');
      grid.addEventListener('animationend', () => grid.classList.remove('transitioning'), { once: true });
    }

    // Swap card image per year
    const cardBg = document.querySelector('#hwgCard1 .hwg-card-bg');
    if (cardBg && d.img) {
      cardBg.style.opacity = '0';
      cardBg.style.transition = 'opacity 0.35s ease';
      setTimeout(() => {
        cardBg.src = d.img;
        cardBg.onload = () => { cardBg.style.opacity = '1'; };
        // fallback if already cached
        if (cardBg.complete) cardBg.style.opacity = '1';
      }, 180);
    }
    if (c1) c1.textContent = d.c1;
    if (c2) c2.textContent = d.c2;
    if (c3) c3.textContent = d.c3;
    if (c4) c4.textContent = d.c4;
  }

  select.addEventListener('change', () => update(select.value, true));
  update(select.value, false);
})();