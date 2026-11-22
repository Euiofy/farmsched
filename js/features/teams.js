// Teyvat Companion | features / teams
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const teamSavedTile = function (t, c, i) {
    const editing = editingTeamId === t.id && savedTeamDraft;
    return `<div class="team-position" data-team-position="${i}" data-team-group="saved:${esc(t.id)}"><div class="team-position-head"><span>Slot ${i + 1}</span><button type="button" class="team-move-handle" aria-label="Move ${esc(c)} in slot ${i + 1}" title="Drag to swap, or select two slots" aria-pressed="false">${teamGripSvg}</button></div><div class="team-slot-control ${editing && c ? 'has-character' : ''}"><button class="team-pick-slot" type="button" data-team-member-edit="${esc(t.id)}" data-member-slot="${i}" aria-label="Replace ${esc(c)} in slot ${i + 1}"><span class="team-pick-slot-portrait" data-character-rarity="${characterPortraitRarity(c)}">${c ? `<span>${esc(pickInitials(c))}</span><img src="${esc(pickPortrait(c))}" alt="" draggable="false" loading="lazy" data-portrait-name="${esc(c)}" data-portrait-stage="0">` : '✦'}</span><span>${esc(c || 'Choose character')}</span>${editing && !c ? '<span class="team-pick-slot-plus" aria-hidden="true">＋</span>' : ''}</button>${editing && c ? `<button type="button" class="team-slot-remove" data-clear-saved-slot="${i}" aria-label="Remove ${esc(c)} from slot ${i + 1}" title="Remove character"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg></button>` : ''}</div></div>`;
};
const nextDefaultTeamName = function () {
    const used = new Set(state.planner.teams.map(t => t.name.trim().toLowerCase()));
    let index = state.planner.teams.length + 1;
    while (used.has('team ' + index))
        index++;
    return 'Team ' + index;
};
const renderTeams = function () {
    $('planner-team-name').placeholder = nextDefaultTeamName();
    const target = $('planner-teams'), teams = state.planner.teams;
    if (editingTeamId && !teams.some(t => t.id === editingTeamId)) {
        editingTeamId = '';
        savedTeamDraft = null;
    }
    $('saved-team-quick-remove').disabled = !!editingTeamId || !teams.length;
    if (editingTeamId)
        visibleSavedTeamId = editingTeamId;
    if (!teams.length) {
        visibleSavedTeamId = '';
        visibleSavedTeamIndex = 0;
        $('saved-team-nav').hidden = true;
        target.innerHTML = '<div class="planner-empty"><h3>No teams yet</h3><p>Create a team or use a suggested lineup. Its members will get farming priority when you make it active.</p></div>';
        return;
    }
    const found = teams.findIndex(t => t.id === visibleSavedTeamId);
    if (found >= 0)
        visibleSavedTeamIndex = found;
    else if (!visibleSavedTeamId) {
        const active = teams.findIndex(t => t.id === state.planner.activeTeamId);
        visibleSavedTeamIndex = Math.max(0, active);
    }
    else
        visibleSavedTeamIndex = Math.min(visibleSavedTeamIndex, teams.length - 1);
    const t = teams[visibleSavedTeamIndex];
    visibleSavedTeamId = t.id;
    $('saved-team-nav').hidden = false;
    $('saved-team-count').textContent = (visibleSavedTeamIndex + 1) + ' / ' + teams.length;
    $('saved-team-jump').disabled = !!editingTeamId;
    $('saved-team-jump').title = editingTeamId ? 'Save or cancel editing before switching teams' : 'Browse all saved teams';
    $('saved-team-prev').disabled = !!editingTeamId || visibleSavedTeamIndex === 0;
    $('saved-team-next').disabled = !!editingTeamId || visibleSavedTeamIndex === teams.length - 1;
    const editing = t.id === editingTeamId && savedTeamDraft;
    const members = editing ? savedTeamDraft.members : t.members;
    target.innerHTML = `<div class="team-card ${t.id === state.planner.activeTeamId ? 'active' : ''} ${editing ? 'is-editing' : ''}"><div class="team-title">${editing ? `<input class="input" id="saved-team-name" aria-label="Team name" maxlength="70" required value="${esc(savedTeamDraft.name)}" placeholder="Team name">` : `<strong title="${esc(t.name)}">${esc(t.name)}</strong>`}<small>${t.id === state.planner.activeTeamId ? '★ Active' : 'Saved team'}</small></div><div class="team-saved-positions">${Array.from({ length: 4 }, (_, i) => teamSavedTile(t, members[i] || '', i)).join('')}</div>${editing ? `<div class="team-foot"><button type="button" class="btn btn-mint" data-team-save-inline="${esc(t.id)}">Save</button><button type="button" class="btn btn-outline" data-team-cancel-inline>Cancel</button></div>` : `<div class="team-foot"><button class="btn btn-secondary" type="button" data-team-active="${esc(t.id)}">${t.id === state.planner.activeTeamId ? 'Active now' : 'Make active'}</button><button type="button" class="btn btn-outline" data-team-edit="${esc(t.id)}">Edit team</button><button type="button" class="btn btn-outline" data-team-remove="${esc(t.id)}">Remove</button></div>`}</div>`;
};
const teamRemoveMatches = function () {
    const q = $('team-remove-search').value.trim().toLowerCase();
    return state.planner.teams.map((t, index) => ({ t, index })).filter(({ t }) => [t.name, ...t.members].join(' ').toLowerCase().includes(q));
};
const updateTeamRemoveButtons = function () {
    const n = teamRemoveSelected.size, matches = teamRemoveMatches();
    $('team-remove-count').textContent = n + ' selected';
    $('team-remove-all').textContent = $('team-remove-search').value.trim() ? 'Select matches' : 'Select all';
    $('team-remove-all').disabled = !matches.some(({ t }) => !teamRemoveSelected.has(t.id));
    $('team-remove-clear').disabled = !n;
    $('team-remove-confirm').disabled = !n;
    $('team-remove-confirm').textContent = n ? `Remove ${n} selected` : 'Remove selected';
    const active = teamRemoveSelected.has(state.planner.activeTeamId);
    $('team-remove-note').textContent = 'Only saved lineups are removed. Your build roster, farming plan and materials stay intact.' + (active ? ' The first remaining team will become active, if any.' : '');
};
const renderTeamRemoveList = function () {
    const rows = teamRemoveMatches();
    $('team-remove-list').innerHTML = rows.length ? rows.map(({ t, index }) => `<button type="button" class="saved-team-choice${teamRemoveSelected.has(t.id) ? ' is-selected' : ''}" data-team-remove-choice="${esc(t.id)}" aria-pressed="${teamRemoveSelected.has(t.id)}"><span class="team-remove-check" aria-hidden="true">✓</span><span class="saved-team-choice-copy"><strong>${esc(t.name)}</strong><small>${t.members.map(esc).join(' · ')}</small></span><span class="saved-team-choice-status">${t.id === state.planner.activeTeamId ? '★ Active' : ''}</span></button>`).join('') : '<div class="planner-empty">No matching teams.</div>';
    updateTeamRemoveButtons();
};
const closeTeamRemove = function () { if (teamRemoveDialog.open)
    teamRemoveDialog.close(); };
const teamRemoveOutside = function (e) {
    const r = teamRemoveDialog.getBoundingClientRect();
    return e.target === teamRemoveDialog && (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom);
};
const moveSavedTeam = function (delta) {
    if (editingTeamId)
        return;
    const next = visibleSavedTeamIndex + delta, teams = state.planner.teams;
    if (next < 0 || next >= teams.length)
        return;
    clearTeamMoveSelection();
    visibleSavedTeamIndex = next;
    visibleSavedTeamId = teams[next].id;
    renderTeams();
};
const renderSavedTeamPicker = function () {
    const query = $('saved-team-search').value.trim().toLowerCase();
    const teams = state.planner.teams;
    const rows = teams.map((t, index) => ({ t, index })).filter(({ t }) => [t.name, ...t.members].join(' ').toLowerCase().includes(query));
    $('saved-team-picker-list').innerHTML = rows.length ? rows.map(({ t, index }) => `<button type="button" class="saved-team-choice ${t.id === visibleSavedTeamId ? 'is-current' : ''}" data-jump-team-index="${index}" ${t.id === visibleSavedTeamId ? 'aria-current="true"' : ''}><span class="saved-team-choice-index">${index + 1}</span><span class="saved-team-choice-copy"><strong>${esc(t.name)}</strong><small>${t.members.map(esc).join(' · ')}</small></span><span class="saved-team-choice-status">${t.id === state.planner.activeTeamId ? '<span>★ Active</span>' : ''}${t.id === visibleSavedTeamId ? '<span>Viewing ✓</span>' : ''}</span></button>`).join('') : '<div class="planner-empty">No matching teams.</div>';
    $('saved-team-picker-count').textContent = rows.length + ' of ' + teams.length + ' saved teams';
    $('saved-team-picker-list').scrollTop = 0;
};
// Bind controls / initialize this section in original startup order.
const initializeTeamsSection10 = () => {
    $('saved-team-quick-remove').addEventListener('click', () => {
        if (editingTeamId || !state.planner.teams.length || teamRemoveDialog.open)
            return;
        teamRemoveSelected.clear();
        $('team-remove-search').value = '';
        renderTeamRemoveList();
        teamRemoveDialog.showModal();
        $('team-remove-body').scrollTop = 0;
        $('team-remove-close').focus({ preventScroll: true });
    });
    $('team-remove-search').addEventListener('input', () => {
        renderTeamRemoveList();
        $('team-remove-body').scrollTop = 0;
    });
    $('team-remove-list').addEventListener('click', e => {
        const tile = e.target.closest('[data-team-remove-choice]');
        if (!tile)
            return;
        const id = tile.dataset.teamRemoveChoice;
        if (teamRemoveSelected.has(id))
            teamRemoveSelected.delete(id);
        else
            teamRemoveSelected.add(id);
        const selected = teamRemoveSelected.has(id);
        tile.classList.toggle('is-selected', selected);
        tile.setAttribute('aria-pressed', String(selected));
        updateTeamRemoveButtons();
    });
    $('team-remove-all').addEventListener('click', () => {
        for (const { t } of teamRemoveMatches())
            teamRemoveSelected.add(t.id);
        renderTeamRemoveList();
    });
    $('team-remove-clear').addEventListener('click', () => {
        teamRemoveSelected.clear();
        renderTeamRemoveList();
    });
    $('team-remove-close').addEventListener('click', closeTeamRemove);
    $('team-remove-cancel').addEventListener('click', closeTeamRemove);
    teamRemoveDialog.addEventListener('pointerdown', e => { teamRemoveBackdrop = teamRemoveOutside(e); });
    teamRemoveDialog.addEventListener('pointercancel', () => { teamRemoveBackdrop = false; });
    teamRemoveDialog.addEventListener('click', e => {
        const outside = teamRemoveBackdrop && teamRemoveOutside(e);
        teamRemoveBackdrop = false;
        if (outside)
            closeTeamRemove();
    });
    teamRemoveDialog.addEventListener('close', () => {
        teamRemoveSelected.clear();
        teamRemoveBackdrop = false;
    });
    $('team-remove-confirm').addEventListener('click', () => {
        const ids = new Set(teamRemoveSelected), n = state.planner.teams.filter(t => ids.has(t.id)).length;
        if (!n || editingTeamId)
            return;
        if (!confirm(`Remove ${n} saved team${n === 1 ? '' : 's'}? Your characters and material goals will be kept.`))
            return;
        closeTeamRemove();
        clearTeamMoveSelection();
        state.planner.teams = state.planner.teams.filter(t => !ids.has(t.id));
        if (!state.planner.teams.some(t => t.id === state.planner.activeTeamId))
            state.planner.activeTeamId = state.planner.teams[0]?.id || '';
        save();
        renderPlanner();
        toast(`${n} saved team${n === 1 ? '' : 's'} removed.`);
    });
    $('saved-team-prev').addEventListener('click', () => moveSavedTeam(-1));
    $('saved-team-next').addEventListener('click', () => moveSavedTeam(1));
};
// Bind controls / initialize this section in original startup order.
const initializeTeamsSection11 = () => {
    $('saved-team-jump').addEventListener('click', () => {
        if (editingTeamId || !state.planner.teams.length || savedTeamPicker.open)
            return;
        $('saved-team-search').value = '';
        renderSavedTeamPicker();
        savedTeamPicker.showModal();
        $('saved-team-picker-close').focus({ preventScroll: true });
    });
    $('saved-team-picker-close').addEventListener('click', () => savedTeamPicker.close());
    savedTeamPicker.addEventListener('keydown', e => { if (e.key === 'Escape') {
        e.preventDefault();
        savedTeamPicker.close();
    } });
    $('saved-team-search').addEventListener('input', renderSavedTeamPicker);
    $('saved-team-picker-list').addEventListener('click', e => {
        const btn = e.target.closest('[data-jump-team-index]');
        if (!btn || editingTeamId)
            return;
        const index = Number(btn.dataset.jumpTeamIndex), team = state.planner.teams[index];
        if (!team)
            return;
        clearTeamMoveSelection();
        visibleSavedTeamIndex = index;
        visibleSavedTeamId = team.id;
        renderTeams();
        savedTeamPicker.close();
    });
};
const outsideSavedTeamPicker = function (e) {
    const r = savedTeamPicker.getBoundingClientRect();
    return e.target === savedTeamPicker && (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom);
};
const teamSuggestionData = function () {
    const roster = new Set(state.planner.characters.map(c => c.name));
    const templates = TEAM_TEMPLATES.map((t, i) => ({ ...t, index: i, owned: t.members.filter(x => roster.has(x)).length })).sort((a, b) => b.owned - a.owned);
    return { roster, templates };
};
const otherTeamMemberPortraits = function (t, roster) { return `<div class="other-team-members" aria-label="Team characters">${t.members.map(name => {
    const owned = roster.has(name);
    return `<div class="other-team-member ${owned ? 'is-owned' : 'is-missing'}" title="${esc(name)} — ${owned ? 'In build roster' : 'Not in build roster'}">${pickerPortraitHtml(name)}<span class="other-team-member-name">${esc(name)}</span><span class="other-team-member-status">${owned ? '✓ In roster' : 'Not in roster'}</span></div>`;
}).join('')}</div>`; };
const teamSuggestionCard = function (t, roster, showPortraits = false) { return `<article class="team-card"><div class="team-title"><strong>${esc(t.name)}</strong><small>${t.owned}/${t.members.length} in build roster</small></div><p class="team-hint">${esc(t.style)} · ${esc(t.tip)}</p>${showPortraits ? otherTeamMemberPortraits(t, roster) : `<div class="team-tags">${t.members.map(x => `<span class="${roster.has(x) ? '' : 'missing'}">${esc(x)}${roster.has(x) ? ' ✓' : ''}</span>`).join('')}</div>`}<div class="team-foot"><button type="button" class="btn btn-secondary" data-team-template="${t.index}">Fill team form</button></div></article>`; };
const renderSuggestions = function () {
    const { roster, templates } = teamSuggestionData();
    const ready = templates.filter(t => t.owned === t.members.length);
    $('planner-suggestions').innerHTML = ready.length ? ready.map(t => teamSuggestionCard(t, roster)).join('') : '<div class="planner-empty team-suggestions-empty"><h3>No complete team templates yet</h3><p>Add more characters to your build roster, or use Show other teams to explore possible lineups.</p></div>';
    if ($('other-teams-dialog').open)
        renderOtherTeams();
};
// Bind controls / initialize this section in original startup order.
const initializeTeamsSection12 = () => {
    savedTeamPicker.addEventListener('pointerdown', e => { savedTeamBackdropPressed = outsideSavedTeamPicker(e); });
    savedTeamPicker.addEventListener('pointercancel', () => { savedTeamBackdropPressed = false; });
    savedTeamPicker.addEventListener('click', e => {
        const dismiss = savedTeamBackdropPressed && outsideSavedTeamPicker(e);
        savedTeamBackdropPressed = false;
        if (dismiss)
            savedTeamPicker.close();
    });
    savedTeamPicker.addEventListener('close', () => {
        savedTeamBackdropPressed = false;
        $('saved-team-jump').focus({ preventScroll: true });
    });
};
const renderOtherTeams = function () {
    const { roster, templates } = teamSuggestionData();
    const others = templates.filter(t => t.owned < t.members.length);
    const query = $('other-teams-search').value.trim().toLowerCase();
    const visible = others.filter(t => [t.name, t.style, ...t.members].join(' ').toLowerCase().includes(query));
    $('other-teams-list').innerHTML = visible.length ? visible.map(t => teamSuggestionCard(t, roster, true)).join('') : '<div class="planner-empty team-suggestions-empty">' + (others.length ? 'No matching team templates.' : 'All templates are available in your build roster.') + '</div>';
    $('other-teams-count').textContent = visible.length + ' of ' + others.length + ' other team templates';
    $('other-teams-list').scrollTop = 0;
};
// Bind controls / initialize this section in original startup order.
const initializeTeamsSection13 = () => {
    $('planner-suggestions-toggle').addEventListener('click', () => {
        if (otherTeamsDialog.open)
            return;
        $('other-teams-search').value = '';
        renderOtherTeams();
        otherTeamsDialog.showModal();
        $('other-teams-close').focus({ preventScroll: true });
    });
    $('other-teams-search').addEventListener('input', renderOtherTeams);
    $('other-teams-close').addEventListener('click', () => otherTeamsDialog.close());
};
const outsideOtherTeams = function (e) {
    const r = otherTeamsDialog.getBoundingClientRect();
    return e.target === otherTeamsDialog && (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom);
};
// Bind controls / initialize this section in original startup order.
const initializeTeamsSection14 = () => {
    otherTeamsDialog.addEventListener('pointerdown', e => { otherTeamsBackdropPressed = outsideOtherTeams(e); });
    otherTeamsDialog.addEventListener('pointercancel', () => { otherTeamsBackdropPressed = false; });
    otherTeamsDialog.addEventListener('click', e => {
        const dismiss = otherTeamsBackdropPressed && outsideOtherTeams(e);
        otherTeamsBackdropPressed = false;
        if (dismiss)
            otherTeamsDialog.close();
    });
    otherTeamsDialog.addEventListener('close', () => {
        otherTeamsBackdropPressed = false;
        if (otherTeamsDialog.dataset.filled) {
            delete otherTeamsDialog.dataset.filled;
            return;
        }
        $('planner-suggestions-toggle').focus({ preventScroll: true });
    });
};
const resetTeamEditor = function () {
    $('planner-team-form').reset();
    for (let i = 0; i < 4; i++)
        $('planner-slot-' + i).value = '';
    refreshTeamSlots();
    clearTeamMoveSelection();
};
const beginTeamEdit = function (id, memberSlot = null) {
    const t = state.planner.teams.find(x => x.id === id);
    if (!t)
        return;
    if (editingTeamId !== id) {
        editingTeamId = id;
        savedTeamDraft = { name: t.name, members: [...t.members] };
        visibleSavedTeamId = id;
        clearTeamMoveSelection();
        renderTeams();
    }
    if (memberSlot !== null)
        openTeamSlot(memberSlot, 'saved');
    else
        $('saved-team-name')?.focus({ preventScroll: true });
};
const cancelSavedTeamEdit = function () {
    editingTeamId = '';
    savedTeamDraft = null;
    clearTeamMoveSelection();
    renderTeams();
};
const saveSavedTeamEdit = function () {
    if (!savedTeamDraft)
        return;
    const t = state.planner.teams.find(x => x.id === editingTeamId);
    if (!t) {
        cancelSavedTeamEdit();
        return;
    }
    const name = savedTeamDraft.name.trim();
    const members = savedTeamDraft.members.map(resolveName).filter(Boolean);
    if (!name) {
        toast('Enter a team name.');
        $('saved-team-name')?.focus();
        return;
    }
    if (members.length !== 4 || new Set(members.map(n => isTraveler(n) ? 'Traveler' : n)).size !== 4) {
        toast('Choose four different characters for the team.');
        return;
    }
    t.name = name;
    t.members = members;
    editingTeamId = '';
    savedTeamDraft = null;
    clearTeamMoveSelection();
    save();
    renderPlanner();
    toast('Team changes saved.');
};
const openTeamSlot = function (index, context = 'draft') {
    clearTeamMoveSelection();
    activeTeamContext = context;
    activeTeamSlot = index;
    $('team-modal-intro').textContent = 'Choose a member for slot ' + (index + 1) + (teamPickerMember(index) ? ' · Tap the checked character to remove them.' : '');
    pickerState.team.selected = [teamPickerMember(index)].filter(Boolean);
    pickerState.team.query = '';
    pickerState.team.element = 'All';
    $('team-pick-search').value = '';
    drawPicker('team');
    $('team-character-dialog').showModal();
};
// Bind controls / initialize this section in original startup order.
const initializeTeamsSection20 = () => {
    $('planner-teams').addEventListener('input', e => { if (e.target.id === 'saved-team-name' && savedTeamDraft)
        savedTeamDraft.name = e.target.value; });
    $('planner-teams').addEventListener('keydown', e => { if (e.target.id === 'saved-team-name' && e.key === 'Enter') {
        e.preventDefault();
        saveSavedTeamEdit();
    } });
};
const clearTeamMoveSelection = function () {
    teamMoveSelection = null;
    document.querySelectorAll('.team-position.is-move-selected').forEach(el => {
        el.classList.remove('is-move-selected');
        el.querySelector('.team-move-handle')?.setAttribute('aria-pressed', 'false');
    });
};
const teamPosition = function (el) { return el?.closest?.('.team-position[data-team-position]') || null; };
const teamPositionName = function (el) { return el?.querySelector('.team-pick-slot>span:nth-child(2)')?.textContent || 'Slot'; };
const swapTeamPositions = function (group, a, b) {
    if (a === b)
        return;
    if (a < 0 || a > 3 || b < 0 || b > 3)
        return;
    if (group === 'draft') {
        const x = $('planner-slot-' + a), y = $('planner-slot-' + b);
        [x.value, y.value] = [y.value, x.value];
        refreshTeamSlots();
        toast('Team slots rearranged.');
    }
    else {
        const id = group.slice(6), t = state.planner.teams.find(x => x.id === id);
        if (!t)
            return;
        if (id === editingTeamId && savedTeamDraft) {
            [savedTeamDraft.members[a], savedTeamDraft.members[b]] = [savedTeamDraft.members[b], savedTeamDraft.members[a]];
            renderTeams();
            return;
        }
        [t.members[a], t.members[b]] = [t.members[b], t.members[a]];
        save();
        renderPlanner();
        toast('Team order saved.');
    }
};
const clearTeamDrag = function () {
    const d = teamDrag;
    if (!d)
        return;
    teamDrag = null;
    d.ghost?.remove();
    d.source.classList.remove('is-drag-source');
    d.target?.classList.remove('is-drop-target');
    try {
        if (d.capture.hasPointerCapture(d.id))
            d.capture.releasePointerCapture(d.id);
    }
    catch { }
};
// Bind controls / initialize this section in original startup order.
const initializeTeamsSection21 = () => {
    document.addEventListener('pointerdown', e => {
        if (!e.isPrimary || e.button !== 0 || teamDrag)
            return;
        const source = teamPosition(e.target), handle = e.target.closest('.team-move-handle'), button = e.target.closest('.team-pick-slot');
        if (!source || (!handle && !(e.pointerType === 'mouse' && button)))
            return;
        if (!handle && !button)
            return;
        const group = source.dataset.teamGroup;
        if (group === 'draft' && !$('planner-slot-' + source.dataset.teamPosition).value)
            return;
        teamDrag = { id: e.pointerId, source, capture: handle || button, group, from: Number(source.dataset.teamPosition), x: e.clientX, y: e.clientY, dragging: false, target: null, ghost: null };
    });
    document.addEventListener('pointermove', e => {
        const d = teamDrag;
        if (!d || e.pointerId !== d.id)
            return;
        if (!d.dragging) {
            if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 7)
                return;
            d.dragging = true;
            clearTeamMoveSelection();
            d.source.classList.add('is-drag-source');
            try {
                d.capture.setPointerCapture(e.pointerId);
            }
            catch { }
            d.ghost = document.createElement('div');
            d.ghost.className = 'team-drag-ghost';
            d.ghost.textContent = teamPositionName(d.source);
            document.body.append(d.ghost);
        }
        if (e.cancelable)
            e.preventDefault();
        d.ghost.style.left = e.clientX + 'px';
        d.ghost.style.top = e.clientY + 'px';
        const hit = teamPosition(document.elementFromPoint(e.clientX, e.clientY));
        const target = hit && hit !== d.source && hit.dataset.teamGroup === d.group ? hit : null;
        if (target !== d.target) {
            d.target?.classList.remove('is-drop-target');
            d.target = target;
            target?.classList.add('is-drop-target');
        }
    }, { passive: false });
    document.addEventListener('pointerup', e => {
        const d = teamDrag;
        if (!d || e.pointerId !== d.id)
            return;
        if (!d.dragging) {
            clearTeamDrag();
            return;
        }
        const hit = teamPosition(document.elementFromPoint(e.clientX, e.clientY));
        const target = hit && hit.dataset.teamGroup === d.group ? hit : null;
        teamSuppressClickUntil = performance.now() + 450;
        clearTeamDrag();
        if (target)
            swapTeamPositions(d.group, d.from, Number(target.dataset.teamPosition));
    });
    document.addEventListener('pointercancel', e => { if (teamDrag?.id === e.pointerId)
        clearTeamDrag(); });
    window.addEventListener('blur', clearTeamDrag);
    document.addEventListener('dragstart', e => { if (teamPosition(e.target))
        e.preventDefault(); });
    document.addEventListener('click', e => {
        if (performance.now() < teamSuppressClickUntil && teamPosition(e.target)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
        }
        const handle = e.target.closest('.team-move-handle');
        if (!handle)
            return;
        e.preventDefault();
        e.stopImmediatePropagation();
        const el = teamPosition(handle), group = el.dataset.teamGroup, index = Number(el.dataset.teamPosition), prior = teamMoveSelection;
        clearTeamMoveSelection();
        if (prior && prior.group === group) {
            if (prior.index !== index) {
                swapTeamPositions(group, prior.index, index);
                const matches = [...document.querySelectorAll('.team-position')];
                matches.find(x => x.dataset.teamGroup === group && Number(x.dataset.teamPosition) === index)?.querySelector('.team-move-handle')?.focus();
            }
            return;
        }
        teamMoveSelection = { group, index };
        el.classList.add('is-move-selected');
        handle.setAttribute('aria-pressed', 'true');
    }, { capture: true });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') {
        clearTeamMoveSelection();
        if (teamDrag) {
            clearTeamDrag();
            teamSuppressClickUntil = performance.now() + 450;
        }
    } });
    $('planner-team-cancel').addEventListener('click', resetTeamEditor);
    $('planner-team-name').addEventListener('input', updateTeamCancelVisibility);
    $('planner-team-name').addEventListener('change', updateTeamCancelVisibility);
    $('planner-team-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = $('planner-team-name').value.trim() || nextDefaultTeamName();
        const members = Array.from({ length: 4 }, (_, i) => resolveName($('planner-slot-' + i).value)).filter(Boolean);
        if (members.length !== 4 || new Set(members.map(n => isTraveler(n) ? 'Traveler' : n)).size !== 4) {
            toast('Choose four different characters for the team.');
            return;
        }
        if (state.planner.teams.length >= 35) {
            toast('Too many saved teams.');
            return;
        }
        const id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        state.planner.teams.push({ id, name, members });
        if (!editingTeamId)
            visibleSavedTeamId = id;
        if (!state.planner.activeTeamId)
            state.planner.activeTeamId = id;
        save();
        resetTeamEditor();
        renderPlanner();
        toast('Team saved. Make it active to prioritize its members.');
    });
};
