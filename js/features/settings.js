// Teyvat Companion | features / settings
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const syncCoachPreference = function () {
    const r = state.roadmap, w = state.weaponJourney;
    $('coach-toggle-tracking').checked = r.trackMaterials === true;
    $('settings-region').value = state.region;
    $('coach-edit-weeks').value = String(r.weeks);
    $('coach-edit-budget').value = String(r.budget);
    $('coach-restart').hidden = !r.started;
    $('weapon-edit-weeks').value = String(w.weeks);
    $('weapon-edit-budget').value = String(w.budget);
    $('weapon-restart').hidden = !w.startedAt;
};
// Bind controls / initialize this section in original startup order.
const initializeSettingsSection25 = () => {
    $('settings-region').addEventListener('change', e => changeServer(e.target.value));
    $('coach-toggle-tracking').addEventListener('change', e => {
        state.roadmap.trackMaterials = e.target.checked;
        save();
        renderAll();
        toast(e.target.checked ? 'Material tracking enabled. Progress and remaining counts are visible.' : 'Material tracking hidden. Your saved material quantities are safe.');
    });
    $('coach-settings').addEventListener('submit', e => {
        e.preventDefault();
        state.roadmap.weeks = Number($('coach-edit-weeks').value) === 3 ? 3 : 4;
        state.roadmap.budget = number($('coach-edit-budget').value, 20, 200);
        $('coach-setup-weeks').value = String(state.roadmap.weeks);
        $('coach-setup-budget').value = String(state.roadmap.budget);
        save();
        renderRoadmap();
        toast('Character plan updated.');
    });
    $('coach-extra-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const r = state.roadmap;
        if (!r.started)
            return;
        const item = materialPicker.selected.coach;
        if (!item) {
            toast('Choose a material from the icon catalog first.');
            openMaterialPicker('coach');
            return;
        }
        const name = item.name, character = $('coach-extra-character').value, category = $('coach-extra-category').value;
        const needed = number($('coach-extra-needed').value, 1, 999999), owned = number($('coach-extra-owned').value, 0, 999999), resin = number($('coach-extra-resin').value, 0, 200), where = $('coach-extra-where').value.trim();
        if (!r.people.includes(character))
            return;
        r.extras.push({
            id: 'goal_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), character, name: name.slice(0, 70), itemId: item.id, category, need: needed, owned, day: $('coach-extra-day').value, resin, where: where.slice(0, 100)
        });
        $('coach-extra-form').reset();
        resetMaterialPicker('coach');
        save();
        renderAll();
        toast('Material goal added!');
    });
    $('coach-restart').addEventListener('click', () => {
        if (!confirm('Start a new farming plan? This clears your current schedule and manually entered roadmap material stock, but keeps your characters and teams.'))
            return;
        clearOtherServerPlanHistory();
        state.weaponJourney.mode = 'characters';
        state.roadmap = { ...COACH_DEFAULT(), trackMaterials: state.roadmap.trackMaterials === true };
        state.farm = state.farm.filter(x => !x.id.startsWith('auto_book_'));
        pickerResetCoach();
        save();
        page('roadmap');
        toast('Ready for a new plan.');
    });
};
// Bind controls / initialize this section in original startup order.
const initializeSettingsSection32 = () => {
    $('export-data').addEventListener('click', () => {
        if (window.TeyvatAndroid?.exportBackup) {
            window.TeyvatAndroid.exportBackup(JSON.stringify({ app: 'Teyvat Companion', version: 3, exported: new Date().toISOString(), data: state }, null, 2));
            return;
        }
        const blob = new Blob([JSON.stringify({ app: 'Teyvat Companion', version: 3, exported: new Date().toISOString(), data: state }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teyvat-companion-backup.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        $('coach-backup-status').textContent = 'Backup file downloaded.';
        toast('Backup file downloaded.');
    });
    $('import-open').addEventListener('click', () => $('import-file').click());
    $('import-file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file)
            return;
        try {
            if (file.size > 2000000)
                throw Error('Backup is too large.');
            const raw = JSON.parse(await file.text());
            if (raw.app !== 'Teyvat Companion' || !raw.data || typeof raw.data !== 'object')
                throw Error('Not a Teyvat Companion backup.');
            if (!confirm('Import this backup? It will replace the saved data on this device.'))
                return;
            state = normalize(raw.data);
            materialView.day = null;
            plannerDate = dayKey();
            priorGameDay = dayKey();
            ensureResets();
            save();
            $('region').value = state.region;
            renderAll();
            syncCoachPreference();
            $('coach-backup-status').textContent = 'Backup imported successfully.';
            toast('Backup imported successfully.');
        }
        catch (err) {
            $('coach-backup-status').textContent = 'Could not import: ' + err.message;
            toast('Could not import: ' + err.message);
        }
        finally {
            e.target.value = '';
        }
    });
};
