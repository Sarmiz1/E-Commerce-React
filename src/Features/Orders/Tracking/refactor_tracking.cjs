const fs = require('fs');
const path = require('path');

const dir = __dirname;
const pagePath = path.join(dir, 'TrackingPage.jsx');
let content = fs.readFileSync(pagePath, 'utf-8');

const compDir = path.join(dir, 'Components');
const utilsDir = path.join(dir, 'Utils');
if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true });

function extract(startMarker, endMarker) {
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return '';
  const endIdx = endMarker ? content.indexOf(endMarker, startIdx + startMarker.length) : content.length;
  if (endIdx === -1) return content.substring(startIdx);
  return content.substring(startIdx, endIdx);
}

// Extract sections
const header = content.substring(0, content.indexOf('const FONTS_AND_KEYFRAMES'));
const fontsStr = extract('const FONTS_AND_KEYFRAMES', '// ─── Status config');
const statusCfgStr = extract('const STATUS_CFG', '// ─── SVG Icons');
const iconsStr = extract('const Ic', '// ─── Live Ticker');
const tickerStr = extract('function Ticker', '// ─── Signal / Status Orb');
const orbStr = extract('function StatusOrb', '// ─── Flight Timeline');
const timelineStr = extract('function FlightTimeline', '// ─── Key Stat Block');
const statBlockStr = extract('function StatBlock', '// ─── Copy Badge');
const copyBadgeStr = extract('function CopyBadge', '// ─── Live Clock');
const liveClockStr = extract('function LiveClock', '// ─── Auto-Poll Hook');
const hookStr = extract('function useAutoPoll', '// ─── Status Sidebar Panel');
const panelStr = extract('function StatusPanel', '// ─── Item List');
const itemListStr = extract('function ItemList', '// ─── Support Form');
const supportStr = extract('function SupportForm', '// ─── Scanning State');
const scanningStr = extract('function ScanningState', '// ─── Not Found');
const notFoundStr = extract('function NotFound', '// ─── How It Works');
const howItWorksStr = extract('function HowItWorks', '// ═══════════════════════════════════════════════════════════════════════════════');
const mainPageStr = extract('export default function TrackingPage()', null);

// Write files
fs.writeFileSync(path.join(utilsDir, 'trackingUtils.js'), `
export ${statusCfgStr.trim()}
export ${hookStr.replace('function useAutoPoll', 'useAutoPoll').replace('function', 'export function')}
`.replace(/function statusColor/g, 'export function statusColor')
 .replace(/function statusPct/g, 'export function statusPct')
 .replace(/function computeETA/g, 'export function computeETA')
 .replace(/function timeAgo/g, 'export function timeAgo')
);

fs.writeFileSync(path.join(compDir, 'TrackingStyles.jsx'), `
export ${fontsStr.trim()}
`);

fs.writeFileSync(path.join(compDir, 'TrackingIcons.jsx'), `
import React from 'react';
export ${iconsStr.trim().replace(/function Spinner/g, 'export function Spinner')}
`);

fs.writeFileSync(path.join(compDir, 'TrackingAtoms.jsx'), `
import React, { useState, useEffect, useCallback } from 'react';
import { Ic } from './TrackingIcons';
import { timeAgo, statusColor } from '../Utils/trackingUtils';

export ${statBlockStr.trim()}
export ${copyBadgeStr.trim()}
export ${liveClockStr.trim()}
export ${orbStr.trim()}
`);

fs.writeFileSync(path.join(compDir, 'TrackingMolecules.jsx'), `
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatMoneyCents } from "../../../../Utils/formatMoneyCents";
import { Ic, Spinner } from './TrackingIcons';
import { computeETA, statusColor, statusPct, MILESTONES, MILESTONE_IDX } from '../Utils/trackingUtils';
import { StatusOrb } from './TrackingAtoms';

export ${tickerStr.trim()}
export ${timelineStr.trim()}
export ${itemListStr.trim()}
export ${supportStr.trim()}
export ${scanningStr.trim()}
export ${notFoundStr.trim()}
export ${howItWorksStr.trim()}
`);

fs.writeFileSync(path.join(compDir, 'StatusPanel.jsx'), `
import React from 'react';
import { Ic } from './TrackingIcons';
import { computeETA, statusColor, statusPct, STATUS_CFG } from '../Utils/trackingUtils';
import { StatusOrb, StatBlock, LiveClock } from './TrackingAtoms';
import { formatMoneyCents } from "../../../../Utils/formatMoneyCents";

export ${panelStr.trim()}
`);

fs.writeFileSync(pagePath, `
${header.trim()}
import { FONTS_AND_KEYFRAMES } from './Components/TrackingStyles';
import { useAutoPoll } from './Utils/trackingUtils';
import { Ic, Spinner } from './Components/TrackingIcons';
import { CopyBadge } from './Components/TrackingAtoms';
import { Ticker, FlightTimeline, ItemList, SupportForm, ScanningState, NotFound, HowItWorks } from './Components/TrackingMolecules';
import { StatusPanel } from './Components/StatusPanel';

${mainPageStr.trim()}
`);

console.log("Refactoring complete");
