// Teyvat Companion | features / character picker
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const coachCharacterRotations = function (name) {
    if (isTraveler(name))
        return COACH_ROTATION_ORDER.slice(); // Traveler's level-based talent books span all three rotations.
    const existing = state.planner.characters.find(ch => ch.name === name);
    const series = CHARACTER_BOOK[name] || existing?.book;
    const rotation = BOOKS[series]?.rotation;
    return rotation ? [rotation] : [];
};
const coachSelectionConflict = function (name, names) {
    const candidateDays = coachCharacterRotations(name);
    for (const selected of names) {
        if (selected === name)
            continue;
        const shared = candidateDays.filter(day => coachCharacterRotations(selected).includes(day));
        if (shared.length)
            return { name, with: selected, days: COACH_ROTATION_ORDER.filter(day => shared.includes(day)) };
    }
    return null;
};
const coachConflictText = function (problem) {
    return `${problem.name} conflicts with ${problem.with}: both need ${problem.days.map(d => COACH_ROTATION_LABELS[d]).join(' and ')} talent-book days. Paimon won't overlap them. Try another character (Sunday is a catch-up day).`;
};
const coachFirstConflict = function (names) {
    for (let i = 1; i < names.length; i++) {
        const conflict = coachSelectionConflict(names[i], names.slice(0, i));
        if (conflict)
            return conflict;
    }
    return null;
};
// One character is a valid farming plan, just like a single weapon plan.
// Multiple characters must still have non-overlapping talent-book days.
const coachSelectionValid = function (names) {
    return names.length >= 1 && names.length <= 3 && !coachFirstConflict(names);
};
const coachSelectionNote = function (message = '', warning = false) {
    const note = $('coach-overlap-note');
    if (!note)
        return;
    note.textContent = message || "Paimon won't allow overlapping talent-book days (Mon/Thu, Tue/Fri, Wed/Sat). Sunday is a free catch-up day for everyone.";
    note.classList.toggle('is-warning', warning);
};
const teamPickerMember = function (i) { return activeTeamContext === 'saved' && savedTeamDraft ? savedTeamDraft.members[i] || '' : $('planner-slot-' + i).value; };
const teamOccupiedSlot = function (name) { return [0, 1, 2, 3].find(i => i !== activeTeamSlot && (teamPickerMember(i) === name || (isTraveler(name) && isTraveler(teamPickerMember(i))))); };
const drawPicker = function (which) {
    const ui = pickerState[which];
    if (!ui)
        return;
    // Traveler's seven elemental forms are listed as individual selectable characters.
    const roster = Object.keys(CHARACTER_BOOK).filter(n => CHARACTER_BOOK[n] && CHARACTER_ELEMENT[n]);
    const owned = new Set((typeof state === 'undefined' ? [] : state.planner.characters.map(c => c.name)));
    const query = ui.query.trim().toLowerCase();
    const visible = roster.filter(name => (ui.element === 'All' || CHARACTER_ELEMENT[name] === ui.element)
        && (name.toLowerCase().includes(query) || (isTraveler(name) && ('aether lumine traveler').includes(query))))
        .sort((a, b) => a.localeCompare(b));
    const filters = $(which + '-pick-filters');
    filters.innerHTML = ['All', 'Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo'].map(el => `<button type="button" class="picker-element ${ui.element === el ? 'is-active' : ''}" data-pick-filter="${el}" data-pick-context="${which}" aria-pressed="${ui.element === el}"><span class="picker-element-icon-shell">${elementIconHtml(el)}</span>${el}</button>`).join('');
    const grid = $(which + '-pick-grid');
    const previousScroll = grid.scrollTop;
    const regular = visible.map(name => {
        const chosen = ui.selected.includes(name), inPlanner = which === 'planner' && owned.has(name);
        const occupiedSlot = which === 'team' ? teamOccupiedSlot(name) : undefined, inTeam = occupiedSlot !== undefined;
        const conflict = which === 'coach' && !chosen ? coachSelectionConflict(name, ui.selected) : null;
        const label = conflict ? conflict.days.map(day => COACH_ROTATION_LABELS[day]).join(' + ') : '';
        return `<button type="button" class="picker-face ${chosen ? 'is-selected' : ''} ${inPlanner ? 'disabled-books' : ''} ${conflict ? 'is-farm-blocked' : ''} ${inTeam ? 'is-team-unavailable' : ''}" data-pick-name="${esc(name)}" data-pick-context="${which}" aria-pressed="${chosen}" ${conflict ? 'aria-disabled="true"' : ''} title="${inTeam ? esc(name + ' · Already in slot ' + (occupiedSlot + 1)) : conflict ? esc(coachConflictText(conflict)) : esc(name)}" aria-label="${esc(name)} · ${esc(CHARACTER_ELEMENT[name])}${conflict ? ' · unavailable: ' + esc(label) + ' already used' : ''}${inPlanner ? ' · already in roster' : ''}${inTeam ? ' · already in slot ' + (occupiedSlot + 1) : ''}" style="--element-color:${PICKER_ELEMENT_COLORS[CHARACTER_ELEMENT[name]]}" ${inPlanner || inTeam ? 'disabled' : ''}>${chosen ? '<span class="picker-tick">✓</span>' : ''}${pickerPortraitHtml(name)}<span class="picker-face-name">${esc(name)}</span>${conflict ? `<span class="farm-block-label">Blocked · ${esc(label)}</span>` : ''}${inTeam ? `<span class="team-occupied-label">In slot ${occupiedSlot + 1}</span>` : ''}</button>`;
    }).join('');
    grid.innerHTML = regular || '<div class="picker-empty">No matching characters. Try another name or element.</div>';
    if (which === 'planner' || (which === 'coach' && planEditSession))
        grid.scrollTop = previousScroll;
    const count = visible.length;
    $(which + '-pick-results').textContent = count + ' character' + (count === 1 ? '' : 's') + (ui.element === 'All' ? '' : ' · ' + ui.element);
    if (which === 'coach') {
        const bar = $('coach-pick-selected');
        bar.innerHTML = `<span class="picker-count">${ui.selected.length} / 3 selected</span>` + (ui.selected.length ? ui.selected.map(name => `<button type="button" class="picker-chip" data-pick-remove="${esc(name)}" aria-label="Remove ${esc(name)}"><span class="picker-mini-face">${pickerPortraitHtml(name)}</span>${esc(name)} <span>×</span></button>`).join('') : '<span class="picker-no-selection">Pick 1–3 characters to begin</span>');
    }
    else if (which === 'planner') {
        const name = ui.selected[0] || '';
        $('planner-char').value = name;
        $('planner-pick-selected').innerHTML = name ? `<span class="picker-count">Chosen:</span> ${pickerPortraitHtml(name)} <strong>${esc(name)}</strong><button type="button" class="picker-chip" data-pick-clear="planner">Change ✕</button>` : 'Choose a portrait below to add to your build roster.';
        const portrait = $('planner-pick-selected').querySelector('.picker-portrait');
        if (portrait) {
            portrait.style.width = '40px';
            portrait.style.height = '40px';
            const img = portrait.querySelector('img');
            if (img)
                img.loading = 'eager';
        }
    }
    if (which === 'coach') {
        $('coach-setup-form').querySelector('button[type="submit"]').disabled = !coachSelectionValid(ui.selected);
        refreshPlanEditControls();
    }
};
const choosePortrait = function (which, name) {
    if (!Object.prototype.hasOwnProperty.call(CHARACTER_ELEMENT, name) || !CHARACTER_BOOK[name])
        return;
    const ui = pickerState[which];
    if (which === 'coach') {
        if (ui.selected.includes(name))
            ui.selected = ui.selected.filter(n => n !== name);
        else if (ui.selected.length >= 3) {
            toast('Choose up to 3 characters for this farming plan. Remove one first.');
            return;
        }
        else {
            const conflict = coachSelectionConflict(name, ui.selected);
            if (conflict) {
                const reason = coachConflictText(conflict);
                coachSelectionNote(reason, true);
                toast(reason);
                return;
            }
            ui.selected.push(name);
        }
        coachSelectionNote();
    }
    else if (which === 'team') {
        if (teamOccupiedSlot(name) !== undefined) {
            toast('That character is already in another team slot.');
            return;
        }
        // Tapping the checked member toggles this slot off; other slots are untouched.
        const next = teamPickerMember(activeTeamSlot) === name ? '' : name;
        if (activeTeamContext === 'saved' && savedTeamDraft) {
            savedTeamDraft.members[activeTeamSlot] = next;
            clearTeamMoveSelection();
            $('team-character-dialog').close();
            renderTeams();
        }
        else {
            $('planner-slot-' + activeTeamSlot).value = next;
            refreshTeamSlots();
            clearTeamMoveSelection();
            $('team-character-dialog').close();
        }
        return;
    }
    else {
        if (state.planner.characters.some(c => c.name === name)) {
            toast(name + ' is already in your roster.');
            return;
        }
        ui.selected = [name];
    }
    drawPicker(which);
};
const pickerResetCoach = function () {
    pickerState.coach.selected = [];
    pickerState.coach.query = '';
    pickerState.coach.element = 'All';
    $('coach-pick-search').value = '';
    coachSelectionNote();
    drawPicker('coach');
};
const updateTeamCancelVisibility = function () {
    const changed = $('planner-team-name').value !== $('planner-team-name').defaultValue || Array.from({ length: 4 }, (_, i) => $('planner-slot-' + i)).some(slot => slot.value !== '');
    $('planner-team-cancel').hidden = !changed;
};
const refreshTeamSlots = function () {
    updateTeamCancelVisibility();
    for (let i = 0; i < 4; i++) {
        const name = $('planner-slot-' + i).value;
        const portrait = $('team-slot-img-' + i);
        portrait.dataset.characterRarity = characterPortraitRarity(name);
        $('team-slot-label-' + i).textContent = name || 'Choose character';
        portrait.innerHTML = name ? `<span>${esc(pickInitials(name))}</span><img src="${esc(pickPortrait(name))}" alt="Official in-game portrait of ${esc(name)}" loading="lazy" data-portrait-name="${esc(name)}" data-portrait-stage="0">` : '✦';
        const row = portrait.closest('.team-slot-control');
        row.classList.toggle('has-character', !!name);
        const remove = row.querySelector('.team-slot-remove');
        remove.hidden = !name;
        remove.setAttribute('aria-label', `Remove ${name || 'character'} from slot ${i + 1}`);
    }
};
const bindCharacterPickers = function () {
    for (const which of ['coach', 'planner', 'team']) {
        $(which + '-pick-search').addEventListener('input', e => {
            pickerState[which].query = e.target.value;
            if (which === 'planner')
                $('planner-pick-grid').scrollTop = 0;
            drawPicker(which);
        });
        drawPicker(which);
    }
    refreshTeamSlots();
    const teamDialog = $('team-character-dialog');
    $('team-picker-close').addEventListener('click', () => teamDialog.close());
    // Require both press and release on the backdrop; scrolling or dragging out of the dialog does not dismiss it.
    let pressedBackdrop = false;
    const outsideTeamDialog = e => {
        const r = teamDialog.getBoundingClientRect();
        return e.target === teamDialog && (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom);
    };
    teamDialog.addEventListener('pointerdown', e => { pressedBackdrop = outsideTeamDialog(e); });
    teamDialog.addEventListener('pointercancel', () => { pressedBackdrop = false; });
    teamDialog.addEventListener('click', e => {
        const dismiss = pressedBackdrop && outsideTeamDialog(e);
        pressedBackdrop = false;
        if (dismiss)
            teamDialog.close();
    });
    teamDialog.addEventListener('close', () => { pressedBackdrop = false; });
    document.addEventListener('click', e => {
        const slot = e.target.closest('[data-team-slot]');
        if (slot) {
            openTeamSlot(Number(slot.dataset.teamSlot));
            return;
        }
        const filter = e.target.closest('[data-pick-filter]');
        if (filter) {
            const which = filter.dataset.pickContext;
            pickerState[which].element = filter.dataset.pickFilter;
            if (which === 'planner')
                $('planner-pick-grid').scrollTop = 0;
            drawPicker(which);
            return;
        }
        const tile = e.target.closest('[data-pick-name]');
        if (tile) {
            if (!tile.disabled)
                choosePortrait(tile.dataset.pickContext, tile.dataset.pickName);
            return;
        }
        const remove = e.target.closest('[data-pick-remove]');
        if (remove) {
            choosePortrait('coach', remove.dataset.pickRemove);
            return;
        }
        const clear = e.target.closest('[data-pick-clear]');
        if (clear) {
            pickerState.planner.selected = [];
            drawPicker('planner');
            return;
        }
    });
    document.addEventListener('error', e => {
        const img = e.target;
        if (img.tagName !== 'IMG')
            return;
        if (materialItemImageFallback(img))
            return;
        if (img.hasAttribute('data-material-id')) {
            const id = Number(img.dataset.materialId), stage = Number(img.dataset.materialStage || 0);
            if (Number.isInteger(id) && stage + 1 < TALENT_IMAGE_ENDPOINTS.length) {
                img.dataset.materialStage = String(stage + 1);
                img.src = TALENT_IMAGE_ENDPOINTS[stage + 1](id);
            }
            else
                img.classList.add('is-failed');
            return;
        }
        if (img.hasAttribute('data-material-icon')) {
            if (img.closest('.material-icon-art') && img.dataset.materialMirrorStage !== '1') {
                img.dataset.materialMirrorStage = '1';
                img.src = 'https://genshin-impact.fandom.com/wiki/Special:FilePath/Item_' + encodeURIComponent(img.dataset.materialIcon) + '.png';
            }
            else
                img.classList.add('is-failed');
            return;
        }
        if (img.hasAttribute('data-element-icon')) {
            const element = img.dataset.elementIcon;
            if (img.dataset.elementStage === '0') {
                img.dataset.elementStage = '1';
                img.src = ELEMENT_ICON_BACKUP + ELEMENT_ICON_KNOWN[element] + '.png';
            }
            else {
                img.style.display = 'none';
                img.dataset.elementFailed = 'true';
            }
            return;
        }
        if (!img.hasAttribute('data-portrait-stage'))
            return;
        const name = img.dataset.portraitName;
        if (!name)
            return;
        const stage = Number(img.dataset.portraitStage || 0);
        const sources = portraitCandidates(name);
        if (stage + 1 < sources.length) {
            img.dataset.portraitStage = String(stage + 1);
            img.src = sources[stage + 1];
        }
        else {
            img.classList.add('failed');
            img.title = 'Portrait unavailable from image providers; check your connection.';
        }
    }, true);
};
