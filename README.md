## Nebula Drift

basically a one button browser arcade game. hold to thrust, release to drift, dodge cactus rocks birds whatever, grab coins and powerups. kinda like that chrome no wifi dinosaur game but with more color and stuff layered on.

pretty simple overall. single page, canvas, vanilla js. no build tools no npm.

<img width="1890" height="874" alt="image" src="https://github.com/user-attachments/assets/5b6cc278-bf5c-4b5c-a506-30c170b4d9c9" />
<img width="1916" height="851" alt="image" src="https://github.com/user-attachments/assets/2465939b-8383-4faf-966b-9bab1e44deba" />

## How to set it up (localhost:3000)

you cant just open index.html as a file and expect the modules to work. browsers block that. so you spin up a tiny local server on port 3000.

from this folder in powershell:


```
powershell -ExecutionPolicy Bypass -File .\serve.ps1 3000
```

that should open http://localhost:3000 for you. if it doesnt, just paste that url in your browser yourself.

or if you already got python installed:

```
python -m http.server 3000
```

then go to http://localhost:3000

thats the whole setup. no install step, no packages, just serve the folder and play.

(double clicking serve.bat also works but that one defaults to 8080. if you want 3000 specifically use the powershell line above with 3000 on the end.)

## Controls

- hold mouse / touch / space = thrust
- P or Esc = pause
- [ ] or the skin button = cycle unlocked skins
- R / Enter / Retry = restart after game over

## Whats in here

index.html, css/, js/ (entities, systems, render), serve.ps1 / serve.bat for local hosting. high score and achievements sit in localStorage on your machine.

## License

MIT License

Copyright (c) 2026 AdamSadkii

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
