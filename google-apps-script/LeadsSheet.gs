/**
 * Nova Covenant — Leads sheet receiver (Google Apps Script)
 *
 * Install: open your Google Sheet → Extensions → Apps Script → replace everything
 * with this file → set SECRET below → Deploy → New deployment → Web app
 * (Execute as: Me, Who has access: Anyone) → copy the Web app URL.
 * Full steps: README section "Google Sheets lead tracking".
 *
 * Each new enquiry from the website is appended to the "Leads" tab:
 *   • a day header ("Thursday, 5 November 2026") starts each new day,
 *     with 3 empty rows separating it from the previous day
 *   • every row is stamped with the date and time (India time)
 *   • Status is a dropdown (Pending / Approved), Pending by default, colour-coded
 * The tab, headers and formatting are created automatically on the first lead.
 */

/** Must match GOOGLE_SHEETS_WEBHOOK_SECRET in Vercel. */
const SECRET = 'PASTE_SECRET_HERE';

const SHEET_NAME = 'Leads';
const TIMEZONE = 'Asia/Kolkata';
const STATUS_OPTIONS = ['Pending', 'Approved'];
const DEFAULT_STATUS = 'Pending';
const GAP_ROWS_BETWEEN_DAYS = 3;

const TITLE_ROW = 1;
const HEADER_ROW = 2;
const HEADERS = ['Date & Time', 'Full Name', 'Company Name', 'Business Email', 'Country', 'Division', 'Requirement', 'Message', 'Status'];
const COLUMN_WIDTHS = [170, 170, 190, 230, 120, 190, 220, 380, 120];
const STATUS_COL = HEADERS.indexOf('Status') + 1;
const NUM_COLS = HEADERS.length;

const NAVY = '#101d2e';
const DAY_BAND = '#e8eefb';
const DAY_TEXT = '#1f4280';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!SECRET || SECRET === 'PASTE_SECRET_HERE' || body.secret !== SECRET) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    const sheet = getOrCreateSheet_();
    const when = body.createdAt ? new Date(body.createdAt) : new Date();
    const dayKey = Utilities.formatDate(when, TIMEZONE, 'yyyy-MM-dd');

    if (lastDayKey_(sheet) !== dayKey) addDayHeader_(sheet, when, dayKey);

    const row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, NUM_COLS).setValues([[
      when,
      clean_(body.fullName),
      clean_(body.companyName),
      clean_(body.businessEmail),
      clean_(body.country),
      clean_(body.division),
      clean_(body.requirement),
      clean_(body.message),
      DEFAULT_STATUS,
    ]]);
    styleLeadRow_(sheet, row);
    if (body.leadId) sheet.getRange(row, 1).setNote('Supabase lead ID: ' + body.leadId);

    return json_({ ok: true, row: row });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Health check: opening the Web app URL in a browser shows {"ok":true}. */
function doGet() {
  return json_({ ok: true, service: 'nova-leads-sheet' });
}

/** Optional: run once from the editor (▶ Run → setupSheet) to create the tab before the first lead. */
function setupSheet() {
  getOrCreateSheet_();
}

// ───────────────────────────── helpers ─────────────────────────────

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME, 0);
  if (sheet.getRange(HEADER_ROW, 1).getValue() !== HEADERS[0]) setupLayout_(sheet);
  return sheet;
}

function setupLayout_(sheet) {
  ss_setTimezone_();

  // Title
  sheet.getRange(TITLE_ROW, 1, 1, NUM_COLS).merge()
    .setValue('Nova Covenant International Trading — Enquiry Leads')
    .setFontSize(14).setFontWeight('bold').setFontColor('#ffffff')
    .setBackground(NAVY).setVerticalAlignment('middle').setHorizontalAlignment('left');
  sheet.setRowHeight(TITLE_ROW, 40);

  // Column headers
  sheet.getRange(HEADER_ROW, 1, 1, NUM_COLS).setValues([HEADERS])
    .setFontWeight('bold').setFontColor(NAVY).setBackground('#dce3ea')
    .setVerticalAlignment('middle').setWrap(true);
  sheet.setRowHeight(HEADER_ROW, 32);
  sheet.setFrozenRows(HEADER_ROW);

  COLUMN_WIDTHS.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });

  // Status colours (applies to the whole column; day headers never contain these words)
  const statusRange = sheet.getRange(HEADER_ROW + 1, STATUS_COL, sheet.getMaxRows() - HEADER_ROW, 1);
  const rules = sheet.getConditionalFormatRules().concat([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Pending')
      .setBackground('#fff4d6').setFontColor('#8a5a00').setRanges([statusRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Approved')
      .setBackground('#dff3e4').setFontColor('#1e6b34').setRanges([statusRange]).build(),
  ]);
  sheet.setConditionalFormatRules(rules);

  // Remove the default empty columns to the right for a cleaner look
  const extra = sheet.getMaxColumns() - NUM_COLS;
  if (extra > 0) sheet.deleteColumns(NUM_COLS + 1, extra);
}

function ss_setTimezone_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSpreadsheetTimeZone() !== TIMEZONE) ss.setSpreadsheetTimeZone(TIMEZONE);
}

/** Finds the most recent day header (marked with a hidden note "day:YYYY-MM-DD"). */
function lastDayKey_(sheet) {
  const last = sheet.getLastRow();
  if (last <= HEADER_ROW) return null;
  const notes = sheet.getRange(HEADER_ROW + 1, 1, last - HEADER_ROW, 1).getNotes();
  for (let i = notes.length - 1; i >= 0; i--) {
    const n = notes[i][0];
    if (n && n.indexOf('day:') === 0) return n.slice(4);
  }
  return null;
}

function addDayHeader_(sheet, when, dayKey) {
  const last = sheet.getLastRow();
  const row = last <= HEADER_ROW ? HEADER_ROW + 1 : last + 1 + GAP_ROWS_BETWEEN_DAYS;
  if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), row - sheet.getMaxRows() + 10);

  const label = Utilities.formatDate(when, TIMEZONE, 'EEEE, d MMMM yyyy');
  sheet.getRange(row, 1, 1, NUM_COLS).merge()
    .setValue('📅  ' + label)
    .setFontWeight('bold').setFontSize(11).setFontColor(DAY_TEXT)
    .setBackground(DAY_BAND).setVerticalAlignment('middle')
    .setBorder(true, null, true, null, null, null, '#b9c7e6', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange(row, 1).setNote('day:' + dayKey);
  sheet.setRowHeight(row, 30);
}

function styleLeadRow_(sheet, row) {
  sheet.getRange(row, 1).setNumberFormat('dd mmm yyyy, h:mm am/pm');
  sheet.getRange(row, 1, 1, NUM_COLS)
    .setVerticalAlignment('top').setWrap(true).setFontColor('#354152')
    .setBorder(null, null, true, null, null, null, '#e6ebf1', SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange(row, STATUS_COL).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUS_OPTIONS, true).setAllowInvalid(false).build()
  ).setHorizontalAlignment('center').setFontWeight('bold');
}

/**
 * Plain text only. Values starting with = + - @ are prefixed with ' so a visitor
 * can't inject a spreadsheet formula through the website form.
 */
function clean_(value) {
  const s = String(value == null ? '' : value).slice(0, 4000);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
