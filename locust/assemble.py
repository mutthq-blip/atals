#!/usr/bin/env python3
"""Build the desert locust atlas.

  python3 locust/assemble.py

writes
  locust/dev.html    loads three.js and fonts from the CDN (for development)
  locust/index.html  one self-contained offline file (what GitHub Pages serves)
  locust/artifact.html  same content without the html/head wrapper (for an Artifact preview)
"""
import os, re, base64
D = os.path.dirname(os.path.abspath(__file__)) + '/'
T = D + 'src/'
SH = os.path.dirname(D.rstrip('/')) + '/shared/'
r = lambda f: open(T + f, encoding='utf-8').read()
logo = r('logo.txt').strip()
extra = '''
.formula{background:var(--tint);border-radius:10px;padding:10px 14px;font-weight:600;margin:0 0 10px;line-height:1.8}
.pinlines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;overflow:visible}
.pinlines line{stroke:#ffffff;stroke-width:1.3;stroke-opacity:.95;stroke-linecap:round;filter:drop-shadow(0 0 1px rgba(11,77,48,.9))}
.pinlines .on line{stroke:#f5e7a8;stroke-width:1.7}
.pinlines circle{fill:#fff;stroke:#1b8354;stroke-width:1.2;filter:drop-shadow(0 0 1.5px rgba(11,77,48,.6))}
.pin{z-index:3;box-shadow:0 2px 8px rgba(15,107,67,.28)}.pin::before{inset:-5px}
.pin.on{background:#0f6b43;color:#fff;box-shadow:0 0 0 4px #b8eacb,0 2px 10px rgba(15,107,67,.35)}
.pin.on::after{background:#0f6b43;color:#fff;box-shadow:0 4px 14px rgba(15,107,67,.3)}
.xl .xlab{z-index:3}
/* locust additions */
.hopstrip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:10px 0 4px}
.hopstrip figure{margin:0;display:flex;flex-direction:column;gap:4px}
.hopstrip img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;border:1px solid var(--line);cursor:zoom-in;background:#f4f2ec}
.hopstrip figcaption{font-size:11.5px;color:var(--muted);text-align:center;line-height:1.4}
.xray-btn[hidden]{display:none!important}
.note-sm{font-size:13.5px;color:var(--muted);margin:-4px 0 14px}
.bars.eat .bt i{background:var(--gold)}
.as-scene{position:relative;width:min(100%,360px);margin:0 auto 4px;aspect-ratio:360/280;border-radius:18px;overflow:hidden}
.as-desert{display:block;width:100%;height:100%}
.as-loc{position:absolute;width:62%;left:19%;bottom:8%;filter:drop-shadow(0 10px 8px rgba(80,60,20,.28));animation:locLand 1.6s cubic-bezier(.2,.8,.25,1) .5s both}
.as-desert .sw{animation:swFly linear infinite;transform:translate(-30px,var(--y)) scale(var(--s))}
.as-desert .sw .wg{transform-origin:-1px 0;animation:wgFlap .12s linear infinite alternate}
.as-desert .shr{transform-box:fill-box;transform-origin:50% 100%;animation:shGrow .7s ease-out both}
.as-desert .mote{fill:#fff8e4;opacity:.7;animation:mote 7s ease-in-out infinite}
@keyframes swFly{from{transform:translate(390px,var(--y)) scale(var(--s))}to{transform:translate(-30px,calc(var(--y) + 18px)) scale(var(--s))}}
@keyframes wgFlap{from{transform:scaleY(1)}to{transform:scaleY(-.4)}}
@keyframes locLand{from{transform:translate(40%,-60%) rotate(-14deg) scale(.6);opacity:0}to{transform:none;opacity:1}}
@keyframes shGrow{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes mote{0%,100%{transform:translateY(0);opacity:0}50%{transform:translateY(-14px);opacity:.8}}
@media (prefers-reduced-motion:reduce){.as-loc,.as-desert .sw,.as-desert .sw .wg,.as-desert .shr,.as-desert .mote{animation:none}.as-desert .sw{transform:translate(180px,var(--y)) scale(var(--s))}}
'''
body = f'''<title>أطلس الجراد الصحراوي</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@1,500&display=swap">
<style>{r('style.css')}{extra}</style>
<div class="app" dir="rtl" lang="ar">
  <section class="stage" id="stage" aria-label="المشهد ثلاثي الأبعاد">
    <canvas id="gl"></canvas>
    <svg class="pinlines" id="pinlines" aria-hidden="true"></svg>
    <div class="pins" id="pins"></div>
    <div class="xl" id="xl" hidden></div>
    <div class="top"><div class="seg" id="seg" hidden></div><div class="badge" id="badge" hidden></div></div>
    {r('tools.html')}
    <div class="vo-toast" id="voToast" hidden role="status"></div>
    <div class="hint" id="hint">اسحب للتدوير · قرّب بإصبعين أو بعجلة الفأرة</div>
    <img class="mark" alt="" src="{logo}">
  </section>
  <aside class="panel">
    <header class="brand">
      <div class="org"><img alt="شعار وقاء" src="{logo}"><div><b>وقاء</b><span>المركز الوطني للوقاية من الآفات النباتية والأمراض الحيوانية ومكافحتها</span></div></div>
      <span class="eyebrow">مكافحة الجراد الصحراوي · دليل تفاعلي ثلاثي الأبعاد</span>
      <h1>الجراد الصحراوي</h1>
      <p class="sciline"><span class="sci" dir="ltr" lang="la">Schistocerca gregaria</span></p>
    </header>
    <nav class="tabs" id="tabs" role="tablist" aria-label="أقسام الدليل"></nav>
    <div id="content"></div>
    <p class="foot">محتوى توعوي عام ضمن حملات وقاء. الرصد والمكافحة تنفذها فرق وقاء المختصة، وإذا شفت جراداً بلّغ وقاء.</p>
  </aside>
</div>
<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="عرض الصورة"><button type="button" aria-label="إغلاق">×</button><figure><img alt=""><figcaption></figcaption></figure></div>
<div class="attract" id="attract" hidden><div class="att-in"><img id="attLogo" alt=""><div><b>اكتشف الجراد الصحراوي</b><span>المس الشاشة لتبدأ التجربة</span></div></div></div>
<script>{r('photos.js')}</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>{r('vendor/three-extras.js')}</script>
<script>
(function(){{
{r('vendor/hdr.js')}
{r('toolkit.js')}
{r('xr.js')}
{r('locust3d.js')}
{r('ground3d.js')}
{r('field3d.js')}
{r('mapdata.js')}
{r('models.js')}
{r('app.js')}
{r('assess.js')}
}})();
</script>'''
H = '<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
def wrap(s):
    i = s.find('<div class="app"')
    return H + s[:i].rstrip() + '\n<style>html,body{margin:0;padding:0;background:#fff}[hidden]{display:none!important}</style>\n</head>\n<body>\n' + s[i:].rstrip() + '\n</body>\n</html>\n'
def offline(s):
    fc = open(SH + 'fonts/fonts.css').read()
    fc = re.sub(r'url\(([^)]+\.woff2)\)', lambda m: 'url(data:font/woff2;base64,' + base64.b64encode(open(SH + 'fonts/' + m.group(1), 'rb').read()).decode() + ')', fc).replace('\n', '')
    s = re.sub(r'<link rel="preconnect"[^>]*>\n', '', s)
    s = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>', lambda m: '<style>' + fc + '</style>', s)
    three = open(SH + 'vendor/three.r128.min.js').read()
    s = s.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<script>' + three + '</script>')
    s = s.replace('تعذّر تحميل المشهد ثلاثي الأبعاد. تحقق من الاتصال ثم أعد فتح الصفحة.', 'تعذّر تحميل المشهد ثلاثي الأبعاد. أعد فتح الصفحة.')
    assert 'cdnjs' not in s and 'googleapis' not in s
    return s
open(D + 'dev.html', 'w', encoding='utf-8').write(wrap(body))
open(D + 'index.html', 'w', encoding='utf-8').write(wrap(offline(body)))
open(D + 'artifact.html', 'w', encoding='utf-8').write(body)
for f in ('dev.html', 'index.html', 'artifact.html'):
    print(f, os.path.getsize(D + f) // 1024, 'KB')
