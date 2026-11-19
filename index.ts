// @ts-nocheck
// 강원도수어문화원 근태관리 — Supabase Edge Function (자동 생성 파일: 직접 고치지 마세요)
import { createClient } from 'npm:@supabase/supabase-js@2';
// ============================================================
// ① 구글 시트·GAS 흉내 계층 (아래 ②의 근태 코드가 그대로 돌아가게 해 주는 부분)
//    - 한국 시간(Asia/Seoul, UTC+9) 고정: 서버 시간대와 상관없이 같은 결과
//    - 시트 데이터는 요청마다 DB에서 읽어 메모리에서 처리하고, 바뀐 줄만 다시 저장
// ============================================================
const KOFF = 9 * 3600 * 1000;
class KDate extends Date {
  constructor(...a) {
    if (a.length >= 2 && a.every(x => typeof x === 'number')) {
      const y = a[0], m = a[1], d = a.length > 2 ? a[2] : 1, h = a[3] || 0, mi = a[4] || 0, s = a[5] || 0, ms = a[6] || 0;
      super(Date.UTC(y, m, d, h, mi, s, ms) - KOFF);
    } else if (a.length === 1 && typeof a[0] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(a[0])) {
      super(Date.parse(a[0] + 'Z') - KOFF);
    } else { super(...a); }
  }
  _k() { return new Date(this.getTime() + KOFF); }
  getFullYear() { return this._k().getUTCFullYear(); }
  getMonth() { return this._k().getUTCMonth(); }
  getDate() { return this._k().getUTCDate(); }
  getDay() { return this._k().getUTCDay(); }
  getHours() { return this._k().getUTCHours(); }
  getMinutes() { return this._k().getUTCMinutes(); }
  getSeconds() { return this._k().getUTCSeconds(); }
  getMilliseconds() { return this._k().getUTCMilliseconds(); }
  getTimezoneOffset() { return -540; }
  _set(fn) { const k = this._k(); fn(k); this.setTime(k.getTime() - KOFF); return this.getTime(); }
  setDate(v) { return this._set(k => k.setUTCDate(v)); }
  setMonth(v, d) { return this._set(k => d === undefined ? k.setUTCMonth(v) : k.setUTCMonth(v, d)); }
  setFullYear(v) { return this._set(k => k.setUTCFullYear(v)); }
  setHours(h, mi, s, ms) { return this._set(k => k.setUTCHours(h, mi === undefined ? k.getUTCMinutes() : mi, s === undefined ? k.getUTCSeconds() : s, ms === undefined ? k.getUTCMilliseconds() : ms)); }
  setMinutes(v) { return this._set(k => k.setUTCMinutes(v)); }
  toLocaleString(l, o) { return Date.prototype.toLocaleString.call(this, l || 'ko-KR', Object.assign({ timeZone: 'Asia/Seoul' }, o || {})); }
  toLocaleDateString(l, o) { return Date.prototype.toLocaleDateString.call(this, l || 'ko-KR', Object.assign({ timeZone: 'Asia/Seoul' }, o || {})); }
  toLocaleTimeString(l, o) { return Date.prototype.toLocaleTimeString.call(this, l || 'ko-KR', Object.assign({ timeZone: 'Asia/Seoul' }, o || {})); }
}

// ── SHA-256 (동기 방식, 어디서나 동작) ──
function __sha256bytes(str) {
  const msg = new TextEncoder().encode(String(str));
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const l = msg.length, nb = (((l + 9 + 63) >> 6) << 6), buf = new Uint8Array(nb);
  buf.set(msg); buf[l] = 0x80;
  const dv = new DataView(buf.buffer); dv.setUint32(nb - 4, (l * 8) >>> 0); dv.setUint32(nb - 8, Math.floor(l * 8 / 4294967296));
  const w = new Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < nb; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i-15], 7) ^ rotr(w[i-15], 18) ^ (w[i-15] >>> 3), s1 = rotr(w[i-2], 17) ^ rotr(w[i-2], 19) ^ (w[i-2] >>> 10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22), maj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  const out = []; H.forEach(x => { for (let s = 24; s >= 0; s -= 8) { const v = (x >>> s) & 255; out.push(v > 127 ? v - 256 : v); } });
  return out;
}

// ── 시트: 셀 값 변환 (구글 시트처럼 날짜·시간·숫자를 자동으로 바꿈) ──
function __conv(v, isText) {
  if (v === null || v === undefined) return '';
  if (isText || typeof v !== 'string') return v;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) { const p = v.split('-').map(Number); return new KDate(p[0], p[1] - 1, p[2]); }
  if (/^\d{1,2}:\d{2}$/.test(v)) { const p = v.split(':').map(Number); return new KDate(1899, 11, 30, p[0], p[1]); }
  if (/^-?\d+(\.\d+)?$/.test(v) && !/^0\d/.test(v)) return Number(v);
  if (/^'/.test(v)) return v.slice(1);
  return v;
}
function __enc(v) { return v instanceof Date ? { $d: v.getTime() } : v; }
function __dec(v) { return (v && typeof v === 'object' && '$d' in v) ? new KDate(v.$d) : v; }

class KRange {
  constructor(sh, r, c, nr, nc) { this.sh = sh; this.r = r; this.c = c; this.nr = nr; this.nc = nc; }
  getValues() { const o = []; for (let i = 0; i < this.nr; i++) { const row = []; for (let j = 0; j < this.nc; j++) { const x = (this.sh.d[this.r - 1 + i] || [])[this.c - 1 + j]; row.push(x === undefined ? '' : x); } o.push(row); } return o; }
  getValue() { return this.getValues()[0][0]; }
  setValues(vs) { if (vs.length !== this.nr || vs.some(v => v.length !== this.nc)) throw new Error('범위 크기 불일치 ' + this.sh.name); vs.forEach((row, i) => row.forEach((v, j) => this.sh.set(this.r + i, this.c + j, v))); return this; }
  setValue(v) { for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sh.set(this.r + i, this.c + j, v); return this; }
  setNumberFormat(f) { if (f === '@') this.sh.markText(this.r, this.c, this.nr, this.nc); return this; }
  clearContent() { for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) if (this.sh.d[this.r - 1 + i]) this.sh.d[this.r - 1 + i][this.c - 1 + j] = ''; this.sh.trim(); return this; }
  setFontWeight() { return this; } setBackground() { return this; } setFontColor() { return this; } setNote() { return this; }
}
class KSheet {
  constructor(name) { this.name = name; this.d = []; this.text = {}; }   // text: { 열번호: [[시작행,끝행],...] } — 텍스트 서식 범위
  markText(r, c, nr, nc) {
    for (let j = 0; j < nc; j++) {
      const col = c + j, list = (this.text[col] = this.text[col] || []);
      list.push([r, r + nr - 1]); list.sort((a, b) => a[0] - b[0]);
      const m = [];
      list.forEach(x => { const last = m[m.length - 1]; if (last && x[0] <= last[1] + 1) last[1] = Math.max(last[1], x[1]); else m.push([x[0], x[1]]); });
      this.text[col] = m;
    }
  }
  isText(r, c) { const l = this.text[c]; if (!l) return false; for (let i = 0; i < l.length; i++) if (r >= l[i][0] && r <= l[i][1]) return true; return false; }
  set(r, c, v) { if (r < 1 || c < 1) throw new Error('범위 오류'); while (this.d.length < r) this.d.push([]); const row = this.d[r - 1]; while (row.length < c) row.push(''); row[c - 1] = __conv(v, this.isText(r, c)); }
  trim() { while (this.d.length && this.d[this.d.length - 1].every(x => x === '')) this.d.pop(); }
  getLastRow() { this.trim(); return this.d.length; }
  getMaxRows() { return Math.max(this.getLastRow(), 1000); }
  getLastColumn() { return this.d.reduce((m, row) => { let n = row.length; while (n && row[n - 1] === '') n--; return Math.max(m, n); }, 0); }
  getRange(a, b, c, d) {
    if (typeof a === 'string') { const m = a.match(/^([A-Z]):([A-Z])$/); const col = m[1].charCodeAt(0) - 64; return new KRange(this, 1, col, 100000, m[2].charCodeAt(0) - 64 - col + 1); }
    return new KRange(this, a, b, c === undefined ? 1 : c, d === undefined ? 1 : d);
  }
  getDataRange() { return new KRange(this, 1, 1, Math.max(this.getLastRow(), 1), Math.max(this.getLastColumn(), 1)); }
  appendRow(row) { const r = this.getLastRow() + 1; row.forEach((v, j) => this.set(r, j + 1, v)); return this; }
  deleteRow(r) { this.d.splice(r - 1, 1); }
  deleteRows(r, n) { this.d.splice(r - 1, n); }
  insertColumnAfter(c) { this.d.forEach(row => { while (row.length < c) row.push(''); row.splice(c, 0, ''); }); }
  setColumnWidth() {} setFrozenRows() {}
}

// ── 한 번의 요청 동안 쓰는 "구글 환경" 만들기 ──
//  state: { sheets:{이름:KSheet}, props:{키:값}, propsDirty:{키:값|null}, fetchCache:{}, need:null }
function makeEnv(state, opts) {
  const p2 = n => String(n).padStart(2, '0');
  const ss = {
    getSheetByName: n => state.sheets[n] || null,
    insertSheet: n => { if (state.sheets[n]) throw new Error('이미 있는 시트 ' + n); return (state.sheets[n] = new KSheet(n)); },
    getId: () => 'att', getSheets: () => Object.keys(state.sheets).map(k => state.sheets[k]),
  };
  const cache = state.cache || (state.cache = {});
  class NeedFetch extends Error {}
  return {
    Date: KDate, console, edge: !!(opts && opts.edge),
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    Utilities: {
      computeDigest: (a, str) => __sha256bytes(str), DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
      getUuid: () => crypto.randomUUID(),
      newBlob: () => { throw new Error('사진 저장은 서버 앞단에서 처리합니다.'); }, base64Decode: () => { throw new Error('미지원'); },
      formatDate: (d, tz, f) => { const k = new Date((d instanceof Date ? d.getTime() : new Date(d).getTime()) + KOFF); return f.replace(/yyyy|MM|dd|HH|mm|ss/g, t => ({ yyyy: k.getUTCFullYear(), MM: p2(k.getUTCMonth() + 1), dd: p2(k.getUTCDate()), HH: p2(k.getUTCHours()), mm: p2(k.getUTCMinutes()), ss: p2(k.getUTCSeconds()) })[t]); },
    },
    ContentService: { MimeType: { TEXT: 't', JSON: 'j' }, createTextOutput: s => ({ text: s, setMimeType() { return this; } }) },
    DriveApp: { Access: { ANYONE_WITH_LINK: 'a' }, Permission: { VIEW: 'v' } },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },   // 동시 저장은 DB의 버전 확인으로 막음
    CacheService: { getScriptCache: () => ({ get: k => (cache[k] === undefined ? null : cache[k]), put: (k, v) => { cache[k] = v; }, remove: k => { delete cache[k]; } }) },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: k => (k in state.props ? state.props[k] : null),
      setProperty: (k, v) => { state.props[k] = String(v); state.propsDirty[k] = String(v); },
      deleteProperty: k => { delete state.props[k]; state.propsDirty[k] = null; },
    }) },
    // 바깥 서버 호출(슬랙·카카오): 처음엔 "필요하다"고 알리고 멈춤 → 서버 앞단이 호출해서 결과를 채운 뒤 처음부터 다시 실행
    UrlFetchApp: { fetch: (url, opt) => {
      opt = opt || {};
      const key = JSON.stringify([url, String(opt.method || 'get').toLowerCase(), opt.payload || '', (opt.headers || {}).Authorization || '']);
      const hit = state.fetchCache[key];
      if (hit) return { getResponseCode: () => hit.code, getContentText: () => hit.text };
      const need = { key, url, method: String(opt.method || 'get').toLowerCase(), headers: opt.headers || {}, payload: opt.payload || null, contentType: opt.contentType || null };
      state.need = need; (state.needs = state.needs || []).push(need);
      throw new NeedFetch('NEED_FETCH');
    } },
  };
}

// ============================================================
// ② 근태 업무 코드 (구글 시트용으로 만들었던 코드를 거의 그대로 담은 부분)
// ============================================================
function createCore(env) {
  const { SpreadsheetApp, Utilities, ContentService, DriveApp, LockService, CacheService, PropertiesService, UrlFetchApp, console } = env;
  const Date = env.Date;
  const __EDGE__ = !!env.edge;
// ============================================================
// 근태관리 시스템 (휴가·시간외·대체휴무 + 시수·대체시수) - Code.gs
// ★ 이 파일 하나만 붙여넣으면 됩니다. 코드는 수정하지 마세요 ★
// ★ 기관명·비밀번호 등은 [설정] 시트 또는 관리자 화면에서 변경 ★
//
// 【구성】 ① 설정·공통 도우미  ② 로그인·관리자 인증  ③ 휴가·시간외·대체휴무
//        ④ 시수·대체시수  ⑤ 공지·연가 촉진  ⑥ 출퇴근·출장(GPS)  ⑦ 출장 신청·복명서
//   (각 구역은 '// ====' 줄로 나뉘어 있습니다. Ctrl+F 로 구역 제목을 찾으세요.)
// 【버전】 index.html 과 이 파일의 버전이 같아야 합니다. (관리자 화면 [기관 설정]에서 비교 표시)
// ============================================================
const APP_VERSION = '2026.11.19-2';   // ← 고칠 때마다 날짜로 바꾸세요. index.html 맨 위의 APP_VERSION 과 같게 유지

// 시트 이름 (변경 금지)
const SHEETS = {
  STAFF:     "직원목록",
  LEAVE:     "휴가신청",
  OVERTIME:  "시간외신청",
  LEAVE_BAL: "연차관리",
  CONFIG:    "설정",        // ← 관리자가 수정하는 시트
  COMP:      "대체휴무",
  COMP_USE:  "대체휴무사용",
  SIS:       "시수보고서",
  ALT:       "대체시수보고서",
  APPROVAL:  "결재설정",
  OT_REQ:    "시간외사전신청",   // 시간외 근무 전, 직원이 사유를 적어 선임에게 먼저 신청
};

// Supabase 서버(Edge Function)에서 돌 때만 true — 이때는 구글 로그인으로 본인을 확인하므로 PIN·관리자 비밀번호를 쓰지 않음
function _edge() { return typeof __EDGE__ !== 'undefined' && __EDGE__ === true; }

// 승인 상태 판별 (예전 데이터의 '확인'도 승인으로 인정)
function _isApproved(s) { s = String(s).trim(); return s === '승인' || s === '확인'; }
// 휴가는 선임 승인 없이 신청 즉시 확정 → 반려가 아니면 모두 인정 (옛 '대기' 건 포함)
function _leaveOk(s) { s = String(s).trim(); return s !== '반려'; }
function _isPending(s)  { s = String(s).trim(); return s === '' || s === '대기'; }
function _fmtD(v) { return v instanceof Date ? Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd') : String(v == null ? '' : v); }
function _fmtT(v) { return v instanceof Date ? Utilities.formatDate(v, 'Asia/Seoul', 'HH:mm') : String(v == null ? '' : v); }
function _yearOf(v) { if (!v) return null; const d = v instanceof Date ? v : new Date(v); return isNaN(d.getTime()) ? null : d.getFullYear(); }
function _round3(n) { return Math.round(Number(n) * 1000) / 1000; }
function _num(v) { return Number(String(v == null ? '' : v).replace(/[^0-9.]/g, '')) || 0; }
function _values(sheetName) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getDataRange().getValues().slice(1);
}

// 설정 시트에서 값 읽기 (캐시: 실행당 1회)
let _configCache = null;
function getConfig() {
  if (_configCache) return _configCache;
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
    if (!sheet) {
      // 설정 시트가 없으면 기본값 사용 + 시트 자동 생성
      _createConfigSheet();
      _configCache = _defaultConfig();
      return _configCache;
    }
    const data = sheet.getDataRange().getValues();
    const map = {};
    data.forEach(row => {
      const key = String(row[0]).trim();
      const val = String(row[1]).trim();
      if (key && !key.startsWith('#')) map[key] = val;
    });
    _configCache = {
      ADMIN_PASSWORD: map['관리자비밀번호'] || '',
      ORG_NAME:       map['기관명']         || '우리 지회',
      ANNUAL_LEAVE:   Number(map['연차기본일수']) || 15,
      WORK_HOURS:     Number(map['일일기준근무시간']) || 8,
      SISU_RANGE:     /^\d{1,2}-\d{1,2}$/.test(map['시수입력시간대'] || '') ? map['시수입력시간대'] : '9-18',
    };
  } catch(e) {
    _configCache = _defaultConfig();
  }
  return _configCache;
}

function _defaultConfig() {
  return { ADMIN_PASSWORD:'', ORG_NAME:'우리 지회', ANNUAL_LEAVE:15, WORK_HOURS:8, SISU_RANGE:'9-18' };
}

// 설정 시트 자동 생성 (최초 1회)
function _createConfigSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.insertSheet(SHEETS.CONFIG);
    const rows = [
      ['# 아래 항목을 수정하세요. 항목명(A열)은 절대 변경하지 마세요.', ''],
      ['기관명',           '우리 지회'],
      ['관리자비밀번호',   ''],
      ['연차기본일수',     '15'],
      ['일일기준근무시간', '8'],
      ['시수입력시간대',   '9-18'],
    ];
    sheet.getRange(1, 2, rows.length, 1).setNumberFormat('@');
    sheet.getRange(1, 1, rows.length, 2).setValues(rows);
    // 헤더 행 색상
    sheet.getRange(1, 1, 1, 2).setBackground('#f3f4f6').setFontColor('#888');
    sheet.getRange(2, 1, rows.length-1, 1).setFontWeight('bold');
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 240);
    sheet.getRange(2, 2, rows.length-1, 1).setBackground('#fffde7');
  } catch(e) {}
}

// ============================================================
// 웹앱 진입점
// ============================================================
function doGet(e) {
  // GET 파라미터로 fn이 오면 함수 호출
  if (e && e.parameter && e.parameter.fn) {
    return _routeGet(e);
  }
  // 그 외 GET 요청 → 연결 확인용 응답
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: getConfig().ORG_NAME + ' GAS 연결 정상' }))
    .setMimeType(ContentService.MimeType.TEXT);
}

// ============================================================
// doPost: Vercel 앱에서 fetch(POST)로 호출하는 진입점
// body: { fn: "함수명", arg: JSON문자열 또는 null }
// ============================================================
function doPost(e) {
  // GAS ContentService는 커스텀 CORS 헤더 미지원
  // → text/plain으로 응답하면 브라우저 CORS 프리플라이트 없이 통과됨
  try {
    const body = JSON.parse(e.postData.contents);
    const result = _dispatch(body.fn, body.arg);
    return ContentService
      .createTextOutput(typeof result === 'string' ? result : JSON.stringify(result))
      .setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, msg: err.message }))
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// GET 방식 라우팅 (필요시)
function _routeGet(e) {
  const fn = e.parameter.fn;
  const arg = e.parameter.arg || null;
  const result = _dispatch(fn, arg);
  return ContentService
    .createTextOutput(typeof result === 'string' ? result : JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 함수명 → 실제 함수 디스패치
function _dispatch(fn, arg) {
  try {
    if (!_edge() && ADMIN_FNS.indexOf(fn) >= 0) {   // 관리자 전용: 관리자 비밀번호가 함께 와야 실행 (Supabase는 서버 앞단이 관리자 계정을 확인)
      let env = null;
      try { env = JSON.parse(arg); } catch(e) {}
      if (!env || typeof env !== 'object' || !('__a' in env) || !_adminOk(env.__a)) {
        return { ok: false, denied: true, msg: _isLocked('admin') ? LOCK_MSG : '관리자 인증이 필요합니다. 관리자 모드로 다시 로그인하세요.' };
      }
      arg = env.__p === undefined ? null : env.__p;
    }
    switch (fn) {
      // ── 인증 ──
      case 'login':           { const p = JSON.parse(arg); return login(p.name, p.pin); }
      case 'adminLogin':      { const p = JSON.parse(arg); return adminLogin(p.pw); }
      case 'changePin':       { const p = JSON.parse(arg); return changePin(p.name, p.oldPin, p.newPin); }
      case 'getOrgConfig':    return getOrgConfig();
      case 'getStaffNames':   return getStaffNames();
      case 'initSheets':      return initSheets();
      case 'getAdminStaff':   return getAdminStaff();
      case 'saveStaff':       { const p = JSON.parse(arg); return saveStaff(p); }
      case 'getAdminConfig':  return getAdminConfig();
      case 'saveAdminConfig': { const p = JSON.parse(arg); return saveAdminConfig(p); }

      // ── 연차/잔여 ──
      case 'getMyLeaveBalance': { const p = JSON.parse(arg); return getMyLeaveBalance(p.name, p.year); }
      case 'getLeaveBalance':   { const p = arg ? JSON.parse(arg) : {}; return getLeaveBalance(p.year); }
      case 'saveLeaveBalance':  { const p = JSON.parse(arg); return saveLeaveBalance(p.rows, p.year); }

      // ── 휴가 ──
      case 'submitLeave':       { const p = JSON.parse(arg); return submitLeave(p); }
      case 'getAdminLeaves':    return getAdminLeaves();
      case 'getSupervisorLeaves': { const p = JSON.parse(arg); return getSupervisorLeaves(p.auth); }
      case 'deleteLeaveRow':    { const p = JSON.parse(arg); return deleteLeaveRow(p.row); }
      case 'updateLeaveStatus': { const p = JSON.parse(arg); return supervisorUpdateStatus(p.auth, SHEETS.LEAVE, p.row, p.status); }

      // ── 시간외 ──
      case 'saveOtPicture':      { const p = JSON.parse(arg); return saveOtPicture(p.base64, p.filename); }
      case 'submitOvertime':     { const p = JSON.parse(arg); return submitOvertime(p); }
      case 'getWeeklyActualHours': { const p = JSON.parse(arg); return getWeeklyActualHours(p.name, p.date); }
      case 'calcOvertimePay':    { const p = JSON.parse(arg); return calcOvertimePay(p.hourly, p.dayType, p.start, p.end, p.actualWeeklyHours, p.name); }
      case 'getAdminOvertimes':  return getAdminOvertimes();
      case 'getSupervisorOvertimes': { const p = JSON.parse(arg); return getSupervisorOvertimes(p.auth); }
      case 'deleteOvertimeRow':  { const p = JSON.parse(arg); return deleteOvertimeRow(p.row); }
      case 'updateOvertimeStatus': { const p = JSON.parse(arg); return supervisorUpdateStatus(p.auth, SHEETS.OVERTIME, p.row, p.status); }

      // ── 시수 보고서 ──
      case 'loadAltStaffList':   return loadAltStaffList();
      case 'loadApprovalConfig': return loadApprovalConfig();
      case 'adminSaveApproval':  return adminSaveApproval(arg);
      case 'saveData':           return saveData(arg);
      case 'loadData':           return loadData(arg);
      case 'loadLatestByName':   return loadLatestByName(arg);
      case 'saveConfirmData':    return saveConfirmData(arg);
      case 'listAllData':        return listAllData();
      case 'getMyRecordList':    return getMyRecordList(arg);

      // ── 대체시수 ──
      case 'saveAltOccData':     return saveAltOccData(arg);
      case 'saveAltUseData':     return saveAltUseData(arg);
      case 'loadAltData':        return loadAltData(arg);
      case 'loadAltLatestByName': return loadAltLatestByName(arg);
      case 'listAllAltData':     return listAllAltData();
      case 'getAltRecordList':   return getAltRecordList(arg);
      case 'confirmAltOccRow':   return confirmAltOccRow(arg);
      case 'confirmAltUseRow':   return confirmAltUseRow(arg);

      // ── 내역 ──
      case 'getMyHistory':      { const p = JSON.parse(arg); return getMyHistory(p.name); }

      // ── 대체휴무 ──
      case 'grantCompLeave':    { const p = JSON.parse(arg); return grantCompLeave(p.name, p.days, p.reason); }
      case 'getMyCompLeave':    { const p = JSON.parse(arg); return getMyCompLeave(p.name); }
      case 'submitCompLeave':   { const p = JSON.parse(arg); return submitCompLeave(p); }
      case 'deleteCompLeaveRow': { const p = JSON.parse(arg); return deleteCompLeaveRow(p.row); }
      case 'cancelCompGrant':    { const p = JSON.parse(arg); return cancelCompGrant(p.row); }
      case 'getAdminCompLeaveRequests': return getAdminCompLeaveRequests();
      case 'getAdminCompLeaveGrants':   return getAdminCompLeaveGrants();
      case 'getSupervisorCompLeaves': { const p = JSON.parse(arg); return getSupervisorCompLeaves(p.auth); }
      case 'updateCompLeaveStatus': { const p = JSON.parse(arg); return supervisorUpdateStatus(p.auth, SHEETS.COMP_USE, p.row, p.status); }
      case 'getSupervisorPending':  { const p = JSON.parse(arg); return getSupervisorPending(p.auth); }

      // ── 시간외 사전 신청 (선임 수락 후에만 근무 타이머) ──
      case 'submitOvertimeRequest':       { const p = JSON.parse(arg); return submitOvertimeRequest(p); }
      case 'getMyOvertimeRequests':       { const p = JSON.parse(arg); return getMyOvertimeRequests(p.name); }
      case 'deleteOvertimeRequestRow':    { const p = JSON.parse(arg); return deleteOvertimeRequestRow(p.row, p.name); }
      case 'getAdminOvertimeRequests':    return getAdminOvertimeRequests();
      case 'getSupervisorOvertimeRequests': { const p = JSON.parse(arg); return getSupervisorOvertimeRequests(p.auth); }
      case 'updateOvertimeRequestStatus': { const p = JSON.parse(arg); return supervisorUpdateStatus(p.auth, SHEETS.OT_REQ, p.row, p.status); }

      // ── 출퇴근·출장 (모바일 GPS) ──
      case 'getMyAttendToday':    { const p = JSON.parse(arg); return getMyAttendToday(p.auth); }
      case 'punchAttend':         { const p = JSON.parse(arg); return punchAttend(p); }
      case 'deleteMyAttendReason': { const p = JSON.parse(arg); return deleteMyAttendReason(p); }
      case 'getMyMonthAttend':    { const p = JSON.parse(arg); return getMyMonthAttend(p); }
      case 'getAttendAdminConfig': return getAttendAdminConfig();
      case 'saveAttendConfig':    { const p = JSON.parse(arg); return saveAttendConfig(p); }
      case 'geocodeAddress':      { const p = JSON.parse(arg); return geocodeAddressAdmin(p); }
      case 'getAdminAttendMonth': { const p = JSON.parse(arg); return getAdminAttendMonth(p); }
      case 'adminSaveAttend':     { const p = JSON.parse(arg); return adminSaveAttend(p); }
      case 'adminDeleteAttend':   { const p = JSON.parse(arg); return adminDeleteAttend(p); }
      case 'adminSaveTrip':       { const p = JSON.parse(arg); return adminSaveTrip(p); }
      case 'adminDeleteTrip':     { const p = JSON.parse(arg); return adminDeleteTrip(p); }
      case 'getAdminAttendLog':   { const p = JSON.parse(arg); return getAdminAttendLog(p); }

      // ── 출장 신청 (선임 승인 → 인쇄 결재) ──
      case 'getTripFormConfig':          return getTripFormConfig();
      case 'submitTripRequest':          { const p = JSON.parse(arg); return submitTripRequest(p); }
      case 'getMyTripRequests':          { const p = JSON.parse(arg); return getMyTripRequests(p.auth); }
      case 'getSupervisorTripRequests':  { const p = JSON.parse(arg); return getSupervisorTripRequests(p.auth); }
      case 'deleteTripRequest':          { const p = JSON.parse(arg); return deleteTripRequest(p); }
      case 'getAdminTripRequests':       { const p = arg ? JSON.parse(arg) : {}; return getAdminTripRequests(p); }
      case 'adminDeleteTripRequest':     { const p = JSON.parse(arg); return adminDeleteTripRequest(p); }
      case 'saveTripReport':             { const p = JSON.parse(arg); return saveTripReport(p); }
      case 'getTripUnapplied':           { const p = JSON.parse(arg); return getTripUnapplied(p); }
      case 'getAdminTripUnapplied':      return getAdminTripUnapplied();
      case 'getTripAdminConfig':         return getTripAdminConfig();
      case 'saveTripAdminConfig':        { const p = JSON.parse(arg); return saveTripAdminConfig(p); }

      // ── 슬랙 알림 설정 (관리자 비밀번호 필요) ──
      case 'getSlackConfig':   return getSlackConfig();
      case 'saveSlackConfig':  { const p = JSON.parse(arg); return saveSlackConfig(p); }
      case 'sendSlackTest':    { const p = JSON.parse(arg); return sendSlackTest(p); }

      // ── 공지사항 ──
      case 'getNotices':        return getNotices();
      case 'getAdminNotices':   return getAdminNotices();
      case 'saveNotice':        { const p = JSON.parse(arg); return saveNotice(p); }
      case 'deleteNotice':      { const p = JSON.parse(arg); return deleteNotice(p.id); }

      // ── 연가 사용 촉진 (연 3회 통지 · 사용 계획서) ──
      case 'getPromoConfig':    { const p = arg ? JSON.parse(arg) : {}; return getPromoConfig(p.year); }
      case 'savePromoConfig':   { const p = JSON.parse(arg); return savePromoConfig(p); }
      case 'getAdminPromo':     { const p = arg ? JSON.parse(arg) : {}; return getAdminPromo(p.year); }
      case 'adminPromoNotify':  { const p = JSON.parse(arg); return adminPromoNotify(p.year, p.round, p.names); }
      case 'getMyPromo':        { const p = JSON.parse(arg); return getMyPromo(p.auth, p.year); }
      case 'submitPromoPlan':   { const p = JSON.parse(arg); return submitPromoPlan(p.auth, p.year, p.round, p.rows); }

      // ── 관리자 대시보드 ──
      case 'getAdminDashboard': { const p = arg ? JSON.parse(arg) : {}; return getAdminDashboard(p.year); }

      default:
        return { ok: false, msg: '알 수 없는 함수: ' + fn };
    }
  } catch(err) {
    return { ok: false, msg: '[' + fn + '] ' + err.message };
  }
}

// ============================================================
// 시간외 근무 사진 → Google Drive 저장
// ============================================================
function saveOtPicture(base64Data, filename) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ssFile = DriveApp.getFileById(ss.getId());
    const parentFolder = ssFile.getParents().next();

    // "시간외근무_사진" 폴더 찾기 or 생성
    let folder;
    const folders = parentFolder.getFoldersByName('시간외근무_사진');
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = parentFolder.createFolder('시간외근무_사진');
    }

    // base64 → Blob 변환 후 저장
    const contentType = base64Data.match(/^data:(.*?);base64,/)[1];
    const pureBase64 = base64Data.replace(/^data:.*?;base64,/, '');
    const blob = Utilities.newBlob(Utilities.base64Decode(pureBase64), contentType, filename);
    const file = folder.createFile(blob);

    // 공유 링크 설정 (링크 있는 사람 열람)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const viewUrl = 'https://drive.google.com/file/d/' + fileId + '/view';
    const imgUrl  = 'https://drive.google.com/uc?id=' + fileId;

    return { ok: true, fileId, viewUrl, imgUrl };
  } catch(err) {
    return { ok: false, msg: err.message };
  }
}

// ============================================================
// 초기화: 시트가 없으면 자동 생성 (관리자 로그인 시 자동 실행)
// ============================================================
const OT_HEADERS = ['신청일','이름','근무일','요일구분','시작시간','종료시간','근무시간','해당주실근무시간','수당발생시간','예상수당','상태','업무내용','사진','시작위치','종료위치','시작지도','종료지도','처리일','사전신청행'];
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 직원목록 시트
  if (!ss.getSheetByName(SHEETS.STAFF)) {
    const s = ss.insertSheet(SHEETS.STAFF);
    s.getRange(1,1,1,12).setValues([['이름','PIN','시급','부서','직위','연락처','역할','담당선임','연차부여일수','주간기준시간','비고','슬랙ID']]);
    s.getRange(1,1,1,12).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
    // 주간기준시간 안내 메모
    s.getRange(1,10).setNote('비워두면 설정 시트의 기본값(40시간) 사용. 단축근무자는 여기에 실제 주간 근무시간 입력. 예) 20, 30, 35');
  } else {
    // 기존 시트에 컬럼이 없으면 헤더만 추가 (데이터 보호)
    const s = ss.getSheetByName(SHEETS.STAFF);
    const header = s.getRange(1,1,1,s.getLastColumn()).getValues()[0];
    if (!header.includes('주간기준시간')) {
      const col = s.getLastColumn() + 1;
      s.getRange(1, col).setValue('주간기준시간')
        .setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
      s.getRange(1, col).setNote('비워두면 기본값(40시간). 단축근무자만 입력. 예) 20, 30, 35');
    }
  }

  // 직원목록 12번째 열 '슬랙ID' (선임에게 슬랙 DM을 보낼 때 사용) — 비어 있을 때만 머리글 추가
  try {
    const st = ss.getSheetByName(SHEETS.STAFF);
    if (st && String(st.getRange(1,12).getValue()||'').trim() === '') {
      st.getRange(1,12).setValue('슬랙ID').setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
    }
    // 13·14번째 열: 출근기준/퇴근기준 시각 (비우면 기관 기본값 사용)
    if (st && String(st.getRange(1,13).getValue()||'').trim() === '') st.getRange(1,13,1,2).setValues([['출근기준','퇴근기준']]).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
    if (st) st.getRange(2,13,Math.max(st.getMaxRows()-1,1),2).setNumberFormat('@');
    // 15번째 열: 구글계정(로그인에 쓰는 업무용 이메일)
    if (st && String(st.getRange(1,15).getValue()||'').trim() === '') st.getRange(1,15).setValue('구글계정').setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
    if (st) st.getRange(2,15,Math.max(st.getMaxRows()-1,1),1).setNumberFormat('@');
  } catch(e) {}

  // 시간외사전신청 시트
  if (!ss.getSheetByName(SHEETS.OT_REQ)) {
    const s = ss.insertSheet(SHEETS.OT_REQ);
    s.getRange(1,1,1,9).setValues([['신청일','이름','근무예정일','예정시작','예정종료','사유','상태','처리일','요청ID']]);
    s.getRange(1,1,1,9).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
  }

  // 휴가신청 시트
  if (!ss.getSheetByName(SHEETS.LEAVE)) {
    const s = ss.insertSheet(SHEETS.LEAVE);
    s.getRange(1,1,1,9).setValues([['신청일','이름','휴가종류','시작일','종료일','일수','사유','상태','처리일']]);
    s.getRange(1,1,1,9).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
  }

  // 시간외신청 시트
  if (!ss.getSheetByName(SHEETS.OVERTIME)) {
    const s = ss.insertSheet(SHEETS.OVERTIME);
    s.getRange(1,1,1,OT_HEADERS.length).setValues([OT_HEADERS]);
    s.getRange(1,1,1,OT_HEADERS.length).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
  } else {
    // 예전 머리글(12열에 '처리일')을 실제 저장 구조에 맞게 바로잡기 — 데이터는 건드리지 않음
    const s = ss.getSheetByName(SHEETS.OVERTIME);
    const h = s.getRange(1,1,1,Math.max(s.getLastColumn(),1)).getValues()[0];
    if (String(h[11]||'') !== '업무내용' || String(h[17]||'') !== '처리일' || String(h[18]||'') !== '사전신청행') {
      s.getRange(1,1,1,OT_HEADERS.length).setValues([OT_HEADERS]);
      s.getRange(1,1,1,OT_HEADERS.length).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
    }
  }

  // 연차관리 시트 (연도별 구조)
  if (!ss.getSheetByName(SHEETS.LEAVE_BAL)) {
    const s = ss.insertSheet(SHEETS.LEAVE_BAL);
    s.getRange(1,1,1,4).setValues([['이름','연도','부여일수','비고']]);
    s.getRange(1,1,1,4).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
    s.getRange(1,2).setNote('연도를 입력하세요. 예) 2026');
  } else {
    // 기존 시트에 연도 컬럼이 없으면 자동 추가
    const s = ss.getSheetByName(SHEETS.LEAVE_BAL);
    const header = s.getRange(1,1,1,s.getLastColumn()).getValues()[0];
    if (!header.includes('연도')) {
      // B열에 연도 삽입 (기존 데이터 뒤로 밀기)
      s.insertColumnAfter(1);
      s.getRange(1,2).setValue('연도').setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
      // 기존 데이터 행에 올해 연도 채우기
      const lastRow = s.getLastRow();
      const year = new Date().getFullYear();
      if (lastRow > 1) {
        for (let r = 2; r <= lastRow; r++) {
          s.getRange(r, 2).setValue(year);
        }
      }
    }
  }

  // ★ 설정 시트 — 코드 수정 없이 여기서 관리
  if (!ss.getSheetByName(SHEETS.CONFIG)) {
    _createConfigSheet();
  }

  // 대체휴무 / 시수 / 대체시수 / 결재설정 시트
  _getCompSheet(); _getCompUseSheet();
  getOrCreateSisSheet(); getOrCreateAltSheet(); getOrCreateApprovalConfigSheet();

  // 직원목록 PIN 열은 텍스트로 (앞자리 0 보존)
  try { ss.getSheetByName(SHEETS.STAFF).getRange('B:B').setNumberFormat('@'); } catch(e) {}

  return { ok: true };
}

// ============================================================
// PIN 암호화(해시) · 로그인 잠금 · 관리자 인증
//  - PIN은 시트에 "h1$솔트$해시값" 형태로만 저장되어 관리자도 볼 수 없습니다.
//  - 잊어버리면 관리자가 [직원 관리]에서 새 번호를 입력해 바꿔줍니다.
// ============================================================
const PIN_ROUNDS = 300;
const LOCK_MAX = 5, LOCK_SEC = 600;     // 10분 안에 5번 틀리면 10분간 잠금

function _sha(str) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  return b.map(x => ('0' + (x & 0xff).toString(16)).slice(-2)).join('');
}
function _isHashed(v) { return /^h1\$[0-9a-f]{16,64}\$[0-9a-f]{64}$/.test(String(v || '').trim()); }
function _hashPin(pin, salt) {
  salt = salt || Utilities.getUuid().replace(/-/g, '');
  let h = salt + ':' + String(pin).trim();
  for (let i = 0; i < PIN_ROUNDS; i++) h = _sha(h + salt);
  return 'h1$' + salt + '$' + h;
}
function _pinMatches(stored, pin) {
  stored = String(stored == null ? '' : stored).trim(); pin = String(pin == null ? '' : pin).trim();
  if (!stored || !pin) return false;
  if (_isHashed(stored)) return _hashPin(pin, stored.split('$')[1]) === stored;
  return stored === pin;                 // 아직 암호화 전인 예전 PIN (처음 로그인/관리자 로그인 때 자동 암호화)
}
function _lockKey(k) { return 'lk_' + _sha(String(k)).slice(0, 24); }
function _isLocked(k) {
  try { return Number(CacheService.getScriptCache().get(_lockKey(k)) || 0) >= LOCK_MAX; } catch(e) { return false; }
}
function _lockFail(k) {
  try {
    const c = CacheService.getScriptCache(), key = _lockKey(k);
    c.put(key, String(Number(c.get(key) || 0) + 1), LOCK_SEC);
  } catch(e) {}
}
function _lockClear(k) { try { CacheService.getScriptCache().remove(_lockKey(k)); } catch(e) {} }
const LOCK_MSG = '비밀번호를 여러 번 틀려 10분간 잠겼습니다. 잠시 후 다시 시도하세요.';

// 관리자 비밀번호 확인 (틀리면 횟수 누적)
function _adminOk(pw) {
  if (_isLocked('admin')) return false;
  const ok = String(pw || '') !== '' && String(pw) === String(getConfig().ADMIN_PASSWORD);
  if (ok) _lockClear('admin'); else _lockFail('admin');
  return ok;
}
// 관리자만 쓸 수 있는 함수 — 호출할 때 관리자 비밀번호가 함께 와야 함
const ADMIN_FNS = ['getAdminTripUnapplied','getAdminTripRequests','adminDeleteTripRequest','getTripAdminConfig','saveTripAdminConfig','getAttendAdminConfig','saveAttendConfig','geocodeAddress','getAdminAttendMonth','adminSaveAttend','adminDeleteAttend','adminSaveTrip','adminDeleteTrip','getAdminAttendLog','adminPromoNotify','getAdminNotices','saveNotice','deleteNotice','getPromoConfig','savePromoConfig','getAdminPromo','initSheets','getAdminStaff','saveStaff','getAdminConfig','saveAdminConfig',
  'getLeaveBalance','saveLeaveBalance','getAdminLeaves','getAdminOvertimes','getAdminOvertimeRequests',
  'getAdminCompLeaveRequests','getAdminCompLeaveGrants','grantCompLeave','cancelCompGrant',
  'getAdminDashboard','adminSaveApproval'];

// 예전 평문 PIN을 한꺼번에 암호화
function _migratePins() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.STAFF);
  if (!sheet || sheet.getLastRow() < 2) return 0;
  const rng = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1);
  const vals = rng.getValues(); let n = 0;
  const out = vals.map(v => {
    const t = String(v[0] == null ? '' : v[0]).trim();
    if (!t || _isHashed(t)) return [v[0]];
    n++; return [_hashPin(t)];
  });
  if (n) { rng.setNumberFormat('@'); rng.setValues(out); }
  return n;
}

// ============================================================
// 로그인 & 직원 정보
// ============================================================
function login(name, pin) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.STAFF);
    if (!sheet) return { ok: false, msg: '직원목록 시트가 없습니다. 관리자에게 문의하세요.' };
    const nm = String(name || '').trim();
    if (_isLocked('u:' + nm)) return { ok: false, msg: LOCK_MSG };

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === nm && _pinMatches(data[i][1], pin)) {
        _lockClear('u:' + nm);
        if (!_isHashed(data[i][1])) {          // 예전 평문 PIN → 지금 암호화
          const c = sheet.getRange(i + 1, 2); c.setNumberFormat('@'); c.setValue(_hashPin(pin));
        }
        const role = String(data[i][6] || '일반').trim();
        let myStaff = [];
        if (role === '선임' || role === '관리자') {
          myStaff = data.slice(1)
            .filter(r => String(r[7]).trim() === String(data[i][0]).trim())
            .map(r => String(r[0]).trim());
        }
        return {
          ok: true,
          name:        String(data[i][0]),
          hourly:      Number(data[i][2]) || 0,
          dept:        String(data[i][3] || ''),
          position:    String(data[i][4] || ''),  // 직위
          contact:     String(data[i][5] || ''),  // 연락처
          role:        role === '관리자' ? '선임' : role,
          myStaff:     myStaff,
          annualLeave: Number(data[i][8]) || 0,
          weeklyHours: Number(data[i][9]) || 0,  // 0이면 설정 기본값 사용
        };
      }
    }
    _lockFail('u:' + nm);
    return { ok: false, msg: '이름 또는 PIN이 올바르지 않습니다.' };
  } catch(e) {
    return { ok: false, msg: e.message };
  }
}

// 이름으로 직원 정보 만들기 (login 성공 결과와 같은 모양) — Supabase 로그인(whoami)에서 사용
function _staffInfoByName(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.STAFF);
  if (!sheet) return null;
  const nm = String(name || '').trim();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() !== nm) continue;
    const role = String(data[i][6] || '일반').trim();
    let myStaff = [];
    if (role === '선임' || role === '관리자') myStaff = data.slice(1).filter(r => String(r[7]).trim() === nm).map(r => String(r[0]).trim());
    return {
      ok: true, name: String(data[i][0]), hourly: Number(data[i][2]) || 0, dept: String(data[i][3] || ''), position: String(data[i][4] || ''),
      contact: String(data[i][5] || ''), role: role === '관리자' ? '선임' : role, myStaff: myStaff,
      annualLeave: Number(data[i][8]) || 0, weeklyHours: Number(data[i][9]) || 0,
    };
  }
  return null;
}
// 구글 계정(이메일)으로 직원 이름 찾기 — 직원목록 15열
function _staffNameByEmail(email) {
  const em = String(email || '').trim().toLowerCase();
  if (!em) return '';
  const hit = _staffRows().filter(r => String(r[14] || '').trim().toLowerCase() === em)[0];
  return hit ? String(hit[0]).trim() : '';
}
function _staffEmails() { return _staffRows().map(r => String(r[14] || '').trim().toLowerCase()).filter(Boolean); }

// 웹앱이 기관명 등 설정값을 읽어가는 함수
function getOrgConfig() {
  const cfg = getConfig();
  return { ok: true, orgName: cfg.ORG_NAME, annualLeave: cfg.ANNUAL_LEAVE };
}

function getStaffNames() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.STAFF);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    return data.slice(1).map(r => String(r[0]).trim()).filter(n => n);
  } catch(e) { return []; }
}

function adminLogin(pw) {
  if (_isLocked('admin')) return { ok: false, msg: LOCK_MSG };
  if (!String(getConfig().ADMIN_PASSWORD || '')) return { ok: false, msg: '관리자 비밀번호가 아직 정해지지 않았습니다. 구글 시트 [설정] 시트의 "관리자비밀번호" 칸에 직접 입력하세요.' };
  if (!_adminOk(pw)) return { ok: false, msg: '비밀번호가 틀렸습니다.' };
  try { initSheets(); } catch(e) {}   // 필요한 시트를 자동으로 준비
  try { _migratePins(); } catch(e) {} // 예전 평문 PIN 암호화
  return { ok: true, orgName: getConfig().ORG_NAME };
}

// ============================================================
// 슬랙 알림: 후임이 신청하면 담당 선임의 슬랙 DM으로 알려준다
//  - 봇 토큰은 [스크립트 속성]에만 저장 (시트에 노출되지 않음), 선임의 슬랙 ID는 [직원목록] 12열
//  - 알림이 실패해도 신청 저장에는 영향 없음 (조용히 건너뜀)
// ============================================================
function _slackToken() {
  try { return PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN') || ''; } catch(e) { return ''; }
}
function _siteUrl() {
  try { return PropertiesService.getScriptProperties().getProperty('SITE_URL') || ''; } catch(e) { return ''; }
}
function _slackPost(slackId, text) {
  const token = _slackToken();
  if (!token) return { ok: false, error: 'no_token' };
  try {
    const res = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
      method: 'post', contentType: 'application/json; charset=utf-8',
      headers: { Authorization: 'Bearer ' + token },
      payload: JSON.stringify({ channel: slackId, text: text }),
      muteHttpExceptions: true,
    });
    const j = JSON.parse(res.getContentText() || '{}');
    return { ok: !!j.ok, error: j.error || '' };
  } catch(e) { return { ok: false, error: String(e.message || e) }; }
}
function _slackIdOf(name) {
  const row = _staffRows().filter(r => String(r[0]).trim() === String(name).trim())[0];
  return row ? String(row[11] || '').trim() : '';
}
function _notifySupervisor(requester, title, detail) {
  try {
    const supName = _supervisorMap()[String(requester).trim()];
    if (!supName) return;
    const sid = _slackIdOf(supName);
    if (!sid || !_slackToken()) return;
    const url = _siteUrl();
    _slackPost(sid, ':bell: *' + title + '*\n' + requester + ' 님 · ' + detail + (url ? '\n<' + url + '|근태 시스템에서 확인하기>' : ''));
  } catch(e) {}
}
function _slackErrorMsg(code) {
  const m = {
    no_token: '봇 토큰이 아직 저장되지 않았습니다.',
    invalid_auth: '봇 토큰이 올바르지 않습니다. (xoxb- 로 시작하는 Bot User OAuth Token)',
    not_authed: '봇 토큰이 올바르지 않습니다.', token_revoked: '봇 토큰이 취소되었습니다. 새 토큰을 입력하세요.',
    channel_not_found: '슬랙 ID를 찾을 수 없습니다. 프로필 → ⋮ → [멤버 ID 복사] 로 U 로 시작하는 ID를 입력하세요.',
    user_not_found: '슬랙 ID를 찾을 수 없습니다.', missing_scope: '슬랙 앱에 chat:write 권한을 추가하고 다시 설치하세요.',
    not_in_channel: '봇이 해당 대화에 참여할 수 없습니다.',
  };
  return m[code] || ('슬랙 오류: ' + code);
}
function _isAdminPw(pw) { return _edge() ? true : _adminOk(pw); }   // Supabase: 관리자 여부는 서버 앞단이 구글 계정으로 확인
function getSlackConfig() {
  return { ok: true, hasToken: !!_slackToken(), siteUrl: _siteUrl() };
}
function saveSlackConfig(p) {
  try {
    if (!_isAdminPw(p.pw)) return { ok: false, msg: '관리자 비밀번호가 올바르지 않습니다.' };
    const props = PropertiesService.getScriptProperties();
    if (p.clearToken) props.deleteProperty('SLACK_BOT_TOKEN');
    else if (String(p.token || '').trim()) {
      const t = String(p.token).trim();
      if (!/^xoxb-/.test(t)) return { ok: false, msg: '봇 토큰은 xoxb- 로 시작합니다. (Bot User OAuth Token)' };
      props.setProperty('SLACK_BOT_TOKEN', t);
    }
    if (p.siteUrl !== undefined) props.setProperty('SITE_URL', String(p.siteUrl || '').trim());
    return { ok: true, hasToken: !!_slackToken() };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function sendSlackTest(p) {
  try {
    if (!_isAdminPw(p.pw)) return { ok: false, msg: '관리자 비밀번호가 올바르지 않습니다.' };
    const name = String(p.name || '').trim();
    const sid = _slackIdOf(name);
    if (!name || !sid) return { ok: false, msg: name ? name + ' 님의 슬랙 ID가 비어 있습니다. [직원 관리]에서 입력 후 저장하세요.' : '직원을 선택하세요.' };
    const r = _slackPost(sid, ':white_check_mark: 근태 시스템 슬랙 알림 테스트입니다. 이 메시지가 보이면 설정이 완료된 것입니다.');
    return r.ok ? { ok: true } : { ok: false, msg: _slackErrorMsg(r.error), code: r.error };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// 직원 본인: 비밀번호(PIN) 변경 — 현재 PIN을 맞게 입력해야 바꿀 수 있음
function changePin(name, oldPin, newPin) {
  try {
    name = String(name || '').trim(); oldPin = String(oldPin || '').trim(); newPin = String(newPin || '').trim();
    if (!name || !oldPin) return { ok: false, msg: '현재 비밀번호를 입력하세요.' };
    if (newPin.length < 4 || newPin.length > 12 || /\s/.test(newPin)) return { ok: false, msg: '새 비밀번호는 공백 없이 4~12자로 입력하세요.' };
    if (newPin === oldPin) return { ok: false, msg: '현재 비밀번호와 다른 값을 입력하세요.' };
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.STAFF);
    if (!sheet) return { ok: false, msg: '직원목록 시트가 없습니다.' };
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() !== name) continue;
      if (_isLocked('u:' + name)) return { ok: false, msg: LOCK_MSG };
      if (!_pinMatches(data[i][1], oldPin)) { _lockFail('u:' + name); return { ok: false, msg: '현재 비밀번호가 올바르지 않습니다.' }; }
      _lockClear('u:' + name);
      const cell = sheet.getRange(i + 1, 2);
      cell.setNumberFormat('@');                 // 텍스트로 저장
      cell.setValue(_hashPin(newPin));           // 암호화해서 저장 — 아무도 원래 번호를 볼 수 없음
      return { ok: true };
    }
    return { ok: false, msg: '직원 정보를 찾을 수 없습니다.' };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// 관리자 화면: 기관 설정 조회/저장 (비밀번호는 [설정] 시트에서만 변경)
function getAdminConfig() {
  const c = getConfig();
  return { ok: true, version: APP_VERSION, orgName: c.ORG_NAME, annualLeave: c.ANNUAL_LEAVE, workHours: c.WORK_HOURS, sisuRange: c.SISU_RANGE };
}
function saveAdminConfig(p) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEETS.CONFIG);
    if (!sheet) { _createConfigSheet(); sheet = ss.getSheetByName(SHEETS.CONFIG); }
    const pairs = { '기관명': p.orgName, '연차기본일수': p.annualLeave, '일일기준근무시간': p.workHours, '시수입력시간대': p.sisuRange };
    const data = sheet.getDataRange().getValues();
    Object.keys(pairs).forEach(key => {
      const val = pairs[key];
      if (val === undefined || val === null || String(val).trim() === '') return;
      let row = -1;
      for (let i = 0; i < data.length; i++) if (String(data[i][0]).trim() === key) { row = i + 1; break; }
      if (row < 0) { sheet.appendRow([key, String(val)]); data.push([key, String(val)]); }
      else sheet.getRange(row, 2).setNumberFormat('@').setValue(String(val).trim());
    });
    _configCache = null;
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ============================================================
// 핵심 로직: 해당 주 실근무시간 계산
// ============================================================
function getWeeklyActualHours(name, targetDateStr) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const target = new Date(targetDateStr);
    const dayOfWeek = target.getDay();
    const monday = new Date(target);
    monday.setDate(target.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d);
    }

    // 개인별 주간 기준시간: 직원목록 → 없으면 설정 시트 기본값
    let standardHours = getConfig().WORK_HOURS * 5; // 기본 40시간
    const staffSheet2 = ss.getSheetByName(SHEETS.STAFF);
    if (staffSheet2) {
      const sData = staffSheet2.getDataRange().getValues();
      for (let i = 1; i < sData.length; i++) {
        if (String(sData[i][0]).trim() === String(name).trim()) {
          const personal = Number(sData[i][9]);
          if (personal > 0) standardHours = personal; // 단축근무자 개인 설정
          break;
        }
      }
    }

    // 시수 차감 (시수보고서 기준, 같은 연도만)
    let sisuHours = 0;
    _values(SHEETS.SIS).forEach(row => {
      if (String(row[1]).trim() !== String(name).trim()) return;
      const y = _sisYear(row);
      if (y && y !== target.getFullYear()) return;
      const month = Number(row[7]), day = Number(row[8]);
      const startH = Number(row[9]), endH = Number(row[10]);
      if (!month || !day || isNaN(startH) || isNaN(endH) || endH <= startH) return;
      weekDates.forEach(d => {
        if (d.getMonth() + 1 === month && d.getDate() === day) sisuHours += endH - startH;
      });
    });

    // 휴가 차감 (승인된 것만, 해당 주 날짜 기준)
    const leaveSheet = ss.getSheetByName(SHEETS.LEAVE);
    let leaveHours = 0;
    let leaveDaysInWeek = 0;
    if (leaveSheet) {
      const leaveData = leaveSheet.getDataRange().getValues();
      for (let i = 1; i < leaveData.length; i++) {
        const row = leaveData[i];
        if (String(row[1]).trim() !== String(name).trim()) continue;
        if (!_leaveOk(row[7])) continue;
        const startD = new Date(row[3]);
        const endD   = new Date(row[4]);
        if (isNaN(startD) || isNaN(endD)) continue;
        startD.setHours(0,0,0,0); endD.setHours(23,59,59,999);
        weekDates.forEach(d => {
          if (d >= startD && d <= endD) {
            const type = String(row[2]);
            const dailyH = standardHours / 5; // 하루 기준시간 (단축근무자 반영)
            if (type.includes('반차')) { leaveHours += dailyH / 2; leaveDaysInWeek += 0.5; }
            else { leaveHours += dailyH; leaveDaysInWeek += 1; }
          }
        });
      }
    }

    const actual = Math.max(0, standardHours - sisuHours - leaveHours);

    return {
      ok: true,
      standard:   standardHours,
      sisuUsed:   sisuHours,
      leaveHours: leaveHours,
      leaveDays:  leaveDaysInWeek,
      actual,
      weekStart: Utilities.formatDate(weekDates[0], 'Asia/Seoul', 'MM/dd'),
      weekEnd:   Utilities.formatDate(weekDates[4], 'Asia/Seoul', 'MM/dd'),
    };
  } catch(e) {
    return { ok: false, msg: e.message };
  }
}

function parseTimeStr(str) {
  if (!str) return NaN;
  const parts = str.split(':');
  if (parts.length < 2) return NaN;
  return Number(parts[0]) + Number(parts[1]) / 60;
}

// ============================================================
// 수당 계산
// ============================================================
function calcOvertimePay(hourly, dayType, startStr, endStr, actualWeeklyHours, name) {
  const start = parseTimeStr(startStr);
  const end   = parseTimeStr(endStr);
  if (isNaN(start) || isNaN(end) || end <= start) return { ok: false, msg: '시간 입력 오류' };

  const totalHours = end - start;
  // 개인별 주간 기준시간 조회
  let personalStd = getConfig().WORK_HOURS * 5;
  try {
    const _ss = SpreadsheetApp.getActiveSpreadsheet();
    const _st = _ss.getSheetByName(SHEETS.STAFF);
    if (_st) {
      const _d = _st.getDataRange().getValues();
      for (let _i = 1; _i < _d.length; _i++) {
        if (String(_d[_i][0]).trim() === String(name).trim()) {
          const _p = Number(_d[_i][9]);
          if (_p > 0) personalStd = _p;
          break;
        }
      }
    }
  } catch(e) {}
  const shortage   = Math.max(0, personalStd - actualWeeklyHours);
  const paidHours  = Math.max(0, totalHours - shortage);

  let details = [], totalPay = 0;

  const calc = (segments, rateFn) => {
    let paidRemaining = paidHours;
    segments.forEach(seg => {
      const h = seg.hours;
      const paidH = Math.min(h, paidRemaining);
      paidRemaining -= paidH;
      const rate = rateFn(seg.t);
      const pay = Math.round(hourly * paidH * rate);
      totalPay += pay;
      details.push({ label: `${formatT(seg.t)}~${formatT(seg.end)} (${rate*100}%)`, hours: h, paidHours: paidH, pay });
    });
  };

  if (dayType === 'weekday') {
    calc(splitByTime(start, end, [18, 22, 24]), t => t < 22 ? 1.5 : 2.0);
  } else {
    calc(splitByTime(start, end, [9, 18, 22, 24]), t => t < 18 ? 1.5 : t < 22 ? 2.0 : 2.5);
  }

  return {
    ok: true, totalHours, shortage, paidHours, totalPay, details,
    warning: shortage > 0
      ? `이번 주 실근무시간이 ${actualWeeklyHours}시간이라 ${shortage}시간은 수당이 발생하지 않습니다. ${paidHours}시간만 수당 적용됩니다.`
      : null,
  };
}

function splitByTime(start, end, breakpoints) {
  const segs = [];
  let cur = start;
  for (const bp of breakpoints) {
    if (cur >= end) break;
    if (bp <= cur) continue;
    const segEnd = Math.min(bp, end);
    if (segEnd > cur) { segs.push({ t: cur, end: segEnd, hours: segEnd - cur }); cur = segEnd; }
  }
  return segs;
}

function formatT(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
}

// ============================================================
// 휴가 신청 저장
// ============================================================
function submitLeave(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEETS.LEAVE);
    if (!sheet) { initSheets(); sheet = ss.getSheetByName(SHEETS.LEAVE); }
    const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    sheet.appendRow([today, data.name, data.leaveType, data.startDate, data.endDate, data.days, data.reason || '', '승인', today]);   // 선임 승인 없이 즉시 확정
    _notifySupervisor(data.name, '휴가 확정 (참고)',
      data.leaveType + ' · ' + data.startDate + (data.endDate && data.endDate !== data.startDate ? ' ~ ' + data.endDate : '') +
      ' (' + data.days + ')' + (data.reason ? ' · ' + data.reason : ''));
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ============================================================
// 시간외 신청 저장
// ============================================================
function submitOvertime(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEETS.OVERTIME);
    if (!sheet) { initSheets(); sheet = ss.getSheetByName(SHEETS.OVERTIME); }
    const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    // 선임이 수락한 사전 신청이 있어야만 제출할 수 있다 (한 건의 사전 신청 = 한 번의 근무 보고)
    const name = String(data.name || '').trim();
    const reqId = String(data.preReqId || '').trim();
    if (!reqId) return { ok: false, msg: '선임이 수락한 시간외 사전 신청이 있어야 제출할 수 있습니다.' };
    const reqSheet = _getOtReqSheet();
    const reqRow = _findOtReqRow(reqId);
    if (!reqRow) return { ok: false, msg: '사전 신청을 찾을 수 없습니다.' };
    const rr = reqSheet.getRange(reqRow, 1, 1, 9).getValues()[0];
    if (String(rr[1]).trim() !== name) return { ok: false, msg: '본인의 사전 신청이 아닙니다.' };
    if (String(rr[6]).trim() !== '수락') return { ok: false, msg: '선임이 수락한 사전 신청만 사용할 수 있습니다. (현재 상태: ' + (String(rr[6]).trim() || '대기') + ')' };
    if (_fmtD(rr[2]) !== _fmtD(data.workDate)) return { ok: false, msg: '사전 신청한 근무예정일(' + _fmtD(rr[2]) + ')과 근무일이 다릅니다.' };
    sheet.appendRow([today, data.name, data.workDate, data.dayType, data.startTime, data.endTime, data.totalHours, data.actualWeeklyHours, data.paidHours, data.totalPay, '대기', data.content||'', data.photoUrl||'', data.gpsStart||'', data.gpsEnd||'', data.gpsStartMap||'', data.gpsEndMap||'', '', reqId]);
    reqSheet.getRange(reqRow, 7).setValue('완료');
    _notifySupervisor(data.name, '시간외 근무 보고서 제출 (최종 승인 대기)',
      data.workDate + ' ' + data.startTime + '~' + data.endTime + ' · 수당 ' + (data.paidHours || 0) + 'h' + (data.content ? ' · ' + data.content : ''));
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ============================================================
// 관리자: 직원 목록 조회 / 저장
// ============================================================
function getAdminStaff() {
  try {
    return _values(SHEETS.STAFF).filter(r => String(r[0]).trim()).map((r, i) => ({
      name: String(r[0]).trim(), pin: '', hasPin: !!String(r[1] || '').trim(), hourly: Number(r[2]) || 0, dept: String(r[3] || ''),
      position: String(r[4] || ''), contact: String(r[5] || ''),
      role: String(r[6] || '일반').trim() || '일반', supervisor: String(r[7] || '').trim(),
      annualLeave: Number(r[8]) || 0,
      weeklyHours: Number(r[9]) || '',
      note: String(r[10] || ''),
      slackId: String(r[11] || '').trim(),
      stdIn: _fmtT(r[12]).trim(), stdOut: _fmtT(r[13]).trim(),
      email: String(r[14] || '').trim().toLowerCase(),
    }));
  } catch(e) { return []; }
}

function saveStaff(rows) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEETS.STAFF);
    if (!sheet) { initSheets(); sheet = ss.getSheetByName(SHEETS.STAFF); }
    const clean = (rows || []).filter(r => r && String(r.name || '').trim());
    const names = clean.map(r => String(r.name).trim());
    if (new Set(names).size !== names.length) return { ok: false, msg: '같은 이름의 직원이 있습니다. 이름을 구분해 주세요.' };
    // PIN: 새로 입력한 칸만 암호화해서 저장, 비워두면 기존 PIN 유지 (관리자는 기존 PIN을 볼 수 없음)
    const oldPin = {};
    _values(SHEETS.STAFF).forEach(r => { const n = String(r[0]).trim(); if (n) oldPin[n] = String(r[1] == null ? '' : r[1]).trim(); });
    const pinOut = [];
    const emails = clean.map(r => String(r.email || '').trim().toLowerCase());
    if (_edge()) {                       // 구글 계정 확인: 형식, 중복
      for (let i = 0; i < emails.length; i++) {
        if (emails[i] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emails[i])) return { ok: false, msg: String(clean[i].name).trim() + ': 구글 계정(이메일) 형식이 올바르지 않습니다.' };
      }
      const seen = {};
      for (let i = 0; i < emails.length; i++) {
        if (!emails[i]) continue;
        if (seen[emails[i]]) return { ok: false, msg: emails[i] + ' 계정이 두 명에게 입력되어 있습니다.' };
        seen[emails[i]] = 1;
      }
    }
    for (const r of clean) {
      const typed = String(r.pin || '').trim();
      const nm = String(r.name).trim();
      if (_edge()) { pinOut.push(''); continue; }   // Supabase: 구글 로그인으로 본인 확인 → PIN 없음
      if (typed) {
        if (typed.length < 4 || typed.length > 12 || /\s/.test(typed)) return { ok: false, msg: nm + ': PIN은 공백 없이 4~12자로 입력하세요.' };
        pinOut.push(_hashPin(typed)); _lockClear('u:' + nm);
      } else {
        const keep = oldPin[String(r.origName || nm).trim()] || oldPin[nm] || '';
        if (!keep) return { ok: false, msg: nm + ': 새 직원은 PIN을 입력해야 합니다.' };
        pinOut.push(_isHashed(keep) ? keep : _hashPin(keep));
      }
    }
    const values = clean.map((r, i) => [
      String(r.name).trim(), pinOut[i], Number(r.hourly) || 0, r.dept || '',
      r.position || '', r.contact || '',
      r.role || '일반', r.supervisor || '',
      Number(r.annualLeave) || 0,
      Number(r.weeklyHours) > 0 ? Number(r.weeklyHours) : '',
      r.note || '',
      String(r.slackId || '').trim(),
      _okHM(r.stdIn) ? _normHM(r.stdIn) : '', _okHM(r.stdOut) ? _normHM(r.stdOut) : '',
      emails[i],
    ]);
    sheet.getRange(1,1,1,15).setValues([['이름','PIN','시급','부서','직위','연락처','역할','담당선임','연차부여일수','주간기준시간','비고','슬랙ID','출근기준','퇴근기준','구글계정']]);
    const last = sheet.getLastRow();
    if (last > 1) sheet.getRange(2, 1, last - 1, 15).clearContent();
    if (values.length) {
      sheet.getRange(2, 2, values.length, 1).setNumberFormat('@');   // PIN: 앞자리 0 보존
      sheet.getRange(2, 6, values.length, 1).setNumberFormat('@');   // 연락처
      sheet.getRange(2, 13, values.length, 3).setNumberFormat('@');  // 출근/퇴근 기준시각, 구글계정
      sheet.getRange(2, 1, values.length, 15).setValues(values);
    }
    return { ok: true, count: values.length };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ============================================================
// 연차 잔여 계산
// ============================================================

// 개인용 (대시보드 배너에 표시)
function getMyLeaveBalance(name, year) {
  try {
    const bal = _calcLeaveBalance(name, year);
    return {
      ok: true,
      year:      bal.year,
      granted:   bal.annualTotal,
      used:      bal.totalUsed,
      remaining: bal.remain,
      sisuUsedDays:      bal.sisuUsedDays,
      leavedDays:        bal.leavedDays,
      totalConfirmedChi: bal.totalConfirmedChi,
      nextChiNeeded:     bal.nextChiNeeded,
    };
  } catch(e) { return { ok: false }; }
}

// 관리자: 특정 연도의 연차 목록 조회
function getLeaveBalance(year) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.LEAVE_BAL);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const header = data[0];
    const hasYearCol = header.includes('연도');
    const targetYear = year ? Number(year) : new Date().getFullYear();

    return data.slice(1)
      .filter(r => {
        if (!String(r[0]).trim()) return false;
        if (hasYearCol) return Number(r[1]) === targetYear;
        return true;
      })
      .map(r => hasYearCol
        ? { name: String(r[0]), year: Number(r[1]), granted: Number(r[2]) || 0, note: String(r[3] || '') }
        : { name: String(r[0]), year: targetYear,   granted: Number(r[1]) || 0, note: String(r[2] || '') }
      );
  } catch(e) { return []; }
}

// 관리자: 연차 저장 (연도별 — 같은 이름+연도 행을 덮어씀, 다른 연도는 보존)
function saveLeaveBalance(rows, year) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEETS.LEAVE_BAL);
    if (!sheet) { initSheets(); sheet = ss.getSheetByName(SHEETS.LEAVE_BAL); }

    const targetYear = year ? Number(year) : new Date().getFullYear();
    const header = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    const hasYearCol = header.includes('연도');

    if (hasYearCol) {
      // 연도별 구조: 해당 연도 행만 삭제 후 재작성, 다른 연도는 유지
      const all = sheet.getDataRange().getValues();
      const kept = all.slice(1).filter(r => Number(r[1]) !== targetYear && String(r[0]).trim());
      const newRows = rows.map(r => [r.name, targetYear, r.granted, r.note || '']);
      const merged = [...kept, ...newRows].sort((a, b) =>
        String(a[0]).localeCompare(String(b[0]), 'ko') || Number(a[1]) - Number(b[1])
      );
      const last = sheet.getLastRow();
      if (last > 1) sheet.deleteRows(2, last - 1);
      if (merged.length > 0) sheet.getRange(2, 1, merged.length, 4).setValues(merged);
    } else {
      // 구버전 구조: 전체 덮어쓰기
      const last = sheet.getLastRow();
      if (last > 1) sheet.deleteRows(2, last - 1);
      rows.forEach(r => sheet.appendRow([r.name, r.granted, r.note || '']));
    }

    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

function _calcLeaveBalance(name, year) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targetYear = year ? Number(year) : new Date().getFullYear();

  // 부여 연차: 연차관리 시트에서 해당 연도 행 찾기
  let annualTotal = 0;
  const balSheet = ss.getSheetByName(SHEETS.LEAVE_BAL);
  if (balSheet) {
    const bData = balSheet.getDataRange().getValues();
    const header = bData[0];
    const hasYearCol = header.includes('연도');
    const found = bData.slice(1).find(r => {
      const nameMatch = String(r[0]).trim() === String(name).trim();
      if (!nameMatch) return false;
      if (hasYearCol) return Number(r[1]) === targetYear;
      return true; // 연도 컬럼 없는 구버전은 그냥 사용
    });
    if (found) annualTotal = hasYearCol ? (Number(found[2]) || 0) : (Number(found[1]) || 0);
  }
  // 연차관리에 없으면 직원목록 기본값
  if (!annualTotal) {
    const staffSheet = ss.getSheetByName(SHEETS.STAFF);
    if (staffSheet) {
      const sData = staffSheet.getDataRange().getValues();
      const found = sData.slice(1).find(r => String(r[0]).trim() === String(name).trim());
      if (found) annualTotal = Number(found[8]) || 0;
    }
  }

  // 시수: 해당 연도에 선임이 확인(승인)한 차시 수 — 1차시 = 1/8일 (8차시 = 연차 1일), 확인 즉시 반영
  let totalSavedChi = 0;
  _values(SHEETS.SIS).forEach(r => {
    if (String(r[1]).trim() !== String(name).trim()) return;
    if (!String(r[7]).trim() || !String(r[8]).trim()) return;
    if (String(r[12]) !== 'Y') return;
    const y = _sisYear(r);
    if (y && y !== targetYear) return;
    totalSavedChi++;
  });
  const sisuUsedDays = _round3(totalSavedChi / 8);

  // 휴가신청: 해당 연도 승인 건만 (시작일 기준)
  const leaveSheet = ss.getSheetByName(SHEETS.LEAVE);
  let leavedDays = 0;
  if (leaveSheet) {
    leaveSheet.getDataRange().getValues().slice(1).forEach(r => {
      if (String(r[1]).trim() !== String(name).trim()) return;
      if (!_leaveOk(r[7])) return;
      const y = _yearOf(r[3]);
      if (y && y !== targetYear) return;
      leavedDays += _num(r[5]);
    });
  }

  const totalUsed = _round3(sisuUsedDays + leavedDays);
  const remain = Math.max(0, _round3(annualTotal - totalUsed));

  return {
    year: targetYear,
    annualTotal,
    sisuUsedDays,
    leavedDays,
    totalUsed,
    remain,
    totalConfirmedChi: totalSavedChi,
    nextChiNeeded: 8 - (totalSavedChi % 8 === 0 && totalSavedChi > 0 ? 8 : totalSavedChi % 8),
  };
}

// ============================================================
// 선임/관리자 휴가·시간외 조회
// ============================================================
function _leaveList(filterNames) {
  try {
    const sup = _supervisorMap();
    return _values(SHEETS.LEAVE)
      .map((r, i) => ({ r, row: i + 2 }))                       // 시트의 실제 행 번호를 먼저 붙인 뒤 거르기
      .filter(x => String(x.r[1]).trim() && (!filterNames || filterNames.includes(String(x.r[1]).trim())))
      .map(({ r, row }) => ({
        row, date: _fmtD(r[0]), name: String(r[1]).trim(), supervisor: sup[String(r[1]).trim()] || '', type: String(r[2]),
        start: _fmtD(r[3]), end: _fmtD(r[4]), days: String(r[5]),
        reason: String(r[6] || ''), status: _leaveOk(r[7]) ? '승인' : '반려', processed: _fmtD(r[8]),
        detail: String(r[2]) + ' · ' + _fmtD(r[3]) + (_fmtD(r[4]) && _fmtD(r[4]) !== _fmtD(r[3]) ? ' ~ ' + _fmtD(r[4]) : '') +
                ' (' + r[5] + ')' + (r[6] ? ' · ' + r[6] : ''),
      })).reverse();
  } catch(e) { return []; }
}
function _overtimeList(filterNames) {
  try {
    const sup = _supervisorMap();
    return _values(SHEETS.OVERTIME)
      .map((r, i) => ({ r, row: i + 2 }))
      .filter(x => String(x.r[1]).trim() && (!filterNames || filterNames.includes(String(x.r[1]).trim())))
      .map(({ r, row }) => ({
        row, date: _fmtD(r[0]), name: String(r[1]).trim(), supervisor: sup[String(r[1]).trim()] || '', workDate: _fmtD(r[2]), dayType: String(r[3]),
        startTime: _fmtT(r[4]), endTime: _fmtT(r[5]), totalHours: Number(r[6]) || 0,
        actualWeekly: Number(r[7]) || 0, paidHours: Number(r[8]) || 0, totalPay: Number(r[9]) || 0,
        status: String(r[10] || '대기'), content: String(r[11] || ''), photoUrl: String(r[12] || ''),
        processed: _fmtD(r[17]),
        gpsStart: String(r[13] || ''), gpsEnd: String(r[14] || ''), gpsStartMap: String(r[15] || ''), gpsEndMap: String(r[16] || ''),
        detail: _fmtD(r[2]) + ' ' + _fmtT(r[4]) + '~' + _fmtT(r[5]) + ' · 수당 ' + (Number(r[8]) || 0) + 'h ' +
                (Number(r[9]) || 0).toLocaleString() + '원' + (r[11] ? ' · ' + r[11] : ''),
      })).reverse();
  } catch(e) { return []; }
}
// ── 선임 승인 체계 ─────────────────────────────────────────
// 신청 → 그 직원의 '담당선임'(직원목록 H열)이 승인/반려. 관리자는 조회만 한다.
// 누가 요청했는지는 이름+PIN으로 서버에서 다시 확인한다 (화면에서 보낸 이름을 믿지 않음).
function _staffRows() { return _values(SHEETS.STAFF).filter(r => String(r[0]).trim()); }
function _supervisorMap() {            // { 직원이름: 담당선임이름 }
  const m = {};
  _staffRows().forEach(r => { m[String(r[0]).trim()] = String(r[7] || '').trim(); });
  return m;
}
function _authStaff(auth) {            // 이름+PIN이 맞으면 { name }, 아니면 null
  const a = auth || {};
  if (_edge() && a.__trusted) {        // Supabase: 서버 앞단이 구글 로그인으로 확인해 넣어 준 이름만 인정
    const nm = String(a.name || '').trim();
    return nm && _staffRows().some(r => String(r[0]).trim() === nm) ? { name: nm } : null;
  }
  const name = String(a.name || '').trim(), pin = String(a.pin || '').trim();
  if (!name || !pin) return null;
  if (_isLocked('u:' + name)) return null;
  const hit = _staffRows().filter(r => String(r[0]).trim() === name && _pinMatches(r[1], pin))[0];
  if (!hit) { _lockFail('u:' + name); return null; }
  _lockClear('u:' + name);
  return { name };
}
function _mySubordinates(me) {
  const m = _supervisorMap();
  return Object.keys(m).filter(n => m[n] === me);
}

function getSupervisorLeaves(auth) {
  const me = _authStaff(auth); if (!me) return [];
  return _leaveList(_mySubordinates(me.name));
}
function getSupervisorOvertimes(auth) {
  const me = _authStaff(auth); if (!me) return [];
  return _overtimeList(_mySubordinates(me.name));
}
function getSupervisorCompLeaves(auth) {
  const me = _authStaff(auth); if (!me) return [];
  const mine = _mySubordinates(me.name);
  return getAdminCompLeaveRequests().filter(x => mine.includes(x.name));
}
function getSupervisorPending(auth) {   // 선임 메뉴 옆에 붙일 '처리할 건수'
  const me = _authStaff(auth); if (!me) return { ok: false, leave: 0, overtime: 0, otreq: 0, comp: 0, total: 0 };
  const mine = _mySubordinates(me.name);
  const cnt = list => list.filter(x => _isPending(x.status)).length;
  const leave = 0, overtime = cnt(_overtimeList(mine)), otreq = cnt(_otReqList(mine));
  const comp = cnt(getAdminCompLeaveRequests().filter(x => mine.includes(x.name)));
  return { ok: true, leave, overtime, otreq, comp, total: leave + overtime + otreq + comp };
}
// ── 시간외 사전 신청 ──────────────────────────────────────
// 근무 전에 '이런 사유로 시간외를 하려고 합니다'를 선임에게 먼저 신청 → 선임이 수락해야 근무 타이머가 열린다.
// 상태: 대기 → 수락/반려 → (근무 보고서 제출 시) 완료
function _getOtReqSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEETS.OT_REQ);
  if (!sh) { initSheets(); sh = ss.getSheetByName(SHEETS.OT_REQ); }
  return sh;
}
function _findOtReqRow(reqId) {        // 요청ID → 시트 행 번호 (없으면 0)
  const rows = _values(SHEETS.OT_REQ);
  for (let i = 0; i < rows.length; i++) if (String(rows[i][8]).trim() === String(reqId).trim()) return i + 2;
  return 0;
}
function _otReqList(filterNames) {
  try {
    const sup = _supervisorMap();
    return _values(SHEETS.OT_REQ)
      .map((r, i) => ({ r, row: i + 2 }))
      .filter(x => String(x.r[1]).trim() && (!filterNames || filterNames.includes(String(x.r[1]).trim())))
      .map(({ r, row }) => ({
        row, id: String(r[8] || ''), date: _fmtD(r[0]), name: String(r[1]).trim(), supervisor: sup[String(r[1]).trim()] || '',
        workDate: _fmtD(r[2]), startTime: _fmtT(r[3]), endTime: _fmtT(r[4]), reason: String(r[5] || ''),
        status: String(r[6] || '대기'), processed: _fmtD(r[7]),
        detail: _fmtD(r[2]) + ' ' + _fmtT(r[3]) + '~' + _fmtT(r[4]) + ' 예정 · ' + String(r[5] || ''),
      })).reverse();
  } catch(e) { return []; }
}
function submitOvertimeRequest(data) {
  try {
    const name = String(data.name || '').trim();
    const workDate = String(data.workDate || '').trim(), st = String(data.startTime || '').trim(), en = String(data.endTime || '').trim();
    const reason = String(data.reason || '').trim();
    if (!name) return { ok: false, msg: '이름이 없습니다.' };
    if (!workDate || !st || !en) return { ok: false, msg: '근무 예정일과 예정 시간(시작·종료)을 입력하세요.' };
    if (!reason) return { ok: false, msg: '시간외 근무 사유를 입력하세요.' };
    if (en <= st) return { ok: false, msg: '종료 시간이 시작 시간보다 늦어야 합니다.' };
    const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    if (workDate < today) return { ok: false, msg: '지난 날짜는 신청할 수 없습니다.' };
    const sup = _supervisorMap();
    if (!(name in sup)) return { ok: false, msg: '직원 정보를 찾을 수 없습니다.' };
    if (!sup[name]) return { ok: false, msg: '담당 선임이 지정되어 있지 않아 신청할 수 없습니다. 관리자에게 문의하세요.' };
    const dup = _otReqList([name]).filter(x => x.workDate === workDate && (x.status === '대기' || x.status === '수락'))[0];
    if (dup) return { ok: false, msg: workDate + ' 날짜에 이미 ' + (dup.status === '대기' ? '선임 확인을 기다리는' : '수락된, 아직 근무 보고를 내지 않은') + ' 사전 신청이 있습니다.' };
    const id = 'R' + new Date().getTime() + Math.floor(Math.random() * 1000);
    _getOtReqSheet().appendRow([today, name, workDate, st, en, reason, '대기', '', id]);
    _notifySupervisor(name, '시간외 사전 신청 (수락 대기)', workDate + ' ' + st + '~' + en + ' 예정 · ' + reason);
    return { ok: true, id };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function getMyOvertimeRequests(name) {
  const me = String(name || '').trim();
  return _otReqList([me]);
}
function deleteOvertimeRequestRow(row, name) {      // 대기 중인 사전 신청만 직원이 취소 가능
  try {
    const sheet = _getOtReqSheet();
    const r = sheet.getRange(Number(row), 1, 1, 9).getValues()[0];
    if (!String(r[1]).trim()) return { ok: false, msg: '행 없음' };
    if (name && String(r[1]).trim() !== String(name).trim()) return { ok: false, msg: '본인의 신청만 취소할 수 있습니다.' };
    if (!_isPending(r[6])) return { ok: false, msg: '이미 처리된 신청은 취소할 수 없습니다.' };
    sheet.deleteRow(Number(row));
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function getAdminOvertimeRequests() { return _otReqList(null); }
function getSupervisorOvertimeRequests(auth) {
  const me = _authStaff(auth); if (!me) return [];
  return _otReqList(_mySubordinates(me.name));
}

function getAdminLeaves()    { return _leaveList(null); }
function getAdminOvertimes() { return _overtimeList(null); }

// 승인/반려 — 담당 선임만 가능 (시간외 · 대체휴무 사용. 휴가·출장은 신청 즉시 확정이라 해당 없음)
function supervisorUpdateStatus(auth, sheetName, row, status) {
  try {
    const me = _authStaff(auth);
    if (!me) return { ok: false, msg: '로그인 정보가 올바르지 않습니다. 다시 로그인해 주세요.' };
    status = status === '확인' ? '승인' : status;
    if (sheetName === SHEETS.LEAVE) return { ok: false, msg: '휴가는 신청 즉시 확정되어 승인·반려 처리가 없습니다.' };
    if (['승인', '반려', '대기'].indexOf(status) < 0) return { ok: false, msg: '처리 상태가 올바르지 않습니다.' };
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return { ok: false, msg: '시트 없음' };
    const requester = String(sheet.getRange(Number(row), 2).getValue() || '').trim();   // 휴가·시간외·대체휴무사용 모두 B열이 이름
    if (!requester) return { ok: false, msg: '신청 행을 찾을 수 없습니다.' };
    if (_supervisorMap()[requester] !== me.name) return { ok: false, msg: requester + ' 님의 담당 선임만 승인/반려할 수 있습니다.' };
    if (sheetName === SHEETS.OT_REQ) {            // 시간외 사전 신청: 승인 = 수락, 근무까지 끝난 건(완료)은 바꿀 수 없음
      if (String(sheet.getRange(Number(row), 7).getValue()).trim() === '완료') return { ok: false, msg: '이미 근무 보고까지 끝난 건은 바꿀 수 없습니다.' };
      if (status === '승인') status = '수락';
    }
    return updateStatus(sheetName, row, status);
  } catch(e) { return { ok: false, msg: e.message }; }
}

// 상태 기록 (내부용) — 승인 / 반려 / 대기
function updateStatus(sheetName, row, status) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) return { ok: false, msg: '시트 없음' };
    const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    const statusCol = sheetName === SHEETS.LEAVE ? 8 : sheetName === SHEETS.COMP_USE ? 6 : sheetName === SHEETS.OT_REQ ? 7 : 11;
    const dateCol   = sheetName === SHEETS.LEAVE ? 9 : sheetName === SHEETS.COMP_USE ? 7 : sheetName === SHEETS.OT_REQ ? 8 : 18;   // 시간외 12열은 업무내용 → 처리일은 18열
    sheet.getRange(Number(row), statusCol).setValue(status === '확인' ? '승인' : status);
    sheet.getRange(Number(row), dateCol).setValue(today);
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ============================================================
// 개인 신청 내역 조회
// ============================================================
function getMyHistory(name) {
  try {
    const me = String(name).trim();
    const leaves = _leaveList([me]).map(x => ({
      type: '휴가', date: x.date, detail: x.detail, status: x.status, row: x.row, canDelete: x.start >= _today(),
      pd: { leaveType: x.type, start: x.start, end: x.end, days: x.days, reason: x.reason },
    }));
    const overs = _overtimeList([me]).map(x => ({
      type: '시간외', date: x.date, detail: x.detail, status: x.status, row: x.row, canDelete: _isPending(x.status),
      pd: { workDate: x.workDate, startT: x.startTime, endT: x.endTime, paidH: x.paidHours, pay: x.totalPay, content: x.content,
            photoUrl: x.photoUrl, gpsStart: x.gpsStart, gpsEnd: x.gpsEnd, gpsStartMap: x.gpsStartMap, gpsEndMap: x.gpsEndMap },
    }));
    const comps = getAdminCompLeaveRequests().filter(x => x.name === me).map(x => ({
      type: '대체휴무', date: x.date, detail: x.useDate + ' 사용 (' + x.days + '일)' + (x.reason ? ' · ' + x.reason : ''),
      status: x.status, row: x.row, canDelete: _isPending(x.status),
      pd: { days: x.days, useDate: x.useDate, reason: x.reason },
    }));
    return [...leaves, ...overs, ...comps]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 50);
  } catch(e) { return []; }
}

// ============================================================
// 대체휴무 (관리자가 부여 → 직원이 사용 신청 → 관리자가 승인)
// ============================================================
// [대체휴무]     부여일 / 이름 / 일수 / 사유 / 상태(부여·취소) / 처리일 / 비고
// [대체휴무사용] 신청일 / 이름 / 사용일수 / 사용날짜 / 사유 / 상태(대기·승인·반려) / 처리일

function _getCompSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.COMP);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.COMP);
    sheet.getRange(1,1,1,7).setValues([['부여일','이름','일수','사유','상태','처리일','비고']]);
    sheet.getRange(1,1,1,7).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
  }
  return sheet;
}
function _getCompUseSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.COMP_USE);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.COMP_USE);
    sheet.getRange(1,1,1,7).setValues([['신청일','이름','사용일수','사용날짜','사유','상태','처리일']]);
    sheet.getRange(1,1,1,7).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('white');
  }
  return sheet;
}

// 한 사람의 대체휴무 집계
function _compSummary(name, compRows, useRows) {
  const me = String(name).trim();
  let granted = 0, used = 0, pending = 0;
  (compRows || _values(SHEETS.COMP)).forEach(r => {
    if (String(r[1]).trim() === me && String(r[4]).trim() === '부여') granted += Number(r[2]) || 0;
  });
  (useRows || _values(SHEETS.COMP_USE)).forEach(r => {
    if (String(r[1]).trim() !== me) return;
    if (_isApproved(r[5])) used += Number(r[2]) || 0;
    else if (_isPending(r[5])) pending += Number(r[2]) || 0;
  });
  return { granted, used, pending, remaining: Math.max(0, _round3(granted - used)) };
}

// 관리자: 대체휴무 부여
function grantCompLeave(name, days, reason) {
  try {
    if (!String(name || '').trim()) return { ok: false, msg: '직원을 선택하세요.' };
    if (!(Number(days) > 0)) return { ok: false, msg: '일수를 확인하세요.' };
    const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    _getCompSheet().appendRow([today, String(name).trim(), Number(days), reason || '', '부여', today, '']);
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// 관리자: 잘못 부여한 건 취소
function cancelCompGrant(row) {
  try {
    const sheet = _getCompSheet();
    const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    const r = sheet.getRange(Number(row), 1, 1, 7).getValues()[0];
    if (!String(r[1]).trim()) return { ok: false, msg: '행 없음' };
    const s = _compSummary(r[1]);
    if (s.granted - (Number(r[2]) || 0) < s.used + s.pending) return { ok: false, msg: '이미 사용(신청)한 일수가 있어 취소할 수 없습니다.' };
    sheet.getRange(Number(row), 5).setValue('취소');
    sheet.getRange(Number(row), 6).setValue(today);
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// 직원: 내 대체휴무 현황
function getMyCompLeave(name) {
  try {
    const me = String(name).trim();
    const s = _compSummary(me);
    const list = [];
    _values(SHEETS.COMP).forEach(r => {
      if (String(r[1]).trim() !== me) return;
      list.push({ date: _fmtD(r[0]), days: Number(r[2]) || 0, reason: String(r[3] || ''), status: String(r[4] || ''), kind: '부여' });
    });
    _values(SHEETS.COMP_USE).forEach(r => {
      if (String(r[1]).trim() !== me) return;
      list.push({ date: _fmtD(r[3]), days: Number(r[2]) || 0, reason: String(r[4] || ''), status: String(r[5] || '대기'), kind: '사용' });
    });
    list.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return { ok: true, granted: s.granted, used: s.used, pending: s.pending, remaining: s.remaining, list };
  } catch(e) { return { ok: false, granted: 0, used: 0, pending: 0, remaining: 0, list: [] }; }
}

// 직원: 대체휴무 사용 신청
function submitCompLeave(data) {
  try {
    const days = Number(data.days) || 0;
    if (days <= 0 || !data.useDate) return { ok: false, msg: '사용 일수와 날짜를 확인하세요.' };
    const s = _compSummary(data.name);
    if (days > s.granted - s.used - s.pending) {
      return { ok: false, msg: '잔여 대체휴무가 부족합니다. (잔여 ' + s.remaining + '일' + (s.pending ? ', 승인 대기 ' + s.pending + '일' : '') + ')' };
    }
    const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    _getCompUseSheet().appendRow([today, String(data.name).trim(), days, data.useDate, data.reason || '', '대기', '']);
    _notifySupervisor(String(data.name).trim(), '대체휴무 사용 신청', data.useDate + ' (' + days + '일)' + (data.reason ? ' · ' + data.reason : ''));
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// 직원: 대기 중인 사용 신청 삭제
function deleteCompLeaveRow(row) {
  try {
    const sheet = _getCompUseSheet();
    const r = sheet.getRange(Number(row), 1, 1, 7).getValues()[0];
    if (!String(r[1]).trim()) return { ok: false, msg: '행 없음' };
    if (!_isPending(r[5])) return { ok: false, msg: '이미 처리된 신청은 삭제할 수 없습니다.' };
    sheet.deleteRow(Number(row));
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// 사용 신청 목록 (관리자 조회용 / 선임 목록의 바탕)
function getAdminCompLeaveRequests() {
  try {
    const sup = _supervisorMap();
    return _values(SHEETS.COMP_USE).map((r, i) => ({
      row: i + 2,
      date: _fmtD(r[0]), name: String(r[1]).trim(), supervisor: sup[String(r[1]).trim()] || '', days: Number(r[2]) || 0,
      useDate: _fmtD(r[3]), reason: String(r[4] || ''), status: String(r[5] || '대기'), processed: _fmtD(r[6]),
      detail: '대체휴무 ' + _fmtD(r[3]) + ' 사용 (' + (Number(r[2]) || 0) + '일)' + (r[4] ? ' · ' + r[4] : ''),
    })).filter(x => x.name).reverse();
  } catch(e) { return []; }
}

// 관리자: 부여 내역
function getAdminCompLeaveGrants() {
  try {
    return _values(SHEETS.COMP).map((r, i) => ({
      row: i + 2,
      date: _fmtD(r[0]), name: String(r[1]).trim(), days: Number(r[2]) || 0,
      reason: String(r[3] || ''), status: String(r[4] || ''), note: String(r[6] || ''),
    })).filter(x => x.name).reverse();
  } catch(e) { return []; }
}

// ============================================================
// 관리자 대시보드: 전체 직원의 연차·휴가·시수·시간외·대체시수·대체휴무
//  - 시트를 한 번씩만 읽어 직원별로 집계 + 상세 목록까지 반환
// ============================================================
function getAdminDashboard(year) {
  try {
    const targetYear = year ? Number(year) : new Date().getFullYear();
    const staff    = _values(SHEETS.STAFF).filter(r => String(r[0]).trim());
    const leaveAll = _values(SHEETS.LEAVE);
    const otAll    = _values(SHEETS.OVERTIME);
    const sisAll   = _values(SHEETS.SIS);
    const altAll   = _values(SHEETS.ALT);
    const compAll  = _values(SHEETS.COMP);
    const useAll   = _values(SHEETS.COMP_USE);

    // 연차 부여 (연차관리 시트, 연도 컬럼 유무 모두 지원)
    const balSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.LEAVE_BAL);
    const balData  = balSheet ? balSheet.getDataRange().getValues() : [[]];
    const hasYearCol = (balData[0] || []).includes('연도');

    const sum = { staffCount: staff.length, pendingLeave: 0, pendingOvertime: 0, pendingOtReq: _otReqList(null).filter(x => _isPending(x.status)).length, pendingComp: 0, pendingSisu: 0, pendingAlt: 0,
                  leaveDays: 0, otHours: 0, otPay: 0, sisuChi: 0, altOccHours: 0, altUseHours: 0 };

    const dashboard = staff.map(st => {
      const name = String(st[0]).trim();

      // ── 연차 부여일수 ──
      let granted = 0;
      const bal = balData.slice(1).find(r => String(r[0]).trim() === name && (!hasYearCol || Number(r[1]) === targetYear));
      if (bal) granted = hasYearCol ? (Number(bal[2]) || 0) : (Number(bal[1]) || 0);
      if (!granted) granted = Number(st[8]) || 0;

      // ── 휴가 (시작일 연도 기준) ──
      let leaveDays = 0, leavePending = 0;
      const leaveList = [];
      leaveAll.forEach(r => {
        if (String(r[1]).trim() !== name) return;
        const y = _yearOf(r[3]);
        if (y && y !== targetYear) return;
        const days = _num(r[5]);
        if (_leaveOk(r[7])) leaveDays += days;
        leaveList.push({ type: String(r[2]), start: _fmtD(r[3]), end: _fmtD(r[4]), days, reason: String(r[6] || ''), status: _leaveOk(r[7]) ? '승인' : '반려' });
      });
      leaveList.sort((a, b) => String(b.start).localeCompare(String(a.start)));

      // ── 시수 (8차시 = 연차 1일) ──
      let sisuSaved = 0, sisuConfirmed = 0;
      const sisuList = [];
      sisAll.forEach(r => {
        if (String(r[1]).trim() !== name) return;
        if (!String(r[7]).trim() || !String(r[8]).trim()) return;
        const y = _sisYear(r);
        if (y && y !== targetYear) return;
        sisuSaved++;
        const ok = String(r[12]) === 'Y';
        if (ok) sisuConfirmed++;
        sisuList.push({ docNo: String(r[0]).replace(/^'/, ''), seq: r[6], month: Number(r[7]), day: Number(r[8]),
                        start: r[9], end: r[10], note: String(r[11] || ''), confirmed: ok });
      });
      sisuList.sort((a, b) => (b.month - a.month) || (b.day - a.day) || (Number(b.start) - Number(a.start)));
      const sisuDays = _round3(sisuConfirmed / 8);   // 선임 확인된 차시만, 1차시 = 1/8일

      // ── 시간외 (근무일 연도 기준) ──
      let otCount = 0, otHours = 0, otPaid = 0, otPay = 0, otPending = 0;
      const otList = [];
      otAll.forEach(r => {
        if (String(r[1]).trim() !== name) return;
        const y = _yearOf(r[2]);
        if (y && y !== targetYear) return;
        if (_isApproved(r[10])) { otCount++; otHours += Number(r[6]) || 0; otPaid += Number(r[8]) || 0; otPay += Number(r[9]) || 0; }
        else if (_isPending(r[10])) otPending++;
        otList.push({ workDate: _fmtD(r[2]), start: _fmtT(r[4]), end: _fmtT(r[5]), hours: Number(r[6]) || 0,
                      paidHours: Number(r[8]) || 0, pay: Number(r[9]) || 0, content: String(r[11] || ''), status: String(r[10] || '대기') });
      });
      otList.sort((a, b) => String(b.workDate).localeCompare(String(a.workDate)));

      // ── 대체시수 (발생: 인정시간 / 사용: 사용 시작~종료) ──
      let altOcc = 0, altUse = 0, altPending = 0;
      const altList = [];
      altAll.forEach(r => {
        if (String(r[1]).trim() !== name) return;
        const y = _altYear(r);
        if (y && y !== targetYear) return;
        const hasOcc = String(r[5]).trim() !== '' || String(r[6]).trim() !== '';
        const hasUse = String(r[13]).trim() !== '';
        if (!hasOcc && !hasUse) return;
        const occH = _num(r[10]), occOk = String(r[12]) === 'Y';
        const useH = hasUse ? Math.round(_hoursBetween(r[16], r[17]) * 10) / 10 : 0, useOk = String(r[18]) === 'Y';
        if (occOk) altOcc += occH; else if (hasOcc) altPending++;
        if (hasUse) { if (useOk) altUse += useH; else altPending++; }
        altList.push({
          occ: hasOcc ? (r[5] + '/' + r[6] + (r[7] ? '(' + r[7] + ')' : '')) : '', occHours: occH, occReason: String(r[11] || ''), occConfirmed: occOk,
          use: hasUse ? (r[13] + '/' + r[14] + (r[15] ? '(' + r[15] + ')' : '')) : '', useHours: useH, useConfirmed: useOk,
        });
      });

      // ── 대체휴무 ──
      const comp = _compSummary(name, compAll, useAll);
      const compList = [];
      compAll.forEach(r => { if (String(r[1]).trim() === name) compList.push({ kind: '부여', date: _fmtD(r[0]), days: Number(r[2]) || 0, reason: String(r[3] || ''), status: String(r[4] || '') }); });
      useAll.forEach(r => { if (String(r[1]).trim() === name) compList.push({ kind: '사용', date: _fmtD(r[3]), days: Number(r[2]) || 0, reason: String(r[4] || ''), status: String(r[5] || '대기') }); });
      compList.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const compPending = useAll.filter(r => String(r[1]).trim() === name && _isPending(r[5])).length;

      sum.pendingLeave += leavePending; sum.pendingOvertime += otPending; sum.pendingComp += compPending;
      sum.pendingSisu += (sisuSaved - sisuConfirmed); sum.pendingAlt += altPending;
      sum.leaveDays += leaveDays; sum.otHours += otHours; sum.otPay += otPay; sum.sisuChi += sisuSaved;
      sum.altOccHours += altOcc; sum.altUseHours += altUse;

      const used = _round3(leaveDays + sisuDays);
      return {
        name, dept: String(st[3] || ''), position: String(st[4] || ''), role: String(st[6] || '일반'),
        annual:   { granted, leaveDays, sisuDays, used, remaining: Math.max(0, granted - used) },
        leave:    { count: leaveList.length, days: leaveDays, pending: leavePending, list: leaveList },
        sisuje:   { saved: sisuSaved, confirmed: sisuConfirmed, days: sisuDays, list: sisuList },
        overtime: { count: otCount, hours: otHours, paidHours: otPaid, pay: otPay, pending: otPending, list: otList },
        alt:      { occHours: Math.round(altOcc * 10) / 10, useHours: Math.round(altUse * 10) / 10,
                    remainHours: Math.round((altOcc - altUse) * 10) / 10, pending: altPending, list: altList },
        comp:     { granted: comp.granted, used: comp.used, remaining: comp.remaining, pending: compPending, list: compList },
      };
    });

    sum.altOccHours = Math.round(sum.altOccHours * 10) / 10;
    sum.altUseHours = Math.round(sum.altUseHours * 10) / 10;
    return { ok: true, year: targetYear, orgName: getConfig().ORG_NAME, summary: sum, dashboard };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ============================================================
// 직원 본인의 신청 삭제 (대기 상태만)
// ============================================================

// 휴가 행 삭제
function deleteLeaveRow(row) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.LEAVE);
    if (!sheet) return { ok: false, msg: '시트 없음' };
    const data = sheet.getDataRange().getValues();
    const r = data[row - 1];
    if (!r) return { ok: false, msg: '행 없음' };
    // 이미 승인된 건은 삭제 불가
    if (_fmtD(r[3]) < _today()) return { ok: false, msg: '이미 시작된(지난) 휴가는 삭제할 수 없습니다. 관리자에게 문의하세요.' };
    sheet.deleteRow(row);
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// 시간외 행 삭제
function deleteOvertimeRow(row) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.OVERTIME);
    if (!sheet) return { ok: false, msg: '시트 없음' };
    const data = sheet.getDataRange().getValues();
    const r = data[row - 1];
    if (!r) return { ok: false, msg: '행 없음' };
    if (!_isPending(r[10])) return { ok: false, msg: '이미 처리된 신청은 삭제할 수 없습니다.' };
    const reqId = String(r[18] || '').trim();   // 이 근무 보고에 연결된 사전 신청 → 다시 '수락'으로 되돌려 재제출 가능하게
    sheet.deleteRow(row);
    if (reqId) {
      const reqRow = _findOtReqRow(reqId);
      if (reqRow) {
        const rs = _getOtReqSheet();
        if (String(rs.getRange(reqRow, 7).getValue()).trim() === '완료') rs.getRange(reqRow, 7).setValue('수락');
      }
    }
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ============================================================
// ============================================================
// 시수 보고서 · 대체시수 (선임 확인 방식)
//  - [시수보고서] 1문서 = 8차시(=연차 1일), 차시별 선임 확인
//  - [대체시수보고서] 발생신청→발생확인 / 사용신청→사용확인
// ============================================================
// ============================================================
// 대체시수 시트 컬럼 (20개)
// 1:문서번호 2:성명 3:직위 4:부서 5:연락처
// 6:발생월 7:발생일 8:발생요일 9:발생시작 10:발생종료 11:인정시간 12:발생사유
// 13:발생확인
// 14:사용월 15:사용일 16:사용요일 17:사용시작 18:사용종료
// 19:사용확인
// 20:저장시각
const ALT_HEADERS = [
  '문서번호','성명','직위','부서','연락처',
  '발생월','발생일','발생요일','발생시작','발생종료','인정시간','발생사유',
  '발생확인',
  '사용월','사용일','사용요일','사용시작','사용종료',
  '사용확인','저장시각'
];
const ALT_COL = 20;


// 시수보고서 행의 연도: 문서번호 앞 4자리(예: 2027-01) → 없으면 저장시각
function _sisYear(r) {
  const yy = Number(r[14]);                       // 15번째 칸 '연도' (직접 입력한 값) 우선
  if (yy >= 2000 && yy <= 2100) return yy;
  const m = String(r[0] || '').replace(/^'/, '').match(/^(\d{4})/);   // 예전 데이터: 문서번호 앞 연도
  if (m) return Number(m[1]);
  const t = parseTimeSis(r[13]);
  return t ? new Date(t).getFullYear() : null;
}
function _altYear(r) {
  const m = String(r[0] || '').replace(/^'/, '').match(/^(\d{4})/);
  if (m) return Number(m[1]);
  const t = altParseTime(r[19]);
  return t ? new Date(t).getFullYear() : null;
}
// 시각 두 개의 차이(시간). 날짜형/문자열(HH:MM) 모두 처리
function _hoursBetween(s, e) {
  if (s instanceof Date && e instanceof Date) return Math.max(0, (e.getTime() - s.getTime()) / 3600000);
  const p = v => { const m = String(v || '').match(/(\d{1,2}):(\d{2})/); return m ? Number(m[1]) + Number(m[2]) / 60 : NaN; };
  const a = p(s), b = p(e);
  return (isNaN(a) || isNaN(b) || b <= a) ? 0 : b - a;
}

// ===== 시트 초기화 =====
function getOrCreateAltSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.ALT);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.ALT);
    sheet.getRange('A:A').setNumberFormat('@');
    sheet.getRange(1,1,1,ALT_COL).setValues([ALT_HEADERS]);
    sheet.getRange(1,1,1,ALT_COL).setFontWeight('bold').setBackground('#e3f2fd');
  } else {
    sheet.getRange('A:A').setNumberFormat('@');
  }
  return sheet;
}

function getOrCreateAltPersonSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = name + '_대체시수';
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange('A:A').setNumberFormat('@');
    sheet.getRange(1,1,1,ALT_COL).setValues([ALT_HEADERS]);
    sheet.getRange(1,1,1,ALT_COL).setFontWeight('bold').setBackground('#e8f5e9');
  }
  return sheet;
}

// ===== 헬퍼 =====
function altCleanDocNo(val) { return String(val||'').replace(/^'/,'').trim(); }
function altParseTime(str) {
  if (!str) return 0;
  var d = new Date(str); if (!isNaN(d.getTime())) return d.getTime();
  try {
    var s = String(str).replace('오전','AM').replace('오후','PM').replace(/\.\s*/g,'-').replace(/\s+/g,' ').trim();
    var d2 = new Date(s); if (!isNaN(d2.getTime())) return d2.getTime();
  } catch(e) {}
  return 0;
}

// 시트 행 → row 객체
function rowToAltObj(r) {
  return {
    occMonth:r[5], occDay:r[6], occDow:r[7], occStart:r[8], occEnd:r[9],
    occHours:r[10], occReason:r[11], occConfirmed:r[12]==='Y',
    useMonth:r[13], useDay:r[14], useDow:r[15], useStart:r[16], useEnd:r[17],
    useConfirmed:r[18]==='Y'
  };
}

// ===== 직원 목록 로드 (통합 [직원목록] 시트 → 시수 화면용) =====
function loadAltStaffList() {
  try {
    const range = getConfig().SISU_RANGE;
    const list = _values(SHEETS.STAFF).filter(r => String(r[0]).trim()).map(r => {
      const role = String(r[6] || '일반').trim();
      return {
        name: String(r[0]).trim(), position: String(r[4] || '').trim(),
        dept: String(r[3] || '').trim(), contact: String(r[5] || '').trim(),
        senior: String(r[7] || '').trim(),
        mode: (role === '선임' || role === '관리자') ? 'both' : 'staff',
        timeRange: range, email: ''
      };
    });
    return JSON.stringify({success:true, list});
  } catch(e) {
    return JSON.stringify({success:false, message:e.message});
  }
}

// ===== 발생 저장 =====
function saveAltOccData(dataJson) {
  try {
    const data = JSON.parse(dataJson);
    const rawDocNo = String(data.docNo||'').trim();
    if (!rawDocNo) return JSON.stringify({success:false, message:'문서번호가 없습니다.'});
    const docNo = altCleanDocNo(rawDocNo);
    const name  = String(data.name||'').trim();
    if (!name) return JSON.stringify({success:false, message:'성명이 없습니다.'});
    const now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    const validRows = (data.rows||[]).filter(r => r.occMonth || r.occDay);
    if (!validRows.length) return JSON.stringify({success:false, message:'입력된 발생 내용이 없습니다.'});

    const beforeOcc = _values(SHEETS.ALT).filter(v => altCleanDocNo(v[0])===docNo && String(v[1]).trim()===name).length;
    function writeToSheet(sheet) {
      const lastRow = sheet.getLastRow();
      // 기존 행 중 발생확인된 것은 보존, 아닌 것만 삭제 후 덮어쓰기
      let existingConfirmed = {}; // rowIdx → occConfirmed
      if (lastRow > 1) {
        const all = sheet.getRange(2,1,lastRow-1,ALT_COL).getValues();
        let idx = 0;
        all.forEach(r => {
          if (altCleanDocNo(r[0])===docNo && String(r[1]).trim()===name) {
            if (r[12]==='Y') existingConfirmed[idx] = true;
            idx++;
          }
        });
        // 해당 문서 행 삭제
        const vals = sheet.getRange(2,1,lastRow-1,2).getValues();
        for (let i=vals.length-1; i>=0; i--) {
          if (altCleanDocNo(vals[i][0])===docNo && String(vals[i][1]).trim()===name)
            sheet.deleteRow(i+2);
        }
      }
      const newRows = validRows.map((r,i) => [
        "'"+docNo, name, data.position||'', data.dept||'', data.contact||'',
        r.occMonth||'', r.occDay||'', r.occDow||'', r.occStart||'', r.occEnd||'',
        r.occHours||'', r.occReason||'',
        existingConfirmed[i] ? 'Y' : '',  // 발생확인 보존
        r.useMonth||'', r.useDay||'', r.useDow||'', r.useStart||'', r.useEnd||'',
        r.useConfirmed ? 'Y' : '',
        now
      ]);
      sheet.getRange(sheet.getLastRow()+1,1,newRows.length,ALT_COL).setValues(newRows);
    }

    writeToSheet(getOrCreateAltSheet());
    writeToSheet(getOrCreateAltPersonSheet(name));
    if (validRows.length > beforeOcc) {
      _notifySupervisor(name, '대체시수 발생 신청 (선임 확인 대기)', (validRows.length-beforeOcc)+'건 · ' +
        validRows.slice(beforeOcc).map(r => r.occMonth+'/'+r.occDay+' '+(r.occStart||'')+'~'+(r.occEnd||'')).join(', ') + ' · 문서 ' + docNo);
    }
    return JSON.stringify({success:true, message:'발생 저장 완료'});
  } catch(e) { return JSON.stringify({success:false, message:e.message}); }
}

// ===== 사용 저장 =====
function saveAltUseData(dataJson) {
  try {
    const data = JSON.parse(dataJson);
    const docNo = altCleanDocNo(String(data.docNo||'').trim());
    const name  = String(data.name||'').trim();
    if (!docNo || !name) return JSON.stringify({success:false, message:'문서번호/성명 없음'});

    function updateUseInSheet(sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) return;
      const all = sheet.getRange(2,1,lastRow-1,ALT_COL).getValues();
      let rowCount = 0;
      all.forEach((r,i) => {
        if (altCleanDocNo(r[0])===docNo && String(r[1]).trim()===name) {
          const useRow = (data.rows||[])[rowCount];
          if (useRow) {
            sheet.getRange(i+2,14).setValue(useRow.useMonth||'');
            sheet.getRange(i+2,15).setValue(useRow.useDay||'');
            sheet.getRange(i+2,16).setValue(useRow.useDow||'');
            sheet.getRange(i+2,17).setValue(useRow.useStart||'');
            sheet.getRange(i+2,18).setValue(useRow.useEnd||'');
            // 사용확인은 선임만 변경 가능 — 여기선 건드리지 않음
          }
          rowCount++;
        }
      });
    }

    const beforeUse = _values(SHEETS.ALT).filter(v => altCleanDocNo(v[0])===docNo && String(v[1]).trim()===name && (v[13]||v[14])).length;
    updateUseInSheet(getOrCreateAltSheet());
    const afterRows = _values(SHEETS.ALT).filter(v => altCleanDocNo(v[0])===docNo && String(v[1]).trim()===name && (v[13]||v[14]));
    if (afterRows.length > beforeUse) {
      _notifySupervisor(name, '대체시수 사용 신청 (선임 확인 대기)', (afterRows.length-beforeUse)+'건 · ' +
        afterRows.slice(beforeUse).map(v => v[13]+'/'+v[14]+' '+_fmtT(v[16])+(v[17]?'~'+_fmtT(v[17]):'')).join(', ') + ' · 문서 ' + docNo);
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const personSheet = ss.getSheetByName(name+'_대체시수');
    if (personSheet) updateUseInSheet(personSheet);
    return JSON.stringify({success:true, message:'사용 저장 완료'});
  } catch(e) { return JSON.stringify({success:false, message:e.message}); }
}

// ===== 발생확인 =====
function confirmAltOccRow(paramJson) {
  try {
    const param = JSON.parse(paramJson);
    const docNo = altCleanDocNo(param.docNo);
    const name  = String(param.name||'').trim();
    const rowIdx = Number(param.rowIdx);
    const val = param.confirmed ? 'Y' : '';

    function doConfirm(sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) return;
      const all = sheet.getRange(2,1,lastRow-1,2).getValues();
      let count = 0;
      for (let i=0; i<all.length; i++) {
        if (altCleanDocNo(all[i][0])===docNo && String(all[i][1]).trim()===name) {
          if (count===rowIdx) { sheet.getRange(i+2,13).setValue(val); break; }
          count++;
        }
      }
    }
    doConfirm(getOrCreateAltSheet());
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const personSheet = ss.getSheetByName(name+'_대체시수');
    if (personSheet) doConfirm(personSheet);
    return JSON.stringify({success:true});
  } catch(e) { return JSON.stringify({success:false, message:e.message}); }
}

// ===== 사용확인 =====
function confirmAltUseRow(paramJson) {
  try {
    const param = JSON.parse(paramJson);
    const docNo = altCleanDocNo(param.docNo);
    const name  = String(param.name||'').trim();
    const rowIdx = Number(param.rowIdx);
    const val = param.confirmed ? 'Y' : '';

    function doConfirm(sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) return;
      const all = sheet.getRange(2,1,lastRow-1,2).getValues();
      let count = 0;
      for (let i=0; i<all.length; i++) {
        if (altCleanDocNo(all[i][0])===docNo && String(all[i][1]).trim()===name) {
          if (count===rowIdx) { sheet.getRange(i+2,19).setValue(val); break; }
          count++;
        }
      }
    }
    doConfirm(getOrCreateAltSheet());
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const personSheet = ss.getSheetByName(name+'_대체시수');
    if (personSheet) doConfirm(personSheet);
    return JSON.stringify({success:true});
  } catch(e) { return JSON.stringify({success:false, message:e.message}); }
}

// ===== 불러오기 =====
function loadAltData(param) {
  var docNo='', name='';
  try { var p=JSON.parse(param); docNo=altCleanDocNo(p.docNo); name=String(p.name||'').trim(); }
  catch(e){ docNo=altCleanDocNo(param); }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const personSheet = name ? ss.getSheetByName(name+'_대체시수') : null;
  const sheet = personSheet || getOrCreateAltSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return JSON.stringify({success:false, message:'데이터 없음'});
  const all = sheet.getRange(2,1,lastRow-1,ALT_COL).getValues();
  const matching = all.filter(r => altCleanDocNo(r[0])===docNo && (!name||String(r[1]).trim()===name));
  if (!matching.length) return JSON.stringify({success:false, message:'문서번호를 찾을 수 없습니다.'});
  const first = matching[0];
  return JSON.stringify({success:true, data:{
    docNo, name:first[1], position:first[2], dept:first[3], contact:first[4],
    rows: matching.map(rowToAltObj)
  }});
}

function loadAltLatestByName(name) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const personSheet = ss.getSheetByName(name+'_대체시수');
    const sheet = personSheet || getOrCreateAltSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return JSON.stringify({success:false, message:'저장된 데이터가 없습니다.'});
    const all = sheet.getRange(2,1,lastRow-1,ALT_COL).getValues();
    const nameRows = all.filter(r => String(r[1]).trim()===name);
    if (!nameRows.length) return JSON.stringify({success:false, message:'저장된 데이터가 없습니다.'});
    const docMap = {};
    nameRows.forEach(r => { const dn=altCleanDocNo(r[0]); const t=altParseTime(r[19]); if(!docMap[dn]||t>docMap[dn]) docMap[dn]=t; });
    const latestDocNo = Object.keys(docMap).sort((a,b)=>docMap[b]-docMap[a])[0];
    const matching = nameRows.filter(r => altCleanDocNo(r[0])===latestDocNo);
    const first = matching[0];
    return JSON.stringify({success:true, data:{
      docNo:latestDocNo, name:first[1], position:first[2], dept:first[3], contact:first[4],
      rows: matching.map(rowToAltObj)
    }});
  } catch(e) { return JSON.stringify({success:false, message:e.message}); }
}

// ===== 목록 =====
function getAltRecordList(name) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const personSheet = ss.getSheetByName(name+'_대체시수');
    const sheet = personSheet || getOrCreateAltSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return JSON.stringify({success:true, list:[]});
    const all = sheet.getRange(2,1,lastRow-1,ALT_COL).getValues();
    const nameRows = all.filter(r => String(r[1]).trim()===name);
    if (!nameRows.length) return JSON.stringify({success:true, list:[]});
    const docMap = {};
    nameRows.forEach(r => {
      const dn = altCleanDocNo(r[0]); if (!dn) return;
      if (!docMap[dn]) docMap[dn] = {docNo:dn, rows:[], lastSaved:r[19]};
      docMap[dn].rows.push(r);
      if (altParseTime(r[19]) > altParseTime(docMap[dn].lastSaved)) docMap[dn].lastSaved = r[19];
    });
    const list = Object.values(docMap).map(d => {
      const yr = (d.docNo.match(/^(\d{4})/) || ['','기타'])[1];
      const occRows = d.rows.filter(r => Number(r[5])>0);
      let dateRange = '';
      if (occRows.length) {
        const f=occRows[0], l=occRows[occRows.length-1];
        const fs=(Number(f[5])||0)+'월 '+(Number(f[6])||0)+'일';
        const ls=(Number(l[5])||0)+'월 '+(Number(l[6])||0)+'일';
        dateRange = fs===ls ? fs : fs+' ~ '+ls;
      }
      const occConfirmed = d.rows.filter(r=>r[12]==='Y').length;
      const useTotal = d.rows.filter(r=>String(r[13]).trim()!=='').length; // 사용월 입력된 행 수
      const useConfirmed = d.rows.filter(r=>r[18]==='Y').length;
      return {docNo:d.docNo, year:yr, totalRows:d.rows.length, occConfirmed, useTotal, useConfirmed, dateRange};
    });
    list.sort((a,b) => b.docNo>a.docNo?1:-1);
    return JSON.stringify({success:true, list});
  } catch(e) { return JSON.stringify({success:false, message:e.message}); }
}

function listAllAltData() {
  const sheet = getOrCreateAltSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return JSON.stringify({success:true, list:[]});
  const all = sheet.getRange(2,1,lastRow-1,ALT_COL).getValues();
  const nameLatest = {};
  all.forEach(r => {
    const dn=altCleanDocNo(r[0]), name=String(r[1]).trim(), t=altParseTime(r[19]);
    if (!dn||!name) return;
    if (!nameLatest[name]||t>nameLatest[name].time) nameLatest[name]={docNo:dn,time:t};
  });
  const map = {};
  all.forEach(r => {
    const dn=altCleanDocNo(r[0]), name=String(r[1]).trim();
    if (!dn||!name) return;
    if (!nameLatest[name]||nameLatest[name].docNo!==dn) return;
    if (!map[name]) map[name]={docNo:dn,name,position:r[2],dept:r[3],contact:r[4],rows:[]};
    map[name].rows.push(rowToAltObj(r));
  });
  return JSON.stringify({success:true, list:Object.values(map)});
}

// ===== 결재라인 저장 (관리자 화면) =====
function adminSaveApproval(paramJson) {
  try {
    const p = JSON.parse(paramJson);
    const list = p.list||[];
    const sh = getOrCreateApprovalConfigSheet();
    const last = sh.getLastRow();
    if (last>1) sh.getRange(2,1,last-1,6).clearContent();
    const rows = list.filter(r=>r.dept).map(r=>[
      r.dept||'', r.addressee||'',
      r.approvers[0]||'', r.approvers[1]||'', r.approvers[2]||'', r.approvers[3]||''
    ]);
    if (rows.length) sh.getRange(2,1,rows.length,6).setValues(rows);
    return JSON.stringify({success:true});
  } catch(e) { return JSON.stringify({success:false, message:e.message}); }
}

// ===== 시수 보고서 함수 (변경 없음) =====
function getOrCreateSisSheet() {
  const ss=SpreadsheetApp.getActiveSpreadsheet(); let sheet=ss.getSheetByName(SHEETS.SIS);
  if(!sheet){ sheet=ss.insertSheet(SHEETS.SIS); sheet.getRange('A:A').setNumberFormat('@'); sheet.getRange(1,1,1,14).setValues([['문서번호','성명','직위','부서','연락처','특이사항','차시','월','일','시작시간','종료시간','비고','선임확인','저장시각']]); sheet.getRange(1,1,1,14).setFontWeight('bold').setBackground('#e8eaf6'); } else { sheet.getRange('A:A').setNumberFormat('@'); }
  return sheet;
}
function getOrCreateSisPersonSheet(name) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(); let sheet=ss.getSheetByName(name);
  if(!sheet){ sheet=ss.insertSheet(name); sheet.getRange('A:A').setNumberFormat('@'); sheet.getRange(1,1,1,14).setValues([['문서번호','성명','직위','부서','연락처','특이사항','차시','월','일','시작시간','종료시간','비고','선임확인','저장시각']]); sheet.getRange(1,1,1,14).setFontWeight('bold').setBackground('#fce4ec'); }
  return sheet;
}
function getOrCreateApprovalConfigSheet() {
  const ss=SpreadsheetApp.getActiveSpreadsheet(); let sheet=ss.getSheetByName(SHEETS.APPROVAL);
  if(!sheet){ sheet=ss.insertSheet(SHEETS.APPROVAL); sheet.getRange(1,1,1,6).setValues([['부서명','수신처','결재자1','결재자2','결재자3','결재자4']]); sheet.getRange(2,1,1,6).setValues([['기본','기관장 귀하','담당','팀장','센터장','']]); sheet.getRange(1,1,1,6).setFontWeight('bold').setBackground('#f3f3f3'); }
  return sheet;
}
function loadApprovalConfig() {
  try { const sheet=getOrCreateApprovalConfigSheet(); const lastRow=sheet.getLastRow(); if(lastRow<2) return JSON.stringify([]); const data=sheet.getRange(2,1,lastRow-1,sheet.getLastColumn()).getValues(); const result=data.filter(r=>String(r[0]).trim()).map(r=>{ var approvers=[]; for(var i=2;i<r.length;i++){ var v=String(r[i]||'').trim(); if(v) approvers.push(v); } return{dept:String(r[0]).trim(),addressee:String(r[1]||'').trim(),approvers}; }); return JSON.stringify(result); } catch(e){ return JSON.stringify([]); }
}
function parseTimeSis(str) { if(!str) return 0; var d=new Date(str); if(!isNaN(d.getTime())) return d.getTime(); try{ var s=String(str).replace('오전','AM').replace('오후','PM').replace(/\.\s*/g,'-').replace(/\s+/g,' ').trim(); var d2=new Date(s); if(!isNaN(d2.getTime())) return d2.getTime(); }catch(e){} return 0; }
function cleanDocNoSis(val){ return String(val||'').replace(/^'/,'').trim(); }
function _sisFilledCount(docNo,name) {          // 이미 저장돼 있는 '월·일이 채워진 차시' 수 (알림 중복 방지)
  try { return _values(SHEETS.SIS).filter(v=>cleanDocNoSis(v[0])===docNo&&String(v[1]).trim()===name&&v[7]&&v[8]).length; } catch(e) { return 0; }
}
function saveData(dataJson) {
  const data=JSON.parse(dataJson); const rawDocNo=String(data.docNo||'').trim();
  if(!rawDocNo||/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(rawDocNo)) return JSON.stringify({success:false,message:'문서번호를 입력 후 저장해주세요.'});
  const docNo=rawDocNo, name=String(data.name||'').trim(); const now=new Date().toISOString();
  const yr=(Number(data.year)>=2000&&Number(data.year)<=2100)?Number(data.year):new Date().getFullYear();
  const rows=data.rows.map(r=>[docNo,name,data.position,data.dept,data.contact,data.remarks||'',r.seq,r.month,r.day,r.timeStart,r.timeEnd,r.note,r.confirmed?'Y':'',now,yr]);
  const before=_sisFilledCount(docNo,name);
  _saveToSisSheet(getOrCreateSisSheet(),docNo,name,rows); _saveToSisSheet(getOrCreateSisPersonSheet(name),docNo,name,rows);
  const after=rows.filter(r=>r[7]&&r[8]).length;
  if(after>before) _notifySupervisor(name,'시수 보고 (선임 확인 대기)',(after-before)+'차시 새로 입력 · 문서 '+docNo+' ('+after+'/8차시)');
  return JSON.stringify({success:true});
}
function _saveToSisSheet(sheet,docNo,name,rows) {
  const lastRow=sheet.getLastRow(); const confirmedMap={};
  if(lastRow>1){ const vals=sheet.getRange(2,1,lastRow-1,13).getValues(); vals.forEach(v=>{ if(cleanDocNoSis(v[0])===docNo&&String(v[1]).trim()===name&&v[12]==='Y') confirmedMap[String(v[6])]=true; }); const allVals=sheet.getRange(2,1,lastRow-1,2).getValues(); for(var i=allVals.length-1;i>=0;i--){ if(cleanDocNoSis(allVals[i][0])===docNo&&String(allVals[i][1]).trim()===name) sheet.deleteRow(i+2); } }
  if(rows.length>0){ const protectedRows=rows.map(r=>{ var row=r.slice(); if(confirmedMap[String(r[6])]) row[12]='Y'; return row; }); sheet.getRange(sheet.getLastRow()+1,1,protectedRows.length,15).setValues(protectedRows); if(String(sheet.getRange(1,15).getValue())!=='연도') sheet.getRange(1,15).setValue('연도'); }
}
function saveConfirmData(dataJson) {
  const data=JSON.parse(dataJson); const docNo=cleanDocNoSis(data.docNo); const name=String(data.name||'').trim();
  _saveConfirmToSisSheet(getOrCreateSisSheet(),docNo,name,data.rows); _saveConfirmToSisSheet(getOrCreateSisPersonSheet(name),docNo,name,data.rows);
  return JSON.stringify({success:true});
}
function _saveConfirmToSisSheet(sheet,docNo,name,rows) {
  const lastRow=sheet.getLastRow(); if(lastRow<=1) return;
  const allData=sheet.getRange(2,1,lastRow-1,14).getValues();
  allData.forEach((row,i)=>{ if(cleanDocNoSis(row[0])===docNo&&String(row[1]).trim()===name){ const matchRow=rows.find(r=>String(r.seq)===String(row[6])); if(matchRow) sheet.getRange(i+2,13).setValue(matchRow.confirmed?'Y':''); } });
}
function loadLatestByName(name) {
  try {
    const ss=SpreadsheetApp.getActiveSpreadsheet(); const personSheet=ss.getSheetByName(name); const sheet=personSheet||getOrCreateSisSheet(); const lastRow=sheet.getLastRow();
    if(lastRow<=1) return JSON.stringify({success:false,message:'저장된 데이터가 없습니다.'});
    const allData=sheet.getRange(2,1,lastRow-1,15).getValues(); const nameRows=allData.filter(r=>String(r[1]).trim()===name);
    if(!nameRows.length) return JSON.stringify({success:false,message:'저장된 데이터가 없습니다.'});
    const docMap={}; nameRows.forEach(row=>{ const dn=cleanDocNoSis(row[0]); const t=parseTimeSis(row[13]); if(!docMap[dn]||t>docMap[dn]) docMap[dn]=t; });
    const latestDocNo=Object.keys(docMap).sort((a,b)=>docMap[b]-docMap[a])[0];
    const matching=allData.filter(r=>cleanDocNoSis(r[0])===latestDocNo&&String(r[1]).trim()===name);
    if(!matching.length) return JSON.stringify({success:false,message:'데이터를 찾을 수 없습니다.'});
    const first=matching[0];
    return JSON.stringify({success:true,data:{ docNo:latestDocNo,year:_sisYear(first),name:first[1],position:first[2],dept:first[3],contact:first[4],remarks:first[5], rows:matching.map(r=>({seq:r[6],month:r[7],day:r[8],timeStart:r[9],timeEnd:r[10],note:r[11],confirmed:r[12]==='Y'})) }});
  } catch(e){ return JSON.stringify({success:false,message:e.message}); }
}
function loadData(param) {
  var docNo='',name=''; try{ var parsed=JSON.parse(param); docNo=cleanDocNoSis(parsed.docNo); name=String(parsed.name||'').trim(); }catch(e){ docNo=cleanDocNoSis(param); }
  const ss=SpreadsheetApp.getActiveSpreadsheet(); const personSheet=name?ss.getSheetByName(name):null; const sheet=personSheet||getOrCreateSisSheet(); const lastRow=sheet.getLastRow();
  if(lastRow<=1) return JSON.stringify({success:false,message:'데이터 없음'});
  const allData=sheet.getRange(2,1,lastRow-1,15).getValues(); const matching=allData.filter(r=>cleanDocNoSis(r[0])===docNo&&(!name||String(r[1]).trim()===name));
  if(!matching.length) return JSON.stringify({success:false,message:'문서번호를 찾을 수 없습니다.'});
  const first=matching[0];
  return JSON.stringify({success:true,data:{ docNo,year:_sisYear(first),name:first[1],position:first[2],dept:first[3],contact:first[4],remarks:first[5], rows:matching.map(r=>({seq:r[6],month:r[7],day:r[8],timeStart:r[9],timeEnd:r[10],note:r[11],confirmed:r[12]==='Y'})) }});
}
function listAllData() {
  const sheet=getOrCreateSisSheet(); const lastRow=sheet.getLastRow();
  if(lastRow<=1) return JSON.stringify({success:true,list:[]});
  const allData=sheet.getRange(2,1,lastRow-1,14).getValues(); const nameLatest={};
  allData.forEach(row=>{ const docNo=cleanDocNoSis(row[0]); const name=String(row[1]).trim(); const t=parseTimeSis(row[13]); if(!docNo||!name) return; if(!nameLatest[name]||t>nameLatest[name].time) nameLatest[name]={docNo,time:t}; });
  const map={};
  allData.forEach(row=>{ const docNo=cleanDocNoSis(row[0]); const name=String(row[1]).trim(); if(!docNo||!name) return; if(!nameLatest[name]||nameLatest[name].docNo!==docNo) return; if(!map[name]) map[name]={docNo,name,position:row[2],dept:row[3],contact:row[4],remarks:row[5],rows:[]}; map[name].rows.push({seq:row[6],month:row[7],day:row[8],timeStart:row[9],timeEnd:row[10],note:row[11],confirmed:row[12]==='Y'}); });
  return JSON.stringify({success:true,list:Object.values(map)});
}
function getMyRecordList(name) {
  try {
    const ss=SpreadsheetApp.getActiveSpreadsheet(); const personSheet=ss.getSheetByName(name); const sheet=personSheet||getOrCreateSisSheet(); const lastRow=sheet.getLastRow();
    if(lastRow<=1) return JSON.stringify({success:true,list:[]});
    const allData=sheet.getRange(2,1,lastRow-1,14).getValues(); const nameRows=allData.filter(r=>String(r[1]).trim()===name);
    if(!nameRows.length) return JSON.stringify({success:true,list:[]});
    const docMap={}; nameRows.forEach(row=>{ const dn=cleanDocNoSis(row[0]); if(!dn) return; if(!docMap[dn]) docMap[dn]={docNo:dn,rows:[],lastSaved:row[13]}; docMap[dn].rows.push(row); var t=parseTimeSis(row[13]); if(t>parseTimeSis(docMap[dn].lastSaved)) docMap[dn].lastSaved=row[13]; });
    var list=Object.values(docMap).map(d=>{ var yearMatch=d.docNo.match(/^(\d{4})/); var year=yearMatch?yearMatch[1]:'기타'; var totalSeq=d.rows.length; var confirmed=d.rows.filter(r=>r[12]==='Y').length; var dateRange=''; var validRows=d.rows.filter(r=>Number(r[6])>0); if(validRows.length){ validRows.sort((a,b)=>Number(a[6])-Number(b[6])); var first=validRows[0],last=validRows[validRows.length-1]; var fm=Number(first[7]),fd=Number(first[8]),lm=Number(last[7]),ld=Number(last[8]); var fs=(fm>0?fm+'월':'')+(fd>0?' '+fd+'일':''); var ls=(lm>0?lm+'월':'')+(ld>0?' '+ld+'일':''); dateRange=fs===ls?fs:fs+' ~ '+ls; } return{docNo:d.docNo,year,totalSeq,confirmed,dateRange}; });
    list.sort((a,b)=>b.docNo>a.docNo?1:-1);
    return JSON.stringify({success:true,list});
  } catch(e){ return JSON.stringify({success:false,message:e.message}); }
}


// ============================================================
// 공지사항 (관리자가 올리면 직원 대시보드 맨 위에 표시)
// ============================================================
const NOTICE_SHEET = '공지사항';
function _now() { return new Date(); }   // 테스트에서 바꿔 끼울 수 있게 분리
function _today() { return Utilities.formatDate(_now(), 'Asia/Seoul', 'yyyy-MM-dd'); }
function _ensureSheet(name, headers, textCols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    (textCols || []).forEach(c => sh.getRange(1, c, 1000, 1).setNumberFormat('@'));
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    try { sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#e8eef7'); sh.setFrozenRows(1); } catch(e) {}
  }
  return sh;
}
function _noticeSheet() { return _ensureSheet(NOTICE_SHEET, ['ID','등록일','제목','내용','게시시작','게시종료','중요','숨김'], [1,2,5,6]); }
function _noticeList() {
  return _values(NOTICE_SHEET).map((r, i) => ({
    row: i + 2, id: String(r[0]), date: _fmtD(r[1]), title: String(r[2] || ''), content: String(r[3] || ''),
    start: _fmtD(r[4]), end: _fmtD(r[5]), important: String(r[6]) === 'Y', hidden: String(r[7]) === 'Y',
  })).filter(x => x.id);
}
// 직원 화면용: 오늘 게시 중인 공지 (중요 → 최신순)
function getNotices() {
  try {
    const t = _today();
    return _noticeList()
      .filter(n => !n.hidden && (!n.start || n.start <= t) && (!n.end || n.end >= t))
      .sort((a, b) => (b.important - a.important) || String(b.date).localeCompare(String(a.date)))
      .map(n => ({ id: n.id, date: n.date, title: n.title, content: n.content, important: n.important }));
  } catch(e) { return []; }
}
function getAdminNotices() {
  try { return _noticeList().sort((a, b) => String(b.date).localeCompare(String(a.date))); } catch(e) { return []; }
}
function saveNotice(p) {
  try {
    const title = String(p.title || '').trim(), content = String(p.content || '').trim();
    if (!title) return { ok: false, msg: '제목을 입력하세요.' };
    const start = String(p.start || '').trim(), end = String(p.end || '').trim();
    if (start && end && end < start) return { ok: false, msg: '게시 종료일이 시작일보다 빠릅니다.' };
    const sh = _noticeSheet();
    if (p.id) {
      const data = sh.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) !== String(p.id)) continue;
        sh.getRange(i + 1, 3, 1, 6).setValues([[title, content, start, end, p.important ? 'Y' : '', p.hidden ? 'Y' : '']]);
        return { ok: true, id: p.id };
      }
      return { ok: false, msg: '공지를 찾을 수 없습니다.' };
    }
    const id = 'N' + new Date().getTime() + Math.floor(Math.random() * 1000);
    sh.appendRow([id, _today(), title, content, start, end, p.important ? 'Y' : '', p.hidden ? 'Y' : '']);
    return { ok: true, id };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function deleteNotice(id) {
  try {
    const sh = _noticeSheet(); const data = sh.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) if (String(data[i][0]) === String(id)) { sh.deleteRow(i + 1); return { ok: true }; }
    return { ok: false, msg: '공지를 찾을 수 없습니다.' };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ============================================================
// 연가 사용 촉진: 관리자가 연 3회 잔여 연가를 통지 → 직원이 연가 사용 계획서를 제출 (본인 내역에 보관, 관리자 화면·인쇄)
// ============================================================
const PROMO_CFG = '연가촉진설정', PROMO_NOTICE = '연가통지', PROMO_PLAN = '연가계획서';
function _promoCfgSheet()    { return _ensureSheet(PROMO_CFG,    ['연도','회차','통지예정일','통지자'], [3]); }
function _promoNoticeSheet() { return _ensureSheet(PROMO_NOTICE, ['연도','회차','직원','통지일','통지자','부여','사용','잔여'], [4]); }
function _promoPlanSheet()   { return _ensureSheet(PROMO_PLAN,   ['제출일','연도','회차','직원','시작일','종료일','일수','비고'], [1,5,6]); }
function _yr(y) { return Number(y) || new Date().getFullYear(); }

function _promoRounds(year) {                         // [{round,start}] 1~3회차 (통지 예정일은 참고용)
  const rows = _values(PROMO_CFG).filter(r => Number(r[0]) === year);
  return [1, 2, 3].map(n => {
    const r = rows.filter(x => Number(x[1]) === n)[0];
    return { round: n, start: r ? _fmtD(r[2]) : '' };
  });
}
function getPromoConfig(year) {
  try { const y = _yr(year); return { ok: true, year: y, rounds: _promoRounds(y) }; } catch(e) { return { ok: false, msg: e.message }; }
}
function savePromoConfig(p) {
  try {
    const y = _yr(p.year); const rounds = p.rounds || [];
    for (const r of rounds) if (![1, 2, 3].includes(Number(r.round))) return { ok: false, msg: '회차가 올바르지 않습니다.' };
    const sh = _promoCfgSheet(); const data = sh.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) if (Number(data[i][0]) === y) sh.deleteRow(i + 1);
    rounds.filter(r => String(r.start || '').trim()).forEach(r => sh.appendRow([y, Number(r.round), String(r.start).trim(), '관리자']));
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function _promoNoticesAll() {
  return _values(PROMO_NOTICE).filter(r => String(r[2]).trim()).map(r => ({
    year: Number(r[0]), round: Number(r[1]), name: String(r[2]).trim(), date: _fmtD(r[3]), by: String(r[4] || ''),
    granted: Number(r[5]) || 0, used: Number(r[6]) || 0, remain: Number(r[7]) || 0,
  }));
}
function _promoNotices(year) { return _promoNoticesAll().filter(x => x.year === year); }
function _promoPlansAll() {
  return _values(PROMO_PLAN).filter(r => String(r[3]).trim()).map(r => ({
    submitted: _fmtD(r[0]), year: Number(r[1]), round: Number(r[2]), name: String(r[3]).trim(),
    start: _fmtD(r[4]), end: _fmtD(r[5]), days: Number(r[6]) || 0, note: String(r[7] || ''),
  }));
}
function _promoPlans(year) { return _promoPlansAll().filter(x => x.year === year); }

// 관리자: 회차별 전 직원 현황 (통지 여부·잔여·제출한 계획서) — 화면·엑셀·인쇄용
function getAdminPromo(year) {
  try {
    const y = _yr(year); const rounds = _promoRounds(y); const notices = _promoNotices(y), plans = _promoPlans(y);
    const staff = _staffRows().map(r => ({ name: String(r[0]).trim(), dept: String(r[3] || ''), position: String(r[4] || '') }));
    const bal = {}; staff.forEach(st => { bal[st.name] = _calcLeaveBalance(st.name, y); });   // 직원당 한 번만 계산
    const list = [];
    [1, 2, 3].forEach(n => {
      staff.forEach(st => {
        const nt = notices.filter(x => x.round === n && x.name === st.name)[0];
        const pl = plans.filter(x => x.round === n && x.name === st.name);
        const b = bal[st.name];
        list.push({ round: n, name: st.name, dept: st.dept, position: st.position,
          notified: !!nt, noticeDate: nt ? nt.date : '', by: nt ? nt.by : '',
          granted: nt ? nt.granted : b.annualTotal, used: nt ? nt.used : b.totalUsed, remain: nt ? nt.remain : b.remain,
          planCount: pl.length, planDays: pl.reduce((a, c) => a + c.days, 0), submitted: pl.length ? pl[0].submitted : '',
          plans: pl.map(p => ({ start: p.start, end: p.end, days: p.days, submitted: p.submitted })) });
      });
    });
    return { ok: true, year: y, rounds, list };
  } catch(e) { return { ok: false, msg: e.message }; }
}
// 관리자가 선택한 직원에게 통지 (현재 연차 일수를 스냅샷으로 저장, 슬랙 DM)
function adminPromoNotify(year, round, names) {
  try {
    const y = _yr(year), n = Number(round);
    if (![1, 2, 3].includes(n)) return { ok: false, msg: '회차가 올바르지 않습니다.' };
    const all = _staffRows().map(r => String(r[0]).trim());
    const targets = (names || []).map(x => String(x).trim()).filter(x => all.includes(x));
    if (!targets.length) return { ok: false, msg: '통지할 직원을 선택하세요.' };
    const sh = _promoNoticeSheet(); const today = _today();
    let done = 0;
    targets.forEach(name => {
      const bal = _calcLeaveBalance(name, y);
      const data = sh.getDataRange().getValues();
      for (let i = data.length - 1; i >= 1; i--) if (Number(data[i][0]) === y && Number(data[i][1]) === n && String(data[i][2]).trim() === name) sh.deleteRow(i + 1);
      sh.appendRow([y, n, name, today, '관리자', bal.annualTotal, bal.totalUsed, bal.remain]);
      done++;
      try {
        const sid = _slackIdOf(name);
        if (sid && _slackToken()) { const url = _siteUrl();
          _slackPost(sid, ':calendar: *연가 사용 통지 (' + y + '년 ' + n + '회차)*\n부여 ' + bal.annualTotal + '일 / 사용 ' + bal.totalUsed + '일 / 잔여 ' + bal.remain + '일\n연가 사용 계획서를 제출해 주세요.' + (url ? '\n<' + url + '|근태 시스템에서 제출하기>' : '')); }
      } catch(e) {}
    });
    return { ok: true, count: done };
  } catch(e) { return { ok: false, msg: e.message }; }
}
// 직원: 이번 해 받은 통지 + 지금까지 제출한 모든 계획서(보관 내역, 복사용)
function getMyPromo(auth, year) {
  try {
    const me = _authStaff(auth); if (!me) return { ok: false, msg: '로그인 정보를 확인할 수 없습니다.' };
    const y = _yr(year);
    const allN = _promoNoticesAll().filter(x => x.name === me.name), allP = _promoPlansAll().filter(x => x.name === me.name);
    const plansOf = (yy, rr) => allP.filter(x => x.year === yy && x.round === rr).map(p => ({ start: p.start, end: p.end, days: p.days, note: p.note, submitted: p.submitted }));
    const notices = allN.filter(x => x.year === y).sort((a, b) => a.round - b.round).map(nt => {
      const pl = plansOf(nt.year, nt.round);
      return Object.assign({}, nt, { plans: pl, planDays: pl.reduce((a, b) => a + b.days, 0), submitted: pl.length > 0 });
    });
    const keys = {}; allP.forEach(p => { keys[p.year + '-' + p.round] = [p.year, p.round]; });
    const history = Object.keys(keys).map(k => {
      const yy = keys[k][0], rr = keys[k][1]; const nt = allN.filter(x => x.year === yy && x.round === rr)[0] || {};
      const pl = plansOf(yy, rr);
      return { year: yy, round: rr, date: nt.date || '', by: nt.by || '', granted: nt.granted || 0, used: nt.used || 0, remain: nt.remain || 0,
        plans: pl, planDays: pl.reduce((a, b) => a + b.days, 0), submitted: pl.length ? pl[0].submitted : '' };
    }).sort((a, b) => (b.year - a.year) || (b.round - a.round));
    return { ok: true, year: y, notices, history };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function submitPromoPlan(auth, year, round, rows) {
  try {
    const me = _authStaff(auth); if (!me) return { ok: false, msg: '로그인 정보를 확인할 수 없습니다.' };
    const y = _yr(year), n = Number(round);
    const nt = _promoNotices(y).filter(x => x.name === me.name && x.round === n)[0];
    if (!nt) return { ok: false, msg: '아직 통지받지 않은 회차입니다.' };
    const clean = (rows || []).filter(r => r && (String(r.start || '').trim() || String(r.end || '').trim()));
    if (!clean.length) return { ok: false, msg: '사용 기간을 한 줄 이상 입력하세요.' };
    let total = 0;
    for (const r of clean) {
      const st = String(r.start || '').trim(), en = String(r.end || '').trim(), d = Number(r.days);
      if (!st || !en || en < st) return { ok: false, msg: '기간(시작일~종료일)을 올바르게 입력하세요.' };
      if (!(d > 0)) return { ok: false, msg: '일수는 0보다 커야 합니다. (' + st + ' ~ ' + en + ')' };
      total += d;
    }
    if (total > nt.remain + 0.0001) return { ok: false, msg: '계획 합계(' + total + '일)가 통지된 잔여 연가(' + nt.remain + '일)를 넘습니다.' };
    const sh = _promoPlanSheet(); const data = sh.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) if (Number(data[i][1]) === y && Number(data[i][2]) === n && String(data[i][3]).trim() === me.name) sh.deleteRow(i + 1);
    const today = _today();
    clean.forEach(r => sh.appendRow([today, y, n, me.name, String(r.start).trim(), String(r.end).trim(), Number(r.days), String(r.note || '').trim()]));
    return { ok: true, total };
  } catch(e) { return { ok: false, msg: e.message }; }
}


// ============================================================
// 모바일 출퇴근 · 출장 (GPS 주소 기록)
// ------------------------------------------------------------
// 직원: [출근]/[퇴근]/[출장] 버튼 → 서버 시각 + 위치(주소) 기록
//   · 근무지 반경 밖이거나, 내 기준시각(출근 +5분 이상 늦음 / 퇴근 1분이라도 빠름)을 벗어나면 사유 필수
//   · 출장은 버튼 한 번 (출장지 주소 자동 + 사유 필수)
// 관리자: 기록 보정(수정) · 수정 이력 · 월별 근태현황 · 근무지/기준시각 설정
// ============================================================
const ATT_SHEET = '출퇴근기록', TRIP_SHEET = '출장기록', REASON_SHEET = '출퇴근사유', ATTLOG_SHEET = '근태수정이력';
const ATT_HEAD  = ['날짜','이름','출근시각','출근장소','출근위도','출근경도','출근확인','출근사유','퇴근시각','퇴근장소','퇴근위도','퇴근경도','퇴근확인','퇴근사유','수정'];
const TRIP_HEAD = ['날짜','이름','시각','출장지주소','위도','경도','방문처','사유','수정'];
const LATE_GRACE_MIN = 5;          // 기준 출근시각보다 이 시간(분) 이상 늦으면 사유 필수
const DEFAULT_REASON = '시수';     // 사유 목록에 항상 들어 있는 기본 항목

function _attSheet()  { return _ensureSheet(ATT_SHEET, ATT_HEAD, [1,2,3,9]); }
function _tripSheet() { return _ensureSheet(TRIP_SHEET, TRIP_HEAD, [1,2,3]); }
function _reasonSheet() { return _ensureSheet(REASON_SHEET, ['이름','사유'], [1,2]); }
function _attLogSheet() { return _ensureSheet(ATTLOG_SHEET, ['일시','처리자','대상직원','대상날짜','항목','이전값','변경값'], [1,3,4]); }
function _putRow(sh, row, arr) {
  const rg = sh.getRange(row, 1, 1, arr.length);
  rg.setNumberFormat('@');
  rg.setValues([arr.map(v => v === null || v === undefined ? '' : v)]);
}
function _p2(n) { return (n < 10 ? '0' : '') + n; }
function _ymdLocal(d) { return d.getFullYear() + '-' + _p2(d.getMonth() + 1) + '-' + _p2(d.getDate()); }
function _okHM(v) { const m = String(v == null ? '' : v).trim().match(/^(\d{1,2}):(\d{2})$/); return !!m && Number(m[1]) < 24 && Number(m[2]) < 60; }
function _normHM(v) { const m = String(v).trim().match(/^(\d{1,2}):(\d{2})$/); return _p2(Number(m[1])) + ':' + m[2]; }
function _toMin(hm) { const m = String(hm || '').match(/^(\d{1,2}):(\d{2})/); return m ? Number(m[1]) * 60 + Number(m[2]) : NaN; }

// ── 설정 (설정 시트의 키-값) ──
function _cfgRaw(key) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
  if (!sh) return '';
  const d = sh.getDataRange().getValues();
  for (let i = 0; i < d.length; i++) if (String(d[i][0]).trim() === key) return String(d[i][1] == null ? '' : d[i][1]).trim();
  return '';
}
function _cfgSetRaw(key, val) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEETS.CONFIG);
  if (!sh) { _createConfigSheet(); sh = ss.getSheetByName(SHEETS.CONFIG); }
  const d = sh.getDataRange().getValues();
  for (let i = 0; i < d.length; i++) if (String(d[i][0]).trim() === key) { sh.getRange(i + 1, 2).setNumberFormat('@').setValue(String(val)); return; }
  sh.appendRow([key, String(val)]);
  sh.getRange(sh.getLastRow(), 2).setNumberFormat('@').setValue(String(val));
}
function _attCfg() {
  const lat = parseFloat(_cfgRaw('근무지위도')), lng = parseFloat(_cfgRaw('근무지경도'));
  const si = _cfgRaw('기본출근'), so = _cfgRaw('기본퇴근');
  return {
    placeName: _cfgRaw('근무지명'), address: _cfgRaw('근무지주소'), lat, lng,
    hasPlace: isFinite(lat) && isFinite(lng), radius: Number(_cfgRaw('허용반경')) || 300,
    stdIn: _okHM(si) ? _normHM(si) : '09:00', stdOut: _okHM(so) ? _normHM(so) : '18:00',
  };
}
function _stdOf(name, cfg) {         // 직원별 기준시각 (비어 있으면 기관 기본값)
  cfg = cfg || _attCfg();
  const r = _staffRows().filter(x => String(x[0]).trim() === String(name).trim())[0];
  const a = r ? _fmtT(r[12]).trim() : '', b = r ? _fmtT(r[13]).trim() : '';
  return { in: _okHM(a) ? _normHM(a) : cfg.stdIn, out: _okHM(b) ? _normHM(b) : cfg.stdOut };
}

// ── 거리 · 주소 변환 (카카오 로컬 API: 키는 스크립트 속성에 저장) ──
function _haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function _kakaoKey() { try { return PropertiesService.getScriptProperties().getProperty('KAKAO_REST_KEY') || ''; } catch(e) { return ''; } }
function _kakaoGet(path) {
  const key = _kakaoKey();
  if (!key) return { err: 'no_key' };
  try {
    const res = UrlFetchApp.fetch('https://dapi.kakao.com' + path, { method: 'get', headers: { Authorization: 'KakaoAK ' + key }, muteHttpExceptions: true });
    const code = res.getResponseCode ? res.getResponseCode() : 200;
    const j = JSON.parse(res.getContentText());
    if (code !== 200) return { err: 'http_' + code, msg: j.message || j.msg || '' };
    return { data: j };
  } catch(e) { return { err: 'exception', msg: e.message }; }
}
function _reverseGeocode(lat, lng) {
  const r = _kakaoGet('/v2/local/geo/coord2address.json?x=' + encodeURIComponent(lng) + '&y=' + encodeURIComponent(lat));
  const d = r.data && r.data.documents && r.data.documents[0];
  return d ? ((d.road_address && d.road_address.address_name) || (d.address && d.address.address_name) || '') : '';
}
function _geocodeAddr(q) {
  q = String(q || '').trim();
  if (!q) return { ok: false, msg: '주소를 입력하세요.' };
  let r = _kakaoGet('/v2/local/search/address.json?query=' + encodeURIComponent(q));
  if (r.err === 'no_key') return { ok: false, msg: '카카오 REST API 키가 아직 저장되지 않았습니다. 아래에 키를 먼저 저장하세요.' };
  if (r.err) return { ok: false, msg: '카카오 응답 오류(' + r.err + ') ' + (r.msg || '') + ' — REST API 키가 맞는지, 앱의 [제품 설정 → 카카오맵 → 사용 설정]이 ON인지 확인하세요.' };
  let d = r.data.documents && r.data.documents[0];
  if (d) return { ok: true, lat: Number(d.y), lng: Number(d.x), addr: (d.road_address && d.road_address.address_name) || d.address_name || q };
  r = _kakaoGet('/v2/local/search/keyword.json?query=' + encodeURIComponent(q));
  d = r.data && r.data.documents && r.data.documents[0];
  if (d) return { ok: true, lat: Number(d.y), lng: Number(d.x), addr: d.road_address_name || d.address_name || q, place: d.place_name };
  return { ok: false, msg: '주소를 찾지 못했습니다. 도로명 주소를 더 자세히 입력해 보세요.' };
}
function _placeText(addr, lat, lng, hasGps) {
  if (addr) return addr;
  return hasGps ? ('주소 변환 불가 (위도 ' + Number(lat).toFixed(5) + ', 경도 ' + Number(lng).toFixed(5) + ')') : '위치 확인 불가';
}

// ── 기록 읽기/찾기 ──
function _attObj(v) {
  return {
    date: _fmtD(v[0]), name: String(v[1]).trim(),
    inTime: _fmtT(v[2]), inAddr: String(v[3] || ''), inFlag: String(v[6] || ''), inReason: String(v[7] || ''),
    outTime: _fmtT(v[8]), outAddr: String(v[9] || ''), outFlag: String(v[12] || ''), outReason: String(v[13] || ''),
    edited: String(v[14] || ''),
  };
}
function _tripObj(v) {
  return { date: _fmtD(v[0]), name: String(v[1]).trim(), time: _fmtT(v[2]), addr: String(v[3] || ''), place: String(v[6] || ''), reason: String(v[7] || ''), edited: String(v[8] || '') };
}
function _findAtt(date, name) {
  const rows = _values(ATT_SHEET);
  for (let i = 0; i < rows.length; i++) if (_fmtD(rows[i][0]) === date && String(rows[i][1]).trim() === name) return { row: i + 2, vals: rows[i].slice() };
  return null;
}
function _findTrip(date, name) {
  const rows = _values(TRIP_SHEET);
  for (let i = 0; i < rows.length; i++) if (_fmtD(rows[i][0]) === date && String(rows[i][1]).trim() === name) return { row: i + 2, vals: rows[i].slice() };
  return null;
}
function _reasonList(name) {
  const mine = _values(REASON_SHEET).filter(r => String(r[0]).trim() === name).map(r => String(r[1]).trim()).filter(x => x && x !== DEFAULT_REASON);
  return [DEFAULT_REASON].concat(mine.filter((x, i) => mine.indexOf(x) === i));
}
function _todayStatus(name) {
  const date = _today();
  const a = _findAtt(date, name), t = _findTrip(date, name);
  const ao = a ? _attObj(a.vals) : null, to = t ? _tripObj(t.vals) : null;
  return {
    date,
    in:   ao && ao.inTime  ? { time: ao.inTime,  addr: ao.inAddr,  flag: ao.inFlag,  reason: ao.inReason }  : null,
    out:  ao && ao.outTime ? { time: ao.outTime, addr: ao.outAddr, flag: ao.outFlag, reason: ao.outReason } : null,
    trip: to ? { time: to.time, addr: to.addr, place: to.place, reason: to.reason } : null,
    tripReq: _tripCoverFor(name, date),
  };
}

// ── 직원: 오늘 상태 ──
function getMyAttendToday(auth) {
  try {
    const me = _authStaff(auth); if (!me) return { ok: false, msg: '로그인 정보가 올바르지 않습니다.' };
    const cfg = _attCfg();
    return {
      ok: true, now: Utilities.formatDate(_now(), 'Asia/Seoul', 'HH:mm'),
      place: { name: cfg.placeName, address: cfg.address, radius: cfg.radius, set: cfg.hasPlace },
      std: _stdOf(me.name, cfg), reasons: _reasonList(me.name), today: _todayStatus(me.name),
    };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function deleteMyAttendReason(p) {
  try {
    const me = _authStaff(p.auth); if (!me) return { ok: false, msg: '로그인 정보가 올바르지 않습니다.' };
    const sh = _reasonSheet();
    const rows = _values(REASON_SHEET);
    for (let i = rows.length - 1; i >= 0; i--) if (String(rows[i][0]).trim() === me.name && String(rows[i][1]).trim() === String(p.reason).trim()) sh.deleteRow(i + 2);
    return { ok: true, reasons: _reasonList(me.name) };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ── 직원: 출근 / 퇴근 / 출장 찍기 ──
// 사유가 필요한데 없으면 기록하지 않고 { needReason:true, flags:[…] }를 돌려준다 → 화면이 사유를 받아 다시 호출.
function punchAttend(p) {
  try {
    const me = _authStaff(p.auth); if (!me) return { ok: false, msg: '로그인 정보가 올바르지 않습니다. 다시 로그인해 주세요.' };
    const type = String(p.type || '');
    if (['in', 'out', 'trip'].indexOf(type) < 0) return { ok: false, msg: '알 수 없는 요청입니다.' };
    const now = _now(), date = _today(), hm = Utilities.formatDate(now, 'Asia/Seoul', 'HH:mm');
    const cfg = _attCfg(), std = _stdOf(me.name, cfg);
    const lat = Number(p.lat), lng = Number(p.lng);
    const hasGps = p.lat !== undefined && p.lat !== null && p.lat !== '' && isFinite(lat) && isFinite(lng) && !(lat === 0 && lng === 0) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    const rec = _findAtt(date, me.name), trip = _findTrip(date, me.name);
    const ao = rec ? _attObj(rec.vals) : null;
    if (type === 'in'   && ao && ao.inTime)  return { ok: false, msg: '오늘 이미 출근을 기록했습니다 (' + ao.inTime + '). 잘못 찍은 경우 관리자에게 수정을 요청하세요.' };
    if (type === 'out'  && ao && ao.outTime) return { ok: false, msg: '오늘 이미 퇴근을 기록했습니다 (' + ao.outTime + '). 잘못 찍은 경우 관리자에게 수정을 요청하세요.' };
    if (type === 'trip' && trip)             return { ok: false, msg: '오늘 이미 출장을 기록했습니다. 잘못 찍은 경우 관리자에게 수정을 요청하세요.' };

    const reason = String(p.reason || '').trim().slice(0, 100);
    const flags = [];      // { code, label, text }
    let dist = null;
    if (type === 'trip') {
      flags.push({ code: 'trip', label: '출장', text: '출장 사유를 입력하세요.' });
    } else {
      if (!hasGps) flags.push({ code: 'nogps', label: '위치없음', text: '현재 위치를 확인하지 못했습니다.' });
      else if (cfg.hasPlace) {
        dist = Math.round(_haversine(lat, lng, cfg.lat, cfg.lng));
        if (dist > cfg.radius && !trip) flags.push({ code: 'place', label: '범위밖', text: '근무지(' + (cfg.placeName || cfg.address || '등록된 근무지') + ')에서 ' + dist + 'm 떨어진 곳입니다. (허용 ' + cfg.radius + 'm)' });
      }
      if (type === 'in') {
        const diff = _toMin(hm) - _toMin(std.in);
        if (diff >= LATE_GRACE_MIN) flags.push({ code: 'late', label: '지각', text: '기준 출근시각(' + std.in + ')보다 ' + diff + '분 늦었습니다.' });
      } else {
        const diff = _toMin(std.out) - _toMin(hm);
        if (diff > 0) flags.push({ code: 'early', label: '조퇴', text: '기준 퇴근시각(' + std.out + ')보다 ' + diff + '분 일찍 찍었습니다.' });
      }
    }
    const addr = hasGps ? _reverseGeocode(lat, lng) : '';
    const placeTxt = _placeText(addr, lat, lng, hasGps);
    if (flags.length && !reason) {
      return { ok: false, needReason: true, type, flags, dist, addr: placeTxt, time: hm,
               msg: type === 'trip' ? '출장 사유를 입력해 주세요.' : '사유를 입력해야 기록할 수 있습니다.',
               reasons: _reasonList(me.name) };
    }
    const label = flags.length ? flags.map(f => f.label).join('·') : '정상';
    if (type === 'trip') {
      _putRow(_tripSheet(), _tripSheet().getLastRow() + 1, [date, me.name, hm, placeTxt, hasGps ? lat : '', hasGps ? lng : '', String(p.place || '').trim().slice(0, 100), reason, '']);
      if (!_tripCoverFor(me.name, date)) _notifySupervisor(me.name, '출장 기록 (출장 신청서 없음)', hm + ' · ' + (String(p.place || '').trim() || placeTxt || '위치 미확인') + ' · ' + reason + ' — 출장 후 신청서를 작성하도록 안내해 주세요.');
    } else {
      const arr = rec ? rec.vals.slice() : [];
      while (arr.length < ATT_HEAD.length) arr.push('');
      arr[0] = date; arr[1] = me.name;
      if (type === 'in') { arr[2] = hm; arr[3] = placeTxt; arr[4] = hasGps ? lat : ''; arr[5] = hasGps ? lng : ''; arr[6] = label; arr[7] = reason; }
      else               { arr[8] = hm; arr[9] = placeTxt; arr[10] = hasGps ? lat : ''; arr[11] = hasGps ? lng : ''; arr[12] = label; arr[13] = reason; }
      const sh = _attSheet();
      _putRow(sh, rec ? rec.row : sh.getLastRow() + 1, arr);
    }
    // 자주 쓰는 사유 목록에 저장
    if (reason && p.saveReason && reason !== DEFAULT_REASON) {
      const list = _reasonList(me.name);
      if (list.indexOf(reason) < 0 && list.length < 31) { const rs = _reasonSheet(); _putRow(rs, rs.getLastRow() + 1, [me.name, reason]); }
    }
    return { ok: true, type, time: hm, addr: placeTxt, flag: label, today: _todayStatus(me.name), reasons: _reasonList(me.name) };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ── 월별 근태현황 ──
function _monthCtx() {
  return { treq: _tripList(null), att: _values(ATT_SHEET), trips: _values(TRIP_SHEET), leave: _values(SHEETS.LEAVE), ot: _values(SHEETS.OVERTIME), comp: _values(SHEETS.COMP_USE) };
}
function _buildMonth(name, ym, ctx) {
  const Y = Number(ym.slice(0, 4)), M = Number(ym.slice(5, 7));
  const last = new Date(Y, M, 0).getDate();
  const DOW = ['일','월','화','수','목','금','토'];
  const prefix = ym + '-', today = _today();
  const att = {}, trips = {}, leave = {}, ot = {}, comp = {};
  ctx.att.forEach(r => { const d = _fmtD(r[0]); if (String(r[1]).trim() === name && d.indexOf(prefix) === 0) att[d] = _attObj(r); });
  ctx.trips.forEach(r => { const d = _fmtD(r[0]); if (String(r[1]).trim() === name && d.indexOf(prefix) === 0) trips[d] = _tripObj(r); });
  ctx.leave.forEach(r => {
    if (String(r[1]).trim() !== name || !_leaveOk(r[7])) return;
    const s = _fmtD(r[3]), e = _fmtD(r[4]) || s;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return;
    const sd = new Date(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)));
    for (let k = 0; k < 400; k++) {
      const d = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate() + k), ds = _ymdLocal(d);
      if (ds > e) break;
      if (ds.indexOf(prefix) === 0 && d.getDay() !== 0 && d.getDay() !== 6) leave[ds] = String(r[2]);
    }
  });
  ctx.ot.forEach(r => {
    const d = _fmtD(r[2]);
    if (String(r[1]).trim() !== name || d.indexOf(prefix) !== 0 || !_isApproved(r[10])) return;
    (ot[d] = ot[d] || []).push({ text: _fmtT(r[4]) + '~' + _fmtT(r[5]) + ' (' + _round3(Number(r[6]) || 0) + 'h)', hours: Number(r[6]) || 0 });
  });
  ctx.comp.forEach(r => {
    const d = _fmtD(r[3]);
    if (String(r[1]).trim() === name && d.indexOf(prefix) === 0 && _isApproved(r[5])) comp[d] = Number(r[2]) || 1;
  });
  const sum = { weekdays: 0, attDays: 0, late: 0, early: 0, outPlace: 0, trip: 0, leave: 0, comp: 0, missing: 0, otCount: 0, otHours: 0 };
  const rows = [];
  const tcov = {};      // 날짜 → 그 날을 덮는 출장 신청 (승인된 것을 우선)
  (ctx.treq || []).forEach(x => {
    if (x.name !== name || !/^\d{4}-\d{2}-\d{2}$/.test(x.start)) return;
    const sd = new Date(x.start + 'T00:00:00');
    for (let k = 0; k < 40; k++) {
      const dd = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate() + k), ds = _ymdLocal(dd);
      if (ds > x.end) break;
      if (ds.indexOf(prefix) !== 0) continue;
      const ok = true;
      if (!tcov[ds] || (ok && !tcov[ds].ok)) tcov[ds] = { docNo: x.docNo, ok, status: x.status, to: x.to, purpose: x.purpose };
    }
  });
  for (let d = 1; d <= last; d++) {
    const date = Y + '-' + _p2(M) + '-' + _p2(d), dow = new Date(Y, M - 1, d).getDay(), weekend = dow === 0 || dow === 6;
    const tq = tcov[date] || null;
    const a = att[date] || null, tr = trips[date] || null, lv = leave[date] || '', cp = comp[date] || 0, ots = ot[date] || [];
    const hasIn = !!(a && a.inTime), hasOut = !!(a && a.outTime);
    const fl = ((a && a.inFlag) || '') + '|' + ((a && a.outFlag) || '');
    if (!weekend) sum.weekdays++;
    if (hasIn || hasOut) sum.attDays++;
    if (fl.indexOf('지각') >= 0) sum.late++;
    if (fl.indexOf('조퇴') >= 0) sum.early++;
    if (fl.indexOf('범위밖') >= 0 || fl.indexOf('위치없음') >= 0) sum.outPlace++;
    const tqOnly = !!(tq && tq.ok && !weekend && !tr && !(a && (a.inTime || a.outTime)));   // 승인된 출장 신청만 있고 기록은 없는 날
    if (tr || tqOnly) sum.trip++;
    if (lv) sum.leave += /반차/.test(lv) ? 0.5 : 1;
    if (cp) sum.comp++;
    ots.forEach(o => { sum.otCount++; sum.otHours += o.hours; });
    let status = '';
    const off = !!(tr || lv || cp || tqOnly);
    if (tr) status = '출장'; else if (lv) status = '휴가'; else if (cp) status = '대체휴무'; else if (tqOnly) status = '출장(신청)';
    else if (hasIn || hasOut) {
      const miss = !weekend && date < today && (!hasIn ? '출근 미기록' : !hasOut ? '퇴근 미기록' : '');
      status = miss || (/지각|조퇴|범위밖|위치없음/.test(fl) ? '사유기재' : '정상');
    } else if (!weekend && date < today) status = '미기록';
    if (!weekend && date < today && !off && !hasIn && !hasOut) sum.missing++;
    else if (!weekend && date < today && !off && (!hasIn || !hasOut) && (hasIn || hasOut)) sum.missing++;
    rows.push({
      date, day: d, dow: DOW[dow], weekend,
      inTime: a ? a.inTime : '', inAddr: a ? a.inAddr : '', inFlag: a ? a.inFlag : '', inReason: a ? a.inReason : '',
      outTime: a ? a.outTime : '', outAddr: a ? a.outAddr : '', outFlag: a ? a.outFlag : '', outReason: a ? a.outReason : '',
      trip: tr ? { time: tr.time, addr: tr.addr, place: tr.place, reason: tr.reason } : null,
      tripReq: tq ? { docNo: tq.docNo, status: tq.status, to: tq.to, purpose: tq.purpose } : null, tripNoApply: !!(tr && !tq),
      leave: lv, comp: cp ? '대체휴무' : '', ot: ots.map(o => o.text).join(', '),
      status, edited: !!((a && a.edited) || (tr && tr.edited)), editNote: (a && a.edited) || (tr && tr.edited) || '',
    });
  }
  sum.otHours = _round3(sum.otHours);
  const st = _staffRows().filter(r => String(r[0]).trim() === name)[0] || [];
  return { name, dept: String(st[3] || ''), position: String(st[4] || ''), ym, std: _stdOf(name), rows, summary: sum };
}
function _validYm(ym) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(ym || '')); }
function getMyMonthAttend(p) {
  try {
    const me = _authStaff(p.auth); if (!me) return { ok: false, msg: '로그인 정보가 올바르지 않습니다.' };
    if (!_validYm(p.ym)) return { ok: false, msg: '월 형식이 올바르지 않습니다.' };
    return { ok: true, orgName: getConfig().ORG_NAME, month: _buildMonth(me.name, p.ym, _monthCtx()) };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function getAdminAttendMonth(p) {
  try {
    if (!_validYm(p.ym)) return { ok: false, msg: '월 형식이 올바르지 않습니다.' };
    const ctx = _monthCtx(), names = p.name ? [String(p.name).trim()] : _staffRows().map(r => String(r[0]).trim());
    return { ok: true, orgName: getConfig().ORG_NAME, ym: p.ym, months: names.map(n => _buildMonth(n, p.ym, ctx)) };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ── 관리자: 기록 보정 (모든 변경은 수정이력에 남김) ──
function _logAttend(name, date, field, oldV, newV) {
  const sh = _attLogSheet();
  _putRow(sh, sh.getLastRow() + 1, [Utilities.formatDate(_now(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm'), '관리자', name, date, field, oldV == null ? '' : String(oldV), newV == null ? '' : String(newV)]);
}
function _staffExists(name) { return _staffRows().some(r => String(r[0]).trim() === name); }
function adminSaveAttend(p) {
  try {
    const name = String(p.name || '').trim(), date = String(p.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, msg: '날짜가 올바르지 않습니다.' };
    if (!_staffExists(name)) return { ok: false, msg: '직원을 찾을 수 없습니다.' };
    const cur = _findAtt(date, name);
    const arr = cur ? cur.vals.slice() : [];
    while (arr.length < ATT_HEAD.length) arr.push('');
    arr[0] = date; arr[1] = name;
    const fields = [['inTime', 2, '출근시각', 1], ['inAddr', 3, '출근장소'], ['inReason', 7, '출근사유'], ['outTime', 8, '퇴근시각', 1], ['outAddr', 9, '퇴근장소'], ['outReason', 13, '퇴근사유']];
    const changes = [];
    for (const f of fields) {
      if (p[f[0]] === undefined) continue;
      let v = String(p[f[0]] == null ? '' : p[f[0]]).trim();
      if (f[3]) { if (v && !_okHM(v)) return { ok: false, msg: f[2] + '은 시:분(예 09:05) 형식으로 입력하세요.' }; if (v) v = _normHM(v); }
      const old = f[3] ? _fmtT(arr[f[1]]) : String(arr[f[1]] == null ? '' : arr[f[1]]);
      if (old !== v) { changes.push([f[2], old, v]); arr[f[1]] = v; }
    }
    if (!changes.length) return { ok: true, unchanged: true };
    changes.forEach(c => { if (c[0] === '출근시각' && c[2]) { arr[6] = '관리자보정'; arr[4] = ''; arr[5] = ''; } if (c[0] === '퇴근시각' && c[2]) { arr[12] = '관리자보정'; arr[10] = ''; arr[11] = ''; } });
    arr[14] = '관리자 수정 ' + _today();
    const sh = _attSheet();
    _putRow(sh, cur ? cur.row : sh.getLastRow() + 1, arr);
    changes.forEach(c => _logAttend(name, date, c[0], c[1], c[2]));
    return { ok: true, changed: changes.length };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function adminDeleteAttend(p) {
  try {
    const name = String(p.name || '').trim(), date = String(p.date || '').trim();
    const cur = _findAtt(date, name);
    if (!cur) return { ok: false, msg: '기록이 없습니다.' };
    const o = _attObj(cur.vals);
    _attSheet().deleteRow(cur.row);
    _logAttend(name, date, '출퇴근 기록 삭제', '출근 ' + (o.inTime || '-') + ' / 퇴근 ' + (o.outTime || '-'), '');
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function adminSaveTrip(p) {
  try {
    const name = String(p.name || '').trim(), date = String(p.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, msg: '날짜가 올바르지 않습니다.' };
    if (!_staffExists(name)) return { ok: false, msg: '직원을 찾을 수 없습니다.' };
    const cur = _findTrip(date, name);
    const arr = cur ? cur.vals.slice() : [];
    while (arr.length < TRIP_HEAD.length) arr.push('');
    arr[0] = date; arr[1] = name;
    const fields = [['time', 2, '출장시각', 1], ['addr', 3, '출장지주소'], ['place', 6, '방문처'], ['reason', 7, '출장사유']];
    const changes = [];
    for (const f of fields) {
      if (p[f[0]] === undefined) continue;
      let v = String(p[f[0]] == null ? '' : p[f[0]]).trim();
      if (f[3]) { if (v && !_okHM(v)) return { ok: false, msg: f[2] + '은 시:분(예 09:05) 형식으로 입력하세요.' }; if (v) v = _normHM(v); }
      const old = f[3] ? _fmtT(arr[f[1]]) : String(arr[f[1]] == null ? '' : arr[f[1]]);
      if (old !== v) { changes.push([f[2], old, v]); arr[f[1]] = v; }
    }
    if (!cur && !String(arr[7] || '').trim()) return { ok: false, msg: '출장 사유를 입력하세요.' };
    if (!changes.length) return { ok: true, unchanged: true };
    arr[8] = '관리자 수정 ' + _today();
    const sh = _tripSheet();
    _putRow(sh, cur ? cur.row : sh.getLastRow() + 1, arr);
    changes.forEach(c => _logAttend(name, date, c[0], c[1], c[2]));
    if (!cur) _logAttend(name, date, '출장 추가', '', arr[7]);
    return { ok: true, changed: changes.length };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function adminDeleteTrip(p) {
  try {
    const name = String(p.name || '').trim(), date = String(p.date || '').trim();
    const cur = _findTrip(date, name);
    if (!cur) return { ok: false, msg: '기록이 없습니다.' };
    const o = _tripObj(cur.vals);
    _tripSheet().deleteRow(cur.row);
    _logAttend(name, date, '출장 기록 삭제', (o.addr || '') + ' · ' + (o.reason || ''), '');
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function getAdminAttendLog(p) {
  try {
    const ym = String((p && p.ym) || '');
    return _values(ATTLOG_SHEET).map(r => ({ at: _fmtD(r[0]) === String(r[0]) ? String(r[0]) : Utilities.formatDate(r[0], 'Asia/Seoul', 'yyyy-MM-dd HH:mm'),
      by: String(r[1]), name: String(r[2]), date: _fmtD(r[3]), field: String(r[4]), oldV: String(r[5] || ''), newV: String(r[6] || '') }))
      .filter(x => !ym || x.date.indexOf(ym) === 0).reverse().slice(0, 300);
  } catch(e) { return []; }
}

// ── 관리자: 근무지 · 기준시각 · 카카오 키 설정 ──
function getAttendAdminConfig() {
  const c = _attCfg();
  return { ok: true, placeName: c.placeName, address: c.address, lat: c.hasPlace ? c.lat : '', lng: c.hasPlace ? c.lng : '', radius: c.radius, stdIn: c.stdIn, stdOut: c.stdOut, hasKey: !!_kakaoKey() };
}
function saveAttendConfig(p) {
  try {
    if (p.stdIn !== undefined && !_okHM(p.stdIn)) return { ok: false, msg: '기본 출근시각은 시:분(예 09:00) 형식으로 입력하세요.' };
    if (p.stdOut !== undefined && !_okHM(p.stdOut)) return { ok: false, msg: '기본 퇴근시각은 시:분(예 18:00) 형식으로 입력하세요.' };
    if (p.radius !== undefined && !(Number(p.radius) >= 30 && Number(p.radius) <= 5000)) return { ok: false, msg: '허용 반경은 30~5000 미터 사이로 입력하세요.' };
    if (p.lat !== undefined && p.lat !== '' && !(isFinite(Number(p.lat)) && isFinite(Number(p.lng)) && Math.abs(Number(p.lat)) <= 90 && Math.abs(Number(p.lng)) <= 180)) return { ok: false, msg: '위도·경도가 올바르지 않습니다.' };
    if (p.placeName !== undefined) _cfgSetRaw('근무지명', String(p.placeName).trim());
    if (p.address !== undefined) _cfgSetRaw('근무지주소', String(p.address).trim());
    if (p.lat !== undefined) { _cfgSetRaw('근무지위도', p.lat === '' ? '' : String(Number(p.lat))); _cfgSetRaw('근무지경도', p.lat === '' ? '' : String(Number(p.lng))); }
    if (p.radius !== undefined) _cfgSetRaw('허용반경', String(Math.round(Number(p.radius))));
    if (p.stdIn !== undefined) _cfgSetRaw('기본출근', _normHM(p.stdIn));
    if (p.stdOut !== undefined) _cfgSetRaw('기본퇴근', _normHM(p.stdOut));
    const props = PropertiesService.getScriptProperties();
    if (p.clearKakao) props.deleteProperty('KAKAO_REST_KEY');
    else if (String(p.kakaoKey || '').trim()) props.setProperty('KAKAO_REST_KEY', String(p.kakaoKey).trim());
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function geocodeAddressAdmin(p) {
  try { return _geocodeAddr(p.address); } catch(e) { return { ok: false, msg: e.message }; }
}

// ============================================================
// 출장 신청 (휴가처럼 신청 즉시 확정 → 신청서를 출력해서 결재 받음. 전자결재는 나중에 추가)
//  - 상태: 항상 '확정' (승인·반려 없음. 옛 '대기'·'선임승인'·'최종승인'도 확정으로 취급)
//  - 문서번호는 부서별 규칙(관리자가 설정)으로 신청할 때 자동 발급
//  - 설정은 '설정' 시트의 '출장설정' 칸에 JSON으로 저장
// ============================================================
const TREQ_SHEET = '출장신청';
const TREQ_HEAD = ['신청일','성명','문서번호','부서','직위','연락처','동행자','출장목적','시작일','종료일','출장지','교통편','업무대행자','지급출처','비고','상태','처리일','요청ID','승인자','반려사유','복명서','번호키','번호순번'];
const TRIP_LOGIN_MSG = '로그인 정보가 올바르지 않습니다. 다시 로그인해 주세요.';
function _treqSheet() { return _ensureSheet(TREQ_SHEET, TREQ_HEAD, [1,3,6,9,10,17,18,22,23]); }

function _tripCfg() { try { const o = JSON.parse(_cfgRaw('출장설정') || '{}'); return (o && typeof o === 'object') ? o : {}; } catch(e) { return {}; } }
function _tripPayOptions() {
  const c = _tripCfg();
  const d = ['기관에서 지급', '실비 지급', '지급 없음'];
  return (Array.isArray(c.payOptions) && c.payOptions.length) ? c.payOptions.map(s => String(s).trim()).filter(Boolean) : d;
}
function _tripRule(dept) {
  const rules = _tripCfg().docRules || {};
  const r = rules[dept] || rules['*'] || {};
  let digits = Number(r.digits); if (!(digits >= 1 && digits <= 6)) digits = 2;
  return { prefix: String(r.prefix == null ? '' : r.prefix).trim(), useYear: r.useYear !== false, digits };
}
function _tripFmtNo(rule, year, seq) {
  const parts = [];
  if (rule.prefix) parts.push(rule.prefix);
  if (rule.useYear) parts.push(String(year));
  let s = String(seq); while (s.length < rule.digits) s = '0' + s;
  parts.push(s);
  return parts.join('-');
}
function _tripCounterKey(dept, rule, year) { return '출장번호_' + (dept || '(기본)') + (rule.useYear ? '_' + year : ''); }
function _tripPeekNo(dept) {            // 다음에 발급될 번호 (미리보기, 번호를 쓰지는 않음)
  const rule = _tripRule(dept), year = _today().slice(0, 4);
  const n = Number(_cfgRaw(_tripCounterKey(dept, rule, year)) || 0) + 1;
  return _tripFmtNo(rule, year, n);
}
function _tripPeekSeq(dept) { const rule = _tripRule(dept); return Number(_cfgRaw(_tripCounterKey(dept, rule, _today().slice(0, 4))) || 0) + 1; }
function _tripIssueNo(dept) {           // 번호 발급 (동시에 두 명이 눌러도 겹치지 않게 잠금)
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const rule = _tripRule(dept), year = _today().slice(0, 4);
    const key = _tripCounterKey(dept, rule, year);
    const used = {};
    _values(TREQ_SHEET).forEach(r => { if (String(r[3] || '').trim() === String(dept || '').trim()) used[String(r[2]).trim()] = 1; });   // 같은 부서 안에서만 겹치지 않게 (부서마다 따로 센다)
    let n = Number(_cfgRaw(key) || 0) + 1, no = _tripFmtNo(rule, year, n), guard = 0;
    while (used[no] && guard++ < 1000) { n++; no = _tripFmtNo(rule, year, n); }
    _cfgSetRaw(key, n);
    return { no, key, seq: n };
  } finally { lock.releaseLock(); }
}
function _tripGiveBackNo(key, seq) {    // 가장 마지막 번호의 신청이 지워지면 번호를 되돌려 빈 번호가 안 생기게
  try {
    if (!key || !seq) return;
    const lock = LockService.getScriptLock(); lock.waitLock(20000);
    try { if (Number(_cfgRaw(key) || 0) === Number(seq)) _cfgSetRaw(key, Number(seq) - 1); } finally { lock.releaseLock(); }
  } catch(e) {}
}
function _tripDays(s, e) {
  if (!s) return 0;
  const a = new Date(s + 'T00:00:00'), b = new Date((e || s) + 'T00:00:00');
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  return Math.round((b - a) / 86400000) + 1;
}
function _tripList(filterNames) {
  try {
    const sup = _supervisorMap(), reps = _tripReportMap();
    return _values(TREQ_SHEET)
      .map((r, i) => ({ r, row: i + 2 }))
      .filter(x => String(x.r[1]).trim() && (!filterNames || filterNames.includes(String(x.r[1]).trim())))
      .map(({ r, row }) => {
        const name = String(r[1]).trim(), start = _fmtD(r[8]), end = _fmtD(r[9]) || _fmtD(r[8]);
        return {
          row, date: _fmtD(r[0]), name, docNo: String(r[2] || ''), dept: String(r[3] || ''), position: String(r[4] || ''), contact: String(r[5] || ''),
          passengers: String(r[6] || '').split(',').map(s => s.trim()).filter(Boolean),
          purpose: String(r[7] || ''), start, end, days: _tripDays(start, end), to: String(r[10] || ''), transport: String(r[11] || ''),
          deputy: String(r[12] || ''), payment: String(r[13] || ''), note: String(r[14] || ''),
          status: '확정', processed: _fmtD(r[16]), id: String(r[17] || ''), approver: String(r[18] || ''),   // 옛 '대기'·'선임승인'은 모두 확정으로 보여 줌
          rejectReason: String(r[19] || ''), report: String(r[20] || ''), supervisor: sup[name] || '',
          rep: reps[String(r[17] || '')] || null,
        };
      }).reverse();
  } catch(e) { return []; }
}
function _tripClean(p) {
  const s = k => String(p[k] == null ? '' : p[k]).trim();
  const f = { purpose: s('purpose'), start: s('start'), end: s('end') || s('start'), to: s('to'), transport: s('transport'), deputy: s('deputy'),
              payment: s('payment'), note: s('note'), contact: s('contact') };
  f.passengers = (Array.isArray(p.passengers) ? p.passengers : String(p.passengers || '').split(',')).map(x => String(x).trim()).filter(Boolean);
  if (!f.purpose) f.err = '출장 목적을 입력하세요.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(f.start) || !/^\d{4}-\d{2}-\d{2}$/.test(f.end)) f.err = '출장 기간(시작일·종료일)을 입력하세요.';
  else if (f.end < f.start) f.err = '종료일이 시작일보다 빠릅니다.';
  else if (!f.to) f.err = '출장지를 입력하세요.';
  else if (_tripDays(f.start, f.end) > 31) f.err = '출장 기간이 31일을 넘습니다. 나누어 신청하세요.';
  return f;
}
function getTripFormConfig() {
  return { ok: true, payOptions: _tripPayOptions(), orgName: getConfig().ORG_NAME };
}
function submitTripRequest(p) {
  try {
    const me = _authStaff(p.auth); if (!me) return { ok: false, msg: TRIP_LOGIN_MSG };
    const f = _tripClean(p); if (f.err) return { ok: false, msg: f.err };
    const st = _staffRows().filter(r => String(r[0]).trim() === me.name)[0];
    const dept = String(st[3] || '').trim(), position = String(st[4] || '').trim();
    const contact = f.contact || String(st[5] || '').trim();
    const sup = String(st[7] || '').trim();
    const status = '확정';                            // 승인 단계 없음: 신청 즉시 확정, 출력해서 결재 (전자결재를 붙일 때 여기를 바꾸면 됨)
    const sh = _treqSheet();
    const editRow = Number(p.row) || 0;
    const mine = _tripList([me.name]).filter(x => x.row !== editRow);
    const dup = mine.filter(x => !(f.end < x.start || f.start > x.end))[0];
    if (dup) return { ok: false, msg: dup.start + '~' + dup.end + ' 출장(' + dup.docNo + ')과 기간이 겹칩니다.' };
    const today = _today();
    if (editRow) {                                        // 수정: 복명서를 쓰기 전까지 본인이 고칠 수 있음
      const old = sh.getRange(editRow, 1, 1, TREQ_HEAD.length).getValues()[0];
      if (String(old[1]).trim() !== me.name) return { ok: false, msg: '본인의 신청만 고칠 수 있습니다.' };
      if (String(old[20] || '').trim() || _tripReportMap()[String(old[17] || '')]) return { ok: false, msg: '복명서를 이미 제출한 출장은 고칠 수 없습니다. 관리자에게 문의하세요.' };
      const row = old.slice();
      row[4] = position; row[5] = contact; row[6] = f.passengers.join(', '); row[7] = f.purpose; row[8] = f.start; row[9] = f.end; row[10] = f.to;
      row[11] = f.transport; row[12] = f.deputy; row[13] = f.payment; row[14] = f.note; row[15] = status; row[16] = today; row[18] = ''; row[19] = '';
      _putRow(sh, editRow, row);
      if (sup) _notifySupervisor(me.name, '출장 신청 수정 (참고)', f.start + '~' + f.end + ' · ' + f.to + ' · ' + f.purpose);
      return { ok: true, row: editRow, docNo: String(old[2] || ''), item: _tripList([me.name]).filter(x => x.row === editRow)[0] || null };
    }
    const no = _tripIssueNo(dept);
    const id = 'T' + new Date().getTime() + Math.floor(Math.random() * 1000);
    const row = [today, me.name, no.no, dept, position, contact, f.passengers.join(', '), f.purpose, f.start, f.end, f.to, f.transport, f.deputy, f.payment, f.note,
                 status, today, id, '', '', '', no.key, no.seq];
    const at = sh.getLastRow() + 1;
    _putRow(sh, at, row);
    if (sup) _notifySupervisor(me.name, '출장 신청 (참고)', f.start + '~' + f.end + ' · ' + f.to + ' · ' + f.purpose);
    return { ok: true, row: at, docNo: no.no, id, item: _tripList([me.name]).filter(x => x.row === at)[0] || null };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function getMyTripRequests(auth) {
  const me = _authStaff(auth); if (!me) return [];
  return _tripList([me.name]);
}
function getSupervisorTripRequests(auth) {
  const me = _authStaff(auth); if (!me) return [];
  return _tripList(_mySubordinates(me.name));
}
function getAdminTripRequests(p) {
  const list = _tripList(null);
  const y = p && p.year ? String(p.year) : '';
  return y ? list.filter(x => x.start.slice(0, 4) === y || x.end.slice(0, 4) === y) : list;
}
function deleteTripRequest(p) {                      // 직원 본인: 복명서 제출 전까지 취소
  try {
    const me = _authStaff(p.auth); if (!me) return { ok: false, msg: TRIP_LOGIN_MSG };
    const sh = _treqSheet(), row = Number(p.row);
    if (!(row >= 2) || row > sh.getLastRow()) return { ok: false, msg: '신청 행을 찾을 수 없습니다.' };
    const r = sh.getRange(row, 1, 1, TREQ_HEAD.length).getValues()[0];
    if (String(r[1]).trim() !== me.name) return { ok: false, msg: '본인의 신청만 취소할 수 있습니다.' };
    if (String(r[20] || '').trim() || _tripReportMap()[String(r[17] || '')]) return { ok: false, msg: '복명서를 이미 제출한 출장은 취소할 수 없습니다. 관리자에게 문의하세요.' };
    sh.deleteRow(row);
    _tripGiveBackNo(String(r[21] || ''), r[22]);
    _tripDropReport(String(r[17] || ''));
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function adminDeleteTripRequest(p) {                 // 관리자: 상태와 관계없이 삭제
  try {
    const sh = _treqSheet(), row = Number(p.row);
    if (!(row >= 2) || row > sh.getLastRow()) return { ok: false, msg: '신청 행을 찾을 수 없습니다.' };
    const r = sh.getRange(row, 1, 1, TREQ_HEAD.length).getValues()[0];
    sh.deleteRow(row);
    _tripGiveBackNo(String(r[21] || ''), r[22]);
    _tripDropReport(String(r[17] || ''));
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}
// ── 관리자: 부서별 문서번호 규칙 · 지급출처 목록 ──
function getTripAdminConfig() {
  const depts = {};
  _staffRows().forEach(r => { const d = String(r[3] || '').trim(); if (d) depts[d] = 1; });
  try { _values(SHEETS.APPROVAL).forEach(r => { const d = String(r[0] || '').trim(); if (d && d !== '기본') depts[d] = 1; }); } catch(e) {}
  const rules = (_tripCfg().docRules) || {};
  const one = d => { const rule = _tripRule(d); return { dept: d, prefix: rule.prefix, useYear: rule.useYear, digits: rule.digits, own: !!rules[d], next: _tripPeekNo(d), nextSeq: _tripPeekSeq(d) }; };
  return { ok: true, def: Object.assign(one('*'), { dept: '*' }), depts: Object.keys(depts).sort().map(one), payOptions: _tripPayOptions() };
}
function saveTripAdminConfig(p) {
  try {
    const c = _tripCfg(), rules = {};
    const clean = r => ({ prefix: String(r.prefix == null ? '' : r.prefix).trim().slice(0, 30), useYear: r.useYear !== false && r.useYear !== 'false',
                          digits: Math.min(6, Math.max(1, Number(r.digits) || 2)) });
    if (p.def) rules['*'] = clean(p.def);
    (p.depts || []).forEach(x => { if (x && x.dept && x.own) rules[String(x.dept).trim()] = clean(x); });
    c.docRules = rules;
    if (Array.isArray(p.payOptions)) c.payOptions = p.payOptions.map(s => String(s).trim()).filter(Boolean).slice(0, 12);
    _cfgSetRaw('출장설정', JSON.stringify(c));
    // '다음 번호' 직접 지정 (예전 번호를 이어서 쓰고 싶을 때): 올해 번호만 맞춤
    const year = _today().slice(0, 4);
    (p.depts || []).forEach(x => {
      const n = Number(x && x.nextSeq);
      if (x && x.dept && n >= 1) { const rule = _tripRule(String(x.dept).trim()); _cfgSetRaw(_tripCounterKey(String(x.dept).trim(), rule, year), n - 1); }
    });
    return { ok: true };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ── 출장 복명서 (신청 1건에 복명서 1건) ──────────────────────
// 신청서가 있으면 쓸 수 있음. 복명서도 시스템 승인 없이 인쇄해서 결재.
const TREP_SHEET = '출장복명서';
const TREP_HEAD = ['요청ID','문서번호','성명','제출일','출장결과','편도요금','여비내역','교통비','식비','일비','숙박비','합계','수정일시'];
function _trepSheet() { return _ensureSheet(TREP_SHEET, TREP_HEAD, [1,2,4,6,13]); }
function _tripReportMap() {
  const m = {};
  _values(TREP_SHEET).forEach(r => {
    const id = String(r[0] || '').trim(); if (!id) return;
    let rows = []; try { rows = JSON.parse(String(r[6] || '[]')); } catch(e) {}
    m[id] = { submitDate: _fmtD(r[3]), result: String(r[4] || ''), fare: String(r[5] || ''), rows: Array.isArray(rows) ? rows : [],
              tTransport: Number(r[7]) || 0, tMeal: Number(r[8]) || 0, tDaily: Number(r[9]) || 0, tLodging: Number(r[10]) || 0, total: Number(r[11]) || 0, updated: String(r[12] || '') };
  });
  return m;
}
function _tripDropReport(id) {
  try {
    if (!id) return;
    const rows = _values(TREP_SHEET), sh = _trepSheet();
    for (let i = rows.length - 1; i >= 0; i--) if (String(rows[i][0]).trim() === id) sh.deleteRow(i + 2);
  } catch(e) {}
}
function _tripMoney(v) { const n = Math.round(Number(String(v == null ? '' : v).replace(/,/g, ''))); return isFinite(n) && n > 0 ? Math.min(n, 100000000) : 0; }
function saveTripReport(p) {
  try {
    const me = _authStaff(p.auth); if (!me) return { ok: false, msg: TRIP_LOGIN_MSG };
    const id = String(p.id || '').trim();
    const rows = _values(TREQ_SHEET);
    let hit = -1;
    for (let i = 0; i < rows.length; i++) if (String(rows[i][17]).trim() === id && id) { hit = i; break; }
    if (hit < 0) return { ok: false, msg: '출장 신청을 찾을 수 없습니다.' };
    const rq = rows[hit], row = hit + 2;
    if (String(rq[1]).trim() !== me.name) return { ok: false, msg: '본인의 출장만 복명서를 쓸 수 있습니다.' };
    const result = String(p.result || '').trim().slice(0, 5000);
    if (!result) return { ok: false, msg: '출장 결과(보고 내용)를 입력하세요.' };
    const fare = String(p.fare || '').trim().slice(0, 100);
    const list = (Array.isArray(p.rows) ? p.rows : []).slice(0, 20).map(r => ({
      person: String(r.person || '').trim().slice(0, 30), transport: String(r.transport || '').trim().slice(0, 20),
      transportAmt: _tripMoney(r.transportAmt), meal: _tripMoney(r.meal), daily: _tripMoney(r.daily), lodging: _tripMoney(r.lodging), memo: String(r.memo || '').trim().slice(0, 50),
    })).filter(r => r.person || r.transportAmt || r.meal || r.daily || r.lodging || r.memo);
    const sum = k => list.reduce((a, r) => a + r[k], 0);
    const t = sum('transportAmt'), m = sum('meal'), d = sum('daily'), l = sum('lodging');
    const sh = _trepSheet(), all = _values(TREP_SHEET);
    let at = 0, submit = _today();
    for (let i = 0; i < all.length; i++) if (String(all[i][0]).trim() === id) { at = i + 2; submit = _fmtD(all[i][3]) || submit; break; }
    const now = Utilities.formatDate(_now(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
    _putRow(sh, at || sh.getLastRow() + 1, [id, String(rq[2] || ''), me.name, submit, result, fare, JSON.stringify(list), t, m, d, l, t + m + d + l, now]);
    const tq = _treqSheet(); _putRow(tq, row, (function() { const a = tq.getRange(row, 1, 1, TREQ_HEAD.length).getValues()[0]; a[20] = '제출 ' + submit; return a; })());
    return { ok: true, submitDate: submit, total: t + m + d + l, created: !at };
  } catch(e) { return { ok: false, msg: e.message }; }
}

// ── 출장 버튼 ↔ 신청서 연결 ─────────────────────────────────
// '그 날짜를 덮는 신청서가 있으면 연결됨, 없으면 신청 없음'으로 날짜만 보고 판단한다.
function _tripCoverFrom(list, name, date) {
  let best = null;
  list.forEach(x => {
    if (x.name !== name || date < x.start || date > x.end) return;
    const ok = true;                     // 승인 단계가 없으므로 신청서가 있으면 연결됨
    if (!best || (ok && !best.ok)) best = { docNo: x.docNo, status: x.status, ok, to: x.to, purpose: x.purpose, id: x.id };
  });
  return best;
}
function _tripCoverFor(name, date) { return _tripCoverFrom(_tripList([name]), name, date); }
function _tripUnappliedFor(names, days) {          // 최근 days일 동안 신청서 없이 찍은 출장
  const since = _ymdLocal(new Date(_now().getTime() - days * 86400000));
  const treq = _tripList(null), out = [];
  _values(TRIP_SHEET).forEach(r => {
    const t = _tripObj(r), name = t.name;
    if (!name || !names.includes(name) || t.date < since || !/^\d{4}-\d{2}-\d{2}$/.test(t.date)) return;
    if (_tripCoverFrom(treq, name, t.date)) return;
    out.push({ name, date: t.date, time: t.time, place: t.place, addr: t.addr, reason: t.reason });
  });
  return out.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
}
function getTripUnapplied(p) {                      // scope 'me' = 본인, 'sub' = 담당 후임 (선임)
  try {
    const me = _authStaff(p.auth); if (!me) return { ok: false, msg: TRIP_LOGIN_MSG };
    const names = p.scope === 'sub' ? _mySubordinates(me.name) : [me.name];
    return { ok: true, list: _tripUnappliedFor(names, 90) };
  } catch(e) { return { ok: false, msg: e.message }; }
}
function getAdminTripUnapplied() {
  try { return { ok: true, list: _tripUnappliedFor(_staffRows().map(r => String(r[0]).trim()), 90) }; }
  catch(e) { return { ok: false, msg: e.message }; }
}


  // ============================================================
  // ③ 서버 앞단(Edge Function)이 쓰는 연결 부위
  // ============================================================
  function __rowOwner(sheetName, row) {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sh || !(Number(row) >= 2)) return '';
    return String(sh.getRange(Number(row), 2).getValue() || '').trim();
  }
  function __setOrgName(n) {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
    if (!sh) return;
    const data = sh.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) if (String(data[i][0]).trim() === '기관명') { sh.getRange(i + 1, 2).setValue(n); break; }
    _configCache = null;
  }
  return {
    dispatch: _dispatch, initSheets, getConfig, ADMIN_FNS, SHEETS,
    setNow(f) { _now = f; }, resetConfig() { _configCache = null; },
    staffInfoByName: _staffInfoByName, staffNameByEmail: _staffNameByEmail, staffEmails: _staffEmails,
    supervisorOf: name => _supervisorMap()[String(name || '').trim()] || '',
    mySubordinates: me => _mySubordinates(me),
    rowOwner: __rowOwner, setOrgName: __setOrgName, getSpreadsheet: () => SpreadsheetApp.getActiveSpreadsheet(),
  };
}


// ============================================================
// ④ 서버 앞단: 로그인 확인 → 지회·권한 확인 → 근태 코드 실행 → 바뀐 줄만 저장
//    deps = { db, getUser(token), doFetch(need) }  (실제 서버/테스트가 각자 끼워 넣음)
// ============================================================
const BLOCKED_FNS = ['login', 'adminLogin', 'changePin'];                       // 구글 로그인에서는 쓰지 않음
const ADMIN_EXTRA = ['getSlackConfig', 'saveSlackConfig', 'sendSlackTest'];     // 지회 담당만
const ROW_OWNED = { deleteLeaveRow: '휴가신청', deleteOvertimeRow: '시간외신청', deleteCompLeaveRow: '대체휴무사용' };
const EMAIL_RE = /^[^\s@,"'()<>]+@[^\s@,"'()<>]+\.[^\s@,"'()<>]+$/;

function makeHandler(deps) {
  const db = deps.db;
  const J = (obj, status) => ({ status: status || 200, body: JSON.stringify(obj) });
  const trimTrail = a => { let n = a.length; while (n && a[n - 1] === '') n--; return n === a.length ? a : a.slice(0, n); };
  const normText = t => JSON.stringify(Object.keys(t || {}).sort((a, b) => a - b).map(k => [k, t[k]]));

  function buildState(data, fetchCache) {
    const sheets = {};
    Object.keys(data.sheets || {}).forEach(name => {
      const s = data.sheets[name], sh = new KSheet(name);
      sh.text = JSON.parse(JSON.stringify(s.text || {}));
      let max = 0; (s.rows || []).forEach(r => { if (r[0] > max) max = r[0]; });
      sh.d = Array.from({ length: max }, () => []);
      (s.rows || []).forEach(r => { sh.d[r[0] - 1] = (r[1] || []).map(__dec); });
      sheets[name] = sh;
    });
    return { sheets, props: Object.assign({}, data.kv || {}), propsDirty: {}, fetchCache, need: null, needs: [] };
  }
  function diff(data, state) {
    const out = [];
    Object.keys(state.sheets).forEach(name => {
      const sh = state.sheets[name]; sh.trim();
      const enc = sh.d.map(r => JSON.stringify(trimTrail(r.map(__enc))));
      const old = (data.sheets || {})[name];
      const oldMap = {}; let oldMax = 0;
      if (old) (old.rows || []).forEach(r => { oldMap[r[0]] = JSON.stringify(trimTrail(r[1] || [])); if (r[0] > oldMax) oldMax = r[0]; });
      const upserts = [];
      enc.forEach((e, i) => { if (!old || oldMap[i + 1] !== e) upserts.push([i + 1, JSON.parse(e)]); });
      const deleteFrom = oldMax > enc.length ? enc.length : null;
      const textChanged = normText(sh.text) !== normText(old ? old.text : {});
      if (!old || upserts.length || deleteFrom !== null || textChanged)
        out.push({ sheet: name, base_version: old ? old.version : 0, text: textChanged || !old ? sh.text : null, upserts, delete_from: deleteFrom });
    });
    return out;
  }

  // callback(core) → 결과. hooks.before(결과) → 응답(저장 막기) 또는 null, hooks.after(결과)
  async function runCore(chapterId, chapterName, callback, hooks) {
    hooks = hooks || {};
    const fetchCache = {}, reqNow = deps.now ? deps.now() : Date.now();
    let conflicts = 0, rounds = 0;
    for (;;) {
      if (++rounds > 20) return { resp: J({ ok: false, msg: '처리가 너무 길어져 중단했습니다. 다시 시도하세요.' }) };
      const data = await db.load(chapterId);
      const state = buildState(data, fetchCache);
      const core = createCore(makeEnv(state, { edge: true }));
      core.setNow(() => new KDate(reqNow));
      let res, thrown = null;
      try {
        if (!state.sheets['직원목록']) { core.initSheets(); core.setOrgName(chapterName); }
        res = callback(core);
      } catch (e) { thrown = e; }
      if (state.needs.length) {                                     // 슬랙·카카오 호출이 필요 → 대신 호출해 두고 처음부터 다시
        const seen = {};
        await Promise.all(state.needs.filter(n => !fetchCache[n.key] && !seen[n.key] && (seen[n.key] = 1)).map(async n => {
          try { const r = await deps.doFetch(n); fetchCache[n.key] = { code: r.status, text: await r.text() }; }
          catch (e) { fetchCache[n.key] = { code: 599, text: '' }; }
        }));
        continue;
      }
      if (thrown) return { resp: J({ ok: false, msg: String(thrown.message || thrown) }) };
      if (hooks.before) { const veto = await hooks.before(res, core); if (veto) return { resp: veto }; }
      const changes = diff(data, state);
      if (changes.length || Object.keys(state.propsDirty).length) {
        const r = await db.commit(chapterId, changes, state.propsDirty);
        if (r && r.conflict) { if (++conflicts > 6) return { resp: J({ ok: false, msg: '동시에 저장하는 사람이 많아 처리하지 못했습니다. 잠시 후 다시 시도하세요.' }) }; continue; }
      }
      if (hooks.after) await hooks.after(res, core);
      return { res };
    }
  }

  async function handle(req) {
    let body;
    try { body = JSON.parse(req.body || '{}'); } catch (e) { return J({ ok: false, msg: '요청 형식이 올바르지 않습니다.' }, 400); }
    const fn = String(body.fn || ''), arg = body.arg === undefined ? null : body.arg;
    let user = null;
    try { user = await deps.getUser(req.token); } catch (e) { user = null; }
    if (!user || !user.email) return J({ ok: false, code: 'auth', msg: '로그인이 필요합니다. 구글 계정으로 다시 로그인하세요.' }, 401);
    const email = String(user.email).trim().toLowerCase();
    const member = await db.member(email);
    if (!member) return J({ ok: false, code: 'no_member', email, msg: email + ' 계정은 등록되어 있지 않습니다. 지회 담당자에게 구글 계정 등록을 요청하세요.' });
    const chapterId = member.chapter_id, chapterName = member.chapter_name || chapterId;

    // ── 도협회 전용: 지회 목록·지회 담당자 지정 ──
    if (fn === 'provinceChapters' || fn === 'provinceAddChapter' || fn === 'provinceSetAdmin') {
      if (!member.is_province) return J({ ok: false, denied: true, msg: '도협회 담당자만 사용할 수 있습니다.' });
      let p = {}; try { p = arg ? JSON.parse(arg) : {}; } catch (e) {}
      if (fn === 'provinceChapters') return J({ ok: true, list: await db.chapters() });
      if (fn === 'provinceAddChapter') {
        const id = String(p.id || '').trim().toLowerCase(), name = String(p.name || '').trim();
        if (!/^[a-z0-9_-]{2,30}$/.test(id)) return J({ ok: false, msg: '지회 코드는 영문 소문자·숫자·-·_ 2~30자로 입력하세요. 예) chuncheon' });
        if (!name) return J({ ok: false, msg: '지회 이름을 입력하세요.' });
        return J(await db.addChapter(id, name));
      }
      const em = String(p.email || '').trim().toLowerCase();
      if (em && !EMAIL_RE.test(em)) return J({ ok: false, msg: '이메일 형식이 올바르지 않습니다.' });
      return J(await db.setAdmin(String(p.chapterId || ''), em));
    }

    // ── 사진: 저장소에 올리고 주소 돌려줌 ──
    if (fn === 'saveOtPicture') {
      try {
        const p = JSON.parse(arg), m = String(p.base64 || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
        if (!m) return J({ ok: false, msg: '이미지 형식이 올바르지 않습니다.' });
        const bin = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
        if (bin.length > 8 * 1024 * 1024) return J({ ok: false, msg: '사진이 너무 큽니다(8MB 이하).' });
        const url = await db.uploadPhoto(chapterId, bin, m[1]);
        return J({ ok: true, fileId: url, viewUrl: url, imgUrl: url });
      } catch (e) { return J({ ok: false, msg: '사진 저장 실패: ' + (e.message || e) }); }
    }
    if (BLOCKED_FNS.indexOf(fn) >= 0) return J({ ok: false, msg: '구글 로그인을 쓰는 서버에서는 지원하지 않는 기능입니다.' });

    const isAdmin = !!member.is_admin;
    let emailsAfterSave = null;
    const hooks = {
      before: async (res) => {
        if (fn !== 'saveStaff' || !emailsAfterSave || !(res && res.ok)) return null;
        const bad = await db.emailConflicts(chapterId, emailsAfterSave);
        return bad.length ? J({ ok: false, msg: '이미 다른 지회에 등록된 구글 계정입니다: ' + bad.join(', ') }) : null;
      },
      after: async (res) => { if (fn === 'saveStaff' && emailsAfterSave && res && res.ok) await db.syncMembers(chapterId, emailsAfterSave); },
    };
    const cb = core => {
      const staffName = core.staffNameByEmail(email);
      if (fn === 'whoami') {
        return { ok: true, email, chapterId, chapterName, isAdmin, isProvince: !!member.is_province, staffName,
          staff: staffName ? core.staffInfoByName(staffName) : null, orgName: core.getConfig().ORG_NAME };
      }
      const adminOnly = ADMIN_EXTRA.indexOf(fn) >= 0 || core.ADMIN_FNS.indexOf(fn) >= 0;
      if (adminOnly) {
        if (!isAdmin) return { ok: false, denied: true, msg: '지회 담당자(관리자)만 사용할 수 있습니다.' };
        const out = core.dispatch(fn, arg);
        if (fn === 'saveStaff') emailsAfterSave = core.staffEmails();
        return out;
      }
      if (!staffName && !isAdmin) return { ok: false, code: 'no_staff', msg: '직원목록에서 이 구글 계정을 찾을 수 없습니다. 지회 담당자에게 문의하세요.' };
      let a = arg;
      if (staffName) {
        let p; try { p = arg == null ? null : JSON.parse(arg); } catch (e) { p = undefined; }
        if (p && typeof p === 'object' && !Array.isArray(p)) {
          p.auth = { name: staffName, __trusted: true };      // 본인 이름은 서버가 정함 (화면에서 보낸 이름은 무시)
          if ('name' in p) p.name = staffName;
          if ('requester' in p) p.requester = staffName;
          a = JSON.stringify(p);
        }
      }
      if (ROW_OWNED[fn] && !isAdmin) {
        let p = {}; try { p = JSON.parse(arg); } catch (e) {}
        if (core.rowOwner(ROW_OWNED[fn], p.row) !== staffName) return { ok: false, denied: true, msg: '본인의 신청만 삭제할 수 있습니다.' };
      }
      return core.dispatch(fn, a);
    };
    const r = await runCore(chapterId, chapterName, cb, hooks);
    if (r.resp) return r.resp;
    return typeof r.res === 'string' ? { status: 200, body: r.res } : J(r.res);
  }
  return { handle, runCore };
}

// ============================================================
// ⑤ Supabase 연결 (Edge Function 시작점)
// ============================================================
const __sb = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
const __ALLOWED_DOMAINS = String(Deno.env.get('ALLOWED_EMAIL_DOMAINS') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const __must = r => { if (r.error) throw new Error(r.error.message); return r.data; };

const __db = {
  async member(email) {
    const m = __must(await __sb.from('att_members').select('email,chapter_id,is_admin,is_province').eq('email', email).maybeSingle());
    if (!m) return null;
    const c = __must(await __sb.from('att_chapters').select('name').eq('id', m.chapter_id).maybeSingle());
    return Object.assign({}, m, { chapter_name: c ? c.name : m.chapter_id });
  },
  async load(chapter) { return __must(await __sb.rpc('att_load', { p_chapter: chapter })); },
  async commit(chapter, changes, kv) {
    const r = await __sb.rpc('att_commit', { p_chapter: chapter, p_changes: changes, p_kv: kv });
    if (r.error) { if (String(r.error.message).indexOf('att_conflict') >= 0) return { conflict: true }; throw new Error(r.error.message); }
    return { ok: true };
  },
  async chapters() {
    const cs = __must(await __sb.from('att_chapters').select('id,name').order('id'));
    const ms = __must(await __sb.from('att_members').select('email,chapter_id,is_admin,is_lead'));
    return cs.map(c => ({ id: c.id, name: c.name, admin: (ms.filter(m => m.chapter_id === c.id && m.is_lead)[0] || {}).email || '', members: ms.filter(m => m.chapter_id === c.id).length }));
  },
  // 지회 추가·지회 담당자 지정은 통합 권한 관리 화면(access.html)에서 합니다.
  async addChapter() { return { ok: false, msg: '지회 추가는 통합 권한 관리 화면(access.html)에서 합니다.' }; },
  async setAdmin() { return { ok: false, msg: '지회 담당자 지정은 통합 권한 관리 화면(access.html)에서 합니다.' }; },
  async emailConflicts(chapter, emails) {
    if (!emails.length) return [];
    const rows = __must(await __sb.from('att_members').select('email,chapter_id').in('email', emails));
    return rows.filter(r => r.chapter_id !== chapter).map(r => r.email);
  },
  async syncMembers(chapter, emails) {
    // 직원목록에 새로 적은 구글 계정을 통합 직원 명단에 '일반 직원'으로 추가합니다. (빼기·중지는 access.html 에서)
    if (emails.length) __must(await __sb.rpc('att_sync_members', { p_chapter: chapter, p_emails: emails }));
  },
  async uploadPhoto(chapter, bytes, contentType) {
    const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' })[contentType] || 'img';
    const path = chapter + '/' + crypto.randomUUID() + '.' + ext;
    __must(await __sb.storage.from('att-photos').upload(path, bytes, { contentType }));
    return __sb.storage.from('att-photos').getPublicUrl(path).data.publicUrl;
  },
};
const __handler = makeHandler({
  db: __db,
  // 구글로 로그인한 사람만 인정 (이메일 가입 등으로 남의 주소를 사칭하는 것을 막음)
  async getUser(token) {
    if (!token) return null;
    const r = await __sb.auth.getUser(token);
    const u = r && r.data && r.data.user; if (!u) return null;
    const g = (u.identities || []).filter(i => i.provider === 'google')[0];
    const em = g && g.identity_data && g.identity_data.email;
    if (!em || (g.identity_data.email_verified === false)) return null;
    const lower = String(em).toLowerCase();
    if (__ALLOWED_DOMAINS.length && __ALLOWED_DOMAINS.indexOf(lower.split('@')[1]) < 0) return null;
    return { email: lower };
  },
  doFetch: n => fetch(n.url, { method: n.method, headers: Object.assign({}, n.headers, n.contentType ? { 'Content-Type': n.contentType } : {}), body: n.method === 'get' ? undefined : n.payload }),
});
const __CORS = { 'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'text/plain; charset=utf-8' };
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: __CORS });
  try {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const r = await __handler.handle({ token, body: await req.text() });
    return new Response(r.body, { status: r.status, headers: __CORS });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, msg: '서버 오류: ' + (e && e.message || e) }), { status: 500, headers: __CORS });
  }
});
