# I need to separate this in collabs because it make the proggress faster 

# Code part 1
!pip install requests beautifulsoup4

# Code part 2
from google.colab import drive
# Mount Google Drive
drive.mount('/content/drive')

# Code part 3
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import os

# URL of the website to combine when download image
website_url = 'https://example.com/demos/barber/'
# Main page to scrape for links
main_page = 'https://example.com/demos/barber/index.html'

# Local directory to save images
save_dir = '/content/drive/My Drive/barber'

# Ensure the save directory exists
if not os.path.exists(save_dir):
    os.makedirs(save_dir)

# Function to get all links from a webpage
def get_links(page_url):
    links = []
    response = requests.get(page_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    for a in soup.find_all('a', href=True):
        link = a['href']
        if (link.startswith('http')):
          link = link
        elif link.startswith('/'):
          link = website_url + link
        links.append(link)
    return links

# Function to get image URLs from a webpage
def get_image_urls(page_url):
    image_urls = []
    if (page_url != '#'):
      if (page_url.startswith('http')):
        page_url = page_url
      else:
        page_url = website_url + page_url

      response = requests.get(page_url)
      soup = BeautifulSoup(response.text, 'html.parser')
      for img in soup.find_all('img'):
          img_url = img.get('src')
          if img_url:
              if img_url.startswith('/'):
                  img_url = website_url + img_url
              image_urls.append(img_url)
    return image_urls

# Function to download and save an image
def download_image(img_url):
    response = requests.get(website_url + img_url, stream=True)
    if response.status_code == 200:
        # Extract the subfolder path
        parsed_url = urlparse(img_url)
        subfolder_path = os.path.dirname(parsed_url.path.lstrip('/'))
        img_name = os.path.basename(parsed_url.path)

        # Create subfolder structure in save_dir
        full_path = os.path.join(save_dir, subfolder_path)
        if not os.path.exists(full_path):
            os.makedirs(full_path)

        # Save the image
        img_path = os.path.join(full_path, img_name)
        with open(img_path, 'wb') as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)



# Get links from the main page
print(f'Scraping main page: {main_page}')
links = get_links(main_page)
blink = list(set(links))

# Scrape each link to get images
for idx, link in enumerate(blink):
    if (link != '#'):
      if (link.startswith('http')):
        link = link
      else:
        link = website_url + '/' + link
      print(f'Scraping link {idx + 1}/{len(blink)}: {link}')
      image_urls = get_image_urls(link)
      for img_url in image_urls:
          print(f'Downloading image: {img_url}')
          download_image(img_url)

print('Download completed.')

# this is for google collab version, the approach is to search and get all image from the demo page then download,
# still can be improve but this working for my need today