(() => {
  'use strict';
  const list = document.querySelector('[data-viewer-tabs]');
  if (!list) return;
  const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  function activate(index, changeAddress = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (changeAddress) {
      const url = new URL(location.href);
      url.hash = panels[index].id;
      history.replaceState(null, '', url);
    }
  }
  function reveal(hash) {
    let id;
    try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch (_) { return; }
    if (!id || id === 'top' || id === 'main') { activate(0); return; }
    const target = document.getElementById(id);
    if (!target) return;
    if (target.tagName === 'DETAILS') target.open = true;
    for (let ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    }
    const index = panels.findIndex(panel => panel === target || panel.contains(target));
    if (index !== -1) activate(index);
    const dialog = target.closest("dialog");
    if (dialog && !dialog.open) dialog.showModal();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index, true));
    tab.addEventListener('keydown', event => {
      const rtl = getComputedStyle(list).direction === 'rtl';
      let next = index;
      if (event.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + tabs.length) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : -1) + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(next, true);
      tabs[next].focus();
    });
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.hash) reveal(url.hash);
  });
  window.addEventListener('hashchange', () => reveal(location.hash));
  window.addEventListener('popstate', () => reveal(location.hash));
  activate(0);
  reveal(location.hash);
  list.dataset.ready = 'true';
})();
