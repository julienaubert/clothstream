# see http://stackoverflow.com/questions/23388503/combining-html-files-to-a-index-html
# will continue this route if no better option..

from bs4 import BeautifulSoup
from pathlib import Path


with open(str(Path('app')/'assets'/'index.html')) as index_html_file:
    index_html = BeautifulSoup(index_html_file.read())

with open(str(Path('app')/'assets'/'views'/'collection.html')) as view_html_file:
    view_html = BeautifulSoup(view_html_file.read())

index_html.body.append(view_html)

with open(str(Path('public')/'index.html'), 'w') as out_file:
    out_file.write(index_html.prettify())
