# GitHub Pages: пошагово

## Шаг 0. Решение об адресе
Рекомендую назвать репозиторий **`ВАШ-ЛОГИН.github.io`** — тогда сайт откроется на `https://ВАШ-ЛОГИН.github.io/` (без подпапки), а позже к нему легко подключить свой домен.
(Любое другое имя репозитория тоже работает, но адрес будет `https://ВАШ-ЛОГИН.github.io/имя/`.)

## Шаг 1. Подставить адрес (1 минута)
В папке сайта:  `python3 set-domain.py https://ВАШ-ЛОГИН.github.io`
Нет Python? В любом редакторе (VS Code / Notepad++) «Найти и заменить во всех файлах» `https://maximum.by` → `https://ВАШ-ЛОГИН.github.io` (в папке сайта).

## Шаг 2. Создать репозиторий
github.com → «+» → New repository → Repository name: `ВАШ-ЛОГИН.github.io` → **Public** → Create repository.

## Шаг 3. Загрузить файлы
Вариант А (проще, без установки): на странице пустого репозитория «uploading an existing file» → перетащите ВСЕ файлы и папки ИЗ папки сайта (не саму папку) → внизу «Commit changes».
  Если файл `.nojekyll` не загрузился: Add file → Create new file → имя `.nojekyll` (пустой) → Commit.
Вариант Б (git):
```
cd папка-сайта
git init && git add -A && git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/ВАШ-ЛОГИН/ВАШ-ЛОГИН.github.io.git
git push -u origin main
```

## Шаг 4. Включить Pages
Repo → Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main`, папка `/ (root)` → Save. Через 1–3 минуты вверху страницы появится «Your site is live at …».

## Шаг 5. Проверка (5 минут)
- Открыть сайт на телефоне и компьютере; переключить RU → EN; открыть политику; отправить тестовую заявку.
- `…/sitemap.xml`, `…/robots.txt`, `…/llms.txt`, `…/en/`, `…/несуществующая` (должна открыться 404).
- Картинок нет → положить в `img/` (Add file → Upload files → в папке img).

## Шаг 6. Форма
Formspree.io → New form → скопировать `https://formspree.io/f/xxxx` → в index.html вставить в `data-endpoint=""` → `python3 build-en.py` → закоммитить `index.html` и `en/index.html`.

## Шаг 7. Поисковики
- Google Search Console → Add property (URL prefix) → подтвердить (проще всего через мета-тег — вставьте его в <head> обеих страниц) → Sitemaps → `sitemap.xml`.
- Яндекс Вебмастер → то же.

## Как обновлять сайт позже
Изменили файл локально → Commit → Push (или на GitHub: открыть файл → ✏️ → Commit). Pages обновится за пару минут.

## Свой домен позже
Settings → Pages → Custom domain → домен → Save; у регистратора: 4 A-записи (см. docs.github.com/pages) и CNAME для www; затем включить Enforce HTTPS и выполнить `python3 set-domain.py https://ваш-домен`.
