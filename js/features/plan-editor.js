// Edit active plans without changing their start dates or completion history.
'use strict';
let planEditSession = null;
const planEditModes = ['characters', 'weapons'];
const planEditAvailable = mode => mode === 'weapons' ? !!state.weaponJourney.startedAt : !!state.roadmap.started;
const planEditNames = mode => mode === 'weapons' ? weaponDraft.map(w => w.name) : pickerState.coach.selected;
const planEditChanged = mode => planEditSession?.entries[mode] && JSON.stringify(planEditNames(mode)) !== JSON.stringify(planEditSession.entries[mode].originalNames);
const planEditSelectionValid = mode => {
    if (mode === 'weapons') {
        const rotations = weaponDraft.map(w => weaponPlanMeta(w)?.rotation);
        return weaponDraft.length >= 1 && weaponDraft.length <= 3 && rotations.every(Boolean) && new Set(rotations).size === rotations.length;
    }
    const names = pickerState.coach.selected;
    return ((names.length >= 2 && names.length <= 3) || (names.length === 1 && isTraveler(names[0]))) && !coachFirstConflict(names);
};
const refreshPlanEditControls = () => {
    if (!planEditSession || planEditSession.initializing) return;
    const mode = planEditSession.mode, changed = planEditModes.filter(planEditChanged), invalid = changed.find(m => !planEditSelectionValid(m));
    $('plan-edit-save').disabled = !!invalid || !changed.length;
    $('plan-edit-status').textContent = invalid ? (invalid === 'weapons' ? 'Weapons: choose 1–3 with different domain days.' : 'Characters: choose 2–3 on different days, or one Traveler.') : !planEditAvailable(mode) && !changed.length ? 'No active plan on this tab.' : changed.length === 2 ? 'Save both selections · plan dates and progress stay unchanged.' : changed.length ? 'Save ' + changed[0] + ' · plan dates and progress stay unchanged.' : 'Tap a checked portrait to remove it.';
    document.querySelectorAll('[data-plan-edit-mode]').forEach(b => b.classList.toggle('has-changes', changed.includes(b.dataset.planEditMode)));
};
const switchPlanEditor = mode => {
    if (!planEditSession || !planEditModes.includes(mode)) return;
    planEditSession.mode = mode;
    $('plan-edit-title').textContent = mode === 'weapons' ? 'Change weapon' : 'Change character';
    planEditModes.forEach(m => { $('plan-edit-' + m).hidden = m !== mode || !planEditAvailable(m); });
    document.querySelectorAll('[data-plan-edit-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.planEditMode === mode)));
    const empty = $('plan-edit-empty');
    empty.hidden = planEditAvailable(mode);
    empty.textContent = empty.hidden ? '' : 'No active ' + mode + ' plan yet. Start one from Journey Book.';
    if (mode === 'weapons' && planEditAvailable(mode)) void refreshWeaponPlanCatalog();
    refreshPlanEditControls();
};
const openPlanEditor = mode => {
    if (planEditSession || !planEditModes.includes(mode) || !planEditAvailable(mode)) return;
    planEditSession = {mode, entries:{}, initializing:true, trigger:document.activeElement};
    for (const m of planEditModes) {
        if (!planEditAvailable(m)) continue;
        const weapons = m === 'weapons', prefix = weapons ? 'weapon' : 'coach';
        const form = $(prefix + '-setup-form'), shell = form.querySelector('.picker-shell'), search = $(prefix + '-pick-search'), grid = $(prefix + '-pick-grid');
        const original = weapons ? state.weaponJourney.selected.slice() : state.roadmap.people.slice();
        planEditSession.entries[m] = {shell, form, next:shell.nextSibling, search:search.value, scroll:grid.scrollTop, draft:weapons ? weaponDraft.slice() : pickerState.coach.selected.slice(), filter:weapons ? weaponPlanRarity : pickerState.coach.element, query:weapons ? '' : pickerState.coach.query, originalNames:weapons ? original.map(w=>w.name) : original.slice()};
        $('plan-edit-' + m).append(shell); search.value = '';
        if (weapons) { weaponDraft = original; weaponPlanRarity = 0; renderWeaponPicker(); }
        else { pickerState.coach.selected = original; pickerState.coach.query = ''; pickerState.coach.element = 'All'; coachSelectionNote(); drawPicker('coach'); }
        grid.scrollTop = 0;
    }
    planEditSession.initializing = false;
    switchPlanEditor(mode);
    $('plan-edit-dialog').showModal(); $('plan-edit-close').focus({preventScroll:true});
};
const restorePlanPicker = () => {
    const session = planEditSession;
    if (!session) return;
    planEditSession = null;
    for (const [mode, entry] of Object.entries(session.entries)) {
        const weapons = mode === 'weapons', prefix = weapons ? 'weapon' : 'coach';
        entry.form.insertBefore(entry.shell, entry.next); $(prefix + '-pick-search').value = entry.search;
        if (weapons) { weaponDraft = entry.draft; weaponPlanRarity = entry.filter; renderWeaponPicker(); }
        else { pickerState.coach.selected = entry.draft; pickerState.coach.element = entry.filter; pickerState.coach.query = entry.query; coachSelectionNote(); drawPicker('coach'); }
        $(prefix+'-pick-grid').scrollTop = entry.scroll;
    }
    return session.trigger;
};
const savePlanEditor = () => {
    if (!planEditSession) return;
    const changed = planEditModes.filter(planEditChanged);
    if (!changed.length || changed.some(m=>!planEditSelectionValid(m))) return;
    if (changed.includes('characters')) { const names = pickerState.coach.selected.slice(); ensureJourneyCharacters(names); state.roadmap.people = names; }
    if (changed.includes('weapons')) state.weaponJourney.selected = weaponDraft.slice();
    restorePlanPicker(); $('plan-edit-dialog').close(); save(); renderAll(); void ntfySync();
    $('coach-today').querySelector('[data-plan-edit]')?.focus({preventScroll:true}); toast(changed.length === 2 ? 'Both farming selections updated.' : 'Farming selection updated. Same plan.');
};
const renderPlanEditButton = () => {
    if ($('coach-active').hidden) return;
    const host = $('coach-today'); if (host.querySelector('[data-plan-edit]')) return;
    const mode = state.weaponJourney.mode, button = document.createElement('button');
    button.type = 'button'; button.className = 'btn btn-outline plan-edit-trigger'; button.dataset.planEdit = mode;
    button.setAttribute('aria-haspopup','dialog'); button.setAttribute('aria-controls','plan-edit-dialog');
    button.textContent = mode === 'weapons' ? 'Change weapon' : 'Change character';
    const actions = host.querySelector('.coach-mini-tools'); (actions || host.querySelector('.coach-rest') || host).append(button);
    if (actions) actions.classList.add('plan-edit-tools');
};
const initializePlanEditor = () => {
    const previous = renderRoadmap; renderRoadmap = () => { previous(); renderPlanEditButton(); };
    const dialog = $('plan-edit-dialog');
    const cancel = () => { const trigger=restorePlanPicker(); dialog.close(); trigger?.focus({preventScroll:true}); };
    $('plan-edit-close').addEventListener('click',cancel); $('plan-edit-cancel').addEventListener('click',cancel); $('plan-edit-save').addEventListener('click',savePlanEditor);
    dialog.addEventListener('close',restorePlanPicker); dialog.addEventListener('cancel',e=>{e.preventDefault();cancel();});
    let backdrop=false;
    const outside=e=>{const r=dialog.getBoundingClientRect();return e.target===dialog&&(e.clientX<r.left||e.clientX>=r.right||e.clientY<r.top||e.clientY>=r.bottom);};
    dialog.addEventListener('pointerdown',e=>{backdrop=outside(e);}); dialog.addEventListener('pointercancel',()=>{backdrop=false;}); dialog.addEventListener('click',e=>{if(backdrop&&outside(e))cancel();backdrop=false;});
    document.addEventListener('click',e=>{const button=e.target.closest('[data-plan-edit]');if(button)openPlanEditor(button.dataset.planEdit);const tab=e.target.closest('[data-plan-edit-mode]');if(tab)switchPlanEditor(tab.dataset.planEditMode);});
};
