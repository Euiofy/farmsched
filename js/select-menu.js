/* Accessible custom select menus. Keep the original native selects and change
   events intact, including dynamically rendered roster and modal fields. */
(function () {
    const doc = document, records = new WeakMap();
    let opened = null, serial = 0, pending = false, typeBuffer = '', lastType = 0;
    const arrow = '<svg class="pj-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    const check = '<svg class="pj-dropdown-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
    const menu = doc.createElement('div');
    menu.className = 'pj-dropdown-menu';
    menu.id = 'pj-dropdown-options';
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;
    doc.body.append(menu);
    const popover = typeof menu.showPopover === 'function';
    if (popover)
        menu.setAttribute('popover', 'manual');
    const optionDisabled = o => o.disabled || !!o.closest('optgroup[disabled]');
    function labelFor(s) {
        const label = s.getAttribute('aria-label');
        if (label)
            return label;
        const labelled = s.getAttribute('aria-labelledby');
        if (labelled)
            return labelled.split(/\s+/).map(id => doc.getElementById(id)?.textContent || '').join(' ').trim();
        const l = s.labels?.[0];
        if (l) {
            const c = l.cloneNode(true);
            c.querySelectorAll('select,button,.pj-select').forEach(x => x.remove());
            return c.textContent.trim() || 'Choose an option';
        }
        return s.getAttribute('title') || 'Choose an option';
    }
    function sync(s) {
        let r = records.get(s);
        if (!r)
            return;
        const opt = s.options[s.selectedIndex];
        const v = opt?.label || 'Choose an option';
        if (r.value.textContent !== v)
            r.value.textContent = v;
        const name = labelFor(s);
        if (r.button.getAttribute('aria-label') !== name)
            r.button.setAttribute('aria-label', name);
        if (r.button.disabled !== s.disabled)
            r.button.disabled = s.disabled;
        r.button.title = v;
        if (opened?.s === s && s.disabled)
            close(false);
    }
    function enhance(s) {
        if (records.has(s) || s.multiple || s.size > 1)
            return;
        const wrap = doc.createElement('span');
        wrap.className = 'pj-select';
        const b = doc.createElement('button');
        b.type = 'button';
        b.className = 'pj-select-button';
        b.id = 'pj-select-' + (++serial);
        b.setAttribute('role', 'combobox');
        b.setAttribute('aria-haspopup', 'listbox');
        b.setAttribute('aria-expanded', 'false');
        b.setAttribute('aria-controls', menu.id);
        b.innerHTML = '<span class="pj-select-value"></span>' + arrow;
        s.before(wrap);
        wrap.append(s, b);
        s.tabIndex = -1;
        s.setAttribute('aria-hidden', 'true');
        records.set(s, { button: b, value: b.firstElementChild, wrap });
        sync(s);
        b.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            if (opened?.s === s)
                close(true);
            else
                open(s);
        });
        b.addEventListener('keydown', e => key(s, e));
        s.addEventListener('focus', () => { if (!s.disabled)
            b.focus({ preventScroll: true }); });
        s.addEventListener('change', () => sync(s));
        s.addEventListener('farm-page-sync', () => sync(s));
    }
    function refresh() {
        pending = false;
        if (opened && (!opened.s.isConnected || !opened.b.getClientRects().length || opened.s.closest('dialog:not([open])')))
            close(false);
        doc.querySelectorAll('select').forEach(s => {
            enhance(s);
            sync(s);
        });
    }
    function queue() {
        if (pending)
            return;
        pending = true;
        queueMicrotask(refresh);
    }
    function close(focus) {
        if (!opened)
            return;
        const b = opened.b;
        opened = null;
        typeBuffer = '';
        b.setAttribute('aria-expanded', 'false');
        b.removeAttribute('aria-activedescendant');
        if (popover && menu.matches(':popover-open'))
            menu.hidePopover();
        menu.hidden = true;
        menu.replaceChildren();
        if (focus && b.isConnected)
            b.focus({ preventScroll: true });
    }
    function place() {
        if (!opened)
            return;
        const rect = opened.b.getBoundingClientRect(), vw = doc.documentElement.clientWidth, vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh || !opened.b.getClientRects().length) {
            close(false);
            return;
        }
        const gap = 6, edge = 8;
        const w = Math.min(vw - 2 * edge, Math.max(rect.width, 208));
        menu.style.width = w + 'px';
        menu.style.left = Math.max(edge, Math.min(rect.left, vw - w - edge)) + 'px';
        const down = vh - rect.bottom - gap - edge, up = rect.top - gap - edge;
        const want = Math.min(menu.scrollHeight + 2, 300);
        const above = down < want && up > down;
        const space = above ? up : down;
        menu.style.maxHeight = Math.max(35, Math.min(300, space)) + 'px';
        const h = Math.min(want, Math.max(35, space));
        menu.style.top = Math.max(edge, above ? rect.top - gap - h : rect.bottom + gap) + 'px';
    }
    function highlight(i, scroll = true) {
        if (!opened)
            return;
        const rows = opened.rows;
        if (i < 0 || i >= rows.length || rows[i].getAttribute('aria-disabled') === 'true')
            return;
        opened.index = i;
        rows.forEach((r, j) => r.classList.toggle('is-highlighted', j === i));
        opened.b.setAttribute('aria-activedescendant', rows[i].id);
        if (scroll)
            rows[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    }
    function open(s) {
        sync(s);
        if (s.disabled || !s.options.length)
            return;
        close(false);
        const b = records.get(s).button;
        const parent = s.closest('dialog[open]') || doc.body;
        parent.append(menu);
        menu.replaceChildren();
        menu.setAttribute('aria-label', labelFor(s));
        const rows = Array.from(s.options, (opt, i) => {
            const row = doc.createElement('div');
            row.id = 'pj-dropdown-option-' + i;
            row.className = 'pj-dropdown-option';
            row.setAttribute('role', 'option');
            row.setAttribute('aria-selected', String(i === s.selectedIndex));
            row.setAttribute('aria-disabled', String(optionDisabled(opt)));
            row.dataset.index = i;
            const t = doc.createElement('span');
            t.textContent = opt.label;
            row.append(t);
            row.insertAdjacentHTML('beforeend', check);
            menu.append(row);
            return row;
        });
        opened = { s, b, rows, index: -1 };
        menu.hidden = false;
        b.setAttribute('aria-expanded', 'true');
        if (popover) {
            try {
                menu.showPopover();
            }
            catch { }
        }
        place();
        const i = s.selectedIndex >= 0 && !optionDisabled(s.options[s.selectedIndex]) ? s.selectedIndex : Array.from(s.options).findIndex(o => !optionDisabled(o));
        highlight(i);
        b.focus({ preventScroll: true });
    }
    function choose(i) {
        if (!opened)
            return;
        const { s, b } = opened;
        if (!s.options[i] || optionDisabled(s.options[i]))
            return;
        const changed = s.selectedIndex !== i;
        s.selectedIndex = i;
        sync(s);
        close(true);
        if (changed) {
            s.dispatchEvent(new Event('input', { bubbles: true }));
            s.dispatchEvent(new Event('change', { bubbles: true }));
        }
        queue();
    }
    function move(dir) {
        if (!opened)
            return;
        let i = opened.index;
        for (let j = 0; j < opened.rows.length; j++) {
            i += dir;
            if (i < 0 || i >= opened.rows.length)
                break;
            if (!optionDisabled(opened.s.options[i])) {
                highlight(i);
                break;
            }
        }
    }
    function key(s, e) {
        const active = opened?.s === s;
        const k = e.key;
        if (k === 'Escape' && active) {
            e.preventDefault();
            e.stopImmediatePropagation();
            close(true);
            return;
        }
        if (k === 'Tab' && active) {
            close(false);
            return;
        }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(k)) {
            e.preventDefault();
            e.stopPropagation();
            if (!active) {
                open(s);
                if (k === 'Home' || k === 'End') {
                    const a = Array.from(s.options);
                    const i = k === 'Home' ? a.findIndex(o => !optionDisabled(o)) : a.findLastIndex(o => !optionDisabled(o));
                    highlight(i);
                }
                return;
            }
            if (k === 'Enter' || k === ' ') {
                choose(opened.index);
                return;
            }
            if (k === 'Home' || k === 'End') {
                const a = Array.from(s.options);
                const i = k === 'Home' ? a.findIndex(o => !optionDisabled(o)) : a.findLastIndex(o => !optionDisabled(o));
                highlight(i);
            }
            else
                move(k === 'ArrowDown' ? 1 : -1);
            return;
        }
        if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            if (!active)
                open(s);
            if (!opened)
                return;
            const now = Date.now();
            typeBuffer = (now - lastType > 650 ? '' : typeBuffer) + k.toLowerCase();
            lastType = now;
            const i = Array.from(s.options).findIndex(o => !optionDisabled(o) && o.label.toLowerCase().startsWith(typeBuffer));
            if (i >= 0)
                highlight(i);
        }
    }
    menu.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse')
        e.preventDefault(); });
    menu.addEventListener('click', e => {
        const row = e.target.closest('.pj-dropdown-option');
        if (row) {
            e.stopPropagation();
            choose(Number(row.dataset.index));
        }
    });
    doc.addEventListener('pointerdown', e => { if (opened && !menu.contains(e.target) && !opened.b.contains(e.target))
        close(false); }, true);
    doc.addEventListener('focusin', e => { if (opened && !menu.contains(e.target) && e.target !== opened.b)
        close(false); });
    doc.addEventListener('change', queue, true);
    doc.addEventListener('reset', () => setTimeout(queue, 0), true);
    doc.addEventListener('close', () => {
        if (opened)
            close(false);
        queue();
    }, true);
    doc.addEventListener('scroll', e => { if (opened && !menu.contains(e.target))
        place(); }, true);
    window.addEventListener('resize', () => { if (opened)
        place(); });
    const observer = new MutationObserver(mutations => { if (mutations.some(m => !menu.contains(m.target) && !(m.target instanceof Element && m.target.closest('.pj-select-button'))))
        queue(); });
    observer.observe(doc.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled', 'selected', 'value', 'hidden', 'open', 'class'] });
    refresh();
})();
