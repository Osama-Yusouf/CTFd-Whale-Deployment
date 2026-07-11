$py = Get-Content graphify-out\.graphify_python
$script = @"
import json
from graphify.detect import detect
from pathlib import Path
import sys

# Windows requires us to handle unicode stdout properly if redirecting
sys.stdout.reconfigure(encoding='utf-8')

result = detect(Path(r'c:\Dev\ExploitX\CTFd-3.8.6'))
print(json.dumps(result, ensure_ascii=False))
"@
& $py -c $script | Out-File -FilePath graphify-out\.graphify_detect.json -Encoding utf8
