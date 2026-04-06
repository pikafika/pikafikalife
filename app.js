// app.js v2 — 1형 당뇨 스마트 도우미

// ===================== 1. 상태 =====================
const state = {
  settings: { icr: 10, isf: 50, targetBG: 120, warningThreshold: 10, weight: '', basal: '' },
  currentBG: null, selectedFoods: [], currentCategory: 'all',
  pendingFood: null, lastResult: null, useHalfUnit: false, chartPeriod: 'today'
};

// ===================== 2. 설정 =====================
function loadSettings() {
  try {
    const s = localStorage.getItem('insulinCalc_settings');
    if (s) state.settings = { ...state.settings, ...JSON.parse(s) };
  } catch(e) { console.warn(e); }
}
function saveSettings() {
  try { localStorage.setItem('insulinCalc_settings', JSON.stringify(state.settings)); } catch(e) {}
}

// ===================== 3. 기록 =====================
function loadHistory() {
  try { const s = localStorage.getItem('insulinCalc_history'); return s ? JSON.parse(s) : []; } catch(e) { return []; }
}
function saveHistory(records) {
  try { localStorage.setItem('insulinCalc_history', JSON.stringify(records.slice(0, 100))); } catch(e) {}
}
function addHistoryRecord(result) {
  const records = loadHistory();
  records.unshift({
    id: Date.now(), timestamp: new Date().toISOString(),
    foods: state.selectedFoods.map(f => ({ name: f.name, carbs: f.carbs })),
    totalCarbs: result.totalCarbs, currentBG: result.currentBG,
    mealInsulin: result.mealInsulin, corrInsulin: result.corrInsulin,
    totalInsulin: result.totalInsulin, roundedInsulin: result.roundedInsulin,
    settings: { ...state.settings }, isEaten: false, memo: ''
  });
  saveHistory(records);
  updateNavBadge();
}

// ===================== 3b. 프리셋 =====================
function loadPresets() {
  try { const s = localStorage.getItem('insulinCalc_presets'); return s ? JSON.parse(s) : []; } catch(e) { return []; }
}
function savePresets(p) {
  try { localStorage.setItem('insulinCalc_presets', JSON.stringify(p)); } catch(e) {}
}
function saveCurrentAsPreset(name) {
  if (!state.selectedFoods.length) { showToast('음식을 먼저 선택해주세요!'); return; }
  const presets = loadPresets();
  presets.unshift({ id: Date.now(), name, foods: [...state.selectedFoods] });
  savePresets(presets.slice(0, 10));
  renderPresetBar();
  showToast(`⭐ "${name}" 저장!`);
}
function loadPreset(id) {
  const p = loadPresets().find(p => p.id === id);
  if (!p) return;
  state.selectedFoods = [...p.foods];
  renderSelectedFoods(); updateTotalCarbs();
  showToast(`📦 "${p.name}" 불러왔어요!`);
}
function deletePreset(id) {
  savePresets(loadPresets().filter(p => p.id !== id));
  renderPresetBar(); showToast('프리셋 삭제됨');
}
function renderPresetBar() {
  const bar = document.getElementById('presetBar');
  const chipsEl = document.getElementById('presetChips');
  const presets = loadPresets();
  if (!presets.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  chipsEl.innerHTML = presets.map(p => `
    <div class="preset-chip">
      <button class="preset-chip-load" data-id="${p.id}">${p.name}</button>
      <button class="preset-chip-del" data-id="${p.id}">✕</button>
    </div>`).join('');
  chipsEl.querySelectorAll('.preset-chip-load').forEach(b => b.addEventListener('click', () => loadPreset(parseInt(b.dataset.id))));
  chipsEl.querySelectorAll('.preset-chip-del').forEach(b => b.addEventListener('click', () => deletePreset(parseInt(b.dataset.id))));
}

// ===================== 4. 인슐린 계산 =====================
function calculateInsulin(totalCarbs, currentBG) {
  const { icr, isf, targetBG } = state.settings;
  const meal = totalCarbs / icr;
  const corr = (currentBG - targetBG) / isf;
  const raw = meal + corr;
  return {
    totalCarbs, currentBG,
    mealInsulin: Math.round(meal * 10) / 10,
    corrInsulin: Math.round(corr * 10) / 10,
    totalInsulin: Math.round(raw * 10) / 10,
    roundedInsulin: state.useHalfUnit ? Math.round(raw * 2) / 2 : Math.round(raw * 10) / 10
  };
}
function getTotalCarbs() { return state.selectedFoods.reduce((s, f) => s + f.carbs, 0); }

// ===================== 5. 음식 그리드 =====================
function renderFoodGrid(cat = 'all', term = '') {
  const grid = document.getElementById('foodGrid');
  let foods = window.FOOD_DB;
  if (cat !== 'all') foods = foods.filter(f => f.cat === cat);
  if (term.trim()) foods = foods.filter(f => f.name.toLowerCase().includes(term.toLowerCase()));
  if (!foods.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-muted)"><span style="font-size:36px">🔍</span><p style="margin-top:8px;font-size:14px;font-weight:600">음식을 찾지 못했어요</p></div>`;
    return;
  }
  grid.innerHTML = foods.map(f => `<div class="food-card" role="listitem" tabindex="0" data-id="${f.id}">
    <span class="food-card-emoji">${f.emoji}</span>
    <span class="food-card-name">${f.name}</span>
    <span class="food-card-carbs">${f.carbPer}g</span></div>`).join('');
  grid.querySelectorAll('.food-card').forEach(c => {
    c.addEventListener('click', () => openAddFoodModal(c.dataset.id));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAddFoodModal(c.dataset.id); } });
  });
}

// ===================== 6. 음식 선택/수량 =====================
function openAddFoodModal(foodId) {
  const food = window.FOOD_DB.find(f => f.id === foodId);
  if (!food) return;
  state.pendingFood = food;
  document.getElementById('addFoodInfo').innerHTML = `
    <span class="add-food-info-emoji">${food.emoji}</span>
    <p class="add-food-info-name">${food.name}</p>
    <p class="add-food-info-carbs">1${food.baseUnit}당 탄수화물 <strong>${food.carbPer}g</strong>${food.note ? ` (${food.note})` : ''}</p>`;
  document.getElementById('addFoodQty').value = food.baseAmount;
  document.getElementById('addFoodUnit').textContent = food.baseUnit;
  updateQtyPreview();
  openModal('addFoodModal');
}
function updateQtyPreview() {
  if (!state.pendingFood) return;
  const qty = parseFloat(document.getElementById('addFoodQty').value) || 0;
  const carbs = (qty / state.pendingFood.baseAmount) * state.pendingFood.carbPer;
  document.getElementById('qtyCarbsPreview').textContent = `탄수화물: ${Math.round(carbs*10)/10}g`;
}
function confirmAddFood() {
  const food = state.pendingFood; if (!food) return;
  const qty = parseFloat(document.getElementById('addFoodQty').value) || 0;
  if (qty <= 0) { showToast('수량을 0보다 크게 입력해주세요!'); return; }
  const carbs = Math.round((qty / food.baseAmount) * food.carbPer * 10) / 10;
  const existing = state.selectedFoods.find(f => f.foodId === food.id);
  if (existing) {
    existing.qty += qty;
    existing.carbs = Math.round((existing.qty / food.baseAmount) * food.carbPer * 10) / 10;
  } else {
    state.selectedFoods.push({ id: Date.now(), foodId: food.id, name: food.name, emoji: food.emoji, qty, unit: food.baseUnit, carbs });
  }
  closeModal('addFoodModal'); renderSelectedFoods(); updateTotalCarbs();
  showToast(`${food.name} 추가됐어요! 🎉`);
}
function addManualFood() {
  const name = document.getElementById('manualFoodName').value.trim() || '직접 입력';
  const carbs = parseFloat(document.getElementById('manualCarbs').value);
  if (isNaN(carbs) || carbs < 0) { showToast('탄수화물 값을 올바르게 입력해주세요'); return; }
  state.selectedFoods.push({ id: Date.now(), foodId: 'manual_' + Date.now(), name, emoji: '✏️', qty: 1, unit: '직접입력', carbs });
  document.getElementById('manualFoodName').value = '';
  document.getElementById('manualCarbs').value = '';
  renderSelectedFoods(); updateTotalCarbs(); showToast(`${name} 추가됐어요! 🎉`);
}
function renderSelectedFoods() {
  const list = document.getElementById('selectedList');
  if (!state.selectedFoods.length) {
    list.innerHTML = `<div class="empty-selected"><span class="empty-selected-icon">🍽️</span>아직 음식을 추가하지 않았어요.<br/>위에서 음식을 골라봐요!</div>`;
    return;
  }
  list.innerHTML = state.selectedFoods.map(f => `
    <div class="selected-item" data-id="${f.id}" role="listitem">
      <span class="selected-item-emoji">${f.emoji}</span>
      <div class="selected-item-info">
        <p class="selected-item-name">${f.name}</p>
        <p class="selected-item-detail">${f.qty}${f.unit}</p>
      </div>
      <span class="selected-item-carbs">${f.carbs}g</span>
      <button class="selected-item-remove" data-id="${f.id}" aria-label="${f.name} 삭제">✕</button>
    </div>`).join('');
  list.querySelectorAll('.selected-item-remove').forEach(b => b.addEventListener('click', () => removeFood(parseInt(b.dataset.id))));
}
function removeFood(id) { state.selectedFoods = state.selectedFoods.filter(f => f.id !== id); renderSelectedFoods(); updateTotalCarbs(); }
function updateTotalCarbs() { document.getElementById('totalCarbsDisplay').textContent = `${getTotalCarbs()}g`; }

// ===================== 7. 검색 =====================
let searchDebounceTimer = null;
function handleSearch(term) {
  const dropdown = document.getElementById('searchDropdown');
  if (!term.trim()) { dropdown.classList.remove('open'); renderFoodGrid(state.currentCategory, ''); return; }
  const results = window.FOOD_DB.filter(f => f.name.toLowerCase().includes(term.toLowerCase())).slice(0, 8);
  dropdown.innerHTML = results.length
    ? results.map(f => `<div class="dropdown-item" data-id="${f.id}" role="option" tabindex="0"><span class="dropdown-item-emoji">${f.emoji}</span><span class="dropdown-item-name">${f.name}</span><span class="dropdown-item-carbs">${f.carbPer}g</span></div>`).join('')
    : `<div class="dropdown-item"><span class="dropdown-item-name" style="color:var(--text-muted)">검색 결과가 없어요</span></div>`;
  dropdown.querySelectorAll('.dropdown-item[data-id]').forEach(item => item.addEventListener('click', () => {
    dropdown.classList.remove('open'); document.getElementById('foodSearch').value = ''; openAddFoodModal(item.dataset.id);
  }));
  dropdown.classList.add('open');
  renderFoodGrid(state.currentCategory, term);
}

// ===================== 8. 계산 & 결과 표시 =====================
function calcAndDisplay() {
  const bgInput = parseFloat(document.getElementById('inputBG').value);
  if (isNaN(bgInput) || bgInput < 40 || bgInput > 600) {
    showToast('⚠️ 혈당 수치를 올바르게 입력해주세요 (40~600 mg/dL)');
    document.getElementById('inputBG').focus(); return;
  }
  const totalCarbs = getTotalCarbs();
  if (totalCarbs === 0) showToast('⚠️ 음식이 없어서 교정 인슐린만 계산했어요', 3500);
  state.currentBG = bgInput;
  const result = calculateInsulin(totalCarbs, bgInput);
  state.lastResult = result;
  displayResult(result);
  checkWarning(result.roundedInsulin);
  addHistoryRecord(result);
  document.getElementById('stepResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function displayResult(result) {
  const { mealInsulin, corrInsulin, totalInsulin, roundedInsulin } = result;
  document.getElementById('resultDose').textContent = roundedInsulin >= 0 ? roundedInsulin : `(${roundedInsulin})`;
  document.getElementById('mealInsulin').textContent = `${mealInsulin} 단위 (탄수화물 ${result.totalCarbs}g)`;
  document.getElementById('corrInsulin').textContent = corrInsulin >= 0
    ? `+${corrInsulin} 단위 (혈당 ${result.currentBG}→${state.settings.targetBG})`
    : `${corrInsulin} 단위 (혈당이 목표보다 낮음)`;
  document.getElementById('totalInsulinRaw').textContent = `${totalInsulin} 단위`;
  document.getElementById('totalInsulinRounded').textContent = `${roundedInsulin} 단위 ${state.useHalfUnit ? '(0.5단위 반올림)' : '(소수점 반올림)'}`;
  document.getElementById('resultTime').textContent = `계산 시각: ${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
  document.getElementById('corrInsulin').style.color = corrInsulin < 0 ? '#2ED573' : '';
  renderCoachingGuide(result);
}
function renderCoachingGuide(result) {
  const box = document.getElementById('coachingGuideBox');
  const list = document.getElementById('coachingList');
  const guides = [];
  if (result.currentBG < 70) guides.push('🚨 <strong>저혈당 상태!</strong> 인슐린 투여 보류하고 즉각적인 단당류 15g을 먼저 섭취하세요. 15분 후 재측정.');
  else if (result.currentBG > 250) guides.push('⚠️ <strong>고혈당 주의:</strong> 다량의 수분 섭취, 소변/혈액 케톤 검사 고려하세요.');
  if (result.corrInsulin < 0 && result.currentBG >= 70) guides.push('📉 혈당이 목표치보다 낮아 식사 인슐린이 줄었습니다. 식후 2시간 혈당을 반드시 확인하세요.');
  if (result.totalCarbs >= 80) guides.push('🍚 <strong>고탄수화물 섭취:</strong> 스플릿(나누어 맞기) 기법을 주치의와 상의해 보세요.');
  const highFat = state.selectedFoods.some(f => ['피자','치킨','삼겹살','돈까스','짜장'].some(k => f.name.includes(k)));
  if (highFat) guides.push('🍕 <strong>지연성 혈당 상승 주의:</strong> 지방이 많은 음식은 3~6시간 후에도 혈당이 오르는 "피자 효과"가 있을 수 있습니다.');
  if (!guides.length) guides.push('✅ 투여 기준이 적정해 보입니다. 식후 2시간 혈당이 140~180 내에 드는지 확인해 주세요!');
  box.style.display = 'block';
  list.innerHTML = guides.map(g => `<li>${g}</li>`).join('');
}
function checkWarning(dose) {
  const banner = document.getElementById('alertBanner');
  banner.classList.toggle('visible', dose > state.settings.warningThreshold);
}
function updateRounding() {
  state.useHalfUnit = document.getElementById('toggleRounding').checked;
  if (state.lastResult) { const r = calculateInsulin(state.lastResult.totalCarbs, state.lastResult.currentBG); state.lastResult = r; displayResult(r); }
}

// ===================== 9. 설정 시트 =====================
function openSettingsSheet() {
  document.getElementById('settingICR').value = state.settings.icr;
  document.getElementById('settingISF').value = state.settings.isf;
  document.getElementById('settingTargetBG').value = state.settings.targetBG;
  document.getElementById('settingWarningThreshold').value = state.settings.warningThreshold;
  document.getElementById('settingWeight').value = state.settings.weight || '';
  document.getElementById('settingBasal').value = state.settings.basal || '';
  document.getElementById('settingsSavedMsg').textContent = '';
  openModal('settingsSheet');
}
function saveSettingsFromSheet() {
  const icr = parseFloat(document.getElementById('settingICR').value);
  const isf = parseFloat(document.getElementById('settingISF').value);
  const targetBG = parseInt(document.getElementById('settingTargetBG').value);
  const warningThreshold = parseFloat(document.getElementById('settingWarningThreshold').value);
  if (isNaN(icr) || icr <= 0) { showToast('ICR 값을 올바르게 입력해주세요'); return; }
  if (isNaN(isf) || isf <= 0) { showToast('ISF 값을 올바르게 입력해주세요'); return; }
  if (isNaN(targetBG) || targetBG < 70 || targetBG > 200) { showToast('목표 혈당을 올바르게 입력해주세요 (70~200)'); return; }
  state.settings = { icr, isf, targetBG, warningThreshold, weight: document.getElementById('settingWeight').value, basal: document.getElementById('settingBasal').value };
  saveSettings();
  document.getElementById('settingsSavedMsg').textContent = '✅ 저장되었습니다!';
  setTimeout(() => { document.getElementById('settingsSavedMsg').textContent = ''; }, 2000);
  showToast('설정이 저장됐어요 ✅');
}

// ===================== 10. 기록(히스토리) 렌더링 =====================
function renderRecordsList() {
  const records = loadHistory();
  const container = document.getElementById('mainHistoryList');
  if (!records.length) {
    container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted)"><span style="font-size:44px">📓</span><p style="margin-top:12px;font-size:14px;font-weight:600">아직 기록이 없어요</p><p style="font-size:12px;margin-top:4px">계산하면 자동으로 저장돼요!</p></div>`;
    return;
  }
  // 날짜별 그룹핑
  const groups = {};
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
  records.forEach(r => {
    const d = new Date(r.timestamp); d.setHours(0,0,0,0);
    let key;
    if (d.getTime() === today.getTime()) key = '오늘';
    else if (d.getTime() === yesterday.getTime()) key = '어제';
    else key = d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  container.innerHTML = Object.entries(groups).map(([date, recs]) => `
    <div class="records-date-group">
      <div class="records-date-header">${date}</div>
      ${recs.map(r => renderRecordItem(r)).join('')}
    </div>`).join('');
  // 이벤트
  container.querySelectorAll('.eat-check-input').forEach(cb => cb.addEventListener('change', () => toggleHistoryEaten(parseInt(cb.dataset.id))));
  container.querySelectorAll('.btn-history-share').forEach(b => b.addEventListener('click', () => shareHistoryItem(parseInt(b.dataset.id))));
  container.querySelectorAll('.btn-history-recalc').forEach(b => b.addEventListener('click', () => recalcFromHistory(parseInt(b.dataset.id))));
  container.querySelectorAll('.memo-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const recs = loadHistory(); const rec = recs.find(r => r.id === parseInt(inp.dataset.id));
      if (rec) { rec.memo = inp.value; saveHistory(recs); }
    });
  });
}
function renderRecordItem(r) {
  const d = new Date(r.timestamp);
  const timeStr = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const foodNames = r.foods.map(f => f.name).join(', ') || '음식 없음';
  return `<div class="history-item ${r.isEaten ? 'is-eaten' : ''}">
    <div class="history-item-header">
      <span class="history-item-time">${timeStr}</span>
      <span class="history-item-dose">${r.roundedInsulin} 단위</span>
    </div>
    <p class="history-item-foods">🍽️ ${foodNames}</p>
    <div class="history-item-stats">
      <div class="history-stat"><span class="history-stat-label">탄수화물</span><span class="history-stat-value">${r.totalCarbs}g</span></div>
      <div class="history-stat"><span class="history-stat-label">혈당</span><span class="history-stat-value">${r.currentBG} mg/dL</span></div>
      <div class="history-stat"><span class="history-stat-label">교정</span><span class="history-stat-value">${r.corrInsulin >= 0 ? '+' : ''}${r.corrInsulin}u</span></div>
    </div>
    <input class="memo-input" data-id="${r.id}" placeholder="📝 메모 (학교 급식, 운동 후...)" value="${r.memo || ''}" />
    <div class="history-item-actions">
      <label class="eat-check-label">
        <input type="checkbox" class="eat-check-input" data-id="${r.id}" ${r.isEaten ? 'checked' : ''} /> 실제 식사 ✅
      </label>
      <div style="display:flex;gap:6px;">
        <button class="btn-history-recalc" data-id="${r.id}">🔄 재계산</button>
        <button class="btn-history-share" data-id="${r.id}">🔗 공유</button>
      </div>
    </div>
  </div>`;
}
function toggleHistoryEaten(id) {
  const records = loadHistory(); const rec = records.find(r => r.id === id);
  if (rec) { rec.isEaten = !rec.isEaten; saveHistory(records); showToast(rec.isEaten ? '📈 대시보드에 반영됐어요!' : '차트에서 제외됐어요'); }
}
function shareHistoryItem(id) {
  const r = loadHistory().find(r => r.id === id); if (!r) return;
  const text = `🩵 식사 기록\n혈당: ${r.currentBG}mg/dL | 탄수화물: ${r.totalCarbs}g\n✅ 인슐린: ${r.roundedInsulin} 단위`;
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast('📋 기록이 복사됐어요!'));
  else showToast('지원하지 않는 브라우저입니다.');
}
function recalcFromHistory(id) {
  const r = loadHistory().find(r => r.id === id); if (!r) return;
  state.selectedFoods = r.foods.map((f, i) => ({ id: Date.now()+i, foodId: 'recalc', name: f.name, emoji: '🍽️', qty: 1, unit: '인분', carbs: f.carbs }));
  document.getElementById('inputBG').value = r.currentBG;
  renderSelectedFoods(); updateTotalCarbs();
  switchTab('view-calculator');
  showToast('이전 식사 내용을 불러왔어요!');
}
function exportRecords() {
  const records = loadHistory().filter(r => r.isEaten);
  if (!records.length) { showToast('실제 식사로 체크된 기록이 없어요'); return; }
  const lines = records.map(r => {
    const d = new Date(r.timestamp).toLocaleString('ko-KR');
    return `[${d}] 혈당:${r.currentBG} 탄수:${r.totalCarbs}g 인슐린:${r.roundedInsulin}u ${r.foods.map(f=>f.name).join(',')}`;
  });
  const text = `🩵 인슐린 계산 기록 (병원 공유용)\n${'─'.repeat(30)}\n${lines.join('\n')}\n${'─'.repeat(30)}\n⚠️ 이 기록은 참고용이며, 최종 판단은 의사와 상의하세요.`;
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast('📋 기록이 복사됐어요! 병원에 붙여넣기 하세요'));
  else showToast('지원하지 않는 브라우저입니다.');
}
function updateNavBadge() {
  const badge = document.getElementById('recordsBadge');
  if (!badge) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const count = loadHistory().filter(r => new Date(r.timestamp) >= today).length;
  if (count > 0) { badge.textContent = count; badge.style.display = 'flex'; }
  else badge.style.display = 'none';
}

// ===================== 11. 공유 =====================
function shareToClipboard() {
  if (!state.lastResult) { showToast('먼저 계산해주세요!'); return; }
  const { mealInsulin, corrInsulin, roundedInsulin, totalCarbs, currentBG } = state.lastResult;
  const foods = state.selectedFoods.map(f => `  - ${f.name}: ${f.carbs}g`).join('\n');
  const text = `🩵 인슐린 계산 결과 (${new Date().toLocaleString('ko-KR')})\n\n📊 현재 혈당: ${currentBG} mg/dL\n🍽️ 식사 내용:\n${foods||'  (음식 없음)'}\n\n🧮 계산 결과:\n  총 탄수화물: ${totalCarbs}g\n  식사 인슐린: ${mealInsulin} 단위\n  교정 인슐린: ${corrInsulin >= 0 ? '+' : ''}${corrInsulin} 단위\n  ─────────\n  ✅ 권장 인슐린: ${roundedInsulin} 단위\n\n⚠️ 참고용이며 최종 용량은 의사와 상의하세요.`;
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast('📋 결과가 복사됐어요!'));
  else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); showToast('📋 복사됐어요!'); } catch(e) {} document.body.removeChild(ta); }
}
function shareKakao() {
  if (!state.lastResult) { showToast('먼저 계산해주세요!'); return; }
  const { roundedInsulin, totalCarbs, currentBG } = state.lastResult;
  const msg = `[인슐린 계산 결과] 혈당:${currentBG}mg/dL | 탄수화물:${totalCarbs}g | ✅ 권장:${roundedInsulin}단위`;
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) window.location.href = `kakaolink://send?text=${encodeURIComponent(msg)}`;
  else { shareToClipboard(); showToast('💬 카카오톡에 붙여넣기 하세요!'); }
}

// ===================== 12. 오늘 탭 (renderTodayView) =====================
let currentChart = null;
function renderTodayView() {
  const all = loadHistory();
  const today = new Date(); today.setHours(0,0,0,0);
  let filtered = all;
  if (state.chartPeriod === 'today') filtered = all.filter(r => new Date(r.timestamp) >= today);
  else if (state.chartPeriod === 'week') { const w = new Date(today); w.setDate(w.getDate()-7); filtered = all.filter(r => new Date(r.timestamp) >= w); }
  else if (state.chartPeriod === 'month') { const m = new Date(today); m.setDate(m.getDate()-30); filtered = all.filter(r => new Date(r.timestamp) >= m); }
  
  // 통계 (오늘 기준)
  const todayRecs = all.filter(r => new Date(r.timestamp) >= today);
  document.getElementById('statMealCount').textContent = `${todayRecs.length}회`;
  document.getElementById('statTotalCarbs').textContent = `${todayRecs.reduce((s,r) => s+r.totalCarbs, 0)}g`;
  document.getElementById('statTotalInsulin').textContent = `${todayRecs.reduce((s,r) => s+r.roundedInsulin, 0)}u`;
  const avg = todayRecs.length ? Math.round(todayRecs.reduce((s,r) => s+r.currentBG, 0) / todayRecs.length) : null;
  document.getElementById('statAvgBG').textContent = avg ? `${avg}` : '—';

  // 마지막 혈당 배너
  if (all.length) {
    const last = all[0];
    const mins = Math.floor((Date.now() - new Date(last.timestamp)) / 60000);
    const timeAgo = mins < 60 ? `${mins}분 전 측정` : mins < 1440 ? `${Math.floor(mins/60)}시간 전 측정` : `${Math.floor(mins/1440)}일 전 측정`;
    document.getElementById('todayLastBG').textContent = last.currentBG;
    document.getElementById('todayLastBGTime').textContent = timeAgo;
    const bg = last.currentBG;
    const badge = document.getElementById('todayBGBadge');
    if (bg < 70) badge.innerHTML = `<span class="bg-status-badge danger">🚨 저혈당</span>`;
    else if (bg < 100) badge.innerHTML = `<span class="bg-status-badge low">😊 정상 하단</span>`;
    else if (bg <= 180) badge.innerHTML = `<span class="bg-status-badge normal">✅ 목표 범위</span>`;
    else if (bg <= 250) badge.innerHTML = `<span class="bg-status-badge high">⚠️ 약간 높음</span>`;
    else badge.innerHTML = `<span class="bg-status-badge danger">🔴 고혈당</span>`;
  }

  // 차트
  const chartData = [...filtered].filter(r => r.isEaten).reverse().slice(-15);
  const ctx = document.getElementById('trendChart');
  if (currentChart) { currentChart.destroy(); currentChart = null; }
  if (!chartData.length) {
    ctx.style.display = 'none';
    ctx.parentElement.innerHTML += `<p style="text-align:center;color:var(--text-muted);padding:20px;font-size:13px">실제 식사로 체크된 기록이 없어요.<br>기록 탭에서 ✅ 체크해 주세요!</p>`;
    return;
  }
  ctx.style.display = '';

  // 기간에 따라 X축 레이블 포맷 결정
  const labels = chartData.map(r => {
    const d = new Date(r.timestamp);
    const mm = d.getMonth() + 1;
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    // 오늘: 시간만, 7일/30일: 날짜+시간 2줄
    return state.chartPeriod === 'today' ? `${hh}:${min}` : `${mm}/${dd}\n${hh}:${min}`;
  });

  if (window.Chart) {
    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '혈당(mg/dL)',
            data: chartData.map(r => r.currentBG),
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            pointBackgroundColor: '#4F46E5',
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y',
            tension: 0.35,
            fill: true
          },
          {
            label: '인슐린(단위)',
            data: chartData.map(r => r.roundedInsulin),
            borderColor: '#0EA5E9',
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            pointBackgroundColor: '#0EA5E9',
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y1',
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 11, weight: '700' }, padding: 12, usePointStyle: true, pointStyleWidth: 8 }
          },
          tooltip: {
            callbacks: {
              // 툴팁 제목에 전체 날짜+시간 표시
              title: (items) => {
                const r = chartData[items[0].dataIndex];
                const d = new Date(r.timestamp);
                return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              }
            }
          }
        },
        scales: {
          x: {
            offset: true, // X축 양끝에 여백 추가
            ticks: {
              font: { size: 10, weight: '600' },
              color: '#9AA0AF',
              maxRotation: 0,       // 레이블 회전 없이 수평 유지
              autoSkip: true,
              maxTicksLimit: state.chartPeriod === 'today' ? 6 : 7
            },
            grid: { color: 'rgba(154, 160, 175, 0.1)' }
          },
          y: {
            type: 'linear',
            position: 'left',
            min: 40,
            suggestedMax: 300,
            ticks: { font: { size: 10 }, color: '#4F46E5', maxTicksLimit: 5 },
            grid: { color: 'rgba(79, 70, 229, 0.1)' },
            title: { display: true, text: 'mg/dL', color: '#4F46E5', font: { size: 10, weight: '700' } }
          },
          y1: {
            type: 'linear',
            position: 'right',
            min: 0,
            ticks: { font: { size: 10 }, color: '#0EA5E9', maxTicksLimit: 5 },
            grid: { drawOnChartArea: false },
            title: { display: true, text: '단위', color: '#0EA5E9', font: { size: 10, weight: '700' } }
          }
        }
      }
    });
  }


  // 코칭 카드
  const hour = new Date().getHours();
  let coaching;
  if (hour >= 5 && hour < 10) coaching = { icon: '🌅', title: '좋은 아침이에요!', msg: '공복 혈당이 오늘의 시작을 결정해요. 아침 식사 전 혈당을 측정하고 계산기를 이용해보세요.', tip: '목표 공복 혈당: 80~130 mg/dL' };
  else if (hour >= 10 && hour < 12) coaching = { icon: '☀️', title: '오전 시간', msg: '오전 혈당이 안정적인지 확인해보세요. 간식이 필요하다면 탄수화물 양을 꼭 기록하세요.', tip: '포도당 젤리를 항상 지참하세요' };
  else if (hour >= 12 && hour < 14) coaching = { icon: '🍱', title: '점심 식사 시간이에요', msg: '활동량이 많은 오후를 앞두고 있어요. 평소보다 인슐린을 약간 줄여야 할 수도 있어요.', tip: '식후 2시간 혈당을 꼭 체크하세요' };
  else if (hour >= 14 && hour < 17) coaching = { icon: '🌤️', title: '오후 시간', msg: '점심 인슐린 피크가 지나가는 시간이에요. 간식을 먹는다면 혈당 상태를 먼저 확인하세요.', tip: '운동 예정이라면 혈당 체크 후 간식 준비' };
  else if (hour >= 17 && hour < 21) coaching = { icon: '🌙', title: '저녁 식사 시간', msg: '고지방 음식(치킨, 피자 등)을 드신다면 새벽 지연성 혈당 상승을 주의하세요.', tip: '취침 전 혈당: 100~140 mg/dL 권장' };
  else coaching = { icon: '😴', title: '야간 시간', msg: '취침 전 혈당이 80 이하라면 간식이 필요해요. 불필요한 야식은 수면 중 고혈당을 유발해요.', tip: '야간 저혈당에 대비해 침대 옆에 주스 준비' };
  document.getElementById('todayCoaching').innerHTML = `
    <div class="coaching-time-icon">${coaching.icon}</div>
    <h3 class="coaching-time-title">${coaching.title}</h3>
    <p class="coaching-time-msg">${coaching.msg}</p>
    <div class="coaching-time-tip">💡 ${coaching.tip}</div>`;
}

// ===================== 13. 정보 탭 콘텐츠 =====================
function renderInfoView() {
  renderDBView('all');
  renderGuideCards();
  renderEmergencyCards();
}
function renderDBView(cat = 'all') {
  const db = window.FOOD_DB || [];
  const query = (document.getElementById('dbSearch')?.value || '').trim().toLowerCase();
  let filtered = cat === 'all' ? db : db.filter(f => f.cat === cat);
  if (query) filtered = filtered.filter(f => f.name.toLowerCase().includes(query) || (f.note && f.note.toLowerCase().includes(query)));
  const container = document.getElementById('dbList');
  if (!filtered.length) { container.innerHTML = `<p style="text-align:center;padding:20px">검색 결과가 없습니다.</p>`; return; }
  container.innerHTML = filtered.map(f => `<div class="db-item">
    <div class="db-item-emoji">${f.emoji}</div>
    <div class="db-item-content"><div class="db-item-name">${f.name}</div><div class="db-item-details">${f.baseAmount}${f.baseUnit} 기준</div></div>
    <div class="db-item-carbs">${f.carbPer}g</div></div>`).join('');
}
function renderGuideCards() {
  const guides = [
    { icon: '��', title: '운동 전후 혈당 관리', content: '운동 전 혈당이 100 이하라면 간식 20~30g을 먼저 드세요. 운동 중 저혈당에 대비해 빠른 당분을 항상 지참하고, 운동 후 2~4시간 내 저혈당 위험이 높으니 추가 모니터링이 필요합니다.' },
    { icon: '🤒', title: '아플 때 (Sick Day Rules)', content: '몸이 아플 때는 먹지 않아도 인슐린이 필요할 수 있어요. 구토/설사 시 탈수에 주의하고 수분을 충분히 드세요. 혈당이 240 이상 지속되면 케톤 검사를 하세요. 인슐린 용량은 반드시 의사와 상의하세요.' },
    { icon: '🎉', title: '특별한 날 음식 (명절/파티)', content: '떡, 케이크, 과자 등 탄수화물이 많은 음식을 먹을 예정이라면 미리 가족/보호자에게 알리세요. 음식 종류와 양을 기록해두고 계산기를 이용하세요. 식후 혈당 모니터링을 평소보다 자주 해야 해요.' },
    { icon: '✈️', title: '여행 시 인슐린 관리', content: '인슐린은 직사광선과 고온을 피해 보관하세요 (2~8°C 권장). 여행 중에는 여분의 인슐린, 주사기, 혈당계를 항상 기내 반입하세요. 시차가 바뀔 때 기저 인슐린 시간 조절이 필요할 수 있어요.' },
    { icon: '💉', title: '주사 부위 로테이션', content: '인슐린은 복부 > 허벅지 > 팔 > 엉덩이 순서로 잘 흡수돼요. 같은 부위에 반복 주사하면 지방경화가 생기고 흡수가 불규칙해져요. 매번 2~3cm씩 위치를 바꿔서 주사하세요.' },
    { icon: '🏫', title: '학교/직장에서 관리', content: '선생님/동료에게 1형 당뇨가 있음을 알리고, 저혈당 시 대처법을 공유하세요. 사물함/책상에 주스나 사탕을 항상 비치하세요. 급식/도시락 탄수화물 정보를 미리 확인하면 더 정확한 계산이 가능해요.' },
  ];
  document.getElementById('infoSectionGuide').innerHTML = guides.map((g, i) => `
    <div class="guide-card" id="guide-card-${i}">
      <button class="guide-card-header" onclick="toggleGuideCard(${i})">
        <span class="guide-card-icon">${g.icon}</span>
        <span class="guide-card-title">${g.title}</span>
        <span class="guide-card-chevron" id="guide-chevron-${i}">▼</span>
      </button>
      <div class="guide-card-body hidden" id="guide-body-${i}">${g.content}</div>
    </div>`).join('');
}
window.toggleGuideCard = function(i) {
  const body = document.getElementById(`guide-body-${i}`);
  const chevron = document.getElementById(`guide-chevron-${i}`);
  body.classList.toggle('hidden');
  chevron.textContent = body.classList.contains('hidden') ? '▼' : '▲';
};
function renderEmergencyCards() {
  document.getElementById('infoSectionEmergency').innerHTML = `
    <div class="emg-card emg-hypo">
      <h3 class="emg-title">🚨 저혈당 대처 (70 mg/dL 이하)</h3>
      <div class="emg-step"><span class="emg-step-num">1</span><p>빠른 당분 <strong>15g</strong>을 즉시 섭취하세요<br><small>주스 반 컵 / 사탕 3~4개 / 포도당정 3~4알</small></p></div>
      <div class="emg-step"><span class="emg-step-num">2</span><p><strong>15분 기다린 후</strong> 혈당을 재측정하세요</p></div>
      <div class="emg-step"><span class="emg-step-num">3</span><p>여전히 70 이하라면 <strong>1~2번 반복</strong>하세요</p></div>
      <div class="emg-step"><span class="emg-step-num">4</span><p>혈당이 올랐다면 정규 식사나 간식으로 유지하세요</p></div>
      <div class="emg-alert">⚠️ 의식이 없으면 즉시 <strong>119</strong>에 신고! 음식/음료를 억지로 먹이지 마세요.</div>
    </div>
    <div class="emg-card emg-hyper">
      <h3 class="emg-title">⚠️ 고혈당 대처 (240 mg/dL 이상)</h3>
      <div class="emg-step"><span class="emg-step-num">1</span><p><strong>수분을 충분히</strong> 섭취하세요 (물 500ml 이상)</p></div>
      <div class="emg-step"><span class="emg-step-num">2</span><p>소변/혈액 <strong>케톤 검사</strong>를 하세요</p></div>
      <div class="emg-step"><span class="emg-step-num">3</span><p>케톤이 높다면 즉시 <strong>의사/병원에 연락</strong>하세요</p></div>
      <div class="emg-step"><span class="emg-step-num">4</span><p>격렬한 운동은 피하고 <strong>안정을 취하세요</strong></p></div>
      <div class="emg-alert">🔔 DKA 증상 주의: 구역질, 복통, 빠르고 깊은 호흡, 달콤한 냄새</div>
    </div>`;
}

// ===================== 14. 범주 탭 카운트 =====================
function updateCategoryCounts() {
  document.querySelectorAll('.cat-tab').forEach(tab => {
    const cat = tab.dataset.cat; if (!cat) return;
    if (!tab.dataset.label) tab.dataset.label = tab.textContent.trim();
    const count = cat === 'all' ? window.FOOD_DB.length : window.FOOD_DB.filter(f => f.cat === cat).length;
    tab.textContent = `${tab.dataset.label} (${count})`;
  });
}

// ===================== 15. 모달 유틸리티 =====================
function openModal(id) {
  const m = document.getElementById(id); m.classList.add('open'); document.body.style.overflow = 'hidden';
  const first = m.querySelector('button, input, [tabindex="0"]'); if (first) first.focus();
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; }
['settingsSheet', 'addFoodModal', 'presetNameModal'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', e => { if (e.target.id === id) closeModal(id); });
});

// ===================== 16. 토스트 =====================
let toastTimer = null;
function showToast(msg, dur = 2500) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), dur);
}

// ===================== 17. 라우팅 =====================
function switchTab(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.target === viewId));
  const titleEl = document.getElementById('headerTitle');
  const actionEl = document.getElementById('headerActions');
  actionEl.innerHTML = '';
  if (viewId === 'view-today') { titleEl.textContent = '오늘'; renderTodayView(); }
  else if (viewId === 'view-calculator') {
    titleEl.textContent = '인슐린 계산기';
    actionEl.innerHTML = `<button class="btn-icon" id="btnSettings" title="개인 설정">⚙️</button>`;
    document.getElementById('btnSettings').addEventListener('click', openSettingsSheet);
    renderPresetBar();
  } else if (viewId === 'view-records') { titleEl.textContent = '나의 기록'; renderRecordsList(); }
  else if (viewId === 'view-info') { titleEl.textContent = '정보'; renderInfoView(); }
}

// ===================== 18. 이벤트 리스너 =====================
function initEventListeners() {
  // 바텀 내비
  document.querySelectorAll('.nav-item').forEach(n => n.addEventListener('click', () => switchTab(n.dataset.target)));
  // 설정 시트
  document.getElementById('settingsClose').addEventListener('click', () => closeModal('settingsSheet'));
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettingsFromSheet);
  // 알림 배너 닫기
  document.getElementById('alertClose').addEventListener('click', () => document.getElementById('alertBanner').classList.remove('visible'));
  // 혈당 빠른 선택
  document.querySelectorAll('.quick-btn').forEach(b => b.addEventListener('click', () => {
    document.getElementById('inputBG').value = b.dataset.bg;
    document.querySelectorAll('.quick-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
  }));
  // 혈당 입력
  document.getElementById('inputBG').addEventListener('input', () => {
    document.querySelectorAll('.quick-btn').forEach(b => b.classList.toggle('active', b.dataset.bg === document.getElementById('inputBG').value));
  });
  // 음식 검색
  document.getElementById('foodSearch').addEventListener('input', e => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => handleSearch(e.target.value), 200);
  });
  // 드롭다운 닫기
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-row')) document.getElementById('searchDropdown').classList.remove('open');
  });
  // 계산기 카테고리 탭
  document.querySelectorAll('#stepFood .cat-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('#stepFood .cat-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    state.currentCategory = tab.dataset.cat;
    renderFoodGrid(tab.dataset.cat, document.getElementById('foodSearch').value);
  }));
  // 직접 입력 토글
  document.getElementById('toggleManual').addEventListener('click', () => {
    const area = document.getElementById('manualInputArea');
    const isHidden = area.classList.toggle('hidden');
    document.getElementById('toggleManual').setAttribute('aria-expanded', !isHidden);
  });
  document.getElementById('btnManualAdd').addEventListener('click', addManualFood);
  document.getElementById('btnClearAll').addEventListener('click', () => { state.selectedFoods = []; renderSelectedFoods(); updateTotalCarbs(); });
  // 프리셋 저장
  document.getElementById('btnSavePreset').addEventListener('click', () => {
    if (!state.selectedFoods.length) { showToast('음식을 먼저 선택해주세요!'); return; }
    document.getElementById('presetNameInput').value = '';
    openModal('presetNameModal');
  });
  document.getElementById('presetNameClose').addEventListener('click', () => closeModal('presetNameModal'));
  document.getElementById('btnConfirmPreset').addEventListener('click', () => {
    const name = document.getElementById('presetNameInput').value.trim();
    if (!name) { showToast('이름을 입력해주세요'); return; }
    saveCurrentAsPreset(name); closeModal('presetNameModal');
  });
  // 계산 버튼
  document.getElementById('btnCalculate').addEventListener('click', calcAndDisplay);
  document.getElementById('toggleRounding').addEventListener('change', updateRounding);
  document.getElementById('btnShareClipboard').addEventListener('click', shareToClipboard);
  document.getElementById('btnShareKakao').addEventListener('click', shareKakao);
  // 히스토리 전체 삭제
  document.getElementById('btnClearHistoryMain').addEventListener('click', () => {
    const btn = document.getElementById('btnClearHistoryMain');
    if (btn.dataset.confirm === 'true') {
      saveHistory([]); renderRecordsList(); updateNavBadge(); showToast('기록이 삭제됐어요');
      btn.dataset.confirm = 'false'; btn.textContent = '🗑️ 전체 기록 삭제'; btn.style.cssText = '';
    } else {
      btn.dataset.confirm = 'true'; btn.textContent = '⚠️ 진짜 삭제할까요?'; btn.style.background = 'var(--danger)'; btn.style.color = '#fff';
      setTimeout(() => { if (btn.dataset.confirm === 'true') { btn.dataset.confirm = 'false'; btn.textContent = '🗑️ 전체 기록 삭제'; btn.style.cssText = ''; } }, 3000);
    }
  });
  document.getElementById('btnExportRecords').addEventListener('click', exportRecords);
  // 음식 모달
  document.getElementById('addFoodClose').addEventListener('click', () => closeModal('addFoodModal'));
  document.getElementById('btnConfirmAdd').addEventListener('click', confirmAddFood);
  document.getElementById('addFoodQty').addEventListener('input', updateQtyPreview);
  document.getElementById('qtyMinus').addEventListener('click', () => {
    const inp = document.getElementById('addFoodQty');
    inp.value = Math.max(0.5, Math.round((parseFloat(inp.value)||1) * 2 - 1) / 2);
    updateQtyPreview();
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    const inp = document.getElementById('addFoodQty');
    inp.value = Math.round(((parseFloat(inp.value)||0) + 0.5) * 2) / 2;
    updateQtyPreview();
  });
  // DB 검색/탭
  document.getElementById('dbSearch').addEventListener('input', () => { const at = document.querySelector('#dbCategoryTabs .active'); renderDBView(at ? at.dataset.dbcat : 'all'); });
  document.querySelectorAll('#dbCategoryTabs .cat-tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('#dbCategoryTabs .cat-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active'); renderDBView(t.dataset.dbcat);
  }));
  // 정보 탭 내부 탭 전환
  document.querySelectorAll('.info-tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.info-tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.info-section').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(`infoSection${t.dataset.infotab.charAt(0).toUpperCase() + t.dataset.infotab.slice(1)}`).classList.add('active');
  }));
  // 저혈당 카드 토글
  document.getElementById('emergencyToggle').addEventListener('click', () => {
    const body = document.getElementById('emergencyBody');
    const chevron = document.getElementById('emergencyToggle').querySelector('.emergency-chevron');
    body.classList.toggle('hidden');
    chevron.textContent = body.classList.contains('hidden') ? '▼' : '▲';
  });
  // 차트 기간 탭
  document.querySelectorAll('.period-tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.period-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active'); state.chartPeriod = t.dataset.period; renderTodayView();
  }));
  // ESC 닫기
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') ['settingsSheet', 'addFoodModal', 'presetNameModal'].forEach(closeModal);
  });
}

// ===================== 19. 초기화 =====================
function init() {
  loadSettings();
  updateCategoryCounts();
  renderFoodGrid('all');
  renderSelectedFoods();
  updateTotalCarbs();
  switchTab('view-today');
  initEventListeners();
  updateNavBadge();
  const isFirstVisit = !localStorage.getItem('insulinCalc_settings');
  if (isFirstVisit) {
    setTimeout(() => { openSettingsSheet(); showToast('👋 처음 오셨군요! 개인 설정을 먼저 입력해주세요', 4000); }, 800);
  }
  console.log('🩵 인슐린 계산기 앱 v2 초기화 완료');
}
document.addEventListener('DOMContentLoaded', init);
