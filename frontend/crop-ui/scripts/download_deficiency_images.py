import os, re, pathlib, requests
from bs4 import BeautifulSoup

pages = {
    'banana':'https://www.yara.in/crop-nutrition/bananas/nutrient-deficiencies-banana/',
    'citrus':'https://www.yara.in/crop-nutrition/citrus/nutrient-deficiencies-citrus2/',
    'coffee':'https://www.yara.in/crop-nutrition/coffee/nutrient-deficiencies-coffee/',
    'grapes':'https://www.yara.in/crop-nutrition/grapes-table/nutrient-deficiencies-table-grape/',
    'onion':'https://www.yara.in/crop-nutrition/onion/nutrient-deficiencies-onions/',
    'potato':'https://www.yara.in/crop-nutrition/potato/nutrient-deficiencies-potatoes/',
    'sugarcane':'https://www.yara.in/crop-nutrition/sugarcane/nutrient-deficiencies-sugarcane/',
    'tomato':'https://www.yara.in/crop-nutrition/tomato/nutrient-deficiencies-tomato/',
    'cabbage':'https://www.yara.in/crop-nutrition/cabbages/nutrient-deficiencies-cabbage/',
    'cauliflower':'https://www.yara.in/crop-nutrition/cauliflower/nutrient-deficiencies-cauliflower/',
    'broccoli':'https://www.yara.in/crop-nutrition/broccoli/nutrient-deficiencies-broccoli/',
    'wheat':'https://www.yara.in/crop-nutrition/wheat/nutrient-deficiencies-wheat/',
}

output_dir = pathlib.Path('public/assets/nutrient-deficiencies')
output_dir.mkdir(parents=True, exist_ok=True)

headers = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

def download_image(url, filename):
    try:
        r = requests.get(url, headers=headers, timeout=20)
        r.raise_for_status()
        with open(filename, 'wb') as f:
            f.write(r.content)
        print(f'  Downloaded {filename}')
    except Exception as e:
        print(f'  Failed to download {url}: {e}')

for crop, url in pages.items():
    print(f'Processing {crop}: {url}')
    try:
        r = requests.get(url, headers=headers, timeout=20)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Find all deficiency links
        deficiency_links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if f'deficiency-{crop}' in href.lower() or f'deficiency-{crop[:-1]}' in href.lower():  # for plural
                if href.startswith('/'):
                    href = 'https://www.yara.in' + href
                if href not in deficiency_links:
                    deficiency_links.append(href)
        
        print(f'  Found {len(deficiency_links)} deficiency links')
        
        for link in deficiency_links:
            # Extract nutrient from URL
            match = re.search(r'/(\w+)-deficiency-', link)
            if not match:
                continue
            nutrient = match.group(1).capitalize()
            
            filename = output_dir / f'{crop}_{nutrient}_deficiency.jpg'
            if filename.exists():
                print(f'  Skipping {crop}_{nutrient}_deficiency.jpg (already exists)')
                continue
            
            # Scrape the deficiency page
            try:
                r2 = requests.get(link, headers=headers, timeout=20)
                r2.raise_for_status()
                soup2 = BeautifulSoup(r2.text, 'html.parser')
                
                print(f'  Found {len(soup2.find_all("img"))} img tags in {link}')
                
                # Find images
                imgs = []
                for img in soup2.find_all('img'):
                    src = img.get('src') or img.get('data-src')
                    if not src:
                        continue
                    if src.startswith('//'):
                        src = 'https:' + src
                    if src.startswith('/'):
                        src = 'https://www.yara.in' + src
                    if not src.startswith('http'):
                        continue
                    # Skip logos, icons, etc.
                    if any(skip in src.lower() for skip in ['logo', 'icon', 'flag', 'facebook', 'twitter', 'linkedin', 'youtube', 'svg', 'gif']):
                        continue
                    # Accept any remaining image
                    imgs.append(src)
                
                print(f'  After filter: {len(imgs)} images')
                
                if imgs:
                    # Download the first image
                    download_image(imgs[0], filename)
                else:
                    print(f'  No suitable image found for {crop} {nutrient}')
                    
            except Exception as e:
                print(f'  Failed to process {link}: {e}')
                
    except Exception as e:
        print(f'Failed to process {crop}: {e}')

print('Download complete.')