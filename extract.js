const fs = require('fs');
const path = require('path');

const filePath = './src/Features/Home/HomePage/HomePage.jsx';
const componentsDir = './src/Features/Home/HomePage/Components/Sections';
if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });

const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

let components = {};
let currentComp = null;
let compLines = [];
let braceCount = 0;
let inComp = false;

for (let line of lines) {
    if (!inComp) {
        let match = line.match(/^function\s+([A-Z]\w+)\s*\(/);
        if (match && match[1] !== 'HomePage') {
            currentComp = match[1];
            inComp = true;
            braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
            compLines = [line];
            if (braceCount === 0 && line.includes('}')) {
                components[currentComp] = compLines.join('\n');
                inComp = false;
            }
        }
    } else {
        compLines.push(line);
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (braceCount === 0) {
            components[currentComp] = compLines.join('\n');
            inComp = false;
        }
    }
}

console.log(`Extracted ${Object.keys(components).length} components: ${Object.keys(components).join(', ')}`);

const defaultImports = `import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { formatMoneyCents } from "../../../../../Utils/formatMoneyCents";
import { CATEGORIES } from "../../Data/categories";
import { BRANDS } from "../../Data/brands";
import { PERKS } from "../../Data/perks";
import { TESTIMONIALS } from "../../Data/testimonials";
import { HOW_IT_WORKS } from "../../Data/how-it-works";
import SectionLabel from "../SectionLabel";
import Stars from "../../../../../Components/Stars";
import ParticleField from "../ParticleField";
import FloatingOrbs from "../FloatingOrbs";
import ProductCard from "../../../../../Components/Ui/ProductCard";
import { BentoCard } from "../BentoProductGridComponents/BentoCard";
import AddToCart from "../../../../../Components/Ui/AddToCart";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
`;

for (let [name, code] of Object.entries(components)) {
    let fileContent = defaultImports + '\nexport default ' + code + '\n';
    fs.writeFileSync(path.join(componentsDir, name + '.jsx'), fileContent);
}

// Now rewrite HomePage.jsx to remove these and add imports
let newLines = [];
let skip = false;
let skipBraceCount = 0;

for (let line of lines) {
    let match = line.match(/^function\s+([A-Z]\w+)\s*\(/);
    if (!skip && match && match[1] !== 'HomePage' && components[match[1]]) {
        skip = true;
        skipBraceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (skipBraceCount === 0 && line.includes('}')) skip = false;
        continue;
    }
    
    if (skip) {
        skipBraceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (skipBraceCount === 0) skip = false;
        continue;
    }
    
    newLines.push(line);
}

// Add imports for the extracted components
let importsText = Object.keys(components).map(c => `import ${c} from "./Components/Sections/${c}";`).join('\n');
newLines.splice(24, 0, importsText);

fs.writeFileSync(filePath, newLines.join('\n'));

console.log("Rewrite complete.");
