// Teyvat Companion | features / material picker
// Classic scripts intentionally share lexical bindings; see docs/ARCHITECTURE.md.
'use strict';
const materialCatalogArtwork = function (item) {
    if (!item)
        return '<span class="material-icon-art" aria-hidden="true"><span class="material-icon-fallback">✧</span></span>';
    const init = item.rank ? String(item.rank) + '★' : ({ boss: '✦', local: '❀', enemy: '◆', weekly: '✴', mora: '◇' })[item.type] || '✧';
    const img = materialItemImgTag(item.name, item.iconId, item.type === 'weapon');
    return `<span class="material-icon-art" aria-hidden="true"><span class="material-icon-fallback">${esc(init)}</span>${img}</span>`;
};
const materialCategoryTitle = function (type) { return ({ talent: 'Talent book', weapon: 'Weapon material', boss: 'Boss drop', local: 'Local specialty', enemy: 'Enemy drop', weekly: 'Weekly boss', mora: 'Mora / EXP', gem: 'Ascension gem', other: 'Upgrade item' })[type] || 'Material'; };
const materialMetaLabel = function (item) { return [materialCategoryTitle(item.type), item.region, item.series && item.series !== item.name ? item.series : ''].filter(Boolean).join(' · '); };
const drawMaterialPicker = function () {
    const tabs = [...MATERIAL_CATEGORY_TABS, ['gem', 'Ascension gems'], ['other', 'Other upgrades']];
    $('material-picker-tabs').innerHTML = tabs.map(([key, label]) => `<button class="material-picker-tab ${materialPicker.category === key ? 'active' : ''}" type="button" data-material-category="${key}" aria-pressed="${materialPicker.category === key}">${esc(label)}</button>`).join('');
    const needle = materialPicker.query.trim().toLowerCase();
    const filtered = MATERIAL_CATALOG.filter(item => (materialPicker.category === 'all' || item.type === materialPicker.category) && (!needle || [item.name, item.series, item.region, item.type, item.where, materialCategoryTitle(item.type)].some(t => (t || '').toLowerCase().includes(needle))));
    $('material-picker-grid').innerHTML = filtered.map(item => `<button type="button" class="material-picker-item" data-select-material="${esc(item.id)}" aria-label="Select ${esc(item.name)}"><span>${materialCatalogArtwork(item)}</span><span class="material-picker-item-copy"><strong>${esc(item.name)}</strong><small>${esc(materialMetaLabel(item))}</small></span></button>`).join('') || '<div class="material-picker-noresults">No matching items in this catalog. Try another category or search term.</div>';
    $('material-picker-count').textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'} found · Select an icon and name`;
};
const openMaterialPicker = function (target) {
    materialPicker.target = target;
    const selected = materialPicker.selected[target];
    materialPicker.category = selected?.type || 'talent';
    materialPicker.query = '';
    $('material-picker-search').value = '';
    drawMaterialPicker();
    const dialog = $('material-picker-dialog');
    if (!dialog.open)
        dialog.showModal();
    $('material-picker-search').focus();
};
const updateMaterialPreview = function (target, item) {
    const isFarm = target === 'farm', prefix = isFarm ? 'farm-material-preview' : 'coach-extra-material-preview';
    const title = $(`${prefix}-title`), subtitle = $(`${prefix}-sub`), icon = $(`${prefix}-icon`);
    title.textContent = item?.name || 'Choose a material';
    subtitle.textContent = item ? materialMetaLabel(item) : 'Browse icons and exact item names';
    icon.outerHTML = materialCatalogArtwork(item).replace('class="material-icon-art"', `class="material-icon-art" id="${prefix}-icon"`);
    const input = $(isFarm ? 'farm-material' : 'coach-extra-name');
    input.value = item?.name || '';
    if (isFarm)
        refreshFarmTalentWarning();
    if (item) {
        if (isFarm) {
            $('farm-days').value = item.day === 'weekly' ? 'any' : item.day;
        }
        else {
            $('coach-extra-category').value = item.type === 'talent' ? 'talent' : item.type;
            $('coach-extra-day').value = item.day;
            $('coach-extra-resin').value = String(item.resin);
            $('coach-extra-where').value = item.where || '';
        }
    }
};
const selectMaterialItem = function (id) {
    const item = MATERIAL_CATALOG_BY_ID.get(id);
    if (!item)
        return;
    materialPicker.selected[materialPicker.target] = item;
    updateMaterialPreview(materialPicker.target, item);
    $('material-picker-dialog').close();
    $(materialPicker.target === 'farm' ? 'farm-material-button' : 'coach-extra-name-button').focus();
};
const resetMaterialPicker = function (target) {
    materialPicker.selected[target] = null;
    updateMaterialPreview(target, null);
};
const initMaterialPicker = function () {
    document.addEventListener('click', e => {
        const open = e.target.closest('[data-open-material-picker]');
        if (open) {
            openMaterialPicker(open.dataset.openMaterialPicker);
            return;
        }
        const cat = e.target.closest('[data-material-category]');
        if (cat) {
            materialPicker.category = cat.dataset.materialCategory;
            drawMaterialPicker();
            return;
        }
        const tile = e.target.closest('[data-select-material]');
        if (tile) {
            selectMaterialItem(tile.dataset.selectMaterial);
            return;
        }
    });
    $('material-picker-search').addEventListener('input', e => {
        materialPicker.query = e.target.value;
        if (materialPicker.query.trim())
            materialPicker.category = 'all';
        drawMaterialPicker();
    });
    $('material-picker-close').addEventListener('click', () => $('material-picker-dialog').close());
    $('material-picker-dialog').addEventListener('click', e => { if (e.target === $('material-picker-dialog'))
        $('material-picker-dialog').close(); });
};
// Bind controls / initialize this section in original startup order.
const initializeMaterialPickerSection6 = () => {
    initMaterialPicker();
};
