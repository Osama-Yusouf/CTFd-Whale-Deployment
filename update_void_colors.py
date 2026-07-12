import re

with open(r'c:\Dev\ExploitX\CTFd-Whale-Deployment\CTFd\themes\into-the-void\templates\base.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'BLUE SPACE THEME': 'INTO THE VOID THEME',
    'LEMON INTO THE VOID THEME': 'INTO THE VOID THEME',
    '--space': '--void',
    '--lemon': '--void',
    '#00f0ff': '#ff00ff', # Primary Neon Magenta
    '#ccff00': '#ff00ff',
    '#66f5ff': '#ff66ff', # Light Magenta
    '#d9ff4d': '#ff66ff',
    '#3b82f6': '#8a2be2', # Blue Violet
    '#a3e635': '#8a2be2',
    '#003366': '#1a0033', # Dark Purple
    '#4d6600': '#1a0033',
    'rgba(0, 240, 255': 'rgba(255, 0, 255',
    'rgba(204, 255, 0': 'rgba(255, 0, 255',
    'rgba(59, 130, 246': 'rgba(138, 43, 226',
    'rgba(163, 230, 53': 'rgba(138, 43, 226',
    'rgba(96, 165, 250': 'rgba(216, 102, 255',
    'rgba(190, 242, 100': 'rgba(216, 102, 255',
    '#93c5fd': '#d866ff',
    '#d9f99d': '#d866ff',
    'rgba(30, 58, 138': 'rgba(40, 0, 70',
    'rgba(63, 98, 18': 'rgba(40, 0, 70',
    'rgba(29, 78, 216': 'rgba(70, 0, 110',
    'rgba(101, 163, 13': 'rgba(70, 0, 110',
    '#1e3a8a': '#280046',
    '#3f6212': '#280046',
    '#1d4ed8': '#46006e',
    '#65a30d': '#46006e',
    '#2563eb': '#8a2be2',
    '#84cc16': '#8a2be2',
    'rgba(37, 99, 235': 'rgba(138, 43, 226',
    'rgba(132, 204, 22': 'rgba(138, 43, 226',
    '%23a3e635': '%23ff00ff',
    '%2300f0ff': '%23ff00ff',
    '%23ccff00': '%23ff00ff'
}

for k, v in replacements.items():
    content = content.replace(k, v)

# Update cursors to black hole / void rings
cursor1_regex = r"cursor:\s*url\('data:image/svg\+xml;utf8,<svg[^>]+>.*?</svg>'\)\s*12\s*12,\s*crosshair\s*!important;"
cursor1_new = "cursor: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"4\" fill=\"%23000\" stroke=\"%23ff00ff\" stroke-width=\"1\"/><circle cx=\"16\" cy=\"16\" r=\"12\" fill=\"none\" stroke=\"%238a2be2\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/></svg>') 16 16, crosshair !important;"
content = re.sub(cursor1_regex, cursor1_new, content)

cursor2_regex = r"cursor:\s*url\('data:image/svg\+xml;utf8,<svg[^>]+>.*?</svg>'\)\s*12\s*12,\s*pointer\s*!important;"
cursor2_new = "cursor: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"5\" fill=\"%23000\" stroke=\"%23ff00ff\" stroke-width=\"2\"/><circle cx=\"16\" cy=\"16\" r=\"14\" fill=\"none\" stroke=\"%238a2be2\" stroke-width=\"2\" stroke-dasharray=\"6 4\"/></svg>') 16 16, pointer !important;"
content = re.sub(cursor2_regex, cursor2_new, content)

with open(r'c:\Dev\ExploitX\CTFd-Whale-Deployment\CTFd\themes\into-the-void\templates\base.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated base.html successfully.")
