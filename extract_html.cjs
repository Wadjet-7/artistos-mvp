const fs = require('fs');
const filepath = 'C:/Users/larry/.claude/projects/C--Users-larry-artistos-mvp/9a59e3d1-f2da-4b01-9eeb-9b4a76a61461.jsonl';

const data = fs.readFileSync(filepath, 'utf8');
const lines = data.split('\n');

// Line 567 (index 566) is the queue-operation with the HTML mockup (90855 chars)
const line = lines[566];
console.log('Line 567 length: ' + line.length);

try {
  const obj = JSON.parse(line);
  console.log('Type: ' + obj.type);
  console.log('Operation: ' + obj.operation);

  // The content field should have the user's message with the HTML
  let content = obj.content || '';
  console.log('Content length: ' + content.length);
  console.log('First 500 chars:\n' + content.substring(0, 500));
  console.log('\n--- checking for HTML markers ---');

  const doctypeIdx = content.indexOf('<!DOCTYPE');
  const htmlIdx = content.indexOf('<html');
  const htmlEndIdx = content.lastIndexOf('</html>');

  console.log('<!DOCTYPE at index: ' + doctypeIdx);
  console.log('<html at index: ' + htmlIdx);
  console.log('</html> at index: ' + htmlEndIdx);

  if (doctypeIdx !== -1) {
    const htmlContent = content.substring(doctypeIdx, htmlEndIdx !== -1 ? htmlEndIdx + 7 : undefined);
    fs.writeFileSync('C:/Users/larry/artistos-mvp/extracted_mockup.html', htmlContent, 'utf8');
    console.log('\nSAVED HTML to extracted_mockup.html, length: ' + htmlContent.length);
    console.log('Last 200 chars: ' + htmlContent.substring(htmlContent.length - 200));
  } else if (htmlIdx !== -1) {
    const htmlContent = content.substring(htmlIdx, htmlEndIdx !== -1 ? htmlEndIdx + 7 : undefined);
    fs.writeFileSync('C:/Users/larry/artistos-mvp/extracted_mockup.html', htmlContent, 'utf8');
    console.log('\nSAVED HTML to extracted_mockup.html, length: ' + htmlContent.length);
  } else {
    console.log('No HTML markers found, saving raw content');
    fs.writeFileSync('C:/Users/larry/artistos-mvp/extracted_mockup.html', content, 'utf8');
  }

} catch(e) {
  console.log('Parse error: ' + e.message.substring(0, 300));
}
