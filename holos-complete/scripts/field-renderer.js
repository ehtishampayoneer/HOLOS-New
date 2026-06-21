/* ============================================================
   HOLOS — Field Renderer
   Turns a subcategory's field schema into interactive form
   controls (for shopkeeper add-product) and reads values back.
   Each field type renders differently:
     text/textarea/number → inputs
     select → dropdown
     multiselect → toggle chips
     colors → swatch picker (with custom add)
     sizes → toggle pills
     boolean → toggle switch
   ============================================================ */

const FieldRenderer = (() => {

  /* Curated color palette for the color picker */
  const PALETTE = [
    { hex: '#1a1a1a', label: 'Black' },
    { hex: '#FAFAFA', label: 'White' },
    { hex: '#8B8B8B', label: 'Grey' },
    { hex: '#5C3A21', label: 'Brown' },
    { hex: '#A67B5B', label: 'Tan' },
    { hex: '#C13438', label: 'Red' },
    { hex: '#A04545', label: 'Maroon' },
    { hex: '#E89AB8', label: 'Pink' },
    { hex: '#D98841', label: 'Orange' },
    { hex: '#D4AF37', label: 'Gold' },
    { hex: '#E8DCC4', label: 'Beige' },
    { hex: '#4A7C5F', label: 'Green' },
    { hex: '#2D7C7C', label: 'Teal' },
    { hex: '#1B2A4E', label: 'Navy' },
    { hex: '#4A6F8A', label: 'Blue' },
    { hex: '#7C3B5B', label: 'Purple' },
    { hex: '#C0C0C0', label: 'Silver' },
    { hex: '#B76E79', label: 'Rose Gold' },
  ];

  /* Render a single field to HTML. Values are read later from the DOM. */
  function renderField(field, idx) {
    const fid = `fld-${field.key}`;
    const req = field.required ? '<span class="fr-req">*</span>' : '';
    let control = '';

    switch (field.type) {
      case 'text':
        control = `<input id="${fid}" class="fr-input" data-key="${field.key}" data-type="text" placeholder="${field.label}" />`;
        break;
      case 'textarea':
        control = `<textarea id="${fid}" class="fr-input fr-textarea" data-key="${field.key}" data-type="textarea" placeholder="${field.label}" rows="3"></textarea>`;
        break;
      case 'number':
        control = `
          <div class="fr-number-wrap">
            <input id="${fid}" class="fr-input" data-key="${field.key}" data-type="number" type="number" placeholder="0" />
            ${field.unit ? `<span class="fr-unit">${field.unit}</span>` : ''}
          </div>`;
        break;
      case 'select':
        control = `
          <select id="${fid}" class="fr-input fr-select" data-key="${field.key}" data-type="select">
            <option value="">Choose...</option>
            ${field.options.map(o => `<option value="${o}">${o}</option>`).join('')}
            <option value="__custom__">+ Add your own...</option>
          </select>
          <input type="text" class="fr-input fr-custom-select" id="${fid}-custom" placeholder="Type your option" style="display:none;margin-top:var(--s-2);"
            oninput="this.previousElementSibling.dataset.customValue = this.value;" />`;
        break;
      case 'multiselect':
        control = `
          <div class="fr-chips" data-key="${field.key}" data-type="multiselect" id="${fid}-chips">
            ${field.options.map(o => `<button type="button" class="fr-chip" data-val="${o}" onclick="FieldRenderer.toggleChip(this)">${o}</button>`).join('')}
            <button type="button" class="fr-chip fr-add-chip" onclick="FieldRenderer.promptCustomChip('${fid}-chips','chip')">+ Add</button>
          </div>`;
        break;
      case 'sizes':
        control = `
          <div class="fr-chips fr-sizes" data-key="${field.key}" data-type="sizes" id="${fid}-chips">
            ${field.options.map(o => `<button type="button" class="fr-pill" data-val="${o}" onclick="FieldRenderer.toggleChip(this)">${o}</button>`).join('')}
            <button type="button" class="fr-pill fr-add-chip" onclick="FieldRenderer.promptCustomChip('${fid}-chips','pill')">+ Add</button>
          </div>`;
        break;
      case 'colors':
        control = `
          <div class="fr-colors" data-key="${field.key}" data-type="colors">
            ${PALETTE.map(c => `
              <button type="button" class="fr-color" data-hex="${c.hex}" data-label="${c.label}" onclick="FieldRenderer.toggleColor(this)" title="${c.label}">
                <span class="fr-color-swatch" style="background:${c.hex}"></span>
                <span class="fr-color-check">✓</span>
              </button>
            `).join('')}
          </div>`;
        break;
      case 'boolean':
        control = `
          <button type="button" id="${fid}" class="fr-toggle" data-key="${field.key}" data-type="boolean" data-on="false" onclick="FieldRenderer.toggleBool(this)">
            <span class="fr-toggle-knob"></span>
          </button>`;
        break;
      default:
        control = `<input class="fr-input" data-key="${field.key}" data-type="text" />`;
    }

    return `
      <div class="fr-field" data-field-key="${field.key}" data-required="${!!field.required}">
        <label class="fr-label">${field.label} ${req}</label>
        ${control}
      </div>
    `;
  }

  /* Render the whole schema for a subcategory */
  function renderSchema(subId) {
    const schema = Taxonomy.getSchema(subId);
    if (!schema || schema.length === 0) {
      return `<div class="fr-empty">No fields defined for this subcategory yet.</div>`;
    }
    return schema.map((f, i) => renderField(f, i)).join('');
  }

  /* Interaction handlers */
  function toggleChip(btn) {
    btn.classList.toggle('active');
  }

  /* Add a custom chip/pill the seller typed in */
  function promptCustomChip(containerId, kind) {
    const val = prompt('Add your own option:');
    if (!val || !val.trim()) return;
    const v = val.trim();
    const container = document.getElementById(containerId);
    if (!container) return;
    // avoid duplicates
    if ([...container.querySelectorAll('[data-val]')].some(b => b.dataset.val.toLowerCase() === v.toLowerCase())) return;
    const cls = kind === 'pill' ? 'fr-pill' : 'fr-chip';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = cls + ' active';
    btn.dataset.val = v;
    btn.textContent = v;
    btn.onclick = () => toggleChip(btn);
    // insert before the "+ Add" button
    const addBtn = container.querySelector('.fr-add-chip');
    container.insertBefore(btn, addBtn);
  }

  /* Wire select "+ Add your own" to reveal the custom input */
  function initCustomSelects(root) {
    (root || document).querySelectorAll('select[data-type="select"]').forEach(sel => {
      if (sel._customWired) return;
      sel._customWired = true;
      sel.addEventListener('change', () => {
        const custom = document.getElementById(sel.id + '-custom');
        if (!custom) return;
        if (sel.value === '__custom__') { custom.style.display = 'block'; custom.focus(); }
        else { custom.style.display = 'none'; delete sel.dataset.customValue; }
      });
    });
  }
  function toggleColor(btn) {
    btn.classList.toggle('active');
  }
  function toggleBool(btn) {
    const on = btn.dataset.on === 'true';
    btn.dataset.on = (!on).toString();
    btn.classList.toggle('on', !on);
  }

  /* Read all field values back out of the DOM into an options object */
  function readValues(containerEl) {
    const options = {};
    const fields = containerEl.querySelectorAll('[data-key]');
    const seen = new Set();
    fields.forEach(el => {
      const key = el.dataset.key;
      const type = el.dataset.type;
      if (!key || seen.has(key)) return;
      // Only process the container element (data-type lives on it)
      if (!type) return;
      seen.add(key);

      switch (type) {
        case 'text':
        case 'textarea':
          options[key] = el.value.trim();
          break;
        case 'number':
          options[key] = el.value ? Number(el.value) : null;
          break;
        case 'select':
          options[key] = (el.value === '__custom__') ? (el.dataset.customValue || '') : el.value;
          break;
        case 'multiselect':
        case 'sizes': {
          const active = [...el.querySelectorAll('.active')].map(b => b.dataset.val);
          options[key] = active;
          break;
        }
        case 'colors': {
          const active = [...el.querySelectorAll('.active')].map(b => ({ hex: b.dataset.hex, label: b.dataset.label }));
          options[key] = active;
          break;
        }
        case 'boolean':
          options[key] = el.dataset.on === 'true';
          break;
      }
    });
    return options;
  }

  /* Validate required fields. Returns array of missing field labels. */
  function validate(containerEl, subId) {
    const schema = Taxonomy.getSchema(subId);
    const values = readValues(containerEl);
    const missing = [];
    schema.forEach(f => {
      if (!f.required) return;
      const v = values[f.key];
      const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0);
      if (empty) missing.push(f.label);
    });
    return missing;
  }

  return { renderField, renderSchema, readValues, validate, toggleChip, toggleColor, toggleBool, promptCustomChip, initCustomSelects, PALETTE };
})();

window.FieldRenderer = FieldRenderer;
