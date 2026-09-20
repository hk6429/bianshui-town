from pathlib import Path
import subprocess, hashlib, json, re, datetime
root=Path(__file__).resolve().parent.parent
out=root/'evidence/literary-release';out.mkdir(parents=True,exist_ok=True)
local=(root/'dist/index.html').read_text()
assets=sorted(set(re.findall(r'(?:src|href)="(/assets/[^\"]+\.(?:js|css))"',local)))
assert len(assets)==5,assets
results=[]
def get(url):return subprocess.check_output(['curl','-fLsS','--max-time','30',url])
for name,base in [('cloudflare','https://bianshui-town.pages.dev'),('netlify','https://bianshui-town.netlify.app')]:
 html=get(base+'/').decode();remote=sorted(set(re.findall(r'(?:src|href)="(/assets/[^\"]+\.(?:js|css))"',html)))
 assert remote==assets,(name,remote,assets)
 assert '宋韻任務' in html
 rows=[]
 for path in assets:
  expected=hashlib.sha256((root/'dist'/path.lstrip('/')).read_bytes()).hexdigest();actual=hashlib.sha256(get(base+path)).hexdigest()
  assert actual==expected,(name,path)
  rows.append({'path':path,'sha256':actual,'matches':True})
 results.append({'provider':name,'url':base,'homepage':True,'assets':rows})
record={'builtCommit':'848f7f1','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'localTests':{'passed':388,'failed':0},'build':'passed','deployments':{'cloudflare':'https://6302c38e.bianshui-town.pages.dev','netlify':'https://6aafc29a4dae120b33ae07c2--bianshui-town.netlify.app'},'readback':results,'scope':'HTTP asset SHA256 verification; interactive automated checks separately in browser.json'}
(out/'release.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print('Both production homepages and all 5 JS/CSS hashes match dist')
