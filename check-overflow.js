#!/usr/bin/env node

import { spawn } from 'child_process';

// Run the log-bin command and capture output
const child = spawn('pnpm', ['log-bin', 'presentation4.pptx'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  cwd: process.cwd()
});

let output = '';

child.stdout.on('data', (data) => {
  output += data.toString();
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`Process exited with code ${code}`);
    return;
  }

  try {
    const data = JSON.parse(output);
    
    console.log('🔍 Checking for components that overflow slide bounds (960×720):\n');
    
    let overflowCount = 0;
    
    data.slides.forEach(slide => {
      slide.components.forEach(component => {
        const rightEdge = component.x + component.width;
        const bottomEdge = component.y + component.height;
        
        if (rightEdge > 960 || bottomEdge > 720) {
          overflowCount++;
          console.log(`❌ Slide ${component.slideIndex}: "${component.id}" (${component.type})`);
          console.log(`   Position: (${component.x}, ${component.y})`);
          console.log(`   Size: ${component.width}×${component.height}`);
          console.log(`   Right edge: ${rightEdge} ${rightEdge > 960 ? '(OVERFLOW)' : ''}`);
          console.log(`   Bottom edge: ${bottomEdge} ${bottomEdge > 720 ? '(OVERFLOW)' : ''}`);
          console.log('');
        }
      });
    });
    
    if (overflowCount === 0) {
      console.log('✅ No components overflow the slide bounds');
    } else {
      console.log(`Found ${overflowCount} components that overflow slide bounds`);
    }
    
  } catch (error) {
    console.error('Failed to parse JSON output:', error.message);
  }
});

child.stdin.end();