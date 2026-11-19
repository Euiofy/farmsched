// Teyvat Companion | core / navigation
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const queueNativeSync = function () {
    clearTimeout(nativeTimer);
    nativeTimer = setTimeout(nativeSync, 180);
};
const toast = function (message) {
    const el = $('toast');
    clearTimeout(toastTimer);
    el.classList.remove('has-action');
    el.textContent = message;
    el.classList.add('show');
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
};
const toastDoneWithUndo = function (date) {
    const el = $('toast');
    clearTimeout(toastTimer);
    el.classList.add('has-action');
    el.innerHTML = `<div class="toast-action-layout"><span class="toast-action-message"><strong>Farming finished for today ✓</strong><br>Daily session marked done. Material counts stay unchanged.</span><button type="button" class="toast-action-undo" data-coach-toast-undo="${esc(date)}" aria-label="Undo today's farming completion"><span>↶ Undo</span><span class="toast-action-timer" aria-hidden="true"></span></button></div>`;
    el.classList.add('show');
    toastTimer = setTimeout(() => { el.classList.remove('show', 'has-action'); }, 5000);
};
let farmEntryFrame = 0;
const cancelFarmEntry = function () {
    cancelAnimationFrame(farmEntryFrame);
    farmEntryFrame = 0;
    $('page-farming').classList.remove('is-preparing-entry', 'is-entering');
};
const startFarmEntry = function () {
    farmEntryFrame = requestAnimationFrame(() => {
        farmEntryFrame = requestAnimationFrame(() => {
            farmEntryFrame = 0;
            if (currentPage !== 'farming') return;
            $('page-farming').classList.remove('is-preparing-entry');
            $('page-farming').classList.add('is-entering');
        });
    });
};
const page = function (name) {
    if (name === 'overview')
        name = 'roadmap';
    if (name === 'profile')
        name = 'settings';
    if (!['settings', 'materials', 'farming', 'planner', 'roadmap', 'about'].includes(name))
        return;
    const enteringPage = currentPage !== name;
    if (name !== 'planner') $('page-planner').classList.remove('is-entering');
    if (name !== 'farming' || enteringPage) cancelFarmEntry();
    if (name === 'farming' && enteringPage) $('page-farming').classList.add('is-preparing-entry');
    currentPage = name;
    document.querySelector('.about-footer-link').hidden = name === 'about';
    $('about-footer-separator').hidden = name === 'about';
    document.querySelectorAll('.page').forEach(el => el.classList.toggle('active', el.id === 'page-' + name));
    document.querySelectorAll('.nav-btn').forEach(el => {
        const active = el.dataset.go === name;
        el.classList.toggle('active', active);
        if (active)
            el.setAttribute('aria-current', 'page');
        else
            el.removeAttribute('aria-current');
    });
    document.querySelectorAll('.android-bottom-nav button').forEach(el => {
        const active = el.dataset.go === name;
        el.classList.toggle('active', active);
        if (active)
            el.setAttribute('aria-current', 'page');
        else
            el.removeAttribute('aria-current');
    });
    $('crumb').textContent = { overview: 'Overview', settings: 'Settings', materials: 'Material Schedule', farming: 'Inventory Board', planner: 'Build Planner', roadmap: "Paimon's Journey Book", about: "About" }[name];
    if (enteringPage)
        window.scrollTo({ top: 0, behavior: 'instant' });
    renderAll();
    if (enteringPage && name === 'farming') startFarmEntry();
    else if (enteringPage && name === 'planner') $('page-planner').classList.add('is-entering');
    scheduleFloatingMaterialDays();
};
const renderClocks = function () {
    const date = parseKey(dayKey()), day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
    const set = (id, value) => {
        const el = $(id);
        if (el && el.textContent !== value)
            el.textContent = value;
    };
    set('today-label', day + ' · Game day');
    set('server-reset-label', 'Reset in ' + duration(nextDaily() - Date.now(), true));
    set('bottom-server', `Selected server: ${serverName()}.`);
    const local = new Date(nextDaily()).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    $('today-label').parentElement.title = `${serverName()} game day: ${day}. Daily reset at 04:00 server time (next reset on your device: ${local}).`;
};
const renderAll = function () {
    ensureResets();
    syncCharacterFarmGoals();
    renderClocks();
    renderMaterials();
    renderFarm();
    renderPlanner();
    renderRoadmap();
    if (currentPage === 'settings')
        syncCoachPreference();
};
// Bind controls / initialize this section in original startup order.
const initializeNavigationSection9 = () => {
    window.teyvatOpenPage = name => page(name);
};
// Bind controls / initialize this section in original startup order.
const initializeNavigationSection28 = () => {
    // Delegated navigation and controls
    document.addEventListener('click', e => {
        const go = e.target.closest('[data-go]');
        if (go) {
            page(go.dataset.go);
            return;
        }
        const correct = e.target.closest('[data-correct-farm-book]');
        if (correct) {
            correctSavedFarmBook(correct.dataset.correctFarmBook);
            return;
        }
        const adjust = e.target.closest('[data-farm-adjust]');
        if (adjust) {
            const f = state.farm.find(x => x.id === adjust.dataset.id);
            if (f) {
                f.owned = clamp(f.owned + Number(adjust.dataset.farmAdjust), 0, 999999);
                syncFarmBookStock(f);
                save();
                renderFarm();
                renderRoadmap();
            }
            return;
        }
        const delFarm = e.target.closest('[data-delete-farm]');
        if (delFarm) {
            if (!confirm('Delete this material goal?'))
                return;
            removeFarmGoals(new Set([delFarm.dataset.deleteFarm]));
            return;
        }
        const filt = e.target.closest('[data-filter]');
        if (filt) {
            farmFilter = filt.dataset.filter;
            renderFarm();
        }
    });
};
// Bind controls / initialize this section in original startup order.
const initializeNavigationSection34 = () => {
    $('region').value = state.region;
    ensureResets();
    bindCharacterPickers();
    renderAll();
    page('roadmap');
    save();
    reminderInit();
    setInterval(() => {
        renderClocks();
        const changed = ensureResets(), freshDay = dayKey();
        if (changed || freshDay !== priorGameDay) {
            if (priorGameDay && materialView.day === (parseKey(priorGameDay).getUTCDay() + 6) % 7)
                materialView.day = null;
            if (plannerDate === priorGameDay)
                plannerDate = freshDay;
            priorGameDay = freshDay;
            renderMaterials();
            renderFarm();
            renderPlanner();
            renderRoadmap();
            nativeSync();
        }
    }, 1000);
};
