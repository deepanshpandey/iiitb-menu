/**
 * get_menu.js
 *
 * Download an Excel (.xlsx) export of a public / link-shared Google Sheet.
 * No login or Playwright browser automation required.
 *
 * Uses environment variables (load from .env if present):
 *   GSHEET_URL        required (share/view link)
 *   GSHEET_GID        optional sheet/tab id (export that tab only)
 *   OUT_DIR           default ./data
 *   OUT_FILENAME      default IIITB-Menu.xlsx
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ------------------------------------------------------------------
// Config
// ------------------------------------------------------------------
const GSHEET_URL = process.env.GSHEET_URL;
const GSHEET_GID = process.env.GSHEET_GID;                  // optional
const OUT_DIR = process.env.OUT_DIR || './data';
const OUT_FILENAME = process.env.OUT_FILENAME || 'IIITB-Menu.xlsx';

if (!GSHEET_URL) {
  console.error('GSHEET_URL is required (share link to the Google Sheet).');
  process.exit(1);
}

// Extract spreadsheet ID from a docs.google.com/spreadsheets URL
function extractSheetId(url) {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : null;
}

const SHEET_ID = extractSheetId(GSHEET_URL);
if (!SHEET_ID) {
  console.error('Could not parse spreadsheet ID from GSHEET_URL:', GSHEET_URL);
  process.exit(1);
}

// Build export URL
// Whole workbook:  https://docs.google.com/spreadsheets/d/<ID>/export?format=xlsx
// Single tab:      .../export?format=xlsx&gid=<gid>
let exportUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;
if (GSHEET_GID) {
  exportUrl += `&gid=${encodeURIComponent(GSHEET_GID)}`;
}

async function downloadGSheetXlsx() {
  console.log('[get_menu] Export URL:', exportUrl);

  // Node 18+ has global fetch
  const resp = await fetch(exportUrl, {
    // Force download even if Google adds caching headers
    method: 'GET'
  });

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} ${resp.statusText} fetching Google Sheet export`);
  }

  // Buffer the body
  const arrayBuf = await resp.arrayBuffer();
  const buf = Buffer.from(arrayBuf);

  // Write
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, OUT_FILENAME);
  fs.writeFileSync(outPath, buf);
  console.log('[get_menu] Saved Excel file ->', outPath);
}

downloadGSheetXlsx()
  .catch(err => {
    console.error('[get_menu] Download failed:', err);
    process.exit(1);
  });
