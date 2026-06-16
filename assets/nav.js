// EASTEAM Style Guide — shared dropdown nav injection.
// Renders an accessible, single-column section menu on every page.
// Sections with `children` become expandable toggles (e.g. Email →
// Klaviyo Email + Notification Emails).

(function () {
  const SECTIONS = [
    { num: '01', name: 'Brand',          href: 'brand.html' },
    { num: '02', name: 'Logos',          href: 'logos.html' },
    { num: '03', name: 'Colors',         href: 'colors.html' },
    { num: '04', name: 'Themes',         href: 'themes.html' },
    { num: '05', name: 'Typography',     href: 'typography.html' },
    { num: '06', name: 'Voice',          href: 'voice.html' },
    { num: '07', name: 'Imagery',        href: 'imagery.html' },
    { num: '08', name: 'Buttons',        href: 'buttons.html' },
    { num: '09', name: 'Email',          isNew: true, children: [
        { name: 'Klaviyo Email',       href: 'email.html' },
        { name: 'Notification Emails', href: 'notification-emails.html', isNew: true },
      ] },
    { num: '10', name: 'Social',         href: 'social.html',          isNew: true },
    { num: '11', name: 'Packaging',      href: 'packaging.html' },
    { num: '12', name: 'Files & Folders',href: 'files.html',           isNew: true },
    { num: '13', name: "Do's & Don'ts",  href: 'dos-donts.html' },
    { num: '14', name: 'Website',        href: 'website.html',         isNew: true },
    { num: '15', name: 'Word Documents', href: 'word-documents.html',  isNew: true },
  ];

  function build() {
    const wrap = document.querySelector('[data-nav-dd]');
    if (!wrap) return;

    const path = window.location.pathname;
    const inPages = /\/pages\//.test(path);
    const prefix = inPages ? '' : 'pages/';
    const currentFile = path.split('/').pop();

    // ---- trigger button ----
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-trigger';
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = 'Sections <span class="caret" aria-hidden="true">▾</span>';

    // ---- panel ----
    const panel = document.createElement('div');
    panel.className = 'nav-panel';
    panel.setAttribute('role', 'menu');

    let subId = 0;

    SECTIONS.forEach((s) => {
      if (!s.children) {
        // simple link row
        const a = document.createElement('a');
        a.className = 'nav-item';
        a.setAttribute('role', 'menuitem');
        a.href = prefix + s.href;
        if (currentFile === s.href) a.classList.add('is-current');
        a.innerHTML =
          `<span class="nnum">${s.num}</span>` +
          `<span class="nname">${s.name}</span>` +
          (s.isNew ? `<span class="ntag">New</span>` : ``);
        panel.appendChild(a);
        return;
      }

      // expandable parent (e.g. Email)
      subId += 1;
      const groupId = 'nav-sub-' + subId;
      const childActive = s.children.some((c) => currentFile === c.href);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-item nav-parent';
      btn.setAttribute('aria-expanded', childActive ? 'true' : 'false');
      btn.setAttribute('aria-controls', groupId);
      btn.innerHTML =
        `<span class="nnum">${s.num}</span>` +
        `<span class="nname">${s.name}</span>` +
        (s.isNew ? `<span class="ntag">New</span>` : ``) +
        `<span class="subcaret" aria-hidden="true">▾</span>`;
      panel.appendChild(btn);

      const group = document.createElement('div');
      group.className = 'nav-subgroup';
      group.id = groupId;
      if (childActive) group.classList.add('open');

      s.children.forEach((c) => {
        const sa = document.createElement('a');
        sa.className = 'nav-subitem';
        sa.setAttribute('role', 'menuitem');
        sa.href = prefix + c.href;
        if (currentFile === c.href) sa.classList.add('is-current');
        sa.innerHTML =
          `<span class="subdot" aria-hidden="true"></span>` +
          `<span class="nname">${c.name}</span>` +
          (c.isNew ? `<span class="ntag">New</span>` : ``);
        group.appendChild(sa);
      });
      panel.appendChild(group);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = group.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    const dd = document.createElement('div');
    dd.className = 'nav-dd';
    dd.appendChild(trigger);
    dd.appendChild(panel);
    wrap.appendChild(dd);

    function openMenu() {
      dd.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      dd.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dd.classList.contains('open') ? closeMenu() : openMenu();
    });
    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    panel.addEventListener('click', (e) => e.stopPropagation());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
