# Maximum Studio — сайт (HTML / CSS / JS), RU + EN

## Структура
```
index.html                  русская версия (источник правды)
en/index.html               английская версия (генерируется: python3 build-en.py)
privacy-policy/index.html   политика RU      en/privacy-policy/index.html — политика EN
i18n/en.json                английские тексты сайта      i18n/policy-en.html — текст политики EN
css/fonts.css               ШРИФТЫ (меняются только здесь)      css/style.css — стили
js/main.js                  скрипты (меню, форма, модалки, анимации)
img/                        картинки    fonts/ — свои шрифты (необязательно)
404.html  robots.txt  sitemap.xml  llms.txt  site.webmanifest  .nojekyll
set-domain.py  build-en.py  — вспомогательные скрипты (Python 3)
```
**Правила работы:** меняете русский текст в `index.html` → при необходимости правите перевод в `i18n/en.json` → `python3 build-en.py`. Если сменился адрес сайта → `python3 set-domain.py https://адрес`.

## 1. Картинки — положить в /img (экспорт из Figma, имена в нижнем регистре)
hero.jpg, web-1.jpg, web-2.jpg, mobile.jpg, support.jpg, crm-1.jpg, crm-2.jpg, p1–p6.jpg, t1–t3.png (логотипы клиентов, прозрачный PNG),
b1–b3.jpg, stats-hover.png (250×310), **founder.jpg** (портрет 4:5, ≥800×1000; если файла нет — блок руководителя показывается без фото).
Уже готовы: favicon.svg, apple-touch-icon.png, icon-192/512.png, og-cover.jpg (замените на свою обложку 1200×630 при желании).

## 2. Ссылки на портфолио
В index.html блок `.gal`: у каждой карточки `<a class="pc" href="#">` вставьте ссылку на проект/Behance, поправьте заголовок, описание, теги. Ссылку «BEHANCE» (`.more a.lab`) замените на ваш профиль.
Английские тексты карточек — в i18n/en.json (p1t, p1d, pt, pd), затем `python3 build-en.py`.

## 3. Замена шрифта
Только css/fonts.css: переменные --font-main / --font-text / --font-ui / --font-num / --font-logo. Свой хостинг шрифтов — раскомментируйте @font-face и положите .woff2 в /fonts.

## 4. Форма заявок
В index.html у <form id="form"> заполните data-endpoint="https://formspree.io/f/xxxxxxx" (и то же — после build-en.py оно подтянется в en/index.html).
Отправляется JSON {name, phone, service, lang, page, time}. Ответ 2xx → модалка «Заявка отправлена» + конфетти; иначе — сообщение об ошибке. Пока поле пустое — демо-режим, заявки НЕ уходят.

## 5. SEO — что уже сделано
Отдельные страницы RU и EN с hreflang, canonical, Open Graph/Twitter, JSON-LD (WebSite, ProfessionalService с услугами, Person-руководитель), sitemap с hreflang, robots.txt (разрешены поисковики и ИИ-ассистенты), llms.txt,
видимый SEO-блок «Как мы работаем / Отрасли», блок руководителя с реальным текстом и цифрами, alt у картинок, lazy-load, семантическая разметка, один <h1>.
Что сделать вручную: Search Console + Яндекс Вебмастер (добавить сайт, отправить sitemap.xml), профили Behance/LinkedIn/Clutch с теми же названием, телефоном и описанием, свой домен когда будет.

# Публикация на GitHub Pages
См. ниже раздел в чате / GITHUB.md.
