// Teyvat Companion | features / planner
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const rosterPageSize = function () { return matchMedia('(max-width:1050px)').matches ? 1 : 3; };
const updatePlannerPagination = function (prefix, index, count, size) {
    const pages = Math.max(1, Math.ceil(count / size));
    const pageIndex = clamp(index, 0, pages - 1);
    const nav = $(prefix + '-pagination'), select = $(prefix + '-page');
    nav.hidden = pages <= 1;
    if (select.options.length !== pages)
        select.innerHTML = Array.from({ length: pages }, (_, i) => `<option value="${i}">${i + 1} / ${pages}</option>`).join('');
    select.value = String(pageIndex);
    $(prefix + '-prev').disabled = pageIndex === 0;
    $(prefix + '-next').disabled = pageIndex >= pages - 1;
    return pageIndex;
};
// Bind controls / initialize this section in original startup order.
const initializePlannerSection2 = () => {
    try {
        rosterPortraitView = localStorage.getItem(ROSTER_VIEW_KEY) === '1';
    }
    catch { }
};
const talentNeed = function (ch) {
    const preferred = preferredTalent(ch);
    const gaps = ['n', 's', 'b'].map(k => ({ k, gap: Math.max(0, ch.target[k] - ch.talents[k]) }));
    const preferredGap = gaps.find(x => x.k === preferred);
    if (preferredGap?.gap > 0)
        return preferredGap;
    return gaps.filter(x => x.gap > 0).sort((a, b) => b.gap - a.gap)[0] || null;
};
const candidatesFor = function (key) {
    const rotation = dayRotation(key), done = state.planner.done[key] || [], team = activeTeam();
    return state.planner.characters.map(ch => {
        const need = talentNeed(ch), book = isTraveler(ch.name) ? (need ? talentBookFor(ch, need.k, ch.talents[need.k]) : getBook(ch)) : getBook(ch), metadata = BOOKS[book], ready = !!metadata && (rotation === 'any' || metadata.rotation === rotation), finished = done.includes(ch.name), teamFocus = !!team?.members.includes(ch.name);
        const priority = { high: 30, medium: 17, low: 3 }[ch.priority] || 17, score = (ready ? 90 : 0) + (teamFocus ? 34 : 0) + priority + (need?.gap || 0) * 3 - (finished ? 150 : 0);
        return { ch, need, book, metadata, ready, finished, teamFocus, score };
    }).sort((a, b) => b.score - a.score || a.ch.name.localeCompare(b.ch.name));
};
const effectiveDay = function (key) { return key || dayKey(); };
const bestFor = function (key) {
    const options = candidatesFor(key).filter(o => o.need && !o.finished);
    return options.find(o => o.ready) || options[0] || null;
};
const renderPlanner = function () {
    if (!$('planner-roster'))
        return;
    const current = dayKey();
    if (!plannerDate) {
        plannerDate = current;
        priorGameDay = current;
    }
    $('roster-count').textContent = state.planner.characters.length + ' characters';
    $('roster-quick-remove').disabled = !state.planner.characters.length;
    renderRoster();
    renderTeams();
    renderSuggestions();
    renderQuickAdd();
    if ($('planner-pick-grid'))
        drawPicker('planner');
    const today = bestFor(current);
    $('home-build-name').textContent = today ? today.ch.name + ' — ' + (today.ready ? 'farm ' + today.book : 'prep materials') : (state.planner.characters.length ? 'Your current targets are complete' : 'Add your characters to create a plan');
    $('home-build-note').textContent = today ? (today.ready ? `${today.metadata.domain} · ${talentLabel[today.need.k]}` : 'No matching talent book open in the regular rotation.') : 'The smart planner picks an available talent domain for your roster.';
};
const renderRoster = function () {
    const roster = $('planner-roster'), all = state.planner.characters, size = rosterPageSize();
    const previousScroll = roster.scrollTop;
    roster.classList.toggle('is-portrait-view', rosterPortraitView);
    roster.closest('.planner-roster-panel').classList.toggle('portrait-scroll-mode', rosterPortraitView);
    $('roster-portrait-toggle').checked = rosterPortraitView;
    rosterPageIndex = updatePlannerPagination('roster', rosterPageIndex, all.length, size);
    const first = rosterPortraitView ? 0 : rosterPageIndex * size;
    const search = $('roster-portrait-search');
    $('roster-portrait-search-wrap').hidden = !rosterPortraitView;
    const query = rosterPortraitView ? search.value.trim().toLowerCase() : '';
    const list = rosterPortraitView ? all.filter(ch => !query || ch.name.toLowerCase().includes(query)) : all.slice(first, first + size);
    const pageKey = rosterPortraitView ? 'portrait-scroll:' + query : String(rosterPageIndex) + ':' + size + ':details';
    const sameView = roster.dataset.pageKey === pageKey;
    roster.dataset.pageKey = pageKey;
    $('roster-pagination').hidden = rosterPortraitView || all.length <= size;
    $('roster-page-label').hidden = rosterPortraitView;
    $('roster-page-label').textContent = all.length ? `Showing ${first + 1}–${first + list.length} of ${all.length} characters` : '';
    if (!list.length) {
        roster.innerHTML = query && all.length ? '<div class="planner-empty"><h3>No matching characters</h3><p>Try a different name or clear the search.</p></div>' : '<div class="planner-empty"><h3>Your roster is empty</h3><p>Start by adding a character. Set their current talent levels and targets so your daily missions are actually useful.</p></div>';
        roster.scrollTop = 0;
        return;
    }
    if (rosterPortraitView) {
        roster.innerHTML = list.map(ch => `<button type="button" class="picker-face roster-portrait-tile" data-roster-open="${esc(ch.name)}" aria-haspopup="dialog" title="Edit ${esc(ch.name)}'s talent settings" aria-label="Edit ${esc(ch.name)}'s talent settings">${pickerPortraitHtml(ch.name)}<span class="picker-face-name">${esc(ch.name)}</span></button>`).join('');
    }
    else {
        roster.innerHTML = list.map(rosterCardHtml).join('');
    }
    roster.scrollTop = sameView ? previousScroll : 0;
};
const rosterCardHtml = function (ch) {
    const book = getBook(ch), info = BOOKS[book], need = talentNeed(ch);
    return `<article class="roster-card" data-roster-character="${esc(ch.name)}"><div class="roster-heading"><div class="roster-heading-id"><span class="roster-face">${pickerPortraitHtml(ch.name)}</span><div><div class="roster-title">${esc(ch.name)}</div><div class="roster-meta">${isTraveler(ch.name) ? 'Traveler · rotates through three talent book series' : info ? esc(info.region) + ' · ' + esc(book) + ' · ' + esc(dayLabel(info.rotation)) : 'Choose a talent book or verify in-game'}</div></div></div><button title="Remove from roster" aria-label="Remove ${esc(ch.name)}" class="trash" data-planner-remove="${esc(ch.name)}">${ico('trash')}</button></div><div class="roster-levels">${[['n', 'Normal'], ['s', 'Skill'], ['b', 'Burst']].map(([k, label]) => `<label>${label}<span style="display:grid;grid-template-columns:1fr auto 1fr;gap:3px;align-items:center"><input type="number" inputmode="numeric" min="1" max="10" value="${ch.talents[k]}" data-plan-talent="${esc(ch.name)}" data-talent-kind="${k}" aria-label="${esc(ch.name)} ${label} current level"><span style="margin-top:5px">→</span><input type="number" inputmode="numeric" min="1" max="10" value="${ch.target[k]}" data-plan-target-single="${esc(ch.name)}" data-talent-kind="${k}" aria-label="${esc(ch.name)} ${label} target level"></span></label>`).join('')}</div><div class="roster-line"><label>Priority<select data-plan-priority="${esc(ch.name)}"><option value="high" ${ch.priority === 'high' ? 'selected' : ''}>High</option><option value="medium" ${ch.priority === 'medium' ? 'selected' : ''}>Medium</option><option value="low" ${ch.priority === 'low' ? 'selected' : ''}>Low</option></select></label><label>Focus<select data-plan-focus="${esc(ch.name)}"><option value="auto" ${ch.focus === 'auto' ? 'selected' : ''}>Suggested (${esc(FOCUS_HINTS[ch.name] || 'Skill')})</option><option value="n" ${ch.focus === 'n' ? 'selected' : ''}>Normal</option><option value="s" ${ch.focus === 's' ? 'selected' : ''}>Skill</option><option value="b" ${ch.focus === 'b' ? 'selected' : ''}>Burst</option></select></label></div><div class="roster-line"><label>${isTraveler(ch.name) || CHARACTER_BOOK[ch.name] ? 'Talent books (automatic)' : 'Book override'}<select ${isTraveler(ch.name) || CHARACTER_BOOK[ch.name] ? 'disabled title="Talent books follow the character’s in-game requirements"' : ''} data-plan-book="${esc(ch.name)}"><option value="">${isTraveler(ch.name) ? 'Auto: three series' : CHARACTER_BOOK[ch.name] ? 'Use known book' : 'Select a book'}</option>${Object.keys(BOOKS).map(b => `<option value="${esc(b)}" ${!isTraveler(ch.name) && getBook(ch) === b ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select></label><label>Target level (all talents)<select data-plan-target="${esc(ch.name)}"><option value="6" ${ch.target.n === 6 && ch.target.s === 6 && ch.target.b === 6 ? 'selected' : ''}>6 / 6 / 6</option><option value="8" ${ch.target.n === 8 && ch.target.s === 8 && ch.target.b === 8 ? 'selected' : ''}>8 / 8 / 8</option><option value="9" ${ch.target.n === 9 && ch.target.s === 9 && ch.target.b === 9 ? 'selected' : ''}>9 / 9 / 9</option><option value="10" ${ch.target.n === 10 && ch.target.s === 10 && ch.target.b === 10 ? 'selected' : ''}>10 / 10 / 10</option><option value="custom" ${![6, 8, 9, 10].some(t => ch.target.n === t && ch.target.s === t && ch.target.b === t) ? 'selected' : ''}>Custom — edit above</option></select></label></div><div class="roster-sub">${need ? `Recommended next: <strong>${talentLabel[need.k]} ${ch.talents[need.k]} → ${ch.target[need.k]}</strong>` : '<strong>Target talent levels reached</strong>'}. Starter focus is a suggestion; confirm your build and role.</div></article>`;
};
const addPlannerCharacter = function (input, priority = 'medium', focus = 'auto', silent = false) {
    const name = resolveName(input);
    if (!name || name.length > 75)
        return false;
    if (state.planner.characters.some(c => c.name.toLowerCase() === name.toLowerCase()))
        return false;
    if (state.planner.characters.length >= 130) {
        toast('Your character roster is full.');
        return false;
    }
    const suggested = (focus === 'auto' ? ({ 'Normal': 'n', 'Skill': 's', 'Burst': 'b' }[FOCUS_HINTS[name]] || 's') : focus);
    const target = suggested === 'n' ? { n: 8, s: 6, b: 6 } : suggested === 'b' ? { n: 1, s: 6, b: 8 } : { n: 1, s: 8, b: 6 };
    state.planner.characters.push({ name, priority, focus, talents: { n: 1, s: 1, b: 1 }, target, book: '' });
    rosterPageIndex = Math.floor((state.planner.characters.length - 1) / rosterPageSize());
    save();
    if (!silent) {
        renderPlanner();
        toast(name + ' added to the build roster.');
    }
    return true;
};
// Bind controls / initialize this section in original startup order.
const initializePlannerSection15 = () => {
    for (const [prefix, redraw, get, set] of [
        ['roster', renderRoster, () => rosterPageIndex, v => { rosterPageIndex = v; }]
    ]) {
        $(prefix + '-prev').addEventListener('click', () => {
            set(get() - 1);
            redraw();
        });
        $(prefix + '-next').addEventListener('click', () => {
            set(get() + 1);
            redraw();
        });
        $(prefix + '-page').addEventListener('change', e => {
            set(Number(e.target.value));
            redraw();
        });
    }
};
const resizePlannerPages = function () {
    const r = rosterPageSize();
    if (r !== previousRosterPageSize) {
        rosterPageIndex = Math.floor(rosterPageIndex * previousRosterPageSize / r);
        previousRosterPageSize = r;
        renderRoster();
    }
};
const setRosterPortraitView = function (enabled, anchorIndex = rosterPageIndex * rosterPageSize()) {
    rosterPortraitView = Boolean(enabled);
    try {
        localStorage.setItem(ROSTER_VIEW_KEY, rosterPortraitView ? '1' : '0');
    }
    catch { }
    previousRosterPageSize = rosterPageSize();
    rosterPageIndex = Math.floor(Math.max(0, anchorIndex) / previousRosterPageSize);
    renderRoster();
};
// Bind controls / initialize this section in original startup order.
const initializePlannerSection16 = () => {
    matchMedia('(max-width:1050px)').addEventListener('change', resizePlannerPages);
    $('roster-portrait-toggle').addEventListener('change', e => setRosterPortraitView(e.target.checked));
    $('roster-portrait-search').addEventListener('input', () => { if (rosterPortraitView)
        renderRoster(); });
};
const setRosterCollapsed = function (collapsed) {
    const panel = $('build-roster-panel'), roster = $('planner-roster'), button = $('roster-collapse-toggle');
    if (collapsed && !panel.hidden)
        collapsedRosterScroll = roster.scrollTop;
    rosterCollapsed = Boolean(collapsed);
    panel.hidden = rosterCollapsed;
    panel.closest('.planner-workspace').classList.toggle('is-roster-collapsed', rosterCollapsed);
    button.closest('.roster-section-heading').classList.toggle('is-roster-collapsed', rosterCollapsed);
    button.setAttribute('aria-expanded', String(!rosterCollapsed));
    $('roster-collapse-label').textContent = rosterCollapsed ? 'Show roster' : 'Hide roster';
    if (!rosterCollapsed)
        roster.scrollTop = collapsedRosterScroll;
    try {
        localStorage.setItem(ROSTER_COLLAPSE_KEY, rosterCollapsed ? '1' : '0');
    }
    catch { }
};
// Bind controls / initialize this section in original startup order.
const initializePlannerSection17 = () => {
    try {
        rosterCollapsed = localStorage.getItem(ROSTER_COLLAPSE_KEY) === '1';
    }
    catch { }
    $('roster-collapse-toggle').addEventListener('click', () => setRosterCollapsed(!rosterCollapsed));
    setRosterCollapsed(rosterCollapsed);
};
const rosterRemoveMatches = function () {
    const q = $('roster-remove-search').value.trim().toLowerCase();
    return state.planner.characters.filter(c => c.name.toLowerCase().includes(q));
};
const updateRosterRemoveButtons = function () {
    const n = rosterRemoveSelected.size, matches = rosterRemoveMatches();
    $('roster-remove-count').textContent = n + ' selected';
    $('roster-remove-all').textContent = $('roster-remove-search').value.trim() ? 'Select matches' : 'Select all';
    $('roster-remove-all').disabled = !matches.some(c => !rosterRemoveSelected.has(c.name));
    $('roster-remove-clear').disabled = !n;
    $('roster-remove-confirm').disabled = !n;
    $('roster-remove-confirm').textContent = n ? `Remove ${n} selected` : 'Remove selected';
    const plan = state.roadmap.started && state.roadmap.people.some(n => rosterRemoveSelected.has(n));
    $('roster-remove-note').textContent = 'Removes build roster entries and their talent settings. Saved teams and manual material goals are kept.' + (plan ? ' Selected Journey Book characters stay in the plan, but their automatic material goals may change.' : '');
};
const renderRosterRemoveGrid = function () {
    const grid = $('roster-remove-grid'), matches = rosterRemoveMatches();
    grid.innerHTML = matches.length ? matches.map(c => `<button type="button" class="picker-face${rosterRemoveSelected.has(c.name) ? ' is-selected' : ''}" aria-pressed="${rosterRemoveSelected.has(c.name)}" data-roster-remove-choice="${esc(c.name)}" aria-label="Select ${esc(c.name)} for removal">${pickerPortraitHtml(c.name)}<span class="picker-face-name">${esc(c.name)}</span>${rosterRemoveSelected.has(c.name) ? '<span class="picker-tick" aria-hidden="true">✓</span>' : ''}</button>`).join('') : '<div class="picker-empty">No matching characters.</div>';
    updateRosterRemoveButtons();
};
const closeRosterRemove = function () { if (rosterRemoveDialog.open)
    rosterRemoveDialog.close(); };
const removeRosterCharacters = function (names) {
    const selected = new Set(names), before = state.planner.characters.length;
    state.planner.characters = state.planner.characters.filter(c => !selected.has(c.name));
    syncCharacterFarmGoals();
    save();
    renderPlanner();
    renderFarm();
    renderRoadmap();
    renderMaterials();
    refreshRosterStats();
    return before - state.planner.characters.length;
};
const rosterRemoveOutside = function (e) {
    const r = rosterRemoveDialog.getBoundingClientRect();
    return e.target === rosterRemoveDialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
};
// Bind controls / initialize this section in original startup order.
const initializePlannerSection18 = () => {
    $('roster-quick-remove').addEventListener('click', () => {
        if (!state.planner.characters.length)
            return;
        rosterRemoveSelected.clear();
        $('roster-remove-search').value = '';
        renderRosterRemoveGrid();
        rosterRemoveDialog.showModal();
        rosterRemoveDialog.querySelector('.roster-remove-body').scrollTop = 0;
    });
    $('roster-remove-search').addEventListener('input', () => {
        renderRosterRemoveGrid();
        rosterRemoveDialog.querySelector('.roster-remove-body').scrollTop = 0;
    });
    $('roster-remove-grid').addEventListener('click', e => {
        const tile = e.target.closest('[data-roster-remove-choice]');
        if (!tile)
            return;
        const name = tile.dataset.rosterRemoveChoice;
        if (rosterRemoveSelected.has(name))
            rosterRemoveSelected.delete(name);
        else
            rosterRemoveSelected.add(name);
        const checked = rosterRemoveSelected.has(name);
        tile.classList.toggle('is-selected', checked);
        tile.setAttribute('aria-pressed', String(checked));
        tile.querySelector('.picker-tick')?.remove();
        if (checked)
            tile.insertAdjacentHTML('beforeend', '<span class="picker-tick" aria-hidden="true">✓</span>');
        updateRosterRemoveButtons();
    });
    $('roster-remove-all').addEventListener('click', () => {
        for (const c of rosterRemoveMatches())
            rosterRemoveSelected.add(c.name);
        renderRosterRemoveGrid();
    });
    $('roster-remove-clear').addEventListener('click', () => {
        rosterRemoveSelected.clear();
        renderRosterRemoveGrid();
    });
    $('roster-remove-close').addEventListener('click', closeRosterRemove);
    $('roster-remove-cancel').addEventListener('click', closeRosterRemove);
    rosterRemoveDialog.addEventListener('pointerdown', e => { rosterRemoveBackdropDown = rosterRemoveOutside(e); });
    rosterRemoveDialog.addEventListener('click', e => {
        if (rosterRemoveBackdropDown && rosterRemoveOutside(e))
            closeRosterRemove();
        rosterRemoveBackdropDown = false;
    });
    rosterRemoveDialog.addEventListener('close', () => {
        rosterRemoveSelected.clear();
        rosterRemoveBackdropDown = false;
    });
    $('roster-remove-confirm').addEventListener('click', () => {
        const names = [...rosterRemoveSelected];
        if (!names.length)
            return;
        if (!confirm(`Remove ${names.length} character${names.length === 1 ? '' : 's'} and their talent settings from the build roster?`))
            return;
        closeRosterRemove();
        const count = removeRosterCharacters(names);
        toast(`${count} character${count === 1 ? '' : 's'} removed from your build roster.`);
    });
};
const openRosterStats = function (name) {
    const ch = state.planner.characters.find(c => c.name === name);
    if (!ch || !rosterPortraitView)
        return;
    rosterStatsName = name;
    rosterStatsScroll = $('planner-roster').scrollTop;
    $('roster-stats-body').innerHTML = rosterCardHtml(ch);
    $('roster-stats-body').scrollTop = 0;
    rosterStatsDialog.showModal();
};
// Keep the fields in place while updating values and derived information. Replacing
// the whole card on change would disrupt keyboard focus and clicks on other inputs.
const refreshRosterStats = function () {
    if (!rosterStatsDialog.open)
        return;
    const ch = state.planner.characters.find(c => c.name === rosterStatsName);
    if (!ch) {
        rosterStatsDialog.close();
        return;
    }
    const template = document.createElement('template');
    template.innerHTML = rosterCardHtml(ch);
    const active = $('roster-stats-body');
    const fields = active.querySelectorAll('input,select');
    const updated = template.content.querySelectorAll('input,select');
    fields.forEach((f, i) => { if (updated[i] && f.value !== updated[i].value)
        f.value = updated[i].value; });
    for (const selector of ['.roster-meta', '.roster-sub']) {
        const el = active.querySelector(selector), fresh = template.content.querySelector(selector);
        if (el && fresh)
            el.innerHTML = fresh.innerHTML;
    }
};
const rosterStatsOutside = function (e) {
    const r = rosterStatsDialog.getBoundingClientRect();
    return e.target === rosterStatsDialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
};
const renderQuickAdd = function () {
    const target = $('planner-quick-add');
    if (!target)
        return;
    const preferred = ['Furina', 'Nahida', 'Raiden Shogun', 'Bennett', 'Xingqiu', 'Kuki Shinobu', 'Neuvillette', 'Xiangling'];
    const added = new Set(state.planner.characters.map(c => resolveName(c.name).toLowerCase()));
    const order = [...new Set([...preferred, ...Object.keys(CHARACTER_BOOK).sort((a, b) => a.localeCompare(b))])];
    const available = order.filter(name => Object.prototype.hasOwnProperty.call(CHARACTER_BOOK, name) && !added.has(name.toLowerCase())).slice(0, 8);
    target.innerHTML = available.length ? available.map(x => `<button class="tiny-btn" style="flex:0 0 auto" type="button" data-plan-quick="${esc(x)}">+ ${esc(x)}</button>`).join('') : '<span class="plan-muted">All available characters are already in your build roster.</span>';
};
// Bind controls / initialize this section in original startup order.
const initializePlannerSection19 = () => {
    $('planner-roster').addEventListener('click', e => {
        const tile = e.target.closest('[data-roster-open]');
        if (tile)
            openRosterStats(tile.dataset.rosterOpen);
    });
    $('roster-stats-close').addEventListener('click', () => rosterStatsDialog.close());
    rosterStatsDialog.addEventListener('pointerdown', e => { rosterStatsBackdropDown = rosterStatsOutside(e); });
    rosterStatsDialog.addEventListener('click', e => {
        if (rosterStatsBackdropDown && rosterStatsOutside(e))
            rosterStatsDialog.close();
        rosterStatsBackdropDown = false;
    });
    rosterStatsDialog.addEventListener('close', () => {
        const name = rosterStatsName;
        rosterStatsName = '';
        rosterStatsBackdropDown = false;
        $('roster-stats-body').replaceChildren();
        if (!rosterPortraitView)
            return;
        const roster = $('planner-roster');
        roster.scrollTop = rosterStatsScroll;
        const tile = [...roster.querySelectorAll('[data-roster-open]')].find(el => el.dataset.rosterOpen === name);
        tile?.focus({ preventScroll: true });
    });
    $('planner-names').innerHTML = Object.keys(CHARACTER_BOOK).sort().map(name => `<option value="${esc(name)}"></option>`).join('');
    $('planner-add-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = $('planner-char').value.trim();
        if (!name)
            return;
        const added = addPlannerCharacter(name, $('planner-priority').value, $('planner-focus').value);
        if (!added) {
            toast('That character may already be in your build roster.');
            return;
        }
        pickerState.planner.selected = [];
        drawPicker('planner');
    });
};
// Bind controls / initialize this section in original startup order.
const initializePlannerSection22 = () => {
    document.addEventListener('click', e => {
        const quick = e.target.closest('[data-plan-quick]');
        if (quick) {
            addPlannerCharacter(quick.dataset.planQuick);
            return;
        }
        const del = e.target.closest('[data-planner-remove]');
        if (del) {
            if (!confirm('Remove ' + del.dataset.plannerRemove + ' from your build roster?'))
                return;
            removeRosterCharacters([del.dataset.plannerRemove]);
            return;
        }
        const clearDraft = e.target.closest('[data-clear-draft-slot]');
        if (clearDraft) {
            const i = Number(clearDraft.dataset.clearDraftSlot);
            if (i >= 0 && i < 4) {
                $('planner-slot-' + i).value = '';
                clearTeamMoveSelection();
                refreshTeamSlots();
                document.querySelector(`[data-team-slot="${i}"]`)?.focus({ preventScroll: true });
            }
            return;
        }
        const clearSaved = e.target.closest('[data-clear-saved-slot]');
        if (clearSaved) {
            const i = Number(clearSaved.dataset.clearSavedSlot);
            if (savedTeamDraft && editingTeamId && i >= 0 && i < 4) {
                savedTeamDraft.members[i] = '';
                clearTeamMoveSelection();
                renderTeams();
                $('planner-teams').querySelector(`[data-member-slot="${i}"]`)?.focus({ preventScroll: true });
            }
            return;
        }
        const saveInline = e.target.closest('[data-team-save-inline]');
        if (saveInline) {
            saveSavedTeamEdit();
            return;
        }
        const cancelInline = e.target.closest('[data-team-cancel-inline]');
        if (cancelInline) {
            cancelSavedTeamEdit();
            return;
        }
        const edit = e.target.closest('[data-team-edit]');
        if (edit) {
            beginTeamEdit(edit.dataset.teamEdit);
            return;
        }
        const member = e.target.closest('[data-team-member-edit]');
        if (member) {
            beginTeamEdit(member.dataset.teamMemberEdit, Number(member.dataset.memberSlot));
            return;
        }
        const activate = e.target.closest('[data-team-active]');
        if (activate) {
            state.planner.activeTeamId = activate.dataset.teamActive;
            save();
            renderPlanner();
            toast('Active team updated.');
            return;
        }
        const remove = e.target.closest('[data-team-remove]');
        if (remove) {
            if (editingTeamId === remove.dataset.teamRemove) {
                editingTeamId = '';
                savedTeamDraft = null;
            }
            clearTeamMoveSelection();
            state.planner.teams = state.planner.teams.filter(x => x.id !== remove.dataset.teamRemove);
            if (state.planner.activeTeamId === remove.dataset.teamRemove)
                state.planner.activeTeamId = state.planner.teams[0]?.id || '';
            save();
            renderPlanner();
            return;
        }
        const template = e.target.closest('[data-team-template]');
        if (template) {
            const t = TEAM_TEMPLATES[Number(template.dataset.teamTemplate)];
            if (!t)
                return;
            if (otherTeamsDialog.open) {
                otherTeamsDialog.dataset.filled = 'true';
                otherTeamsDialog.close();
            }
            resetTeamEditor();
            $('planner-team-name').value = t.name;
            for (let i = 0; i < 4; i++)
                $('planner-slot-' + i).value = t.members[i];
            refreshTeamSlots();
            $('planner-team-name').focus();
            toast('Team form filled. Review the characters, then save it.');
            return;
        }
    });
    document.addEventListener('change', e => {
        const input = e.target;
        let name = '', prop = '';
        for (const attr of ['plan-priority', 'plan-focus', 'plan-book', 'plan-target', 'plan-talent', 'plan-target-single'])
            if (input.hasAttribute('data-' + attr)) {
                name = input.getAttribute('data-' + attr);
                prop = attr;
                break;
            }
        if (!prop)
            return;
        const char = state.planner.characters.find(c => c.name === name);
        if (!char)
            return;
        if (prop === 'plan-priority')
            char.priority = ['high', 'medium', 'low'].includes(input.value) ? input.value : 'medium';
        if (prop === 'plan-focus')
            char.focus = ['auto', 'n', 's', 'b'].includes(input.value) ? input.value : 'auto';
        if (prop === 'plan-book' && !isTraveler(char.name) && !CHARACTER_BOOK[char.name]) {
            const previous = char.book;
            char.book = Object.prototype.hasOwnProperty.call(BOOKS, input.value) ? input.value : '';
            const conflict = state.roadmap.started && state.roadmap.people.includes(char.name) && coachFirstConflict(state.roadmap.people);
            if (conflict) {
                char.book = previous;
                renderPlanner();
                refreshRosterStats();
                toast(coachConflictText(conflict));
                return;
            }
        }
        if (prop === 'plan-target' && input.value !== 'custom')
            for (const k of ['n', 's', 'b'])
                char.target[k] = number(input.value, 1, 10);
        if (prop === 'plan-talent') {
            const kind = input.dataset.talentKind, oldLevel = char.talents[kind], newLevel = number(input.value, 1, 10);
            if (newLevel > oldLevel && state.roadmap?.started)
                consumeBooksForUpgrade(char, kind, oldLevel, newLevel);
            char.talents[kind] = newLevel;
        }
        if (prop === 'plan-target-single')
            char.target[input.dataset.talentKind] = number(input.value, 1, 10);
        syncCharacterFarmGoals();
        save();
        renderPlanner();
        renderFarm();
        renderRoadmap();
        renderMaterials();
        refreshRosterStats();
    });
};
