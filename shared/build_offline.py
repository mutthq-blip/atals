#!/usr/bin/env python3
"""Turn an atlas index.html (which loads three.js / fonts from CDN and local css/js files)
into ONE self-contained offline HTML file.

usage: python3 shared/build_offline.py palm-weevil/index.html dist/weqaa-palm-weevil-atlas.html
"""
import os,re,sys,base64
HERE=os.path.dirname(os.path.abspath(__file__))
src,dst=sys.argv[1],sys.argv[2]
base=os.path.dirname(os.path.abspath(src))
s=open(src,encoding='utf-8').read()
# fonts: Google Fonts link -> embedded woff2 (fonts.css lists the faces)
fc=open(HERE+'/fonts/fonts.css').read()
fc=re.sub(r'url\(([^)]+\.woff2)\)',lambda m:'url(data:font/woff2;base64,'+base64.b64encode(open(HERE+'/fonts/'+m.group(1),'rb').read()).decode()+')',fc)
fc=fc.replace('\n','')
s=re.sub(r'<link rel="preconnect"[^>]*>\n','',s)
s=re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>',lambda m:'<style>'+fc+'</style>',s)
# three.js CDN -> inline
three=open(HERE+'/vendor/three.r128.min.js').read()
s=s.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>','<script>'+three+'</script>')
# local css/js -> inline (photos/ and audio/ stay external: they are optional override files)
KEEP=('photos/','audio/','http')
def js(m):
    p=m.group(1)
    if p.startswith(KEEP):return m.group(0)
    return '<script>'+open(os.path.join(base,p),encoding='utf-8').read()+'</script>'
def css(m):
    p=m.group(1)
    if p.startswith(KEEP):return m.group(0)
    return '<style>'+open(os.path.join(base,p),encoding='utf-8').read()+'</style>'
s=re.sub(r'<script src="([^"]+)"></script>',js,s)
s=re.sub(r'<link rel="stylesheet" href="([^"]+)">',css,s)
s=s.replace('تعذّر تحميل المشهد ثلاثي الأبعاد. تحقق من الاتصال ثم أعد فتح الصفحة.','تعذّر تحميل المشهد ثلاثي الأبعاد. أعد فتح الصفحة.')
assert 'cdnjs' not in s and 'googleapis' not in s
os.makedirs(os.path.dirname(os.path.abspath(dst)),exist_ok=True)
open(dst,'w',encoding='utf-8').write(s)
print(dst,os.path.getsize(dst)//1024,'KB')
