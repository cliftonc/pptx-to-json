---
description: Start interactive PowerPoint parser validation with Claude
allowed-tools: [Bash, Read, Write]
---

Start interactive PowerPoint parser validation. This will run the validation script that allows testing different PowerPoint samples and comparing parsing results.

Run: `cd apps/proxy-server && node scripts/validate-samples.js`

Now, you will look at the output.  For each item you will compare the visual description with the generated component json.  If it is not the same, you should then say so, and then you must create a TodoList so you can fix the parser to address the issue.   This means you should now look in the code to find where it may be going wrong, running the parser against the binary.  

CRITICAL:  You must NEVER skip this validation since you think it has known issues.  You MUST try to fix the issue by modifying the parser code.  Do not simply validate, if it isnt valid IMMEDIATELY start fixing it.

You can re-run the parsing and debug the output:  `node scripts/log-paste test-harness/fixtures/<filename>.bin` and look at the output as you are modifying the parser.  Once you are completed then re-run the validation.  It has a --debug option that allows you to also see the RAW powerpoint data to help build the correct parsing logic.

If you have corrected the parsing, you MUST update the test-harness/samples.json file with the relevant entry to be `"validated": true`