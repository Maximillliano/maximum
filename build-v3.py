#!/usr/bin/env python3
"""v3: тот же контент и скрипты, что в v2, но с темой «стекло + свечения» (v3/css/v3.css). Сначала python3 build-v2.py, затем python3 build-v3.py"""
import pathlib,re
R=pathlib.Path(__file__).parent
s=(R/'v2/index.html').read_text(encoding='utf-8')
v=re.search(r'v2\.css\?v=(\w+)',s).group(1)
s=s.replace('</head>',f'<link rel="stylesheet" href="../v3/css/v3.css?v={v}">\n</head>',1)
s=s.replace('<meta name="theme-color" content="#0B0A0F">','<meta name="theme-color" content="#12051f">')
(R/'v3/index.html').write_text(s,encoding='utf-8');print('Готово: v3/index.html')
