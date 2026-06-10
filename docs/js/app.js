let rows = [];
let rowId = 0;

const presets = {
  '명함':    { spec: '90×50mm',        paper: '아트지 350g',      color: '4도(양면)', qty: 1000, unit: 15000 },
  '전단지':  { spec: 'A4 (210×297mm)', paper: '아트지 130g',      color: '4도(단면)', qty: 1000, unit: 45000 },
  '브로슈어':{ spec: 'A4 접지',        paper: '아트지 200g',      color: '4도(양면)', qty: 500,  unit: 180000 },
  '봉투':    { spec: '229×162mm (C5)', paper: '화이트지 120g',    color: '1도',       qty: 500,  unit: 120000 },
  '롤업배너':{ spec: '850×2000mm',     paper: '배너원단',         color: '4도',       qty: 1,    unit: 55000 },
  '스티커':  { spec: 'A4 사이즈',      paper: '모조지 스티커',    color: '4도',       qty: 100,  unit: 8000 },
};

function init() {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  document.getElementById('quote-date').value = fmt(today);
  const exp = new Date(today); exp.setDate(exp.getDate() + 14);
  document.getElementById('quote-expiry').value = fmt(exp);
  const del = new Date(today); del.setDate(del.getDate() + 7);
  document.getElementById('delivery-date').value = fmt(del);
  document.getElementById('quote-no').value =
    'Q-' + today.getFullYear() +
    String(today.getMonth()+1).padStart(2,'0') +
    String(today.getDate()).padStart(2,'0') +
    '-' + String(Math.floor(Math.random()*900)+100);
  addRow();
}

function addRow(presetName) {
  const id = ++rowId;
  const p = presetName ? presets[presetName] : {};
  rows.push({ id, name: presetName||'', spec: p.spec||'', paper: p.paper||'', color: p.color||'', qty: p.qty||1, unit: p.unit||0 });
  renderTable();
}

function deleteRow(id) {
  rows = rows.filter(r => r.id !== id);
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('items-body');
  tbody.innerHTML = '';
  rows.forEach((r, i) => {
    const amount = (r.qty||0) * (r.unit||0);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td><input class="td-input" style="text-align:left" value="${r.name}" oninput="updateRow(${r.id},'name',this.value)" placeholder="품목명"/></td>
      <td><input class="td-input" style="text-align:left;font-size:0.78rem" value="${r.spec}" oninput="updateRow(${r.id},'spec',this.value)" placeholder="규격"/></td>
      <td><input class="td-input" style="text-align:left;font-size:0.78rem" value="${r.paper}" oninput="updateRow(${r.id},'paper',this.value)" placeholder="용지"/></td>
      <td><input class="td-input" style="text-align:center" value="${r.color}" oninput="updateRow(${r.id},'color',this.value)" placeholder="도수"/></td>
      <td><input class="td-input" type="number" min="1" value="${r.qty}" oninput="updateRow(${r.id},'qty',this.value)"/></td>
      <td><input class="td-input" type="number" min="0" value="${r.unit}" oninput="updateRow(${r.id},'unit',this.value)"/></td>
      <td style="font-weight:600;color:#2b6cb0" id="amt-${r.id}">${fmtNum(amount)}</td>
      <td><button class="btn-del" onclick="deleteRow(${r.id})">삭제</button></td>
    `;
    tbody.appendChild(tr);
  });
  calcTotal();
}

function updateRow(id, field, val) {
  const r = rows.find(r => r.id === id);
  if (!r) return;
  r[field] = (field === 'qty' || field === 'unit') ? Number(val) : val;
  const amtCell = document.getElementById('amt-' + id);
  if (amtCell) amtCell.textContent = fmtNum((r.qty||0)*(r.unit||0));
  calcTotal();
}

function calcTotal() {
  const subtotal = rows.reduce((s,r) => s + (r.qty||0)*(r.unit||0), 0);
  const discount = Number(document.getElementById('discount').value) || 0;
  const vat = Math.round((subtotal - discount) * 0.1);
  const total = subtotal - discount + vat;
  document.getElementById('sum-subtotal').textContent = fmtNum(subtotal) + ' 원';
  document.getElementById('sum-vat').textContent      = fmtNum(vat) + ' 원';
  document.getElementById('sum-total').textContent    = fmtNum(total) + ' 원';
}

function fmtNum(n) { return Number(n).toLocaleString('ko-KR'); }
function fmtDate(s) {
  if (!s) return '-';
  const [y,m,d] = s.split('-');
  return `${y}년 ${m}월 ${d}일`;
}

function generatePreview() {
  const get = id => document.getElementById(id).value;

  const subtotal = rows.reduce((s,r) => s + (r.qty||0)*(r.unit||0), 0);
  const discount = Number(get('discount')) || 0;
  const vat = Math.round((subtotal - discount) * 0.1);
  const total = subtotal - discount + vat;

  const itemRows = rows.map((r,i) => `
    <tr>
      <td>${i+1}</td>
      <td style="text-align:left">${r.name||'-'}</td>
      <td>${r.spec||'-'}</td>
      <td>${r.paper||'-'}</td>
      <td>${r.color||'-'}</td>
      <td>${fmtNum(r.qty)}</td>
      <td>${fmtNum(r.unit)}</td>
      <td style="font-weight:600">${fmtNum((r.qty||0)*(r.unit||0))}</td>
    </tr>`).join('');

  const discountRow = discount > 0 ? `
    <div class="totals-row"><span>할인</span><span style="color:#e53e3e">- ${fmtNum(discount)} 원</span></div>` : '';

  const notes = get('notes');
  const notesBlock = notes ? `
    <div class="quote-notes">
      <strong>📝 비고 및 특이사항</strong><br/>
      <pre style="white-space:pre-wrap;font-family:inherit;font-size:0.85rem;margin-top:6px">${notes}</pre>
    </div>` : '';

  const cn = get('client-name')||'(미입력)';
  const sn = get('shop-name')||'인쇄소';

  document.getElementById('quote-paper').innerHTML = `
    <div class="quote-top">
      <div>
        <div class="quote-title">견 적 서</div>
        <div style="font-size:0.85rem;color:#718096;margin-top:4px">QUOTATION</div>
      </div>
      <div class="quote-no">
        <div><strong>견적번호:</strong> ${get('quote-no')}</div>
        <div><strong>견적일자:</strong> ${fmtDate(get('quote-date'))}</div>
        <div><strong>유효기간:</strong> ${fmtDate(get('quote-expiry'))}</div>
      </div>
    </div>

    <div class="quote-parties">
      <div class="party-box">
        <h4>▸ 공급받는자 (고객)</h4>
        <p><strong>${cn}</strong></p>
        ${get('client-contact') ? `<p>담당자: ${get('client-contact')}</p>` : ''}
        ${get('client-phone')   ? `<p>연락처: ${get('client-phone')}</p>`   : ''}
        ${get('client-email')   ? `<p>이메일: ${get('client-email')}</p>`   : ''}
        ${get('client-address') ? `<p>주소: ${get('client-address')}</p>`   : ''}
      </div>
      <div class="party-box">
        <h4>▸ 공급자 (인쇄소)</h4>
        <p><strong>${sn}</strong></p>
        ${get('shop-biz')     ? `<p>사업자번호: ${get('shop-biz')}</p>` : ''}
        ${get('shop-phone')   ? `<p>전화: ${get('shop-phone')}</p>`     : ''}
        ${get('shop-fax')     ? `<p>팩스: ${get('shop-fax')}</p>`       : ''}
        ${get('shop-address') ? `<p>주소: ${get('shop-address')}</p>`   : ''}
      </div>
    </div>

    <div style="display:flex;gap:24px;margin-bottom:20px;font-size:0.88rem">
      <div><strong>납기 예정일:</strong> ${fmtDate(get('delivery-date'))}</div>
      <div><strong>결제 조건:</strong> ${get('payment-term')}</div>
    </div>

    <table class="quote-table">
      <thead>
        <tr>
          <th>No.</th><th>품목명</th><th>규격/사양</th><th>용지</th>
          <th>도수</th><th>수량</th><th>단가 (원)</th><th>금액 (원)</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="quote-totals">
      <div class="totals-box">
        <div class="totals-row"><span>공급가액 소계</span><span>${fmtNum(subtotal)} 원</span></div>
        ${discountRow}
        <div class="totals-row"><span>부가세 (VAT 10%)</span><span>${fmtNum(vat)} 원</span></div>
        <div class="totals-row grand"><span>합계 금액</span><span>${fmtNum(total)} 원</span></div>
      </div>
    </div>

    ${notesBlock}

    <div class="quote-footer">
      위와 같이 견적서를 제출합니다. 본 견적은 유효기간 내에 유효하며, 이후 변경될 수 있습니다.
    </div>

    <div class="seal-box">
      <div class="seal">
        <p>${fmtDate(get('quote-date'))}</p>
        <p style="font-size:1rem;font-weight:700;color:#2d3748">${sn}</p>
        <div style="display:flex;justify-content:flex-end;margin-top:8px">
          <div class="stamp">인(印)</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('preview-section').style.display = 'block';
  document.getElementById('preview-section').scrollIntoView({ behavior: 'smooth' });
}

function hidePreview() {
  document.getElementById('preview-section').style.display = 'none';
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}

function printQuote() {
  if (document.getElementById('preview-section').style.display === 'none') {
    generatePreview();
    setTimeout(() => window.print(), 400);
  } else {
    window.print();
  }
}

function resetForm() {
  if (!confirm('모든 입력 내용을 초기화하시겠습니까?')) return;
  rows = []; rowId = 0;
  document.querySelectorAll('input:not([readonly]), textarea').forEach(el => {
    el.value = el.type === 'number' && el.id === 'discount' ? '0' : '';
  });
  document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
  document.getElementById('shop-name').value = '소소 인쇄소';
  document.getElementById('preview-section').style.display = 'none';
  init();
}

document.addEventListener('DOMContentLoaded', init);
