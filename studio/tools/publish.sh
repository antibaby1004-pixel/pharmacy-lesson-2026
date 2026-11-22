#!/bin/sh
# 사용법: sh tools/publish.sh <약폴더> <게시폴더> <커밋메모> <한글이름> <파일꼬리표>
#   예) sh tools/publish.sh cravit cravit-v1 "사진 교체" 크라비트750 사진
# 렌더 결과(build/dist)를 저장소 루트의 게시폴더로 복사 → 커밋·푸시(GitHub Pages 반영) → MP4를 out/에 복사
set -e
R=$(cd "$(dirname "$0")/../.." && pwd); B=$R/studio/drugs/$1/build
ffprobe -v error -show_entries format=duration -of csv=p=0 "$B/설명영상_1440p.mp4"
cd "$R" && rm -rf "$2" && cp -r "$B/dist" "$2" && git add -A "$2" && git commit -qm "Publish $1 $5 ($3)" && git push -q
mkdir -p "$R/studio/out" && cp "$B/설명영상_1440p.mp4" "$R/studio/out/$4_설명영상_$5.mp4"; echo published
