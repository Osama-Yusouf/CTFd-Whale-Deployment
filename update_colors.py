import re

with open(r'c:\Dev\ExploitX\CTFd-3.8.6\CTFd\themes\stargaze\templates\base.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'LEMON STARGAZE THEME': 'BLUE SPACE THEME',
    '--lemon-light': '--space-light',
    '--lemon-dim': '--space-dim',
    '--lemon-dark': '--space-dark',
    '--lemon-glow': '--space-glow',
    '--lemon': '--space',
    '#ccff00': '#00f0ff',
    '#d9ff4d': '#66f5ff',
    '#a3e635': '#3b82f6',
    '#4d6600': '#003366',
    'rgba(204, 255, 0': 'rgba(0, 240, 255',
    'rgba(163, 230, 53': 'rgba(59, 130, 246',
    'rgba(190, 242, 100': 'rgba(96, 165, 250',
    '#d9f99d': '#93c5fd',
    'rgba(63, 98, 18': 'rgba(30, 58, 138',
    'rgba(101, 163, 13': 'rgba(29, 78, 216',
    '#3f6212': '#1e3a8a',
    '#65a30d': '#1d4ed8',
    '#84cc16': '#2563eb',
    'rgba(132, 204, 22': 'rgba(37, 99, 235'
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(r'c:\Dev\ExploitX\CTFd-3.8.6\CTFd\themes\stargaze\templates\base.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated base.html successfully.")
