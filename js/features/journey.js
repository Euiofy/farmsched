// Teyvat Companion | features / journey
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const coachBookNeeds = function (ch) {
    const c = { Teachings: 0, Guide: 0, Philosophies: 0 };
    if (!ch)
        return c;
    for (const t of ['n', 's', 'b']) {
        const now = number(ch.talents?.[t] ?? 1, 1, 10), goal = number(ch.target?.[t] ?? 1, 1, 10);
        for (let lvl = now; lvl < goal; lvl++) {
            const v = COACH_COSTS[lvl] || [0, 0, 0];
            COACH_RARITIES.forEach((rar, i) => c[rar] += v[i]);
        }
    }
    return c;
};
// Synchronize character talent-book requirements into Inventory Board. Generated
// targets are grouped by exact item rarity, avoiding one duplicate per character.
// Existing manually tracked copies take precedence and their owned quantity is
// preserved. All counts are calculated from actual current → target talent levels;
// the app does not invent ascension or weapon requirements without level data.
const bookMaterialName = function (book, rar) { return rar === 'Guide' ? 'Guide to ' + book : rar + ' of ' + book; };
const syncCharacterFarmGoals = function () {
    const farm = state.farm, road = state.roadmap;
    const desired = new Map();
    let changed = false;
    // Preserve older goals created in the removed duplicate Journey Book form.
    // Move them into Inventory Board once, rather than leaving invisible inventory.
    if (Array.isArray(road.extras) && road.extras.length) {
        const unconverted = [];
        for (const x of road.extras) {
            const match = farm.find(f => f.material.toLowerCase() === x.name.toLowerCase() && f.character === x.character);
            if (match) {
                if (match.target < x.need) {
                    match.target = x.need;
                    changed = true;
                }
                if (match.owned < x.owned) {
                    match.owned = x.owned;
                    changed = true;
                }
            }
            else if (farm.length < 200) {
                farm.push({
                    id: ('migrated_' + x.id).slice(0, 60), character: x.character, material: x.name, itemId: x.itemId || MATERIAL_CATALOG_BY_NAME.get(x.name.toLowerCase())?.id || '', target: x.need, owned: x.owned, days: ['mon', 'tue', 'wed'].includes(x.day) ? x.day : 'any'
                });
                changed = true;
            }
            else {
                unconverted.push(x);
            }
        }
        if (unconverted.length !== road.extras.length) {
            road.extras = unconverted;
            changed = true;
        }
    }
    if (road.started) {
        for (const character of road.people) {
            const ch = state.planner.characters.find(x => x.name === character);
            if (!ch)
                continue;
            for (const kind of ['n', 's', 'b']) {
                for (const [key, count] of Object.entries(requiredBooks(ch, kind, ch.talents[kind], ch.target[kind]))) {
                    if (!count || road.excludedBooks.includes(key))
                        continue;
                    const [book, rar] = key.split(':');
                    if (!BOOKS[book])
                        continue;
                    if (!desired.has(key))
                        desired.set(key, { book, rar, need: 0, characters: [] });
                    const d = desired.get(key);
                    d.need += count;
                    if (!d.characters.includes(character))
                        d.characters.push(character);
                }
            }
        }
    }
    const generatedId = key => 'auto_book_' + key.replace(/[^a-zA-Z0-9]+/g, '_');
    // Keep manually created goals; clean up only our previously auto-generated rows.
    for (let i = farm.length - 1; i >= 0; i--) {
        const f = farm[i];
        if (!f.id.startsWith('auto_book_'))
            continue;
        const key = [...desired.keys()].find(k => generatedId(k) === f.id);
        const matchingManual = key ? farm.some(x => x !== f && !x.id.startsWith('auto_book_') && x.material.toLowerCase() === bookMaterialName(desired.get(key).book, desired.get(key).rar).toLowerCase()) : false;
        if (!key || matchingManual) {
            if (!key) {
                const item = MATERIAL_CATALOG_BY_NAME.get(f.material.toLowerCase());
                if (item?.type === 'talent' && item.series && item.rank >= 2 && item.rank <= 4) {
                    const oldKey = item.series + ':' + COACH_RARITIES[item.rank - 2];
                    road.stock[oldKey] = Math.max(number(road.stock[oldKey] || 0), f.owned);
                }
            }
            // If a manually added entry exists, it wins. Preserve the higher owned count.
            if (matchingManual) {
                const d = desired.get(key), manual = farm.find(x => !x.id.startsWith('auto_book_') && x.material.toLowerCase() === bookMaterialName(d.book, d.rar).toLowerCase());
                if (manual && manual.owned < f.owned) {
                    manual.owned = f.owned;
                    changed = true;
                }
            }
            farm.splice(i, 1);
            changed = true;
        }
    }
    for (const [key, d] of desired) {
        const material = bookMaterialName(d.book, d.rar), id = generatedId(key);
        const manual = farm.filter(f => !f.id.startsWith('auto_book_') && f.material.toLowerCase() === material.toLowerCase());
        if (manual.length) {
            const total = manual.reduce((n, f) => n + f.target, 0);
            if (total < d.need) {
                manual[0].target += d.need - total;
                changed = true;
            }
            continue;
        }
        const cat = MATERIAL_CATALOG_BY_NAME.get(material.toLowerCase());
        const character = d.characters.join(', ').slice(0, 65);
        const entry = farm.find(f => f.id === id);
        if (entry) {
            if (entry.target !== d.need) {
                entry.target = d.need;
                changed = true;
            }
            if (entry.character !== character) {
                entry.character = character;
                changed = true;
            }
            if (entry.itemId !== (cat?.id || '')) {
                entry.itemId = cat?.id || '';
                changed = true;
            }
        }
        else if (farm.length < 200) {
            farm.unshift({ id, character, material, itemId: cat?.id || '', owned: number(road.stock[key] || 0, 0, 999999), target: d.need, days: BOOKS[d.book].rotation });
            changed = true;
        }
    }
    if (changed)
        save();
    return changed;
};
// Record player updates to a book inventory entry in the same stock pool.
const syncFarmBookStock = function (f) {
    const item = MATERIAL_CATALOG_BY_ID.get(f.itemId) || MATERIAL_CATALOG_BY_NAME.get(f.material.toLowerCase());
    if (item?.type === 'talent' && item.series && item.rank >= 2 && item.rank <= 4) {
        const key = item.series + ':' + COACH_RARITIES[item.rank - 2];
        const siblings = state.farm.filter(x => {
            const a = MATERIAL_CATALOG_BY_ID.get(x.itemId) || MATERIAL_CATALOG_BY_NAME.get(x.material.toLowerCase());
            return a?.type === 'talent' && a.series === item.series && a.rank === item.rank;
        });
        state.roadmap.stock[key] = siblings.reduce((n, x) => n + x.owned, 0);
    }
};
// The Inventory Board and Journey Book use the same saved state. Inventory Board
// entries contribute to the Journey Book progress bar; matching auto-generated
// talent-book targets are merged so the same item is not counted twice.
const coachGoals = function () {
    const r = state.roadmap, goals = [];
    for (const name of r.people) {
        const ch = state.planner.characters.find(c => c.name === name);
        if (!ch)
            continue;
        const impact = coachImpact(name);
        for (const kind of ['n', 's', 'b']) {
            const need = requiredBooks(ch, kind, ch.talents[kind], ch.target[kind]);
            for (const [key, count] of Object.entries(need)) {
                const [book, rar] = key.split(':'), meta = BOOKS[book];
                if (!meta || r.excludedBooks.includes(key))
                    continue;
                const id = 'book:' + key;
                let goal = goals.find(g => g.id === id);
                if (!goal) {
                    goal = { id, kind: 'books', character: name, characters: [], book, rar, day: meta.rotation, where: meta.domain + ' · ' + meta.region, need: 0, owned: number(r.stock[key] || 0, 0, 999999), resin: 20, impact };
                    goals.push(goal);
                }
                goal.need += count;
                if (!goal.characters.includes(name))
                    goal.characters.push(name);
                goal.impact = Math.max(goal.impact, impact);
            }
        }
    }
    for (const x of r.extras)
        if (r.people.includes(x.character))
            goals.push({
                id: x.id, kind: x.category, name: x.name, character: x.character, characters: [x.character], book: '', rar: '', day: x.day, where: x.where || coachPlace(x.category), need: x.need, owned: x.owned, resin: x.resin, impact: coachImpact(x.character)
            });
    // A manual Inventory Board target is a real target, even when its character is
    // not part of the 1–3-character Journey Book rotation. Those unmatched goals
    // affect material progress but do not replace Today's chosen characters.
    const grouped = new Map();
    for (const f of state.farm) {
        const item = MATERIAL_CATALOG_BY_ID.get(f.itemId) || MATERIAL_CATALOG_BY_NAME.get(f.material.toLowerCase());
        const key = item?.type === 'talent' && item.series && item.rank >= 2 && item.rank <= 4
            ? 'book:' + item.series + ':' + COACH_RARITIES[item.rank - 2] : '';
        const matching = key ? goals.find(g => g.id === key) : goals.find(g => g.kind !== 'books' && g.name.toLowerCase() === f.material.toLowerCase() && g.character.toLowerCase() === f.character.toLowerCase());
        if (matching) {
            const arr = grouped.get(matching.id) || [];
            arr.push(f);
            grouped.set(matching.id, arr);
            continue;
        }
        const book = item?.type === 'talent' ? item.series : '';
        const rar = item?.type === 'talent' ? COACH_RARITIES[item.rank - 2] : '';
        const farmKind = item?.type === 'talent' ? 'books' : (item?.type || 'other');
        const meta = book ? BOOKS[book] : null;
        const day = f.days !== 'any' ? f.days : (item?.day || 'any');
        const kind = farmKind === 'books' && (!book || !rar) ? 'other' : farmKind;
        goals.push({
            id: 'farm:' + f.id, kind, name: f.material, character: f.character, characters: [f.character], book: book || '', rar: rar || '', day, where: item?.where || (meta?.domain ? meta.domain + ' · ' + meta.region : coachPlace(kind)), need: f.target, owned: f.owned, resin: item?.resin ?? 0, impact: coachImpact(f.character), farmIds: [f.id], farmOnly: true, scheduleEligible: r.people.includes(f.character)
        });
    }
    // If a Inventory Board entry tracks a material the Journey Book already counts,
    // use the larger of the two targets, never their sum. The manual inventory
    // is the source of truth while the Inventory Board link exists.
    for (const g of goals) {
        const linked = grouped.get(g.id);
        if (!linked?.length)
            continue;
        g.need = Math.max(g.need, linked.reduce((total, f) => total + f.target, 0));
        g.owned = linked.reduce((total, f) => total + f.owned, 0);
        g.farmIds = linked.map(f => f.id);
    }
    return goals.map(g => ({ ...g, left: Math.max(0, g.need - g.owned), progress: g.need ? clamp(g.owned / g.need * 100, 0, 100) : 100 }));
};
const coachPlace = function (kind) { return ({
    boss: 'Character ascension boss', weekly: 'Weekly boss / Trounce Domain', local: 'Explore character region', weapon: 'Domain of Forgery', artifact: 'Artifact domain', mora: 'Ley Line Outcrop', enemy: 'Overworld enemy drops', other: 'Check Adventurer Handbook'
})[kind] || 'In-game map'; };
const coachImpact = function (name) {
    const ch = state.planner.characters.find(c => c.name === name), team = activeTeam(), teamFocus = team?.members.includes(name);
    // A planning heuristic, not a claim of exact combat DPS optimization.
    return (teamFocus ? 100 : 0) + ({ high: 65, medium: 35, low: 15 }[ch?.priority] || 35) + (ch ? Math.max(...Object.keys(ch.talents).map(k => Math.max(0, (ch.target[k] || 1) - (ch.talents[k] || 1)))) * 3 : 0);
};
const coachAvailable = function (g, date) {
    if (g.day === 'any')
        return true;
    if (g.day === 'weekly')
        return true; // user-defined weekly target; not a daily reset claim
    const rotation = dayRotation(date);
    return rotation === 'any' || g.day === rotation;
};
const coachScheduleGoals = function () {
    const goals = [];
    for (const name of state.roadmap.people) {
        const ch = state.planner.characters.find(c => c.name === name);
        const books = isTraveler(name)
            ? (() => {
                const el = (name.match(/^Traveler \(([^)]+)\)$/) || [])[1];
                return [...new Set([...(TRAVELER_BOOK_SETS[el] || []), ...(el === 'Geo' ? TRAVELER_BOOK_SETS.Anemo : [])])];
            })()
            : [ch ? getBook(ch) : CHARACTER_BOOK[name]];
        for (const book of books) {
            const meta = BOOKS[book];
            if (!meta)
                continue;
            goals.push({
                id: 'schedule:' + name + ':' + book, kind: 'books', book, rar: 'Guide', character: name, characters: [name],
                day: meta.rotation, where: meta.domain + ' · ' + meta.region, need: 1, owned: 0, left: 1, progress: 0,
                resin: 20, impact: coachImpact(name), scheduleOnly: true
            });
        }
    }
    return goals;
};
const coachActive = function (date = dayKey()) {
    const goals = state.roadmap.trackMaterials ? coachGoals().filter(g => g.left > 0 && (!g.farmOnly || (g.scheduleEligible && g.kind !== 'books'))) : coachScheduleGoals(), done = state.roadmap.done[date] || [], skipped = !!state.roadmap.skipped[date], dayCompleted = !!state.roadmap.dayDone?.[date];
    const tasks = goals.map(g => {
        const available = coachAvailable(g, date), completed = done.includes(g.id), inRotation = g.kind === 'books' || g.kind === 'weapon', weekdayBenefit = inRotation ? (available ? 230 : -170) : 0;
        const urgency = Math.min(55, Math.ceil(g.left / Math.max(1, g.need) * 45));
        const weeklyPenalty = g.day === 'weekly' && (parseKey(date).getUTCDay() !== 1) ? -10 : 0;
        const weight = weekdayBenefit + g.impact + urgency + weeklyPenalty + (available ? 20 : 0) - (completed ? 999 : 0) + (g.kind === 'books' ? 20 : 0) + (state.roadmap.preferred[date] === g.id ? 500 : 0);
        return { ...g, available, completed, weight };
    }).sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
    const conflict = coachFirstConflict(state.roadmap.people);
    const ready = conflict ? [] : tasks.filter(g => g.available && !g.completed);
    return { goals, tasks, ready, top: skipped || dayCompleted ? null : (ready[0] || null), skipped, dayCompleted, conflict };
};
const coachPlanStart = function () {
    const r = state.roadmap;
    return r.startedAt ? dayKey(r.startedAt) : r.started;
};
const coachDateLeft = function (date = dayKey()) {
    if (!state.roadmap.started)
        return { elapsed: 0, remaining: 0, total: 0 };
    const total = state.roadmap.weeks * 7, elapsed = Math.max(0, Math.floor((parseKey(date) - parseKey(coachPlanStart())) / DAY));
    return { elapsed, remaining: Math.max(0, total - elapsed), total };
};
const coachGoalText = function (g) {
    if (g.kind === 'books')
        return `${g.book} · ${g.rar}`;
    return g.name;
};
const coachActionText = function (g) {
    if (!g)
        return 'Enjoy exploring or co-op — you have no tracked farming target available right now.';
    if (g.kind === 'books')
        return `Farm ${g.book} ${g.rar} books for ${g.characters.join(' & ')}.`;
    return `Farm ${g.name} for ${g.character}.`;
};
const coachWhy = function (g) {
    if (!g)
        return 'Add a material goal or adjust a talent target if you still need upgrades.';
    const team = activeTeam(), activeMembers = g.characters.filter(n => team?.members.includes(n));
    let result = g.kind === 'books' ? `Talent book domain is open today; ${g.left} ${g.rar.toLowerCase()} still needed for your configured talent levels.` : `${g.left} left before your goal is reached.`;
    if (activeMembers.length)
        result += ` ${activeMembers.join(' and ')} ${activeMembers.length === 1 ? 'is' : 'are'} in your active team.`;
    return result;
};
const coachResinText = function (g) {
    if (!g)
        return 'Select a farming goal.';
    if (!g.resin)
        return 'No Resin required for this activity. Record only the items you actually collected.';
    const budget = state.roadmap.budget;
    const runs = Math.floor(budget / g.resin);
    return runs ? `With your ${budget}-Resin daily budget, plan up to ${runs} × ${g.resin}-Resin ${runs === 1 ? 'claim' : 'claims'} (${runs * g.resin} Resin). This is a budget, not your live in-game balance. Drop quantities vary.` : `Your planned budget of ${budget} Resin is below the ${g.resin}-Resin claim cost. Increase your daily budget or choose another activity.`;
};
const coachSetStock = function (id, amount) {
    const value = number(amount, 0, 999999), goal = coachGoals().find(g => g.id === id);
    if (id.startsWith('book:')) {
        const parts = id.split(':');
        state.roadmap.stock[parts[1] + ':' + parts[2]] = value;
    }
    else if (id.startsWith('farm:')) {
        const f = state.farm.find(x => 'farm:' + x.id === id);
        if (f)
            f.owned = value;
    }
    else {
        const x = state.roadmap.extras.find(y => y.id === id);
        if (x)
            x.owned = value;
    }
    // Allocate total owned across linked Inventory Board rows without creating a
    // second copy of the same inventory. One row can hold any excess stock.
    if (goal?.farmIds?.length && !id.startsWith('farm:')) {
        let remainder = value;
        for (let i = 0; i < goal.farmIds.length; i++) {
            const f = state.farm.find(x => x.id === goal.farmIds[i]);
            if (!f)
                continue;
            const allocated = i === goal.farmIds.length - 1 ? remainder : Math.min(remainder, f.target);
            f.owned = allocated;
            remainder = Math.max(0, remainder - allocated);
        }
    }
    save();
    renderFarm();
    renderRoadmap();
};
const renderCoachDoneToday = function () {
    const host = $('coach-done-today');
    if (!host)
        return;
    // One daily completion record, not one record for each random material rarity.
    if (!state.roadmap.dayDone?.[dayKey()]) {
        host.innerHTML = '';
        return;
    }
    host.innerHTML = `<div class="coach-done-row"><div class="coach-done-copy"><span aria-hidden="true">✓</span><span><strong>Farming finished today.</strong> Paimon reminders paused until the server reset.</span></div><button type="button" class="btn btn-outline coach-done-undo" data-coach-undo-day="${esc(dayKey())}" aria-label="Undo today's farming completion">↶ Undo</button></div>`;
};
const coachSetups = function () {
    const r = state.roadmap;
    $('coach-not-setup').hidden = !!r.started;
    $('coach-active').hidden = !r.started;
    if (!r.started)
        return;
    const cal = coachDateLeft(), progress = coachGoals(), need = progress.reduce((s, g) => s + g.need, 0), owned = progress.reduce((s, g) => s + Math.min(g.need, g.owned), 0), percent = need ? Math.round(100 * owned / need) : 100;
    $('coach-active').classList.toggle('tracking-off', !r.trackMaterials);
    $('coach-progress-block').hidden = !r.trackMaterials;
    $('coach-progress-percent').textContent = `${percent}%`;
    $('coach-progress-fill').style.width = percent + '%';
    $('coach-week-pill').textContent = `Week ${Math.min(r.weeks, Math.floor(cal.elapsed / 7) + 1)} of ${r.weeks}`;
    $('coach-goal-count').textContent = `${progress.filter(g => g.left > 0).length} material targets remaining · Includes Inventory Board`;
    const existingConflict = coachFirstConflict(r.people);
    $('coach-selected-people').innerHTML = r.people.map(n => `<span class="coach-chip">✦ ${esc(n)}</span>`).join('') + (existingConflict ? `<span class="coach-chip" style="border-color:#d38a73;color:#ffdccb" title="${esc(coachConflictText(existingConflict))}">⚠ Saved plan overlap — restart to resolve</span>` : '');
    const cur = coachActive(), top = cur.top;
    const empty = cur.dayCompleted ? 'You marked today’s farming session complete. Random drops do not need separate completion marks. Your next farming day will start after the server reset.' : cur.skipped ? 'You chose a free day. Your schedule will pick up tomorrow.' : progress.length === 0 ? (r.trackMaterials ? 'Set your talent goals or add a custom material goal.' : 'No character talent-book schedule was found for your selected characters.') : progress.every(g => g.left === 0) ? 'All tracked materials collected! Upgrade the talents in-game and update the talent levels in Build Planner.' : 'No more available materials to farm today. Try another day or add a flexible material goal.';
    $('coach-today').innerHTML = existingConflict ? `<div class="coach-rest"><strong>Farming plan needs updating</strong><p>${esc(coachConflictText(existingConflict))}</p><button type="button" class="btn btn-outline" data-plan-edit="characters">Change character</button></div>` : top ? coachTodayDetailHtml(top, progress) : `<div class="coach-rest"><div style="font-size:35px">☕</div><strong>${cur.dayCompleted ? '✓ Farming finished for today' : cur.skipped ? 'Enjoy your co-op day!' : 'No urgent farming task'}</strong><p>${esc(empty)}</p>${cur.skipped ? '<button type="button" class="btn btn-outline" data-coach-unskip>Resume farming today</button>' : ''}</div>`;
    renderCoachDoneToday();
    const queued = cur.ready.slice(top ? 1 : 0, 4);
    $('coach-next').innerHTML = queued.length ? queued.map(g => `<article class="coach-next-row"><div><strong>${esc(g.character)} · ${esc(coachGoalText(g))}</strong><small>${esc(g.where)} · ${fmt(g.left)} remaining</small></div><button class="btn btn-outline" type="button" data-coach-choose="${esc(g.id)}">Pick this</button></article>`).join('') : '<p class="coach-soft">No other open goals today. Update your materials or enjoy the game.</p>';
    renderCoachStock(progress);
    renderCoachCalendar();
    renderCoachExplain();
    renderCoachTalents();
};
const renderCoachStock = function (goals) {
    const sorted = goals.slice().sort((a, b) => b.left - a.left || b.impact - a.impact);
    const host = $('coach-stock');
    if (!host)
        return;
    host.innerHTML = sorted.length ? sorted.map(g => `<article class="coach-stock-row"><div class="coach-stock-top"><span class="coach-stock-icon has-material-photo">${g.kind === 'books' ? COACH_EMOJI[g.kind] || '📖' : materialItemImgTag(g.name || coachGoalText(g))}</span><div><strong>${esc(coachGoalText(g))}</strong><small>${esc(g.characters.join(' + '))} · ${esc(g.where)}</small></div>${g.kind !== 'books' ? `<button type="button" class="coach-delete" data-coach-delete="${esc(g.id)}" aria-label="Delete goal">✕</button>` : ''}</div><div class="coach-stock-bottom"><div class="coach-mini-progress"><span style="width:${g.progress}%"></span></div><label>Owned <input class="coach-num" type="number" min="0" max="999999" value="${g.owned}" data-coach-owned="${esc(g.id)}" aria-label="Owned ${esc(coachGoalText(g))}"></label><span>of <b>${fmt(g.need)}</b></span></div></article>`).join('') : '<p class="coach-soft">No material goals yet. Add characters and update talent levels to generate book quantities, or add a manual goal.</p>';
};
const renderCoachTalents = function () {
    const host = $('coach-talent-cards');
    if (!host)
        return;
    host.innerHTML = state.roadmap.people.map(name => {
        const ch = state.planner.characters.find(x => x.name === name);
        if (!ch)
            return '';
        const book = getBook(ch), info = BOOKS[book];
        return `<article class="coach-talent-card"><div class="coach-talent-person"><strong>${esc(name)}</strong><small>${isTraveler(name) ? 'Mixed books · alternates with talent level' : info ? esc(book) + ' books · ' + esc(dayLabel(info.rotation)) : 'Choose talent book in Build Planner'}</small></div><div class="coach-talent-row">${[['n', 'Normal'], ['s', 'Skill'], ['b', 'Burst']].map(([k, label]) => `<label>${label}<div class="coach-talent-inputs"><input type="number" min="1" max="10" inputmode="numeric" value="${ch.talents[k]}" data-coach-current="${esc(name)}" data-kind="${k}" aria-label="${esc(name)} ${label} current"><span>→</span><input type="number" min="1" max="10" inputmode="numeric" value="${ch.target[k]}" data-coach-target="${esc(name)}" data-kind="${k}" aria-label="${esc(name)} ${label} goal"></div></label>`).join('')}</div></article>`;
    }).join('');
};
const coachSetTalent = function (name, kind, field, newValue) {
    const ch = state.planner.characters.find(x => x.name === name);
    if (!ch || !['n', 's', 'b'].includes(kind))
        return;
    const newLevel = number(newValue, 1, 10), oldLevel = ch.talents[kind];
    if (field === 'current') {
        if (newLevel > oldLevel)
            consumeBooksForUpgrade(ch, kind, oldLevel, newLevel);
        ch.talents[kind] = newLevel;
    }
    else
        ch.target[kind] = newLevel;
    save();
    renderAll();
    toast(field === 'current' ? 'Talent level updated. Recorded books spent were deducted.' : 'Talent goal updated. Farming needs recalculated.');
};
const coachCalendarName = function (name) {
    if (!name)
        return 'Flex';
    if (name === 'Raiden Shogun')
        return 'Raiden';
    if (name.startsWith('Traveler ('))
        return 'Tr. ' + name.slice(10, -1);
    return name.length <= 10 ? name : name.trim().split(/\s+/).slice(-1)[0];
};
const renderCoachCalendar = function () {
    const r = state.roadmap, today = dayKey(), start = coachPlanStart(), end = advanceKey(start, r.weeks * 7 - 1);
    const monday = advanceKey(today, -((parseKey(today).getUTCDay() + 6) % 7));
    const mobile = matchMedia('(max-width:800px)').matches, visibleDays = mobile ? 14 : 28;
    const lastVisible = advanceKey(monday, visibleDays - 1), host = $('coach-calendar');
    const firstDate = parseKey(monday), lastDate = parseKey(lastVisible);
    const sameMonth = firstDate.getUTCMonth() === lastDate.getUTCMonth() && firstDate.getUTCFullYear() === lastDate.getUTCFullYear();
    $('coach-calendar-month').textContent = sameMonth
        ? firstDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        : `${firstDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })} – ${lastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })}`;
    $('coach-week-range').textContent = `${r.weeks}-week plan`;
    const headings = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(label => `<span class="coach-calendar-weekday" aria-hidden="true">${label}</span>`).join('');
    const keyEntries = new Map();
    const cards = Array.from({ length: visibleDays }, (_, i) => {
        const day = advanceKey(monday, i), weekday = parseKey(day).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), dates = parseKey(day).toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
        const isPassed = day < today, unassigned = isPassed || day < start || day > end;
        if (unassigned)
            return `<div class="coach-calendar-day is-unassigned ${day === today ? 'is-today' : ''}" data-calendar-date="${day}" aria-label="${esc(weekday + ' ' + dates + ': ' + (isPassed ? 'Past date' : 'Outside farming plan'))}"><span><i class="coach-calendar-shortweekday">${weekday}</i><b>${dates}</b></span><strong>---</strong></div>`;
        const offset = Math.max(0, Math.round((parseKey(day) - parseKey(start)) / DAY));
        const todayPlan = coachActive(day), items = todayPlan.ready;
        const recommendation = items.length ? items[Math.floor(offset / 7) % Math.min(2, items.length)] : null;
        const isSkipped = !!r.skipped[day], isCompleted = !!r.dayDone?.[day];
        const portrait = mobile && recommendation && !isSkipped && !isCompleted;
        if (portrait) {
            const name = recommendation.character, book = recommendation.kind === 'books' ? recommendation.book : 'Any';
            keyEntries.set(name + '|' + book, { name, book });
        }
        return `<button class="coach-calendar-day ${day === today ? 'is-today' : ''} ${isCompleted ? 'is-complete' : ''} ${portrait ? 'has-calendar-portrait' : ''}" type="button" data-calendar-date="${day}" data-coach-date="${day}" title="View farming details for ${esc(day)} · ${esc(recommendation?.character || 'Open day')}" aria-label="${esc(weekday + ' ' + dates + ': ' + (isCompleted ? 'Farming completed' : recommendation?.character || 'Open day'))}"><span><i class="coach-calendar-shortweekday">${weekday}</i><b>${dates}</b></span>${portrait ? `<span class="calendar-portrait" aria-hidden="true">${coachAvatarHtml(recommendation.character)}</span>` : ''}<strong>${isCompleted ? '✓ Done' : isSkipped ? 'Free' : recommendation ? esc(mobile ? recommendation.character : coachCalendarName(recommendation.character)) : 'Flex'}</strong><small>${recommendation ? esc(recommendation.kind === 'books' ? recommendation.book : 'Any') : 'Any'}</small></button>`;
    });
    host.innerHTML = headings + Array.from({ length: visibleDays / 7 }, (_, i) => `<div class="coach-calendar-week">${cards.slice(i * 7, i * 7 + 7).join('')}</div>`).join('');
    $('calendar-character-key').innerHTML = [...keyEntries.values()].map(({ name, book }) => `<div class="calendar-key-item">${coachAvatarHtml(name)}<span class="calendar-key-copy"><strong>${esc(name)}</strong><small>${esc(book)}</small></span></div>`).join('');
};
const coachCalendarGoalForDate = function (date) {
    const r = state.roadmap, dayState = coachActive(date), options = dayState.ready;
    if (!options.length || dayState.skipped)
        return null;
    const dayIndex = Math.max(0, Math.round((parseKey(date) - parseKey(coachPlanStart())) / DAY));
    return options[Math.floor(dayIndex / 7) % Math.min(2, options.length)] || null;
};
const coachModalTalentLevels = function (name) {
    const ch = state.planner.characters.find(c => c.name === name);
    if (!ch)
        return '';
    const names = { n: 'Normal Attack', s: 'Skill', b: 'Burst' };
    return `<div class="coach-modal-talent">${Object.entries(names).map(([k, label]) => `${label}: <b>${number(ch.talents?.[k] ?? 1, 1, 10)}</b> → <b>${number(ch.target?.[k] ?? 1, 1, 10)}</b>`).join(' &nbsp;·&nbsp; ')}</div>`;
};
const coachModalBookArt = function (book, goals) {
    const names = talentOfficialNames(book), ids = talentOfficialKeys(book), tiers = ['Teachings', 'Guide', 'Philosophies'];
    return `<div class="coach-modal-books">${names.map((label, i) => {
        const id = ids[i], goal = goals.find(g => g.rar === tiers[i]), left = goal ? goal.left : 0;
        return `<div class="coach-modal-book"><span class="coach-modal-book-icon" role="img" aria-label="${esc(label)} item icon"><span class="material-entry-fallback">${i + 2}★</span>${Number.isInteger(id) ? `<img src="${materialBookIconUrl(id)}" alt="" loading="eager" decoding="async" data-material-id="${id}" data-material-stage="0" data-material-icon="${esc(label)}">` : ''}</span><strong>${esc(label)}</strong><small>${state.roadmap.trackMaterials ? (left ? `${fmt(left)} remaining` : 'No current target') : 'Domain reward'}</small></div>`;
    }).join('')}</div>`;
};
const coachTodayDetailHtml = function (top, progress) {
    if (!top)
        return '';
    const element = CHARACTER_ELEMENT[top.character] || 'Unknown';
    const related = top.kind === 'books'
        ? progress.filter(g => g.kind === 'books' && g.book === top.book && g.characters.includes(top.character))
        : [top];
    const meta = top.kind === 'books' ? BOOKS[top.book] : null;
    const summary = top.kind === 'books'
        ? `<div class="coach-modal-farm"><h4 class="coach-modal-farm-title">${esc(top.book)} talent books</h4><p class="coach-modal-farm-location">${esc(meta?.domain || top.where)} · ${esc(meta?.region || 'Teyvat')} · ${esc(rotateLabel(meta?.rotation))} / Sunday</p>${coachModalBookArt(top.book, related)}</div>`
        : `<div class="coach-modal-farm"><h4 class="coach-modal-farm-title">${esc(top.name)}</h4><p class="coach-modal-farm-location">${esc(top.where)}${state.roadmap.trackMaterials ? ' · ' + fmt(top.left) + ' remaining' : ''}</p><div class="coach-modal-other"><span class="coach-modal-other-icon has-material-photo" aria-hidden="true">${materialItemImgTag(top.name)}</span><div><strong>${esc(top.name || 'Material')}</strong><small>${esc(top.where)}${state.roadmap.trackMaterials ? ' · ' + fmt(top.left) + ' remaining' : ''}</small></div></div></div>`;
    return `<div class="coach-today-rich"><div class="coach-modal-person"><div class="coach-modal-person-details">${coachAvatarHtml(top.character)}<div class="coach-modal-person-text"><span class="coach-modal-priority">✦ Recommended for this date</span><h3>${esc(top.character)}</h3><p>${esc(element)} character${top.kind === 'books' ? ` · ${esc(top.book)} talent books` : ''}</p></div></div></div>${summary}<div class="coach-mini-tools"><button type="button" class="btn btn-outline" data-coach-complete title="Finish today's farming session, regardless of which random materials dropped">Done for today</button><button type="button" class="btn btn-secondary" data-coach-skip-today>Free day / co-op</button></div></div>`;
};
const openCoachDayDialog = function (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !state.roadmap.started)
        return;
    const dialog = $('coach-day-dialog'), all = coachActive(date), choice = coachCalendarGoalForDate(date);
    const label = parseKey(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    $('coach-day-dialog-title').textContent = label;
    const info = dayRotation(date), rotationDays = { mon: 'Monday / Thursday', tue: 'Tuesday / Friday', wed: 'Wednesday / Saturday' };
    $('coach-day-dialog-subtitle').textContent = all.dayCompleted ? 'Farming marked complete for this day · materials shown for reference' : all.skipped ? 'Marked as a free / co-op day · available materials shown for reference' : (info === 'any' ? 'Sunday · all talent domains available' : `${rotationDays[info]} talent domain rotation`);
    const groups = new Map();
    for (const g of all.ready) {
        for (const name of (g.characters?.length ? g.characters : [g.character])) {
            const key = name + '|' + (g.kind === 'books' ? g.book : 'custom:' + g.id);
            if (!groups.has(key))
                groups.set(key, { name, book: g.kind === 'books' ? g.book : '', goals: [] });
            groups.get(key).goals.push(g);
        }
    }
    const items = [...groups.values()].sort((a, b) => {
        const ap = choice && a.goals.some(g => g.id === choice.id && a.name === (choice.character || a.name));
        const bp = choice && b.goals.some(g => g.id === choice.id && b.name === (choice.character || b.name));
        return Number(bp) - Number(ap) || a.name.localeCompare(b.name) || a.book.localeCompare(b.book);
    });
    let body = '';
    if (all.skipped)
        body += '<p class="coach-modal-note">You marked this as a free day. The materials below are still available according to the regular domain schedule.</p>';
    if (!items.length) {
        body += '<div class="coach-modal-empty">No outstanding material goals are scheduled for this date. You can check another day or update your goals in Inventory Board or Build Planner.</div>';
    }
    else {
        body += items.map((g, index) => {
            const element = CHARACTER_ELEMENT[g.name] || 'Unknown', primary = index === 0 && !all.skipped;
            const meta = g.book ? BOOKS[g.book] : null;
            const main = g.goals[0];
            return `<section class="coach-modal-group ${primary ? 'primary' : ''}">
    <div class="coach-modal-person">${coachAvatarHtml(g.name)}<div class="coach-modal-person-details">${primary ? '<span class="coach-modal-priority">✦ Recommended for this date</span>' : ''}<h3>${esc(g.name)}</h3><p>${esc(element)} character${g.book ? ' · ' + esc(g.book) + ' talent books' : ''}</p></div></div>
    ${state.roadmap.trackMaterials ? coachModalTalentLevels(g.name) : ''}
    <div class="coach-modal-farm">${g.book
                ? `<h4 class="coach-modal-farm-title">${esc(g.book)} talent books</h4><p class="coach-modal-farm-location">${esc(meta?.domain || main.where)} · ${esc(meta?.region || 'Teyvat')} · ${esc(rotateLabel(meta?.rotation))} / Sunday</p>${coachModalBookArt(g.book, g.goals)}`
                : `<h4 class="coach-modal-farm-title">Other farming material</h4>${g.goals.map(x => `<div class="coach-modal-other"><span class="coach-modal-other-icon has-material-photo" aria-hidden="true">${materialItemImgTag(x.name)}</span><div><strong>${esc(x.name || 'Material')}</strong><small>${esc(x.where)}${state.roadmap.trackMaterials ? ' · ' + fmt(x.left) + ' remaining' : ''}</small></div></div>`).join('')}`}</div>
   </section>`;
        }).join('');
    }
    $('coach-day-dialog-content').innerHTML = body;
    if (!dialog.open)
        dialog.showModal();
    $('coach-day-dialog-done').focus();
};
const rotateLabel = function (rotation) { return ({ mon: 'Mon / Thu', tue: 'Tue / Fri', wed: 'Wed / Sat' })[rotation] || 'Weekly schedule'; };
const renderCoachExplain = function () {
    const r = state.roadmap, people = r.people.map(n => ({ name: n, score: coachImpact(n) })).sort((a, b) => b.score - a.score), top = people[0];
    $('coach-impact').innerHTML = top ? `<strong>${esc(top.name)}</strong><p>${esc(top.name)} is currently first by your selected team and manual priority settings. This is a planning heuristic, <em>not</em> a calculated DPS ranking. Update your active team or character priorities in Build Planner to change the result.</p>` : '<p>Set up characters to see your team improvement priority.</p>';
};
let renderRoadmap = function () {
    if (!$('page-roadmap'))
        return;
    $('coach-server').textContent = state.region === 'TW' ? 'TW / HK / MO' : state.region;
    $('coach-setup-weeks').value = String(state.roadmap.weeks);
    coachSetups();
    const r = state.roadmap;
    if (r.started) {
        $('coach-edit-weeks').value = String(r.weeks);
        $('coach-edit-budget').value = String(r.budget);
    }
    renderCoachHome();
};
const renderCoachHome = function () {
    const target = $('coach-home-card');
    if (!target)
        return;
    const r = state.roadmap;
    if (!r.started) {
        target.innerHTML = `<div class="coach-home-empty"><strong>Make your 3–4 week plan</strong><p>Choose 1–3 characters and get daily assignments based on your materials and talent book rotation.</p><button class="btn btn-mint" data-go="roadmap">Start farming plan →</button></div>`;
        return;
    }
    const top = coachActive().top;
    if (!top) {
        target.innerHTML = `<div class="coach-home-empty"><strong>Your next move</strong><p>${r.dayDone?.[dayKey()] ? 'Farming complete for today. Your next session starts after the 4 AM server reset.' : r.skipped[dayKey()] ? 'Free day — enjoy co-op today.' : 'No open tracked material goals left today.'}</p><button class="btn btn-mint" data-go="roadmap">Open farming plan →</button></div>`;
        return;
    }
    target.innerHTML = `<div class="coach-home-empty"><span class="coach-overline">YOUR NEXT MOVE · ${esc(fmtDate(dayKey()))}</span><h2>${esc(top.character)} · ${esc(coachGoalText(top))}</h2><p>${esc(coachActionText(top))} ${esc(top.where)}. ${fmt(top.left)} left.</p><button class="btn btn-mint" data-go="roadmap">Follow today's plan →</button></div>`;
};
// Add new plan members without modifying existing talent goals.
const ensureJourneyCharacters = function (names) {
    for (const name of names) {
        let ch = state.planner.characters.find(x => x.name === name);
        if (!ch) {
            const h = ({ Normal: 'n', Skill: 's', Burst: 'b' })[FOCUS_HINTS[name]] || 'b';
            ch = { name, priority: 'high', focus: h, talents: { n: 1, s: 1, b: 1 }, target: { n: 1, s: 1, b: 1 }, book: CHARACTER_BOOK[name] || '' };
            ch.target[h] = 8;
            state.planner.characters.push(ch);
        }
    }
};
const coachStart = function (payload) {
    const selected = payload.names.map(resolveName).filter(Boolean), unique = Array.from(new Set(selected));
    if (unique.length < 1 || unique.length > 3) {
        toast('Choose 1–3 characters for your farming plan.');
        return;
    }
    const conflict = coachFirstConflict(unique);
    if (conflict) {
        const reason = coachConflictText(conflict);
        coachSelectionNote(reason, true);
        toast(reason);
        return;
    }
    const unknown = unique.find(n => !CHARACTER_BOOK[n] && !isTraveler(n) && !state.planner.characters.some(x => x.name === n && getBook(x)));
    if (unknown) {
        toast('Book not known for ' + unknown + '. Add its book in Build Planner first.');
        return;
    }
    ensureJourneyCharacters(unique);
    state.roadmap = { ...COACH_DEFAULT(), trackMaterials: state.roadmap.trackMaterials === true, weeks: payload.weeks, started: dayKey(), startedAt: Date.now(), budget: payload.budget, people: unique };
    clearOtherServerPlanHistory();
    save();
    renderAll();
    toast('Your personalized farming plan is ready. Update current talents and inventory for accurate goals.');
};
const coachMarkDone = function () {
    const today = dayKey();
    if (state.roadmap.dayDone?.[today] || !coachActive(today).top)
        return; // One click per server day.
    state.roadmap.dayDone[today] = true;
    save();
    reminderFinishToday();
    renderAll();
    toastDoneWithUndo(today);
};
const coachUndoDone = function (date = dayKey()) {
    const today = dayKey();
    if (date !== today || !state.roadmap.dayDone?.[today])
        return;
    delete state.roadmap.dayDone[today];
    save();
    reminderResumeIfUndone();
    renderAll();
    toast(reminderDayQuiet(today) ? 'Undone. Paimon stays quiet because your other plan is marked done.' : 'Undone. Today’s farming recommendation and reminders are available again.');
};
// Bind controls / initialize this section in original startup order.
const initializeJourneySection23 = () => {
    matchMedia('(max-width:800px)').addEventListener('change', () => renderRoadmap());
};
// Bind controls / initialize this section in original startup order.
const initializeJourneySection24 = () => {
    $('coach-day-dialog-done').addEventListener('click', () => coachDateModal.close());
    coachDateModal.addEventListener('click', e => {
        const box = coachDateModal.getBoundingClientRect();
        if (e.target === coachDateModal && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom))
            coachDateModal.close();
    });
    $('coach-setup-form').addEventListener('submit', e => {
        e.preventDefault();
        coachStart({ names: pickerState.coach.selected.slice(), weeks: Number($('coach-setup-weeks').value), budget: number($('coach-setup-budget').value, 20, 200) });
    });
};
// Show only the chosen 1–3 characters in the add-goal dropdown.
const coachRenderOptions = function () {
    const select = $('coach-extra-character');
    if (!select)
        return;
    const current = select.value;
    select.innerHTML = state.roadmap.people.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
    if (state.roadmap.people.includes(current))
        select.value = current;
};
// Bind controls / initialize this section in original startup order.
const initializeJourneySection26 = () => {
    document.addEventListener('click', e => {
        if (e.target.closest('[data-coach-fix-overlap]')) {
            page('settings');
            return;
        }
        const timedUndo = e.target.closest('[data-coach-toast-undo]');
        if (timedUndo) {
            coachUndoDone(timedUndo.dataset.coachToastUndo);
            return;
        }
        const done = e.target.closest('[data-coach-complete]');
        if (done) {
            coachMarkDone();
            return;
        }
        const undo = e.target.closest('[data-coach-undo-day]');
        if (undo) {
            coachUndoDone(undo.dataset.coachUndoDay);
            return;
        }
        const skip = e.target.closest('[data-coach-skip-today]');
        if (skip) {
            state.roadmap.skipped[dayKey()] = true;
            save();
            renderAll();
            toast('Free day! The plan carries on tomorrow.');
            return;
        }
        const unskip = e.target.closest('[data-coach-unskip]');
        if (unskip) {
            delete state.roadmap.skipped[dayKey()];
            save();
            renderAll();
            return;
        }
        const del = e.target.closest('[data-coach-delete]');
        if (del) {
            state.roadmap.extras = state.roadmap.extras.filter(x => x.id !== del.dataset.coachDelete);
            save();
            renderAll();
            return;
        }
        const pick = e.target.closest('[data-coach-choose]');
        if (pick) {
            const g = coachActive().ready.find(x => x.id === pick.dataset.coachChoose);
            if (g) {
                state.roadmap.preferred[dayKey()] = g.id;
                save();
                renderAll();
                toast('Showing your chosen task. Other goals are still unfinished.');
            }
            return;
        }
        const dat = e.target.closest('[data-coach-date]');
        if (dat) {
            openCoachDayDialog(dat.dataset.coachDate);
            return;
        }
    });
    document.addEventListener('change', e => {
        const current = e.target.closest('[data-coach-current]');
        if (current) {
            coachSetTalent(current.dataset.coachCurrent, current.dataset.kind, 'current', current.value);
            return;
        }
        const target = e.target.closest('[data-coach-target]');
        if (target) {
            coachSetTalent(target.dataset.coachTarget, target.dataset.kind, 'target', target.value);
            return;
        }
        const stock = e.target.closest('[data-coach-owned]');
        if (stock) {
            coachSetStock(stock.dataset.coachOwned, stock.value);
            toast('Inventory updated. Recommendations recalculated.');
            return;
        }
    });
};
// Bind controls / initialize this section in original startup order.
const initializeJourneySection27 = () => {
    renderRoadmap = function () {
        previousRenderRoadmap();
        coachRenderOptions();
        renderWeaponJourney();
    };
};
