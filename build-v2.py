#!/usr/bin/env python3
"""Собирает сайт:
   v2/template.html + тексты из i18n/ru-source.html (RU) / i18n/en.json (EN) + i18n/v2.json + SEO-шапка i18n/seo-ru.html / seo-en.html
   -> index.html (RU), en/index.html (EN), v3/index.html (тестовый вариант «стекло», noindex), v2/index.html (редирект на главную)
Тексты правятся в i18n/ru-source.html (RU), i18n/en.json и i18n/v2.json — затем:  python3 build-v2.py  (и build-v3.py не нужен)"""
import re,json,html,pathlib
R=pathlib.Path(__file__).parent
ru=(R/'i18n/ru-source.html').read_text(encoding='utf-8')
EN=json.loads((R/'i18n/en.json').read_text(encoding='utf-8'))
V2=json.loads((R/'i18n/v2.json').read_text(encoding='utf-8'))
base=re.search(r'rel="canonical" href="([^"]+?)/?"',ru).group(1).rstrip('/')
RU={}
for m in re.finditer(r'<(\w+)\b[^>]*\bdata-i="([^"]+)"[^>]*>(.*?)</\1>',ru,re.S): RU.setdefault(m.group(2),m.group(3))
RU['meta_desc']=re.search(r'<meta name="description" content="([^"]*)"',ru).group(1)
for k,v in V2.items(): RU[k]=v['ru']; EN[k]=v['en']
tpl=(R/'v2/template.html').read_text(encoding='utf-8')
vb=re.search(r'<symbol id="i-vb"[^>]*>(.*?)</symbol>',ru,re.S).group(1)
chips=['SaaS','EdTech','E-commerce','Travel &amp; Booking','Gaming','Retail','Web3']
def chip_row(last): return ''.join(f'<span role="listitem">{c}</span><i>✦</i>' for c in chips+[last])
def build(lang,variant=None):
    T=RU if lang=='ru' else EN
    root='' if lang=='ru' else '../'
    if variant: root='../'
    pol='privacy-policy/' if lang=='ru' else 'privacy-policy/'
    if variant: pol='../privacy-policy/'
    site=root
    s=tpl.replace('@@SEO@@',(R/f'i18n/seo-{lang}.html').read_text(encoding='utf-8').strip())
    if variant: s=re.sub(r'<meta name="robots" content="[^"]*">','<meta name="robots" content="noindex, nofollow">',s)
    def rep(m):
        k=m.group(1)
        if k not in T: raise SystemExit(f'Нет текста для ключа [{lang}]: {k}')
        return T[k]
    s=re.sub(r'\[\[(\w+)\]\]',rep,s)
    ind8=T['ind8']
    row1=chip_row(ind8); row2=chip_row(ind8)
    s=s.replace('@@CHIPS1@@',row1).replace('@@CHIPS2@@',row2)
    ph=''.join(f'<a class="ig-card ig-empty" href="https://www.instagram.com/maximilian_designer/" target="_blank" rel="noopener"><span class="ig-ph"><svg class="ic" aria-hidden="true"><use href="#i-ig"/></svg></span><span class="ig-o"><span>{T["igO"]}</span></span></a>' for _ in range(3))
    s=s.replace('@@IGPH@@',ph).replace('@@VB@@',vb)
    other_href,other_lbl,cur=('en/','EN','RU') if lang=='ru' else ('../','RU','EN')
    here='./'
    li_ru=f'<li role="none"{" class=\"on\"" if lang=="ru" else ""}><a role="option" href="{here if lang=="ru" else "../"}" hreflang="ru" lang="ru"{" aria-current=\"true\"" if lang=="ru" else ""}>RU</a></li>'
    li_en=f'<li role="none"{" class=\"on\"" if lang=="en" else ""}><a role="option" href="{"en/" if lang=="ru" else here}" hreflang="en" lang="en"{" aria-current=\"true\"" if lang=="en" else ""}>EN</a></li>'
    langbox=f'<div class="lang"><button type="button" class="lang-cur" aria-haspopup="listbox" aria-expanded="false" aria-label="Language"><span class="lang-v">{cur}</span><svg viewBox="0 0 27 27" aria-hidden="true"><path d="m6 10 7.500 7.500L21 10"/></svg></button><ul>{li_ru}{li_en}</ul></div>'
    s=s.replace('@@LANG@@',langbox)
    canon=base+'/'
    s=s.replace('{{LANG}}',lang).replace('{{ROOT}}',root).replace('{{POL}}',pol).replace('{{ROOT_SITE}}',site).replace('{{CANON}}',canon if lang=='ru' else canon+'en/')
    return s
def write(p,t):
    p.parent.mkdir(exist_ok=True);p.write_text(t,encoding='utf-8')
write(R/'index.html',build('ru'));write(R/'en/index.html',build('en'))
v3=build('ru','v3');vv=re.search(r'v2\.css\?v=(\w+)',v3).group(1)
v3=v3.replace('</head>',f'<link rel="stylesheet" href="../v3/css/v3.css?v={vv}">\n</head>',1).replace('<meta name="theme-color" content="#0B0A0F">','<meta name="theme-color" content="#12051f">')
write(R/'v3/index.html',v3)
write(R/'v2/index.html','<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=../"><link rel="canonical" href="../"><title>Maximum Studio</title></head><body><a href="../">Maximum Studio</a></body></html>')
for f in ('index.html','en/index.html'):
    body=re.sub(r'<!--.*?-->|<script.*?</script>','',(R/f).read_text(encoding='utf-8'),flags=re.S)
    if f.startswith('en') and re.search(r'[А-Яа-яЁё]',body): print('ВНИМАНИЕ: русский текст в EN:',set(re.findall(r'[А-Яа-яЁё][А-Яа-яЁё\s]*',body)))
print('Готово: index.html, en/index.html, v3/index.html')
