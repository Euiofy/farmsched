// Teyvat Companion | features / weapon journey
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const cleanWeaponJourney = function (raw) {
    const w = raw && typeof raw === 'object' ? raw : {};
    const selected = Array.isArray(w.selected) ? w.selected.slice(0, 3).filter(x => x && typeof x.name === 'string' && typeof x.series === 'string').map(x => ({ name: x.name.slice(0, 100), series: x.series.slice(0, 100), rarity: Math.max(0, Math.min(5, Number(x.rarity) || 0)), icon: /^UI_EquipIcon_[A-Za-z0-9_]+$/.test(x.icon || '') ? x.icon : '' })) : [];
    return {
        mode: w.mode === 'weapons' ? 'weapons' : 'characters', selected, weeks: Number(w.weeks) === 3 ? 3 : 4, budget: [80, 120, 160, 200].includes(Number(w.budget)) ? Number(w.budget) : 160, startedAt: selected.length ? Math.max(0, Math.min(Date.now(), Number(w.startedAt) || 0)) : 0, activity: w.activity && typeof w.activity === 'object' && !Array.isArray(w.activity) ? w.activity : {}
    };
};
const weaponPlanMeta = function (w) {
    for (const [region, r] of Object.entries(MATERIAL_FORGERY)) {
        const i = r.series.indexOf(w.series);
        if (i >= 0)
            return { region, domain: r.domain, rotation: ['mon', 'tue', 'wed'][i], index: i };
    }
    return null;
};
const weaponPlanArt = function (w, extra = '') {
    return `<span class="weapon-plan-art ${extra}" data-material-rarity="${[1, 2, 3, 4, 5].includes(Number(w.rarity)) ? Number(w.rarity) : ''}" aria-hidden="true"><span class="weapon-art-fallback">⚔</span><img alt="" loading="lazy" data-plan-weapon-name="${esc(w.name)}" data-plan-weapon-icon="${esc(w.icon || '')}" data-plan-weapon-stage="0" src="${esc(weaponUsersImageUrl(w, 0))}"></span>`;
};
const renderWeaponPicker = function () {
    const rows = [...new Map([...weaponPlanRows, ...state.weaponJourney.selected, ...weaponDraft].map(w => [w.name, w])).values()].filter(w => weaponPlanMeta(w)).sort((a, b) => a.name.localeCompare(b.name));
    const q = $('weapon-pick-search').value.trim().toLowerCase();
    const visible = rows.filter(w => (!weaponPlanRarity || w.rarity === weaponPlanRarity) && (!q || w.name.toLowerCase().includes(q)));
    $('weapon-pick-selected').innerHTML = `<span class="picker-count">${weaponDraft.length} / 3 selected</span>` + weaponDraft.map((w, i) => `<button type="button" class="picker-chip" data-weapon-plan-remove="${i}">${weaponPlanArt(w)}${esc(w.name)}<span>×</span></button>`).join('');
    $('weapon-pick-filters').innerHTML = [0, 5, 4, 3, 2, 1].map(r => `<button type="button" class="picker-element ${weaponPlanRarity === r ? 'is-active' : ''}" data-weapon-plan-rarity="${r}" aria-pressed="${weaponPlanRarity === r}">${r ? r + '★' : 'All'}</button>`).join('');
    const selectedNames = new Set(weaponDraft.map(w => w.name)), rotations = new Set(weaponDraft.map(w => weaponPlanMeta(w)?.rotation));
    const grid = $('weapon-pick-grid'), scroll = grid.scrollTop;
    grid.innerHTML = visible.length ? visible.map(w => {
        const on = selectedNames.has(w.name), blocked = !on && (weaponDraft.length >= 3 || rotations.has(weaponPlanMeta(w).rotation));
        return `<button type="button" class="picker-face ${on ? 'is-selected' : ''} ${blocked ? 'is-farm-blocked' : ''}" data-weapon-plan-pick="${esc(w.name)}" aria-pressed="${on}" ${blocked ? 'disabled' : ''} title="${esc(rotateLabel(weaponPlanMeta(w).rotation) + ' / Sun')}">${weaponPlanArt(w)}<span class="picker-face-name">${esc(w.name)}</span>${on ? '<span class="picker-tick">✓</span>' : ''}</button>`;
    }).join('') : '<div class="picker-empty">No matching weapons.</div>';
    grid.scrollTop = scroll;
    $('weapon-pick-results').textContent = weaponCatalogStatus === 'loading' ? 'Loading full weapon catalog…' : weaponCatalogStatus === 'failed' ? `${visible.length} weapons · limited offline catalog` : `${visible.length} weapons · different domain days only`;
    $('weapon-pick-retry').hidden = weaponCatalogStatus !== 'failed';
    $('weapon-start').disabled = !weaponDraft.length;
    refreshPlanEditControls();
};
const refreshWeaponPlanCatalog = async function () {
    if (weaponCatalogStatus === 'loading' || weaponCatalogStatus === 'ready')
        return;
    weaponCatalogStatus = 'loading';
    renderWeaponPicker();
    try {
        const data = await loadWeaponUsersCatalog();
        const merged = new Map(WEAPON_STARTERS.map(w => [w.name, w]));
        for (const [series, list] of Object.entries(data))
            for (const row of list) {
                const w = { ...row, series };
                if (weaponPlanMeta(w))
                    merged.set(w.name, w);
            }
        weaponPlanRows = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
        weaponCatalogStatus = 'ready';
    }
    catch {
        weaponCatalogStatus = 'failed';
    }
    renderWeaponPicker();
};
const weaponDayAvailable = function (w, date) {
    const r = weaponPlanMeta(w);
    if (!r)
        return false;
    const d = parseKey(date).getUTCDay();
    return d === 0 || [1 + r.index, 4 + r.index].includes(d);
};
const weaponPlanActivity = function () {
    const w = state.weaponJourney;
    if (!w.activity[state.region] || typeof w.activity[state.region] !== 'object')
        w.activity[state.region] = {};
    return w.activity[state.region];
};
const weaponPlanStart = function () { return dayKey(state.weaponJourney.startedAt); };
const weaponPlanChoice = function (date) {
    const w = state.weaponJourney;
    if (!w.startedAt)
        return null;
    const offset = Math.round((parseKey(date) - parseKey(weaponPlanStart())) / DAY);
    if (offset < 0 || offset >= w.weeks * 7)
        return null;
    const rows = w.selected.filter(x => weaponDayAvailable(x, date));
    return rows.length ? rows[Math.floor(offset / 7) % rows.length] : null;
};
const weaponPlanDetail = function (w) {
    const meta = weaponPlanMeta(w);
    if (!meta)
        return '';
    const tiers = WEAPON_RARITIES[w.series] || [w.series];
    return `<div class="coach-modal-person-details">${weaponPlanArt(w, 'weapon-plan-portrait')}<div class="coach-modal-person-text"><span class="coach-modal-priority">✦ Recommended for this date</span><h3>${esc(w.name)}</h3><p>${w.rarity ? esc(w.rarity + '★ · ') : ''}Weapon ascension</p></div></div><div class="coach-modal-farm"><h4 class="coach-modal-farm-title">${esc(w.series)}</h4><p class="coach-modal-farm-location">${esc(meta.domain)} · ${esc(meta.region)} · ${esc(rotateLabel(meta.rotation))} / Sunday</p><div class="coach-modal-books weapon-plan-materials">${tiers.map((name, i) => `<div class="coach-modal-book"><span class="coach-modal-book-icon" data-material-rarity="${i + 2}">${materialItemImgTag(name, materialExactItemId(name), true)}</span><strong>${esc(name)}</strong></div>`).join('')}</div></div>`;
};
const renderWeaponCalendar = function () {
    const w = state.weaponJourney, today = dayKey(), start = weaponPlanStart(), end = advanceKey(start, w.weeks * 7 - 1), monday = advanceKey(today, -((parseKey(today).getUTCDay() + 6) % 7));
    const mobile = matchMedia('(max-width:800px)').matches, len = mobile ? 14 : 28, last = advanceKey(monday, len - 1), fmtMonth = d => parseKey(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    $('coach-calendar-month').textContent = fmtMonth(monday) === fmtMonth(last) ? parseKey(monday).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : fmtMonth(monday) + ' – ' + fmtMonth(last);
    $('coach-week-range').textContent = w.weeks + '-week plan';
    const key = new Map(), activity = weaponPlanActivity();
    const cards = Array.from({ length: len }, (_, i) => {
        const d = advanceKey(monday, i), num = parseKey(d).getUTCDate(), blank = d < today || d < start || d > end, choice = blank ? null : weaponPlanChoice(d), mark = activity[d], portrait = mobile && choice && !mark;
        if (blank)
            return `<div class="coach-calendar-day is-unassigned" data-calendar-date="${d}"><span><b>${num}</b></span><strong>---</strong></div>`;
        if (portrait)
            key.set(choice.name, choice);
        return `<button type="button" class="coach-calendar-day ${d === today ? 'is-today' : ''} ${mark === 'done' ? 'is-complete' : ''} ${portrait ? 'has-calendar-portrait' : ''}" data-calendar-date="${d}" data-weapon-plan-date="${d}" aria-label="${esc(d + ' ' + (mark || choice?.name || 'Free day'))}"><span><b>${num}</b></span>${portrait ? `<span class="calendar-portrait">${weaponPlanArt(choice)}</span>` : ''}<strong>${mark === 'done' ? '✓ Done' : mark === 'skip' ? 'Free' : choice ? esc(choice.name) : '---'}</strong><small>${choice ? esc(choice.series) : ''}</small></button>`;
    });
    $('coach-calendar').innerHTML = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span class="coach-calendar-weekday">${d}</span>`).join('') + Array.from({ length: len / 7 }, (_, i) => `<div class="coach-calendar-week">${cards.slice(i * 7, i * 7 + 7).join('')}</div>`).join('');
    $('calendar-character-key').innerHTML = [...key.values()].map(x => `<div class="calendar-key-item">${weaponPlanArt(x)}<span class="calendar-key-copy"><strong>${esc(x.name)}</strong><small>${esc(x.series)}</small></span></div>`).join('');
};
const renderWeaponJourney = function () {
    const w = state.weaponJourney, on = w.mode === 'weapons';
    document.querySelectorAll('[data-journey-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.journeyMode === w.mode)));
    $('coach-setup-form').hidden = on;
    $('weapon-setup-form').hidden = !on;
    document.querySelector('.coach-setup-intro h2').textContent = on ? "Pick 1–3 weapons. We'll handle the schedule." : "Pick 2–3 characters. We'll handle the schedule.";
    $('coach-priority-title').textContent = on ? 'Which weapon should we farm today?' : 'Who should we farm today?';
    if (!on) {
        if (!state.roadmap.started)
            $('coach-week-pill').textContent = 'Week 1 of ' + state.roadmap.weeks;
        return;
    }
    $('coach-not-setup').hidden = !!w.startedAt;
    $('coach-active').hidden = !w.startedAt;
    if (!w.startedAt) {
        $('coach-week-pill').textContent = 'Week 1 of ' + w.weeks;
        renderWeaponPicker();
        refreshWeaponPlanCatalog();
        return;
    }
    $('coach-active').classList.add('tracking-off');
    $('coach-progress-block').hidden = true;
    $('coach-done-today').innerHTML = '';
    $('coach-selected-people').innerHTML = '';
    const today = dayKey(), offset = Math.max(0, Math.round((parseKey(today) - parseKey(weaponPlanStart())) / DAY)), mark = weaponPlanActivity()[today], choice = weaponPlanChoice(today);
    $('coach-week-pill').textContent = `Week ${Math.min(w.weeks, Math.floor(offset / 7) + 1)} of ${w.weeks}`;
    $('coach-today').innerHTML = mark ? `<div class="coach-rest"><strong>${mark === 'done' ? '✓ Farming finished for today' : 'Free day'}</strong><button class="btn btn-outline" type="button" data-weapon-plan-action="undo">↶ Undo</button></div>` : choice ? `<div class="coach-today-rich">${weaponPlanDetail(choice)}<div class="coach-mini-tools"><button class="btn btn-outline" type="button" data-weapon-plan-action="done">Done for today</button><button class="btn btn-secondary" type="button" data-weapon-plan-action="skip">Free day / co-op</button></div></div>` : '<div class="coach-rest"><strong>No scheduled weapon today</strong><p>Enjoy a free day or collect common ascension materials.</p></div>';
    renderWeaponCalendar();
};
const showWeaponPlanDate = function (date) {
    const rows = state.weaponJourney.selected.filter(w => weaponDayAvailable(w, date));
    $('coach-day-dialog-title').textContent = parseKey(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
    $('coach-day-dialog-subtitle').textContent = 'Weapon ascension materials';
    const first = weaponPlanChoice(date);
    $('coach-day-dialog-content').innerHTML = rows.length ? [...rows].sort((a, b) => Number(b.name === first?.name) - Number(a.name === first?.name)).map(w => `<section class="coach-modal-group">${weaponPlanDetail(w)}</section>`).join('') : '<div class="coach-modal-empty">No weapon domains scheduled.</div>';
    if (!$('coach-day-dialog').open)
        $('coach-day-dialog').showModal();
};
// Bind controls / initialize this section in original startup order.
const initializeWeaponJourneySection33 = () => {
    document.addEventListener('error', e => {
        const img = e.target;
        if (!(img instanceof HTMLImageElement) || !img.hasAttribute('data-plan-weapon-name'))
            return;
        const stage = Number(img.dataset.planWeaponStage) + 1;
        img.dataset.planWeaponStage = String(stage);
        const url = weaponUsersImageUrl({ name: img.dataset.planWeaponName, icon: img.dataset.planWeaponIcon }, stage);
        if (url)
            img.src = url;
        else
            img.hidden = true;
    }, true);
    $('weapon-pick-search').addEventListener('input', () => {
        $('weapon-pick-grid').scrollTop = 0;
        renderWeaponPicker();
    });
    $('weapon-pick-retry').addEventListener('click', refreshWeaponPlanCatalog);
    $('weapon-setup-form').addEventListener('submit', e => {
        e.preventDefault();
        if (!weaponDraft.length)
            return;
        const w = state.weaponJourney;
        w.selected = weaponDraft.slice();
        w.weeks = Number($('weapon-setup-weeks').value) === 3 ? 3 : 4;
        w.budget = Number($('weapon-setup-budget').value);
        w.startedAt = Date.now();
        w.activity = {};
        save();
        renderRoadmap();
        toast('Your weapon farming plan is ready.');
    });
    $('weapon-settings').addEventListener('submit', e => {
        e.preventDefault();
        const w = state.weaponJourney;
        w.weeks = Number($('weapon-edit-weeks').value) === 3 ? 3 : 4;
        w.budget = Number($('weapon-edit-budget').value);
        $('weapon-setup-weeks').value = String(w.weeks);
        $('weapon-setup-budget').value = String(w.budget);
        save();
        renderRoadmap();
        toast('Weapon plan updated.');
    });
    $('weapon-restart').addEventListener('click', () => {
        if (!confirm('Start a different weapon plan? Your character plan and inventory will stay unchanged.'))
            return;
        const w = state.weaponJourney;
        weaponDraft = w.selected.slice();
        w.startedAt = 0;
        w.activity = {};
        w.selected = [];
        w.mode = 'weapons';
        save();
        page('roadmap');
    });
    document.addEventListener('click', e => {
        const t = e.target.closest('[data-journey-mode],[data-weapon-plan-pick],[data-weapon-plan-remove],[data-weapon-plan-rarity],[data-weapon-plan-action],[data-weapon-plan-date]');
        if (!t)
            return;
        if (t.hasAttribute('data-journey-mode')) {
            state.weaponJourney.mode = t.dataset.journeyMode;
            save();
            renderRoadmap();
            return;
        }
        if (t.hasAttribute('data-weapon-plan-rarity')) {
            weaponPlanRarity = Number(t.dataset.weaponPlanRarity);
            $('weapon-pick-grid').scrollTop = 0;
            renderWeaponPicker();
            return;
        }
        if (t.hasAttribute('data-weapon-plan-remove')) {
            weaponDraft.splice(Number(t.dataset.weaponPlanRemove), 1);
            renderWeaponPicker();
            return;
        }
        if (t.hasAttribute('data-weapon-plan-pick')) {
            const w = weaponDraft.find(x => x.name === t.dataset.weaponPlanPick) || weaponPlanRows.find(x => x.name === t.dataset.weaponPlanPick) || state.weaponJourney.selected.find(x => x.name === t.dataset.weaponPlanPick);
            if (!w)
                return;
            const i = weaponDraft.findIndex(x => x.name === w.name);
            if (i >= 0)
                weaponDraft.splice(i, 1);
            else if (weaponDraft.length < 3 && !weaponDraft.some(x => weaponPlanMeta(x)?.rotation === weaponPlanMeta(w)?.rotation))
                weaponDraft.push(w);
            renderWeaponPicker();
            return;
        }
        if (t.hasAttribute('data-weapon-plan-action')) {
            const a = weaponPlanActivity(), k = dayKey();
            if (t.dataset.weaponPlanAction === 'undo')
                delete a[k];
            else
                a[k] = t.dataset.weaponPlanAction;
            save();
            renderRoadmap();
            return;
        }
        if (t.hasAttribute('data-weapon-plan-date'))
            showWeaponPlanDate(t.dataset.weaponPlanDate);
    });
};
