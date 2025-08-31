---
description: Add a new PowerPoint sample for validation  
allowed-tools: [Bash, Read, Write, Edit]
---

Add a new PowerPoint sample for validation testing. Usage: `/add-ppt-sample <name> <url> [description]`

Arguments:
- name: Sample name identifier
- url: Microsoft API URL from clipboard
- description: Optional description of the sample

Run: `cd apps/proxy-server && node scripts/add-test-case.js $ARGUMENTS`