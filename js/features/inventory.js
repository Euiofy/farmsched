// Teyvat Companion | features / inventory
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
// Validate known characters only; unknown names may represent weapons or custom goals.
const farmTalentMismatch = function (owner, item) {
    if (item?.type !== 'talent')
        return null;
    const name = resolveName(owner), known = CHARACTER_BOOK[name];
    if (!Object.prototype.hasOwnProperty.call(CHARACTER_BOOK, name))
        return null;
    let series = [known];
    if (isTraveler(name)) {
        const element = (name.match(/^Traveler [(]([^)]+)[)]$/) || [])[1];
        series = [...new Set([...(TRAVELER_BOOK_SETS[element] || []), ...(element === 'Geo' ? TRAVELER_BOOK_SETS.Anemo : [])])];
    }
    if (!series.length || series.includes(item.series))
        return null;
    const suggested = series.length === 1 ? MATERIAL_CATALOG.find(x => x.type === 'talent' && x.series === known && x.rank === item.rank) : null;
    return { name, series, suggested, message: `${name} uses ${series.join(', ')} Books, not ${item.series} Books.` };
};
const refreshFarmTalentWarning = function () {
    const mismatch = farmTalentMismatch($('farm-character').value, materialPicker.selected.farm);
    const warning = $('farm-book-warning'), button = $('farm-book-use-correct');
    warning.hidden = !mismatch;
    $('farm-material-hint').hidden = !!mismatch;
    $('farm-material-button').toggleAttribute('data-talent-mismatch', !!mismatch);
    // This selection remains allowed when intentionally tracking a different character's books.
    $('farm-material-button').setAttribute('aria-describedby', mismatch ? 'farm-book-warning' : 'farm-material-hint');
    $('farm-book-warning-text').textContent = mismatch?.message || '';
    button.hidden = !mismatch?.suggested;
    button.textContent = mismatch?.suggested ? `Use ${mismatch.suggested.series} instead` : '';
    return mismatch;
};
const farmSavedMismatchHtml = function (f) {
    if (f.id.startsWith('auto_book_'))
        return '';
    const item = MATERIAL_CATALOG_BY_ID.get(f.itemId) || MATERIAL_CATALOG_BY_NAME.get(f.material.toLowerCase());
    const mismatch = farmTalentMismatch(f.character, item);
    return mismatch ? `<div class="farm-book-mismatch">${esc(mismatch.message)}${mismatch.suggested ? ` <button type="button" class="farm-book-correct" data-correct-farm-book="${esc(f.id)}" title="Use ${esc(mismatch.suggested.name)} instead">Use ${esc(mismatch.suggested.series)} instead</button>` : ' · Manual goal'}</div>` : '';
};
// Correct only a manual goal, preserving the target and keeping different
// item inventories separate. Merge an identical goal for the same owner.
const correctSavedFarmBook = function (id) {
    const f = state.farm.find(x => x.id === id);
    if (!f || f.id.startsWith('auto_book_'))
        return;
    const item = MATERIAL_CATALOG_BY_ID.get(f.itemId) || MATERIAL_CATALOG_BY_NAME.get(f.material.toLowerCase());
    const mismatch = farmTalentMismatch(f.character, item), next = mismatch?.suggested;
    if (!next)
        return;
    const message = `Replace ${f.material} with ${next.name}?\n\nThe target stays at ${fmt(f.target)} (or the larger existing target). Owned ${item.series} books remain recorded as ${item.series} books, not ${next.series} books.`;
    if (!confirm(message))
        return;
    const oldKey = farmBookKey(f), oldOwned = f.owned, newKey = next.series + ':' + COACH_RARITIES[next.rank - 2];
    const oldSiblings = state.farm.filter(x => x !== f && farmBookKey(x) === oldKey);
    const newSiblings = state.farm.filter(x => x !== f && farmBookKey(x) === newKey);
    const duplicate = newSiblings.find(x => !x.id.startsWith('auto_book_') && resolveName(x.character) === resolveName(f.character));
    // Leave the old material's actual count with an existing goal for that item,
    // or retain it in the stored stock pool for later restoration.
    if (oldSiblings.length) {
        oldSiblings[0].owned = number(oldSiblings[0].owned + oldOwned, 0, 999999);
    }
    else
        state.roadmap.stock[oldKey] = Math.max(number(state.roadmap.stock[oldKey] || 0, 0, 999999), oldOwned);
    if (duplicate) {
        duplicate.target = Math.max(duplicate.target, f.target);
        duplicate.days = next.day;
        duplicate.itemId = next.id;
        duplicate.material = next.name;
        state.farm = state.farm.filter(x => x !== f);
    }
    else {
        f.material = next.name;
        f.itemId = next.id;
        f.days = next.day;
        f.owned = newSiblings.length ? 0 : number(state.roadmap.stock[newKey] || 0, 0, 999999);
    }
    if (oldSiblings.length)
        syncFarmBookStock(oldSiblings[0]);
    state.roadmap.excludedBooks = state.roadmap.excludedBooks.filter(k => k !== newKey);
    syncCharacterFarmGoals();
    const corrected = duplicate || f;
    syncFarmBookStock(corrected);
    farmFilter = 'all';
    farmOwnerKey = farmGroupKey(corrected.character);
    save();
    renderAll();
    toast(`Updated to ${next.name}. Target and farming days synced.`);
};
const daysAvailable = function (days) {
    const now = new Date(serverShift()), dow = now.getUTCDay();
    return days === 'any' || dow === 0 || (days === 'mon' && [1, 4].includes(dow)) || (days === 'tue' && [2, 5].includes(dow)) || (days === 'wed' && [3, 6].includes(dow));
};
const dayLabel = function (days) { return { any: 'Any day', mon: 'Mon / Thu / Sun', tue: 'Tue / Fri / Sun', wed: 'Wed / Sat / Sun' }[days] || 'Any day'; };
// Group display only: never duplicate, split, or modify saved material goals.
const farmGroupKey = function (name) { return String(name || '').trim().toLowerCase(); };
const farmGoalOwners = function (f) {
    // Shared automatic book goals retain a single inventory counter and target.
    // Show the same goal on each relevant character's page.
    if (f.id.startsWith('auto_book_')) {
        const item = MATERIAL_CATALOG_BY_ID.get(f.itemId) || MATERIAL_CATALOG_BY_NAME.get(f.material.toLowerCase());
        if (item?.type === 'talent' && item.series && item.rank >= 2 && item.rank <= 4) {
            const key = item.series + ':' + COACH_RARITIES[item.rank - 2];
            const owners = state.roadmap.people.filter(name => {
                const ch = state.planner.characters.find(x => x.name === name);
                return ch && ['n', 's', 'b'].some(k => Number(requiredBooks(ch, k, ch.talents[k], ch.target[k])[key]) > 0);
            });
            if (owners.length)
                return owners;
        }
        return f.character.split(',').map(name => name.trim()).filter(Boolean);
    }
    return [f.character.trim()];
};
const renderFarmOwnerNavigation = function (matching) {
    const groups = new Map();
    for (const goal of matching) {
        for (const name of farmGoalOwners(goal)) {
            const key = farmGroupKey(name);
            if (!key)
                continue;
            if (!groups.has(key))
                groups.set(key, { key, name, goals: [] });
            const list = groups.get(key).goals;
            if (!list.includes(goal))
                list.push(goal);
        }
    }
    farmOwnerGroups = [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
    const nav = $('farm-owner-nav'), select = $('farm-owner-select');
    nav.hidden = !farmOwnerGroups.length;
    if (!farmOwnerGroups.length) {
        select.replaceChildren();
        delete select.dataset.options;
        return [];
    }
    let index = farmOwnerGroups.findIndex(g => g.key === farmOwnerKey);
    if (index < 0)
        index = clamp(farmOwnerIndex, 0, farmOwnerGroups.length - 1);
    farmOwnerIndex = index;
    const group = farmOwnerGroups[index];
    farmOwnerKey = group.key;
    const options = farmOwnerGroups.map((g, i) => `<option value="${esc(g.key)}">${i + 1} / ${farmOwnerGroups.length} · ${esc(g.name)}</option>`).join('');
    if (select.dataset.options !== options) {
        select.innerHTML = options;
        select.dataset.options = options;
    }
    select.value = group.key;
    select.dispatchEvent(new Event('farm-page-sync'));
    select.disabled = farmOwnerGroups.length === 1;
    $('farm-owner-prev').disabled = index === 0;
    $('farm-owner-next').disabled = index === farmOwnerGroups.length - 1;
    $('farm-owner-name').textContent = group.name;
    const portrait = $('farm-owner-portrait'), known = resolveName(group.name);
    const isCharacter = Object.prototype.hasOwnProperty.call(CHARACTER_BOOK, known);
    portrait.hidden = !isCharacter;
    if (isCharacter && portrait.dataset.name !== known) {
        portrait.innerHTML = pickerPortraitHtml(known);
        portrait.dataset.name = known;
    }
    const complete = group.goals.filter(f => f.owned >= f.target).length;
    $('farm-owner-summary').textContent = `${group.goals.length} goal${group.goals.length === 1 ? '' : 's'} · ${complete} completed`;
    return group.goals;
};
const moveFarmOwner = function (delta) {
    const index = farmOwnerIndex + delta;
    if (index < 0 || index >= farmOwnerGroups.length)
        return;
    farmOwnerKey = farmOwnerGroups[index].key;
    renderFarm();
};
const renderFarm = function () {
    const all = state.farm;
    const completed = all.filter(f => f.owned >= f.target).length;
    $('stat-farm').textContent = all.length;
    $('stat-farm-foot').textContent = all.length ? `${completed} goal${completed === 1 ? '' : 's'} completed` : 'Track the materials you need';
    $('quick-farm').textContent = all.length ? `${all.length - completed} material goal${all.length - completed === 1 ? '' : 's'} left to finish` : 'Make every domain run count.';
    $('farm-count-label').textContent = all.length ? `${all.length} goals · ${completed} completed` : 'No projects yet. Add one to get started.';
    $('farm-quick-remove').disabled = !all.length;
    $('farm-restore-auto').hidden = !state.roadmap.excludedBooks.length;
    const matching = all.filter(f => farmFilter === 'all' || (farmFilter === 'today' && f.owned < f.target && daysAvailable(f.days)) || (farmFilter === 'pending' && f.owned < f.target));
    const previousListKey = $('farm-list').dataset.viewKey, previousScroll = $('farm-list').scrollTop;
    const filtered = renderFarmOwnerNavigation(matching);
    const listKey = farmFilter + '|' + farmOwnerKey;
    $('farm-list').innerHTML = filtered.length ? filtered.map(f => {
        const percent = clamp(f.owned / f.target * 100, 0, 100), done = f.owned >= f.target;
        return `<article class="farm-card"><div class="farm-card-head"><div class="farm-item-heading">${materialCatalogArtwork(MATERIAL_CATALOG_BY_ID.get(f.itemId) || MATERIAL_CATALOG_BY_NAME.get(f.material.toLowerCase()))}<div class="farm-item-description"><div class="farm-title">${esc(f.material)}</div><div class="farm-character">${esc(f.character)}${f.id.startsWith('auto_book_') ? ' · Auto from Journey Book' : ''}</div>${farmSavedMismatchHtml(f)}</div></div>${f.id.startsWith('auto_book_') ? '<span class="farm-auto-label" title="Update this target in Build Planner">Auto</span>' : `<button class="trash" title="Delete goal" aria-label="Delete ${esc(f.material)}" data-delete-farm="${esc(f.id)}">${ico('trash')}</button>`}</div><div class="farm-meta">${esc(dayLabel(f.days))} &nbsp;·&nbsp; <span style="color:${done ? 'var(--mint)' : daysAvailable(f.days) ? 'var(--gold)' : 'var(--sub)'}">${done ? 'Target reached' : daysAvailable(f.days) ? 'Available today (check in-game)' : 'Plan ahead'}</span></div><div class="progress-track" style="margin:0"><div class="progress-fill" style="width:${percent}%"></div></div><div class="farm-actions"><div class="farm-meta">${Math.floor(percent)}% complete · ${fmt(Math.max(0, f.target - f.owned))} to go</div><div class="counter"><button title="Subtract one" aria-label="Subtract one ${esc(f.material)}" data-farm-adjust="-1" data-id="${esc(f.id)}">−</button><strong>${fmt(f.owned)} / ${fmt(f.target)}</strong><button title="Add one" aria-label="Add one ${esc(f.material)}" data-farm-adjust="1" data-id="${esc(f.id)}">+</button></div></div></article>`;
    }).join('') : `<div class="empty">${ico('bag')}<h4>${all.length ? 'Nothing in this view' : 'A fresh start!'}</h4><p>${all.length ? 'Try another filter, or create a new material goal.' : 'Choose an item from the material catalog to start tracking its progress.'}</p></div>`;
    $('farm-list').dataset.viewKey = listKey;
    $('farm-list').scrollTop = previousListKey === listKey ? previousScroll : 0;
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === farmFilter));
};
const farmBookKey = function (f) {
    const item = MATERIAL_CATALOG_BY_ID.get(f.itemId) || MATERIAL_CATALOG_BY_NAME.get(f.material.toLowerCase());
    return item?.type === 'talent' && item.series && item.rank >= 2 && item.rank <= 4 ? item.series + ':' + COACH_RARITIES[item.rank - 2] : '';
};
const farmBookRequired = function (key) { return !!key && !!state.roadmap.started && state.roadmap.people.some(name => {
    const ch = state.planner.characters.find(x => x.name === name);
    return ch && ['n', 's', 'b'].some(k => (requiredBooks(ch, k, ch.talents[k], ch.target[k])[key] || 0) > 0);
}); };
const removeFarmGoals = function (ids) {
    const removed = state.farm.filter(f => ids.has(f.id));
    if (!removed.length)
        return;
    const keys = new Set(removed.map(farmBookKey).filter(Boolean));
    // Keep stock for restoration; removal is about tracked targets, not consuming items.
    for (const key of keys) {
        const remaining = state.farm.filter(f => !ids.has(f.id) && farmBookKey(f) === key);
        if (!remaining.length && farmBookRequired(key)) {
            state.roadmap.stock[key] = state.farm.filter(f => farmBookKey(f) === key).reduce((n, f) => n + f.owned, 0);
            if (!state.roadmap.excludedBooks.includes(key))
                state.roadmap.excludedBooks.push(key);
        }
        else if (remaining.length) {
            state.roadmap.stock[key] = remaining.reduce((n, f) => n + f.owned, 0);
        }
    }
    state.farm = state.farm.filter(f => !ids.has(f.id));
    syncCharacterFarmGoals();
    save();
    renderAll();
    toast(`${removed.length} material goal${removed.length === 1 ? '' : 's'} removed.`);
};
const farmRemoveMatches = function () {
    const key = $('farm-remove-owner').value, q = $('farm-remove-search').value.trim().toLowerCase();
    return state.farm.filter(f => (!key || farmGoalOwners(f).some(n => farmGroupKey(n) === key)) && [f.material, f.character, ...farmGoalOwners(f)].join(' ').toLowerCase().includes(q));
};
const updateFarmRemoveButtons = function () {
    const n = farmRemoveSelected.size, rows = farmRemoveMatches();
    $('farm-remove-count').textContent = n + ' selected';
    $('farm-remove-all').disabled = !rows.some(f => !farmRemoveSelected.has(f.id));
    $('farm-remove-clear').disabled = !n;
    $('farm-remove-confirm').disabled = !n;
    $('farm-remove-confirm').textContent = n ? `Remove ${n} selected` : 'Remove selected';
    const selected = state.farm.filter(f => farmRemoveSelected.has(f.id));
    const affected = selected.some(f => farmBookRequired(farmBookKey(f)));
    $('farm-remove-note').textContent = 'Only selected material goals are removed. Your roster, talent levels and saved teams stay intact.' + (affected ? ' Removed required books without another matching goal are excluded from current-plan tracking until restored. Shared goals are removed from every character page.' : '');
};
const renderFarmRemoveList = function () {
    const rows = farmRemoveMatches();
    $('farm-remove-list').innerHTML = rows.length ? rows.map(f => `<button type="button" class="saved-team-choice${farmRemoveSelected.has(f.id) ? ' is-selected' : ''}" data-farm-remove-choice="${esc(f.id)}" aria-pressed="${farmRemoveSelected.has(f.id)}"><span class="team-remove-check" aria-hidden="true">✓</span>${materialCatalogArtwork(MATERIAL_CATALOG_BY_ID.get(f.itemId) || MATERIAL_CATALOG_BY_NAME.get(f.material.toLowerCase()))}<span class="saved-team-choice-copy"><strong>${esc(f.material)}</strong><small>${esc(farmGoalOwners(f).join(', '))} · ${fmt(f.owned)} / ${fmt(f.target)}</small></span><span class="farm-remove-kind">${f.id.startsWith('auto_book_') ? 'Auto' : 'Manual'}</span></button>`).join('') : '<div class="planner-empty">No matching material goals.</div>';
    updateFarmRemoveButtons();
};
const closeFarmRemove = function () { if (farmRemoveDialog.open)
    farmRemoveDialog.close(); };
const farmRemoveOutside = function (e) {
    const r = farmRemoveDialog.getBoundingClientRect();
    return e.target === farmRemoveDialog && (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom);
};
// Bind controls / initialize this section in original startup order.
const initializeInventorySection8 = () => {
    $('farm-quick-remove').addEventListener('click', () => {
        if (!state.farm.length || farmRemoveDialog.open)
            return;
        farmRemoveSelected.clear();
        $('farm-remove-search').value = '';
        const owners = new Map();
        for (const f of state.farm)
            for (const n of farmGoalOwners(f))
                owners.set(farmGroupKey(n), n);
        const select = $('farm-remove-owner');
        select.innerHTML = '<option value="">All characters &amp; weapons</option>' + [...owners].sort((a, b) => a[1].localeCompare(b[1])).map(([key, name]) => `<option value="${esc(key)}">${esc(name)}</option>`).join('');
        select.value = owners.has(farmOwnerKey) ? farmOwnerKey : '';
        renderFarmRemoveList();
        farmRemoveDialog.showModal();
        $('farm-remove-body').scrollTop = 0;
        $('farm-remove-close').focus({ preventScroll: true });
    });
    for (const id of ['farm-remove-search', 'farm-remove-owner'])
        $(id).addEventListener(id.endsWith('owner') ? 'change' : 'input', () => {
            renderFarmRemoveList();
            $('farm-remove-body').scrollTop = 0;
        });
    $('farm-remove-list').addEventListener('click', e => {
        const tile = e.target.closest('[data-farm-remove-choice]');
        if (!tile)
            return;
        const id = tile.dataset.farmRemoveChoice;
        if (farmRemoveSelected.has(id))
            farmRemoveSelected.delete(id);
        else
            farmRemoveSelected.add(id);
        tile.classList.toggle('is-selected', farmRemoveSelected.has(id));
        tile.setAttribute('aria-pressed', String(farmRemoveSelected.has(id)));
        updateFarmRemoveButtons();
    });
    $('farm-remove-all').addEventListener('click', () => {
        for (const f of farmRemoveMatches())
            farmRemoveSelected.add(f.id);
        renderFarmRemoveList();
    });
    $('farm-remove-clear').addEventListener('click', () => {
        farmRemoveSelected.clear();
        renderFarmRemoveList();
    });
    for (const id of ['farm-remove-close', 'farm-remove-cancel'])
        $(id).addEventListener('click', closeFarmRemove);
    farmRemoveDialog.addEventListener('pointerdown', e => { farmRemoveBackdrop = farmRemoveOutside(e); });
    farmRemoveDialog.addEventListener('pointercancel', () => { farmRemoveBackdrop = false; });
    farmRemoveDialog.addEventListener('click', e => {
        const out = farmRemoveBackdrop && farmRemoveOutside(e);
        farmRemoveBackdrop = false;
        if (out)
            closeFarmRemove();
    });
    farmRemoveDialog.addEventListener('close', () => {
        farmRemoveSelected.clear();
        farmRemoveBackdrop = false;
    });
    $('farm-remove-confirm').addEventListener('click', () => {
        const ids = new Set(farmRemoveSelected), n = state.farm.filter(f => ids.has(f.id)).length;
        if (!n || !confirm(`Remove ${n} selected material goal${n === 1 ? '' : 's'}? Required books with no remaining matching goal will be excluded from tracking until restored.`))
            return;
        closeFarmRemove();
        removeFarmGoals(ids);
    });
    $('farm-restore-auto').addEventListener('click', () => {
        state.roadmap.excludedBooks = [];
        save();
        renderAll();
        toast('Automatic goals restored for the current plan.');
    });
};
// Bind controls / initialize this section in original startup order.
const initializeInventorySection31 = () => {
    $('farm-owner-prev').addEventListener('click', () => moveFarmOwner(-1));
    $('farm-owner-next').addEventListener('click', () => moveFarmOwner(1));
    $('farm-owner-select').addEventListener('change', e => {
        farmOwnerKey = e.target.value;
        renderFarm();
    });
    $('farm-character').addEventListener('input', refreshFarmTalentWarning);
    $('farm-book-use-correct').addEventListener('click', () => {
        const mismatch = refreshFarmTalentWarning();
        if (!mismatch?.suggested)
            return;
        // Do not reinterpret the amount already owned as a different item.
        materialPicker.selected.farm = mismatch.suggested;
        $('farm-owned').value = '0';
        updateMaterialPreview('farm', mismatch.suggested);
        $('farm-material-button').focus({ preventScroll: true });
        toast('Correct talent book selected. Enter the amount you own.');
    });
    $('farm-form').addEventListener('submit', e => {
        e.preventDefault();
        const item = materialPicker.selected.farm;
        if (!item) {
            toast('Choose a material from the icon catalog first.');
            openMaterialPicker('farm');
            return;
        }
        const character = $('farm-character').value.trim(), material = item.name, owned = number($('farm-owned').value, 0, 999999), target = number($('farm-target').value, 1, 999999), days = $('farm-days').value;
        if (!character)
            return;
        const mismatch = refreshFarmTalentWarning();
        if (mismatch && !confirm(mismatch.message + '\n\nKeep this as a manual inventory goal anyway?'))
            return;
        const added = { id: 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), character, material, itemId: item.id, owned, target, days };
        const bookKey = farmBookKey(added);
        state.roadmap.excludedBooks = state.roadmap.excludedBooks.filter(k => k !== bookKey);
        state.farm.unshift(added);
        syncCharacterFarmGoals();
        save();
        $('farm-form').reset();
        resetMaterialPicker('farm');
        farmFilter = 'all';
        farmOwnerKey = farmGroupKey(character);
        renderFarm();
        renderRoadmap();
        toast('Your material goal has been added and is included in Journey Book progress!');
    });
};
