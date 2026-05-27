import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src');

const replacements = [
  { from: /priceCents/g, to: 'priceMinor' },
  { from: /price_cents/g, to: 'price_minor' },
  { from: /salePriceCents/g, to: 'salePriceMinor' },
  { from: /sale_price_cents/g, to: 'sale_price_minor' },
  { from: /totalCents/g, to: 'totalMinor' },
  { from: /total_cents/g, to: 'total_minor' },
  { from: /subtotalCents/g, to: 'subtotalMinor' },
  { from: /subtotal_cents/g, to: 'subtotal_minor' },
  { from: /discountCents/g, to: 'discountMinor' },
  { from: /discount_cents/g, to: 'discount_minor' },
  { from: /shippingCents/g, to: 'shippingMinor' },
  { from: /shipping_cents/g, to: 'shipping_minor' },
  { from: /taxCents/g, to: 'taxMinor' },
  { from: /tax_cents/g, to: 'tax_minor' },
  { from: /amountCents/g, to: 'amountMinor' },
  { from: /amount_cents/g, to: 'amount_minor' },
  { from: /minOrderCents/g, to: 'minOrderMinor' },
  { from: /min_order_cents/g, to: 'min_order_minor' },
  { from: /formatMoneyCents/g, to: 'formatMoneyMinor' },
  { from: /FormatMoneyCents/g, to: 'formatMoneyMinor' },
  { from: /unitPriceCents/g, to: 'unitPriceMinor' },
  { from: /unit_price_cents/g, to: 'unit_price_minor' },
  { from: /lineTotalCents/g, to: 'lineTotalMinor' },
  { from: /line_total_cents/g, to: 'line_total_minor' },
  { from: /targetPriceCents/g, to: 'targetPriceMinor' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.match(/\.(js|jsx|ts|tsx)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const r of replacements) {
        if (content.match(r.from)) {
          content = content.replace(r.from, r.to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated file: ${fullPath}`);
      }
      
      // Check if filename itself needs renaming
      if (file.includes('Cents')) {
        const newFileName = file.replace('Cents', 'Minor');
        const newFullPath = path.join(directory, newFileName);
        fs.renameSync(fullPath, newFullPath);
        console.log(`Renamed file: ${fullPath} -> ${newFullPath}`);
      }
    }
  }
}

processDirectory(dir);
console.log('Finished mass rename in src directory.');
