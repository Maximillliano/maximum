#!/usr/bin/env python3
"""Подставляет адрес вашего сайта в canonical, hreflang, Open Graph, JSON-LD, sitemap.xml, robots.txt и llms.txt.
Запуск из папки сайта:
  python3 set-domain.py https://example.com               (свой домен)
  python3 set-domain.py https://username.github.io        (репозиторий username.github.io)
  python3 set-domain.py https://username.github.io/repo   (обычный репозиторий)
Можно запускать повторно: прошлый адрес находится автоматически."""
import re,sys,pathlib
if len(sys.argv)!=2 or not sys.argv[1].startswith('http'):sys.exit(__doc__)
new=sys.argv[1].rstrip('/');root=pathlib.Path(__file__).parent
files=['index.html','en/index.html','privacy-policy/index.html','en/privacy-policy/index.html','robots.txt','sitemap.xml','llms.txt','i18n/policy-en.html']
mark=root/'.last-domain'
if mark.exists():old=mark.read_text().strip()
else:
    m=re.search(r'rel="canonical" href="([^"]+?)/?"',(root/'index.html').read_text(encoding='utf-8'));old=m.group(1).rstrip('/') if m else 'https://maximum.by'
n=0
for f in files:
    p=root/f
    if p.exists():
        t=p.read_text(encoding='utf-8');n+=t.count(old);p.write_text(t.replace(old,new),encoding='utf-8')
mark.write_text(new)
print(f'Готово: {old} -> {new} (замен: {n}). Если менялся русский текст — сначала python3 build-en.py')
