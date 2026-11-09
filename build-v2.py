#!/usr/bin/env python3
"""Собирает вторую версию сайта (другой дизайн, тот же контент):
   v2/template.html + тексты из index.html (RU) / i18n/en.json (EN) + i18n/v2.json -> v2/index.html (только русская версия)
Тексты правятся в index.html (RU), i18n/en.json и i18n/v2.json — затем:  python3 build-v2.py"""
import re,json,html,pathlib
R=pathlib.Path(__file__).parent
ru=(R/'index.html').read_text(encoding='utf-8')
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
def build(lang):
    T=RU if lang=='ru' else EN
    root='../' if lang=='ru' else '../../'
    pol='../privacy-policy/' if lang=='ru' else '../../en/privacy-policy/'
    site=root if lang=='ru' else root+'en/'
    s=tpl
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
out=R/'v2';
for lang,p in (('ru',out/'index.html'),):
    t=build(lang);p.write_text(t,encoding='utf-8')
    body=re.sub(r'<!--.*?-->|<script.*?</script>','',t,flags=re.S)
    if lang=='en' and re.search(r'[А-Яа-яЁё]',body): print('ВНИМАНИЕ: русский текст в EN:',set(re.findall(r'[А-Яа-яЁё][А-Яа-яЁё\s]*',body)))
print('Готово: v2/index.html (только русская версия)')
