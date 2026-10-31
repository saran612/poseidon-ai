from bs4 import BeautifulSoup
import re

with open(r'd:\SSG_Fullstack_projects\TCS_Hackathon\SAHAYA_CYCLONE_COMPLETE_DATASET\raw_data\APSDMA\apsdma_cyclone_watch.html', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

scripts = soup.find_all('script')
print(f'Found {len(scripts)} script tags')
for s in scripts:
    src = s.get('src')
    if src:
        print('Script src:', src)
    else:
        txt = s.get_text()
        for kw in ['url', 'fetch', 'ajax', 'http', 'api', '.php', '.json', 'dmgDist', 'rainTab']:
            matches = re.findall(rf'[\'"][^\'"]*{kw}[^\'"]*[\'"]', txt, re.IGNORECASE)
            if matches:
                print(f'Found in inline script ({kw}):', set(matches[:5]))

