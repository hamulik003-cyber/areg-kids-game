#!/usr/bin/env python3
"""Version only the new 38-image bundle without changing V287 gameplay."""
from pathlib import Path

def exact(path, old, new, count=1):
    p=Path(path)
    s=p.read_text(encoding='utf-8')
    assert s.count(old)==count,(path,old,s.count(old))
    p.write_text(s.replace(old,new),encoding='utf-8')

# These references must agree with the updated image bundle's numeric version.
exact('app.js', "'./service-worker.js?v=287'", "'./service-worker.js?v=28738'")
for old,new in [
    ("areg-v287-core","areg-v28738-core"),
    ("areg-v287-runtime","areg-v28738-runtime"),
    ("'./constellation-quest-v246.js?v=287'","'./constellation-quest-v246.js?v=28738'"),
    ("'./app.js?v=287'","'./app.js?v=28738'"),
]:
    exact('service-worker.js',old,new)
# Preserve old cached media and V287 startup images on actual DotKiosk.
exact('service-worker.js',
      "&&!MEDIA_CACHES.includes(k))",
      "&&!MEDIA_CACHES.includes(k)&&k!=='areg-v287-core'&&k!=='areg-v287-runtime')")
exact('refresh.html','v=287','v=28738',2)
for path in ('qa/full-audit.mjs','qa/pwa-update.test.mjs'):
    p=Path(path)
    s=p.read_text(encoding='utf8')
    if path.endswith('full-audit.mjs'):
        assert s.count('v=287')==2,(path,s.count('v=287'))
    else:
        assert s.count('v=287')>=5
    s=s.replace('v=287','v=28738')
    if path.endswith('pwa-update.test.mjs'):
        assert 'areg-v287-core' in s
        s=s.replace('areg-v287-core','areg-v28738-core')
    p.write_text(s,encoding='utf8')
print('PASS: only app/SW/cache/version compatibility and QA references changed.')
