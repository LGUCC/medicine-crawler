A Webscrapper capable of scrapping all medicine data from [dawaai.pk](https://www.dawaai.pk)

## Usage

You probably want to scrap the website for the medicine data you could use this data that I scrapped link is available [here](https://github.com/zain-ul-din-zafar/medicine-crawler/tree/master/data).
if you want to scrap the latest data here are the instructions on how to do that.

1. clone this repo
2. cd into the cloned folder and run `npx yarn` which will install dependencies.
3. run the project by typing `npx yarn dev` command and it will start generating files inside the data folder. Don't forget to clear previous data before running it.

## FAQ

**1. How did you make 4000+ commits?**

Instead of running this crawler locally, i decided to run it on the codespace which is free but the only limitation is that GitHub automatically closes them if they remain idle for 4 hours. 
To save the codespace state I wrote a [handy dandy bash script](https://github.com/zain-ul-din-zafar/medicine-crawler/blob/master/commit.bash) that pushed my code to GitHub after crafting each page data. 
