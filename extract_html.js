const fs = require('fs');
const path = 'C:/Users/larry/.claude/projects/C--Users-larry-artistos-mvp/9a59e3d1-f2da-4b01-9eeb-9b4a76a61461.jsonl';

const data = fs.readFileSync(path, 'utf8');
const lines = data.split('\n');

// Look through lines for user messages containing HTML mockup with Cormorant
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('Cormorant') && line.includes('"type":"user"')) {
    try {
      const obj = JSON.parse(line);
      // Extract the message content
      let content = '';
      if (obj.message && obj.message.content) {
        if (typeof obj.message.content === 'string') {
          content = obj.message.content;
        } else if (Array.isArray(obj.message.content)) {
          for (const block of obj.message.content) {
            if (block.type === 'text' && block.text) {
              content += block.text;
            }
          }
        }
      }
      // Check if this content has HTML with Cormorant
      if (content.includes('Cormorant') && content.includes('<')) {
        // Extract just the HTML portion
        const htmlStart = content.indexOf('<!DOCTYPE');
        if (htmlStart === -1) {
          // Maybe starts with <html
          const htmlStart2 = content.indexOf('<html');
          if (htmlStart2 !== -1) {
            fs.writeFileSync('C:/Users/larry/artistos-mvp/extracted_mockup.html', content.substring(htmlStart2), 'utf8');
            console.log('Found HTML at line ' + (i+1) + ', saved (starting from <html). Length: ' + content.substring(htmlStart2).length);
          } else {
            // Save the whole content
            fs.writeFileSync('C:/Users/larry/artistos-mvp/extracted_mockup.html', content, 'utf8');
            console.log('Found content at line ' + (i+1) + ', saved full content. Length: ' + content.length);
          }
        } else {
          fs.writeFileSync('C:/Users/larry/artistos-mvp/extracted_mockup.html', content.substring(htmlStart), 'utf8');
          console.log('Found HTML at line ' + (i+1) + ', saved (starting from <!DOCTYPE). Length: ' + content.substring(htmlStart).length);
        }
        // Also show first 200 chars to confirm
        console.log('First 200 chars: ' + content.substring(0, 200));
        break;
      }
    } catch (e) {
      console.log('Parse error on line ' + (i+1) + ': ' + e.message);
    }
  }
}
