# 신규약사 교육영상 제작 도구 (studio)
GPT가 만든 강의자료·대본·내레이션을 받아, 따뜻한 종이 배경의 장면 + 말소리에 맞춰 나타나는 글자 + 박 선배·하루 캐릭터(움직임·목소리)를 입힌 1440p 영상과 온라인 플레이어를 만든다.
## 폴더
- `lib/` 공통 엔진: `core.js`(시간 보정·등장 효과·캐릭터 엔진 makeChar), `common.css`(색·글씨 크기), `mech.js`(기전 그림 부품), Pretendard 글꼴
- `characters/` 박 선배(8)·하루(12) 포즈 SVG
- `player/` 온라인 플레이어 틀(index.html, style.css)
- `tools/` 제작 스크립트 1~4단계 + `make.py`(한 번에)
- `drugs/<약>/` 약별 작업 폴더 — 첫 예시: `drugs/repatha/`
## 약 폴더 구성 (drugs/<약>/)
- `drug.json` 장면 목록·순서·강조색·쉼 줄이기 설정
- `source/narration/part*.flac` 원본 내레이션, `source/captions.js` 원본 자막(원본 시각), `source/app.js` 플레이어 설정
- `scenes/*.html` 장면(각 장면이 `useTiming('<part>')` 호출, `SCENE.char`=박 선배, `SCENE.char2`=하루 동작표, 시각은 원본 내레이션 기준 초)
- `dialog.json` 캐릭터 목소리 설정과 대사(말풍선 문구 `bubble`, 실제 읽는 문장 `say`, 원본 시각 `at`, 함께할 동작 `with`)
- `voice/` 합성 대사 캐시(문구가 바뀌면 자동으로 새로 만듦), `build/` 결과물(저장소에 올리지 않음)
## 실행
```
pip install -r requirements.txt && python -m playwright install chromium   # 처음 한 번 (ffmpeg 필요)
python tools/make.py drugs/repatha            # 쉼 줄이기 → 대사 합성·삽입 → 장면 촬영 → 이어붙이기·플레이어
python tools/render.py drugs/repatha 3 5      # 특정 장면만 다시 찍기
python tools/assemble.py drugs/repatha        # 이어붙이기만
```
결과: `drugs/<약>/build/설명영상_1440p.mp4`, `drugs/<약>/build/dist/`(플레이어, 자막에 캐릭터 대사 포함)
## 규칙 요약
- 배경 따뜻한 종이색, 약마다 강조색 1개, 제목·소제목은 크게, 기전 단계 설명은 30px
- 내레이션 쉼 0.7초 초과 → 0.5초로 줄임. 캐릭터 대사는 내레이션 문장 사이 쉼에 끼워 넣어 겹치지 않게(그동안 화면은 멈춤)
- 박 선배: Andrew Multilingual, 속도 -6%, 음높이 -8Hz, "음…", "어," 같은 추임새를 넣은 낮고 나른한 말투 / 하루(수달): Emma Multilingual, +10%, +20Hz 밝고 개구진 말투
- 캐릭터는 오른쪽 영역(x 1456 이후)에서 움직이고 말풍선은 내용 영역을 가리지 않음
- 유튜브 원본 기전 영상 자리는 MP4에서 '브리지' 장면(yt1, yt2)으로 안내, 플레이어에서는 유튜브 재생
## 새 약 추가 순서
1. `drugs/repatha`를 복사해 `drugs/<새약>` 만들기
2. GPT 자료를 `source/`에 넣기(내레이션 음성 또는 대본 → 음성 합성, 자막, 강의 슬라이드 내용)
3. 장면 HTML의 글·그림을 새 약 내용으로 바꾸고 `drug.json` 강조색·장면 목록 수정
4. `dialog.json`에 박 선배·하루 추임새 작성 → `python tools/make.py drugs/<새약>`
