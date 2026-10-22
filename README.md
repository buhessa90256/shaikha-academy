# Shaikha Academy · أكاديمية شيخة

An Arabic/English learning game built for iPad, Apple Pencil, touch, and desktop browsers. No build step, accounts, analytics, or backend. Public source contains learning activities only, never the source evaluation or private child records.

## Activities

- Arabic alphabet, English upper/lowercase letters, name letters, and pencil patterns with numbered, animated stroke guides. Each stroke and dot must be traced in sequence before the next letter unlocks.
- Arabic short vowels, English short vowels, three-letter blending, listen-and-write practice.
- Initial letter/picture matching, beginner sight words, a story with comprehension questions.
- Ordered listening games, cooperation and everyday problem solving.
- Drawing prompts with save-image, pressure-sensitive pen strokes, undo, and a Pencil-only option that ignores fingers.
- Al-Fatiha for supervised reading, a hadith about guiding others to good, mealtime manners, UAE facts and quizzes.

Stars reward practice and participation, **not mastery**. Tracing checks starting points, direction, path coverage, stroke order and dots with a child-friendly tolerance. Models teach isolated Arabic print letters; contextual joins and joined name writing are references, not assessed handwriting. Arabic words and name letters proceed right to left; English proceeds left to right. Individual strokes follow their numbered arrows (for example, alif descends). A grown-up should assess grip, formation, reading and pronunciation; teachers may use other valid handwriting conventions. All 195 spoken lesson prompts, letter names, stories and listening instructions have bundled synthetic MP3 clips. Tapping a lesson speaker turns sound on; the top speaker mutes playback. Device speech is only a fallback for future uncatalogued text. No voice is cloned and no runtime speech service or account is needed. Quran text is for supervised reading; use a trusted reciter for tajweed rather than synthetic speech.

## Run and publish

Serve this directory over HTTP, e.g. `python -m http.server 8080`. GitHub Pages: Settings → Pages → Source → GitHub Actions. The Publish Shaikha Academy workflow checks JavaScript, packages only the public app files, and deploys pushes to `main`.

Live site: https://bushaikha90256.github.io/shaikha-academy/

All resources and service-worker scope are relative to this repository path. No custom domain, root site, or other repository is needed or changed.

## Phones and iPad

One screen for phones and iPad in portrait or landscape: colorful islands, a chalkboard, a pencil bunny and star rewards. Lessons, stories and the parent guide change rounds in place, with no scrolling. Phone portrait uses two columns of islands, a horizontal letter picker and two rows of writing controls. Browser checks cover both languages at 390x744, 360x640, 667x375, 834x1194 and 1194x834, plus Arabic at 320x568. No scrolling or clipped controls in checked activities and parent pages.

Open in Safari, Share → Add to Home Screen. Visit once online before offline use. Activities are cached; optional external references need a connection. Enable **Pencil only** to ignore palm and finger touches on tracing and drawing canvases. Drawings can be exported as PNG. Progress is stored only in localStorage in the current browser; the parent guide exports it as JSON. Clearing site data removes it. Browser testing cannot certify physical Apple Pencil or iPad Safari hardware behavior.

## Validation

Run `node --test test/*.test.js`. Sound tests cover playback without installed voices, mute/stop, stale callbacks, blocked playback, fallback language selection and complete MP3 coverage. Tests cover correct strokes, wrong starts, reversed movement, backtracking, off-path input, incomplete strokes, corner shortcuts and every Arabic/English model. Native browser pointer checks verified alif, capital E, and lowercase i including its dot. A demo never awards a star or unlocks the next letter. Browser emulation cannot certify a physical Apple Pencil.

## Content sources

- Arabic handwriting direction reference: https://www.sakkal.com/articles/sakkal_arabic_alphabet.html (all app stroke paths are original).
- Al-Fatiha: https://quran.com/1
- Hadith: Sahih Muslim 1893a, https://sunnah.com/muslim:1893a (English explanation simplified for children).
- UAE government: https://u.ae/en/about-the-uae (political facts checked 2026-10-22).

No child evaluation photo, assessment scores, private attachments, tokens or credentials belong in this repository.

## Characters and narration

Six generated Shaikha poses appear on the home islands, every activity header, all parent-guide pages and completion screens. Poses change with the selected activity. Assets and final prompts are documented in [assets/characters/README.md](assets/characters/README.md). Only the generated characters are published; the supplied reference photo is excluded.

Narration is synthetic: Arabic UAE Fatima and British English Sonia. MP3s are committed and cached for offline use. To regenerate after changing lesson text, run `node scripts/audio-catalog.cjs`, then `python scripts/generate-audio.py` with `edge-tts` installed. Generation sends the public lesson text to Microsoft’s speech service at build time; child progress and drawings are never sent. The public site uses no API credentials. Quran content remains supervised reading with a trusted reciter, not synthetic recitation.
