import re
ST='font-size:.7em;font-weight:600;color:#4A5865'
def part(s):
    m=re.search(r'(^|\s)(\d[^()]*)$',s)
    return s if not m else s[:m.start(2)]+f'<small class="dose" style="{ST}">{m.group(2)}</small>'
def dosify(ko,en):
    return f'{part(ko)} ({part(en)})'
