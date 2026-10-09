#!/usr/bin/env python3
"""Генерирует английскую версию сайта из русской:
   index.html  + i18n/en.json          -> en/index.html
   privacy-policy/index.html + i18n/policy-en.html -> en/privacy-policy/index.html
Русские страницы — источник. Правите русский текст или i18n/en.json — запускайте:  python3 build-en.py
Затем (если меняли домен):  python3 set-domain.py https://ваш-адрес"""
import re,json,html,pathlib
R=pathlib.Path(__file__).parent
EN=json.loads((R/'i18n/en.json').read_text(encoding='utf-8'))
ru=(R/'index.html').read_text(encoding='utf-8')
base=re.search(r'rel="canonical" href="([^"]+?)/?"',ru).group(1).rstrip('/')
esc=lambda s:html.escape(s,quote=False)
DT=re.compile(r'(<(\w+)\b[^>]*\bdata-i="([^"]+)"[^>]*>)(.*?)(</\2>)',re.S)
RU2EN={}
def tr(m):
    key=m.group(3)
    if key not in EN: raise SystemExit('Нет перевода для ключа: '+key)
    RU2EN[html.unescape(m.group(4)).strip()]=EN[key]
    return m.group(1)+esc(EN[key])+m.group(5)
ATTR={'Основное меню':'Main menu','Меню':'Menu','Закрыть':'Close','Максимилиан Антипенко':'Maximilian Antipenko','Разработка сайтов и b2b-сервисов':'Website and B2B service development','Лендинги и интернет-магазины':'Landing pages and online stores','Дизайн мобильных приложений':'Mobile app design','Техподдержка сайтов':'Website support','Разработка CRM':'CRM development','CRM-система':'CRM system','Проект GreenLife':'GreenLife project','Проект':'Project','Мифы о веб-разработке':'Myths about web development','Тренды веб-дизайна':'Web design trends','Языки программирования':'Programming languages'}
def attrs(s):
    return re.sub(r'\b(alt|aria-label)="([^"]*)"',lambda m:f'{m.group(1)}="{html.escape(ATTR.get(m.group(2),RU2EN.get(html.unescape(m.group(2)),m.group(2))))}"',s)
def page_meta(s,url,title,desc,ogt,ogd):
    s=s.replace('<html lang="ru">','<html lang="en">')
    s=re.sub(r'<title>.*?</title>',lambda m:f'<title>{esc(title)}</title>',s,flags=re.S)
    s=re.sub(r'(<meta name="description" content=")[^"]*(")',lambda m:m.group(1)+html.escape(desc)+m.group(2),s)
    s=re.sub(r'(<link rel="canonical" href=")[^"]*(")',lambda m:m.group(1)+url+m.group(2),s)
    s=re.sub(r'(<meta property="og:url" content=")[^"]*(")',lambda m:m.group(1)+url+m.group(2),s)
    s=s.replace('<meta property="og:locale" content="ru_RU">','<meta property="og:locale" content="en_US">').replace('<meta property="og:locale:alternate" content="en_US">','<meta property="og:locale:alternate" content="ru_RU">')
    s=re.sub(r'(<meta property="og:title" content=")[^"]*(")',lambda m:m.group(1)+html.escape(ogt)+m.group(2),s)
    s=re.sub(r'(<meta property="og:description" content=")[^"]*(")',lambda m:m.group(1)+html.escape(ogd)+m.group(2),s)
    s=re.sub(r'(<meta name="twitter:title" content=")[^"]*(")',lambda m:m.group(1)+html.escape(ogt)+m.group(2),s)
    return s
# ---------------- главная ----------------
s=DT.sub(tr,ru)
s=page_meta(s,base+'/en/',EN['meta_title'],EN['meta_desc'],EN['og_title'],EN['og_desc'])
s=attrs(s)
for a,b in [('href="css/','href="../css/'),('src="js/','src="../js/'),('src="img/','src="../img/'),('href="img/','href="../img/'),('data-img="img/','data-img="../img/'),('href="site.webmanifest"','href="../site.webmanifest"')]: s=s.replace(a,b)
s=s.replace('<span class="lang-v">RU</span>','<span class="lang-v">EN</span>')
s=s.replace('<li role="none" class="on"><a role="option" href="./" hreflang="ru" lang="ru" aria-current="true">RU</a></li><li role="none"><a role="option" href="en/" hreflang="en" lang="en">EN</a></li>',
            '<li role="none"><a role="option" href="../" hreflang="ru" lang="ru">RU</a></li><li role="none" class="on"><a role="option" href="./" hreflang="en" lang="en" aria-current="true">EN</a></li>')
s=s.replace('<span>ИП Антипенко Максимилиан Юрьевич</span>',f'<span>{esc(EN["foot_owner"])}</span>')
def ld(m):
    t=m.group(0)
    t=t.replace('Веб-студия Maximum: разработка сайтов и b2b-сервисов, дизайн интерфейсов и мобильных приложений, CRM, техподдержка. 150+ проектов, 10+ лет опыта.',EN['meta_desc'])
    for k,v in sorted(RU2EN.items(),key=lambda kv:-len(kv[0])):
        if len(k)>6: t=t.replace(k,v.replace('"','\\"'))
    t=t.replace('"Минск"','"Minsk"').replace('Веб-студия Maximum: разработка сайтов и b2b-сервисов, дизайн интерфейсов и мобильных приложений, CRM, техподдержка. 150+ проектов, 10+ лет опыта.',EN['meta_desc'])
    return t
s=re.sub(r'<script type="application/ld\+json">.*?</script>',ld,s,flags=re.S)
(R/'en').mkdir(exist_ok=True);(R/'en/privacy-policy').mkdir(exist_ok=True)
(R/'en/index.html').write_text(s,encoding='utf-8')
# ---------------- политика ----------------
p=(R/'privacy-policy/index.html').read_text(encoding='utf-8')
body=(R/'i18n/policy-en.html').read_text(encoding='utf-8').replace('https://maximum.by',base)
a=p.index('<h1>');b=p.index('</main>')
p=p[:a]+body+p[b:]
p=page_meta(p,base+'/en/privacy-policy/',EN['pol_title'],EN['pol_desc'],EN['pol_title'],EN['pol_desc'])
for x,y in [('href="../css/','href="../../css/'),('href="../img/','href="../../img/'),('<a class="lang-link" href="../en/privacy-policy/" hreflang="en" lang="en">EN</a>','<a class="lang-link" href="../../privacy-policy/" hreflang="ru" lang="ru">RU</a>'),('>Заказать<','>Order<'),('← На главную',EN['foot_back']),('ИП Антипенко Максимилиан Юрьевич',EN['foot_owner']),('aria-label="Maximum Studio"','aria-label="Maximum Studio"')]: p=p.replace(x,y)
(R/'en/privacy-policy/index.html').write_text(p,encoding='utf-8')
left=[f for f in('en/index.html','en/privacy-policy/index.html') if re.search(r'[А-Яа-яЁё]',re.sub(r'<!--.*?-->','',(R/f).read_text(encoding='utf-8'),flags=re.S))]
print('Готово: en/index.html, en/privacy-policy/index.html; база адреса:',base)
if left: print('ВНИМАНИЕ: остался русский текст в',left)
