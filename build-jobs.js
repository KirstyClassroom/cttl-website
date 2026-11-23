const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, 'jobs');
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function parse(file) {
  const src = fs.readFileSync(path.join(dir,file), 'utf8').replace(/\r\n/g,'\n');
  const match = src.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  const yaml = match ? match[1] : '';
  const data = {};
  const lines = yaml.split('\n');
  for(let i=0;i<lines.length;i++) {
    const m = lines[i].match(/^([\w-]+):\s*(.*)$/);
    if(!m) continue;
    const key=m[1], val=m[2];
    if (val === '>-' || val === '>' || val === '|-' || val === '|') {
      const chunks=[];
      while(i+1<lines.length && (lines[i+1].startsWith('  ') || lines[i+1]==='')) {
        chunks.push(lines[++i].replace(/^  /,''));
      }
      data[key]=chunks.join('\n').trim();
    } else data[key]=val.replace(/^(['"])(.*)\1$/,'$2');
  }
  if (!data.description) data.description = src.slice(match ? match[0].length : 0).trim();
  return data;
}
function md(source) {
  let html='', list=false;
  const inline = str => esc(str).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,'<a href="$2">$1</a>');
  for(const raw of String(source).split('\n')) {
    const s=raw.trim();
    if(!s) {if(list){html+='</ul>';list=false;}continue;}
    const bullet=s.match(/^[-*] (.+)$/);
    if(bullet){if(!list){html+='<ul>';list=true;}html+='<li>'+inline(bullet[1])+'</li>';continue;}
    if(list){html+='</ul>';list=false;}
    const heading=s.match(/^(#{1,4})\s+(.+)$/);
    if(heading){const level=Math.min(heading[1].length+2,6);html+=`<h${level}>${inline(heading[2])}</h${level}>`;}
    else html+='<p>'+inline(s)+'</p>';
  }
  if(list) html+='</ul>';
  return html;
}
const jobs = fs.existsSync(dir) ? fs.readdirSync(dir).filter(x=>x.endsWith('.md')).sort().reverse().map(file=>{
  const data=parse(file);
  return {id:path.basename(file,'.md'),title:String(data.title||'Education Opportunity'),location:String(data.location||''),pay:String(data.pay||''),description:md(data.description||'')};
}) : [];
fs.writeFileSync(path.join(__dirname,'jobs-data.json'),JSON.stringify(jobs,null,2));
console.log(`Generated ${jobs.length} job(s).`);
