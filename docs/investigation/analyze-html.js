// Analyze the HTML clipboard structure to see what elements it contains

const fs = require('fs');

// Read the clipboard data
const clipboardData = JSON.parse(fs.readFileSync('test-harness/fixtures/clipboard.txt', 'utf8'));
const htmlContent = clipboardData.formatData['text/html'];

console.log('=== HTML CLIPBOARD ANALYSIS ===\n');

// Parse the HTML
const { JSDOM } = require('jsdom');
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

console.log('1. TOP-LEVEL STRUCTURE:');
console.log('=======================');
const topElements = Array.from(document.body.children);
topElements.forEach((element, index) => {
  console.log(`${index + 1}. <${element.tagName.toLowerCase()}> ${element.className ? `class="${element.className}"` : ''}`);
  if (element.dataset) {
    const dataAttrs = Object.keys(element.dataset);
    if (dataAttrs.length > 0) {
      console.log(`   Data attributes: ${dataAttrs.join(', ')}`);
    }
  }
});

console.log('\n2. METADATA FROM FIRST ELEMENT:');
console.log('================================');
const firstElement = topElements[0];
if (firstElement && firstElement.dataset) {
  console.log(`Shape IDs: ${firstElement.dataset.shapeids || 'none'}`);
  console.log(`Shape count: ${firstElement.dataset.clipserviceCount || 'none'}`);
  console.log(`Shape type: ${firstElement.dataset.clipserviceType || 'none'}`);
  console.log(`Creation ID: ${firstElement.dataset.shapeCreationId || 'none'}`);
}

console.log('\n3. CONTENT BREAKDOWN:');
console.log('=====================');
topElements.forEach((element, index) => {
  console.log(`\nElement ${index + 1}:`);
  
  if (element.tagName === 'A') {
    console.log(`  Type: Metadata container`);
    console.log(`  Content: "${element.textContent.trim() || '[empty/whitespace]'}"`);
  } else if (element.tagName === 'DIV') {
    // Check what's inside the div
    const tables = element.querySelectorAll('table');
    const paragraphs = element.querySelectorAll('p');
    const spans = element.querySelectorAll('span');
    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === 3);
    
    console.log(`  Type: Content container`);
    console.log(`  Contains:`);
    console.log(`    - ${tables.length} table(s)`);
    console.log(`    - ${paragraphs.length} paragraph(s)`);
    console.log(`    - ${spans.length} span(s)`);
    console.log(`    - ${textNodes.length} text node(s)`);
    
    // Analyze tables
    if (tables.length > 0) {
      tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tr');
        const cells = table.querySelectorAll('td, th');
        console.log(`    Table ${tableIndex + 1}: ${rows.length} rows, ${cells.length} cells`);
        console.log(`      Table attributes: ${Object.keys(table.dataset).join(', ')}`);
      });
    }
    
    // Look for standalone text content (non-table content)
    const directTextContent = element.textContent.replace(/\s+/g, ' ').trim();
    if (directTextContent && !tables.length) {
      console.log(`    Direct text: "${directTextContent.substring(0, 100)}..."`);
    }
  }
});

console.log('\n4. ALL TEXT CONTENT (EXTRACTED):');
console.log('=================================');
const allText = document.body.textContent.replace(/\s+/g, ' ').trim();
console.log(`"${allText}"`);

console.log('\n5. NON-TABLE ELEMENTS:');
console.log('======================');
const nonTableContent = [];
topElements.forEach(element => {
  if (element.tagName !== 'DIV' || !element.querySelector('table')) {
    const text = element.textContent.trim();
    if (text && text !== ' ') {
      nonTableContent.push({
        tag: element.tagName,
        class: element.className,
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        hasShapeIds: !!element.dataset.shapeids
      });
    }
  }
});

if (nonTableContent.length > 0) {
  nonTableContent.forEach((item, index) => {
    console.log(`${index + 1}. <${item.tag.toLowerCase()}> "${item.text}"`);
    console.log(`   Class: ${item.class || 'none'}`);
    console.log(`   Has shape IDs: ${item.hasShapeIds}`);
  });
} else {
  console.log('No non-table content found with meaningful text.');
}

console.log('\n6. SHAPE ID ANALYSIS:');
console.log('=====================');
const elementsWithShapeIds = Array.from(document.querySelectorAll('[data-shapeids]'));
console.log(`Elements with shape IDs: ${elementsWithShapeIds.length}`);
elementsWithShapeIds.forEach((element, index) => {
  console.log(`${index + 1}. <${element.tagName.toLowerCase()}> data-shapeids="${element.dataset.shapeids}"`);
  console.log(`   Contains table: ${element.querySelector('table') ? 'Yes' : 'No'}`);
  console.log(`   Text content: "${element.textContent.trim().substring(0, 30)}..."`);
});