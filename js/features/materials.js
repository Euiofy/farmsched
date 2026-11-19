// Teyvat Companion | features / materials
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const materialCardHtml = function (entry) {
    if (entry.type === 'weapon') {
        return `<button type="button" class="material-entry material-talent-series material-weapon-series" data-weapon-users-series="${esc(entry.name)}" aria-haspopup="dialog" aria-label="Show weapons using ${esc(entry.name)}"><span class="material-entry-main is-weapon"><span class="material-entry-content"><span class="material-entry-head"><span class="material-type">⚒ Weapon ascension</span></span><strong class="material-entry-name">${esc(materialDisplayName(entry))}</strong>${materialWeaponTierIcons(entry)}<span class="material-entry-sub">${esc(entry.domain)}</span></span></span></button>`;
    }
    if (entry.type === 'talent') {
        return `<button type="button" class="material-entry material-talent-series ${entry.need ? 'is-needed' : ''}" data-talent-users-book="${esc(entry.name)}" aria-haspopup="dialog" aria-label="Show characters who use ${esc(entry.name)} Books"><span class="material-entry-main is-talent"><span class="material-entry-content"><span class="material-entry-head"><span class="material-talent-meta"><span class="material-type">✧ Talent books</span>${entry.need?.people?.size ? `<span class="material-talent-dot" aria-hidden="true">·</span><span class="material-talent-for">For ${esc([...entry.need.people].join(', '))}</span>` : ''}</span>${entry.need ? '<span class="material-need">' + (state.roadmap.started ? 'In your plan' : 'In your roster') + '</span>' : ''}</span><strong class="material-entry-name">${esc(materialDisplayName(entry))}</strong>${materialExtraNames(entry)}<span class="material-series-footer"><span class="material-entry-sub">${esc(entry.domain)}</span></span></span></span></button>`;
    }
    return `<div class="material-entry ${entry.need ? 'is-needed' : ''}"><div class="material-entry-main ${entry.type === 'weapon' ? 'is-weapon' : ''}">${entry.type === 'weapon' ? '' : materialIconHtml(entry)}<div class="material-entry-content"><div class="material-entry-head"><span class="material-type">${entry.type === 'weapon' ? '⚒ Weapon ascension' : entry.availability === 'weekly' ? 'Weekly reward' : 'Everyday'}</span>${entry.need ? '<span class="material-need">' + (state.roadmap.started ? 'In your plan' : 'In your roster') + '</span>' : ''}</div><strong class="material-entry-name">${esc(materialDisplayName(entry))}</strong>${entry.type === 'weapon' ? materialWeaponTierIcons(entry) : ''}${entry.info ? `<small class="material-entry-sub">${esc(entry.info)}</small>` : ''}${entry.domain ? `<span class="material-entry-sub">${esc(entry.domain)}</span>` : ''}${entry.need ? `<small class="material-entry-sub" style="color:#aee4c7;margin-top:5px">For ${esc([...entry.need.people].join(', '))}</small>` : ''}</div></div></div>`;
};
const materialDay = function () { return materialView.day === null ? ((parseKey(dayKey()).getUTCDay() + 6) % 7) : materialView.day; };
const materialRotation = function (day) { return day === 6 ? 'any' : (['mon', 'tue', 'wed', 'mon', 'tue', 'wed'][day]); };
const materialHighlightedBooks = function () {
    const highlights = new Map();
    if (state.roadmap.started) {
        if (coachFirstConflict(state.roadmap.people))
            return highlights;
        for (const g of coachGoals())
            if (g.kind === 'books' && !g.farmOnly && g.left > 0) {
                const slot = highlights.get(g.book) || { left: 0, people: new Set() };
                slot.left += g.left;
                (g.characters || []).forEach(n => slot.people.add(n));
                highlights.set(g.book, slot);
            }
    }
    else {
        for (const ch of state.planner.characters) {
            for (const kind of ['n', 's', 'b']) {
                if (ch.target[kind] <= ch.talents[kind])
                    continue;
                const b = isTraveler(ch.name) ? talentBookFor(ch, kind, ch.talents[kind]) : getBook(ch);
                if (b && BOOKS[b]) {
                    const slot = highlights.get(b) || { left: 0, people: new Set() };
                    slot.people.add(ch.name);
                    highlights.set(b, slot);
                }
            }
        }
    }
    return highlights;
};
const bookUsers = function (book) {
    const names = Object.keys(CHARACTER_BOOK).filter(ch => !isTraveler(ch) && CHARACTER_BOOK[ch] === book);
    const forms = TRAVELER_ELEMENTS.filter(el => (TRAVELER_BOOK_SETS[el] || []).includes(book)).map(el => 'Traveler (' + el + ')');
    return names.concat(forms);
};
const showTalentBookUsers = function (book) {
    const dialog = $('talent-users-dialog');
    if (!BOOKS[book] || !dialog)
        return;
    const names = bookUsers(book).sort((a, b) => a.localeCompare(b));
    const selected = new Set(state.roadmap.started ? state.roadmap.people : []);
    const inPlan = name => selected.has(name);
    names.sort((a, b) => Number(inPlan(b)) - Number(inPlan(a)) || a.localeCompare(b));
    $('talent-users-title').textContent = book + ' Books';
    $('talent-users-description').textContent = `${names.length} character${names.length === 1 ? '' : 's'} use ${book} Books · ${BOOKS[book].region}`;
    $('talent-users-grid').innerHTML = names.length ? names.map(name => `<div class="talent-user-card ${inPlan(name) ? 'in-plan' : ''}"><span class="talent-user-portrait">${pickerPortraitHtml(name)}</span><span class="talent-user-name">${esc(name)}</span><span class="talent-user-element">${esc(CHARACTER_ELEMENT[name] || 'Traveler')}</span>${inPlan(name) ? '<span class="talent-user-plan-tag">In your plan</span>' : ''}</div>`).join('') : '<p class="coach-soft">No characters listed for this book in the current character catalog.</p>';
    $('talent-users-note').hidden = !names.some(name => name.startsWith('Traveler ('));
    if (!dialog.open)
        dialog.showModal();
};
const weaponUsersNormalize = function (value) { return String(value || '').normalize('NFKC').replace(/[‘’]/g, "'").trim().toLowerCase(); };
const weaponUsersIndex = function (raw) {
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.result) ? raw.result : [];
    const series = Object.values(MATERIAL_FORGERY).flatMap(r => r.series);
    const lookup = new Map();
    for (const base of series)
        for (const item of WEAPON_RARITIES[base] || [base]) {
            lookup.set(weaponUsersNormalize(item), base);
            const id = materialExactItemId(item);
            if (id)
                lookup.set(String(id), base);
        }
    const bySeries = Object.fromEntries(series.map(base => [base, []]));
    let matched = 0;
    for (const w of list) {
        if (!w || typeof w.name !== 'string' || !w.costs)
            continue;
        const keys = new Set();
        for (const cost of Object.values(w.costs).flat()) {
            if (!cost || typeof cost !== 'object')
                continue;
            const base = lookup.get(weaponUsersNormalize(cost.name)) || lookup.get(String(cost.id ?? cost.itemId ?? ''));
            if (base)
                keys.add(base);
        }
        if (!keys.size)
            continue;
        matched++;
        const images = w.images || {};
        const filename = String(images.filename_icon || images.nameicon || '').replace(/\.png$/i, '');
        const icon = /^UI_EquipIcon_[A-Za-z0-9_]+$/.test(filename) ? filename : '';
        const row = { name: w.name, rarity: Number(w.rarity) || 0, icon };
        for (const base of keys)
            if (!bySeries[base].some(x => x.name === row.name))
                bySeries[base].push(row);
    }
    if (!matched)
        throw new Error('Weapon ascension costs unavailable');
    for (const rows of Object.values(bySeries))
        rows.sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
    return bySeries;
};
const weaponUsersCached = function () {
    try {
        const raw = JSON.parse(localStorage.getItem(weaponUsersCacheKey) || 'null');
        if (raw && Date.now() - raw.saved < 7 * 86400000 && raw.data && Object.values(raw.data).some(a => Array.isArray(a) && a.length))
            return raw.data;
    }
    catch { }
    return null;
};
const loadWeaponUsersCatalog = function () {
    if (weaponUsersData)
        return Promise.resolve(weaponUsersData);
    const cached = weaponUsersCached();
    if (cached) {
        weaponUsersData = cached;
        return Promise.resolve(cached);
    }
    if (weaponUsersLoading)
        return weaponUsersLoading;
    weaponUsersLoading = (async () => {
        const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 18000);
        try {
            const res = await fetch(WEAPON_USERS_ENDPOINT, { signal: ctrl.signal, credentials: 'omit' });
            if (!res.ok)
                throw new Error('Weapon catalog ' + res.status);
            const indexed = weaponUsersIndex(await res.json());
            weaponUsersData = indexed;
            try {
                localStorage.setItem(weaponUsersCacheKey, JSON.stringify({ saved: Date.now(), data: indexed }));
            }
            catch { }
            return indexed;
        }
        finally {
            clearTimeout(timer);
            weaponUsersLoading = null;
        }
    })();
    return weaponUsersLoading;
};
const weaponUsersImageUrl = function (w, stage) {
    const file = /^UI_EquipIcon_[A-Za-z0-9_]+$/.test(w.icon || '') ? w.icon : '';
    const wiki = 'https://genshin-impact.fandom.com/wiki/Special:FilePath/' + encodeURIComponent('Weapon_' + w.name.replace(/\s+/g, '_') + '.png');
    if (!file)
        return stage === 0 ? wiki : '';
    return ['https://enka.network/ui/' + file + '.png', 'https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/' + file + '.png', wiki][stage] || '';
};
const renderWeaponUsers = function (rows) {
    const host = $('weapon-users-grid');
    host.innerHTML = rows.map(w => `<div class="talent-user-card"><span class="weapon-user-art" data-weapon-rarity="${[1, 2, 3, 4, 5].includes(Number(w.rarity)) ? Number(w.rarity) : ''}"><img alt="" loading="lazy" decoding="async" src="${esc(weaponUsersImageUrl(w, 0))}"></span><span class="talent-user-name">${esc(w.name)}</span>${w.rarity ? `<span class="talent-user-element">${w.rarity}★</span>` : ''}</div>`).join('');
    host.querySelectorAll('img').forEach((img, i) => {
        let stage = 0;
        img.addEventListener('error', () => {
            const next = weaponUsersImageUrl(rows[i], ++stage);
            if (next)
                img.src = next;
            else
                img.hidden = true;
        });
    });
};
const showWeaponSeriesUsers = async function (series) {
    const dialog = $('weapon-users-dialog');
    const region = Object.entries(MATERIAL_FORGERY).find(([, r]) => r.series.includes(series))?.[0];
    if (!region)
        return;
    const request = ++weaponUsersRequest;
    $('weapon-users-title').textContent = series;
    $('weapon-users-description').textContent = region;
    const host = $('weapon-users-grid'), note = $('weapon-users-note');
    note.hidden = true;
    host.innerHTML = '<div class="weapon-users-status" role="status">Loading weapons…</div>';
    if (!dialog.open)
        dialog.showModal();
    try {
        const catalog = await loadWeaponUsersCatalog();
        if (request !== weaponUsersRequest || !dialog.open)
            return;
        const rows = catalog[series] || [];
        if (!rows.length) {
            host.innerHTML = '<div class="weapon-users-status">No matching weapons found in the current catalog.</div>';
            return;
        }
        $('weapon-users-description').textContent = `${rows.length} weapon${rows.length === 1 ? '' : 's'} · ${region}`;
        renderWeaponUsers(rows);
    }
    catch {
        if (request !== weaponUsersRequest || !dialog.open)
            return;
        const fallback = WEAPON_USERS_FALLBACK[series] || [];
        if (fallback.length) {
            renderWeaponUsers(fallback);
            note.textContent = 'Showing a partial saved list. The full online catalog is currently unavailable.';
            note.hidden = false;
        }
        else
            host.innerHTML = '<div class="weapon-users-status" role="status">The weapon catalog could not be loaded. Check your connection and try again.</div>';
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'btn btn-outline';
        retry.textContent = 'Try again';
        retry.addEventListener('click', () => showWeaponSeriesUsers(series));
        const wrap = document.createElement('div');
        wrap.className = 'weapon-users-status';
        wrap.append(retry);
        host.append(wrap);
    }
};
const materialUsers = function (entry) {
    const list = entry.people || [];
    return list.length ? `<div class="material-users"><small>Used by</small><span>${list.map(esc).join(' · ')}</span></div>` : '';
};
const materialEntries = function (region, rotation, type, query, needs) {
    const entries = [];
    const allowed = (kind) => type === 'all' || type === kind;
    const matching = (entry) => !query || [entry.name, entry.domain, region, ...(entry.people || [])].join(' ').toLowerCase().includes(query);
    if (allowed('talent'))
        for (const [name, info] of Object.entries(BOOKS)) {
            if (info.region !== region || (rotation !== 'any' && info.rotation !== rotation))
                continue;
            const e = { name, domain: info.domain, type: 'talent', people: bookUsers(name), need: needs.get(name) };
            if (matching(e))
                entries.push(e);
        }
    if (allowed('weapon'))
        for (let i = 0; i < 3; i++) {
            if (rotation !== 'any' && i !== ({ mon: 0, tue: 1, wed: 2 })[rotation])
                continue;
            const info = MATERIAL_FORGERY[region];
            if (!info)
                continue;
            const e = { name: info.series[i], domain: info.domain, type: 'weapon', people: [] };
            if (matching(e))
                entries.push(e);
        }
    return entries;
};
const renderFloatingMaterialDays = function () {
    const host = $('material-floating-buttons');
    if (!host.children.length) {
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        host.innerHTML = labels.map((label, i) => `<button type="button" class="material-float-day" data-material-day="${i}" aria-label="Show ${MATERIAL_DAYS[i]} materials" title="${MATERIAL_DAYS[i]}">${label}</button>`).join('');
    }
    const selected = materialDay();
    host.querySelectorAll('[data-material-day]').forEach(button => {
        const active = Number(button.dataset.materialDay) === selected;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
};
const updateFloatingMaterialDays = function () {
    const floating = $('material-floating-days');
    if (currentPage !== 'materials') {
        floating.hidden = true;
        $('page-materials').classList.remove('has-floating-days');
        return;
    }
    const originalAnchor = $('material-week-anchor').getBoundingClientRect();
    const pageArea = $('page-materials').getBoundingClientRect();
    // Use the original flow position, rather than the sticky row's viewport
    // rectangle (which stays at the top). After ~120px of extra scrolling,
    // switch from the top row to a right-side shortcut rail.
    const isMobile = window.matchMedia('(max-width:800px)').matches;
    const shouldFloat = !isMobile && originalAnchor.top < -120 && pageArea.bottom > 120 && pageArea.top < innerHeight;
    floating.hidden = !shouldFloat;
    $('page-materials').classList.toggle('has-floating-days', shouldFloat);
};
const scheduleFloatingMaterialDays = function () {
    if (materialFloatingFrame)
        return;
    materialFloatingFrame = requestAnimationFrame(() => {
        materialFloatingFrame = 0;
        updateFloatingMaterialDays();
    });
};
const renderMaterials = function () {
    const today = (parseKey(dayKey()).getUTCDay() + 6) % 7;
    const day = materialDay(), rot = materialRotation(day), dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day];
    const season = rot === 'any' ? 'All talent & weapon materials available' : 'One material series per domain';
    renderFloatingMaterialDays();
    $('material-week').innerHTML = MATERIAL_DAYS.map((name, i) => `<button type="button" class="material-day ${i === day ? 'active' : ''} ${i === today ? 'is-today' : ''}" data-material-day="${i}" aria-pressed="${i === day}"><span>${name}</span><small>${i === today ? 'Today' : i === 6 ? 'All' : 'View'}</small></button>`).join('');
    $('material-heading').textContent = `${dayName}'s farming guide`;
    $('material-server-note').textContent = `${season} · ${state.region === 'TW' ? 'TW / HK / MO' : state.region} server (04:00 reset)`;
    $('material-badge').innerHTML = rot === 'any' ? '✦ Sunday: everything available' : `<b>${dayName}</b> · ${rot === 'mon' ? 'Mon / Thu' : rot === 'tue' ? 'Tue / Fri' : 'Wed / Sat'} rotation`;
    $('material-day-heading').textContent = day === today ? "Available today" : `Available on ${dayName}`;
    $('material-region').value = materialView.region;
    const needs = materialHighlightedBooks();
    const myGoals = state.roadmap.started ? coachGoals().filter(g => g.left > 0 && !g.farmOnly && (materialRotation(day) === 'any' || g.day === 'any' || g.day === 'weekly' || g.day === rot)) : [];
    const flagged = Array.from(needs.entries()).filter(([book]) => rot === 'any' || BOOKS[book]?.rotation === rot);
    const personal = $('material-personal');
    const conflict = state.roadmap.started && coachFirstConflict(state.roadmap.people);
    if (conflict) {
        personal.innerHTML = `<h3>Farming plan needs updating</h3><p>${esc(coachConflictText(conflict))}</p><button type="button" class="btn btn-secondary" data-go="roadmap">Open Journey Book</button>`;
    }
    else if (myGoals.length || flagged.length) {
        const notes = state.roadmap.started ? myGoals.slice(0, 6).map(g => `<span class="material-personal-pill"><b>${esc(g.kind === 'books' ? g.book + ' · ' + g.rar : g.name)}</b>${fmt(g.left)} remaining · ${esc((g.characters || [g.character]).join(', '))}</span>`) : flagged.slice(0, 6).map(([book, x]) => `<span class="material-personal-pill"><b>${esc(book)} books</b>For ${esc([...x.people].join(', '))}</span>`);
        personal.innerHTML = `<h3>✦ Your farming goals</h3><p>Materials relevant to your characters on ${dayName} · ${state.roadmap.started ? 'quantities come from your plan' : 'add a farming plan for exact remaining quantities'}</p><div class="material-personal-list">${notes.join('')}</div>`;
    }
    else {
        personal.innerHTML = '<h3>✦ Your farming goals</h3><p>Build your own schedule in Paimon’s Journey Book to see the talent books you need highlighted here. The full weekly reference is available below.</p><div class="material-personal-list"><button type="button" class="btn btn-secondary" data-go="roadmap">Open Paimon’s Journey Book</button></div>';
    }
    document.querySelectorAll('[data-material-type]').forEach(el => {
        const pressed = el.dataset.materialType === materialView.type;
        el.classList.toggle('active', pressed);
        el.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    });
    const q = materialView.query.trim().toLowerCase();
    const cards = [];
    let count = 0;
    if (materialView.type !== 'other')
        for (const region of MATERIAL_REGION_NAMES) {
            if (materialView.region !== 'all' && materialView.region !== region)
                continue;
            const entries = materialEntries(region, rot, materialView.type, q, needs);
            if (!entries.length)
                continue;
            count += entries.length;
            cards.push(`<article class="material-region"><div class="material-region-head"><strong>${esc(region)}</strong><small>${entries.length} material ${entries.length === 1 ? 'series' : 'series'}</small></div><div class="material-card-list">${entries.map(entry => materialCardHtml(entry)).join('')}</div></article>`);
        }
    if (materialView.type === 'all' || materialView.type === 'other') {
        if (materialView.region === 'all') {
            const others = MATERIAL_ANYTIME.filter(m => !q || (m.name + ' ' + m.info).toLowerCase().includes(q));
            if (others.length) {
                count += others.length;
                // All six categories are accessible on every weekday. The weekly boss card
                // stays in this row; only its reward-claim frequency is different.
                cards.push(`<article class="material-region material-region--anytime"><div class="material-region-head"><strong>Available any day</strong><small>Everyday farming · weekly boss rewards once per boss each week</small></div><div class="material-card-list" aria-label="Materials available any day">${others.map(m => materialCardHtml({ type: 'other', name: m.name, info: m.info, availability: m.availability })).join('')}</div></article>`);
            }
        }
    }
    $('material-results').innerHTML = cards.join('') || '<div class="material-empty">No matching materials. Try clearing your search or choosing another region or material type.</div>';
    $('material-count').textContent = `${count} material ${count === 1 ? 'entry' : 'entries'} displayed`;
    $('material-week-grid').innerHTML = MATERIAL_REGION_NAMES.filter(r => materialView.region === 'all' || materialView.region === r).map(region => {
        const books = ['mon', 'tue', 'wed'].map(rot => Object.entries(BOOKS).find(([n, v]) => v.region === region && v.rotation === rot)?.[0] || '—');
        const weapons = MATERIAL_FORGERY[region].series;
        return `<div class="material-week-card"><h3>${esc(region)}</h3><div class="days">${['Mon / Thu', 'Tue / Fri', 'Wed / Sat'].map((d, i) => `<div><b>${d}</b><span>${esc(books[i])} · ${esc(weapons[i])}</span></div>`).join('')}<div><b>Sunday</b><span>All three talent and weapon series</span></div></div></div>`;
    }).join('');
    // Dashboard preview stays in sync with server day and never displays daily checklists.
    const todayRot = materialRotation(today);
    const todayBooks = Object.keys(BOOKS).filter(book => todayRot === 'any' || BOOKS[book].rotation === todayRot);
    $('stat-materials').textContent = todayBooks.length;
    $('stat-materials-foot').textContent = `Talent series · ${state.region === 'TW' ? 'TW' : state.region} server`;
    $('overview-materials').innerHTML = (todayRot === 'any' ? [] : todayBooks).map(book => `<div class="mini-task"><span class="check-circle" style="border:0;color:var(--mint)">✧</span><strong>${esc(book)}</strong><span style="margin-left:auto;color:#7e9dac;font-size:10px">${esc(BOOKS[book].region)}</span></div>`).join('') || `<div class="mini-task"><span class="check-circle" style="border:0;color:var(--mint)">✧</span><strong>All ${todayBooks.length} talent book series</strong><span style="margin-left:auto;color:#7e9dac;font-size:10px">Sunday</span></div>`;
};
// Bind controls / initialize this section in original startup order.
const initializeMaterialsSection7 = () => {
    window.addEventListener('scroll', scheduleFloatingMaterialDays, { passive: true });
    window.addEventListener('resize', scheduleFloatingMaterialDays, { passive: true });
};
// Bind controls / initialize this section in original startup order.
const initializeMaterialsSection29 = () => {
    document.addEventListener('click', e => {
        const bookButton = e.target.closest('[data-talent-users-book]');
        if (bookButton) {
            showTalentBookUsers(bookButton.dataset.talentUsersBook);
            return;
        }
        const weaponButton = e.target.closest('[data-weapon-users-series]');
        if (weaponButton) {
            showWeaponSeriesUsers(weaponButton.dataset.weaponUsersSeries);
            return;
        }
    });
    $('talent-users-close').addEventListener('click', () => $('talent-users-dialog').close());
    $('weapon-users-close').addEventListener('click', () => $('weapon-users-dialog').close());
    $('weapon-users-dialog').addEventListener('click', e => { if (e.target === $('weapon-users-dialog'))
        e.target.close(); });
    $('talent-users-dialog').addEventListener('click', e => { if (e.target === $('talent-users-dialog'))
        e.target.close(); });
    document.addEventListener('click', e => {
        const day = e.target.closest('[data-material-day]');
        if (day) {
            const fromFloating = !!day.closest('#material-floating-days');
            materialView.day = Number(day.dataset.materialDay);
            renderMaterials();
            if (fromFloating) {
                window.scrollTo({ top: window.scrollY, behavior: 'instant' });
            }
            scheduleFloatingMaterialDays();
            return;
        }
        const kind = e.target.closest('[data-material-type]');
        if (kind) {
            materialView.type = kind.dataset.materialType;
            renderMaterials();
            return;
        }
    });
    $('material-search').addEventListener('input', e => {
        materialView.query = e.target.value;
        renderMaterials();
    });
    for (const r of MATERIAL_REGION_NAMES) {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        $('material-region').append(opt);
    }
    $('material-region').addEventListener('change', e => {
        materialView.region = e.target.value;
        renderMaterials();
    });
};
