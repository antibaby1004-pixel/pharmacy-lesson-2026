"""한 번에 전부: python tools/make.py drugs/<약> [--skip-render]"""
import sys,os,subprocess
H=os.path.dirname(os.path.abspath(__file__));d=sys.argv[1]
first='narrate.py' if os.path.exists(os.path.join(d,'narration.json')) else 'tighten.py'
for step in [first,'voice.py']+([] if '--skip-render' in sys.argv else ['render.py'])+['assemble.py']:
    print('==',step);subprocess.run([sys.executable,os.path.join(H,step),d],check=True)
