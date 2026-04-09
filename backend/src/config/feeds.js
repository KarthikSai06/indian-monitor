// RSS Feed URLs - Cleaned & Updated (March 2026)
const FEEDS = {
  national: [
    { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', source: 'NDTV' },
    { url: 'https://www.thehindu.com/news/feeder/default.rss', source: 'The Hindu' },
    { url: 'https://indianexpress.com/section/india/feed/', source: 'Indian Express' },
    { url: 'https://www.news18.com/commonfeeds/v1/eng/rss/india.xml', source: 'News18 India' },
    { url: 'https://www.firstpost.com/commonfeeds/v1/mfp/rss/india.xml', source: 'Firstpost India' },
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'TOI National' },
  ],

  // ─── State-wise feeds ───
  tamilnadu: [
    { url: 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss', source: 'The Hindu TN' },
    { url: 'https://indianexpress.com/section/cities/chennai/feed/', source: 'Indian Express Chennai' },
    { url: 'https://timesofindia.indiatimes.com/city/chennai/rssfeedstopstories.cms', source: 'TOI Chennai' },
  ],

  karnataka: [
    { url: 'https://www.thehindu.com/news/national/karnataka/feeder/default.rss', source: 'The Hindu Karnataka' },
    { url: 'https://indianexpress.com/section/cities/bangalore/feed/', source: 'Indian Express Bengaluru' },
    { url: 'https://timesofindia.indiatimes.com/city/bangalore/rssfeedstopstories.cms', source: 'TOI Bengaluru' },
  ],

  maharashtra: [
    { url: 'https://indianexpress.com/section/cities/mumbai/feed/', source: 'Indian Express Mumbai' },
    { url: 'https://timesofindia.indiatimes.com/city/mumbai/rssfeedstopstories.cms', source: 'TOI Mumbai' },
    { url: 'https://www.thehindu.com/news/national/maharashtra/feeder/default.rss', source: 'The Hindu Maharashtra' },
  ],

  gujarat: [
    { url: 'https://indianexpress.com/section/cities/ahmedabad/feed/', source: 'Indian Express Ahmedabad' },
    { url: 'https://timesofindia.indiatimes.com/city/ahmedabad/rssfeedstopstories.cms', source: 'TOI Ahmedabad' },
  ],

  rajasthan: [
    { url: 'https://www.hindustantimes.com/feeds/rss/cities/jaipur/rssfeed.xml', source: 'HT Jaipur' },
    { url: 'https://timesofindia.indiatimes.com/city/jaipur/rssfeedstopstories.cms', source: 'TOI Jaipur' },
  ],

  'uttar-pradesh': [
    { url: 'https://indianexpress.com/section/cities/lucknow/feed/', source: 'Indian Express Lucknow' },
    { url: 'https://timesofindia.indiatimes.com/city/lucknow/rssfeedstopstories.cms', source: 'TOI Lucknow' },
    { url: 'https://www.thehindu.com/news/national/uttar-pradesh/feeder/default.rss', source: 'The Hindu UP' },
  ],

  'madhya-pradesh': [
    { url: 'https://timesofindia.indiatimes.com/city/bhopal/rssfeedstopstories.cms', source: 'TOI Bhopal' },
    { url: 'https://www.thehindu.com/news/national/madhya-pradesh/feeder/default.rss', source: 'The Hindu MP' },
  ],

  'west-bengal': [
    { url: 'https://indianexpress.com/section/cities/kolkata/feed/', source: 'Indian Express Kolkata' },
    { url: 'https://timesofindia.indiatimes.com/city/kolkata/rssfeedstopstories.cms', source: 'TOI Kolkata' },
    { url: 'https://www.thehindu.com/news/national/west-bengal/feeder/default.rss', source: 'The Hindu WB' },
  ],

  kerala: [
    { url: 'https://www.thehindu.com/news/national/kerala/feeder/default.rss', source: 'The Hindu Kerala' },
    { url: 'https://timesofindia.indiatimes.com/city/thiruvananthapuram/rssfeedstopstories.cms', source: 'TOI Thiruvananthapuram' },
  ],

  telangana: [
    { url: 'https://www.thehindu.com/news/national/telangana/feeder/default.rss', source: 'The Hindu Telangana' },
    { url: 'https://indianexpress.com/section/cities/hyderabad/feed/', source: 'Indian Express Hyderabad' },
    { url: 'https://timesofindia.indiatimes.com/city/hyderabad/rssfeedstopstories.cms', source: 'TOI Hyderabad' },
  ],

  punjab: [
    { url: 'https://indianexpress.com/section/cities/chandigarh/feed/', source: 'Indian Express Chandigarh' },
    { url: 'https://timesofindia.indiatimes.com/city/chandigarh/rssfeedstopstories.cms', source: 'TOI Chandigarh' },
  ],

  haryana: [
    { url: 'https://indianexpress.com/section/cities/chandigarh/feed/', source: 'Indian Express Chandigarh' },
    { url: 'https://timesofindia.indiatimes.com/city/chandigarh/rssfeedstopstories.cms', source: 'TOI Chandigarh' },
  ],

  bihar: [
    { url: 'https://www.hindustantimes.com/feeds/rss/cities/patna/rssfeed.xml', source: 'HT Patna' },
    { url: 'https://timesofindia.indiatimes.com/city/patna/rssfeedstopstories.cms', source: 'TOI Patna' },
  ],

  odisha: [
    { url: 'https://timesofindia.indiatimes.com/city/bhubaneswar/rssfeedstopstories.cms', source: 'TOI Bhubaneswar' },
    { url: 'https://www.thehindu.com/news/national/odisha/feeder/default.rss', source: 'The Hindu Odisha' },
  ],

  assam: [
    { url: 'https://timesofindia.indiatimes.com/city/guwahati/rssfeedstopstories.cms', source: 'TOI Guwahati' },
    { url: 'https://indianexpress.com/section/north-east-india/assam/feed/', source: 'Indian Express Assam' },
  ],

  jharkhand: [
    { url: 'https://timesofindia.indiatimes.com/city/ranchi/rssfeedstopstories.cms', source: 'TOI Ranchi' },
  ],

  himachal: [
    { url: 'https://timesofindia.indiatimes.com/city/shimla/rssfeedstopstories.cms', source: 'TOI Shimla' },
  ],

  uttarakhand: [
    { url: 'https://timesofindia.indiatimes.com/city/dehradun/rssfeedstopstories.cms', source: 'TOI Dehradun' },
  ],

  delhi: [
    { url: 'https://indianexpress.com/section/cities/delhi/feed/', source: 'Indian Express Delhi' },
    { url: 'https://timesofindia.indiatimes.com/city/delhi/rssfeedstopstories.cms', source: 'TOI Delhi' },
    { url: 'https://www.thehindu.com/news/cities/Delhi/feeder/default.rss', source: 'The Hindu Delhi' },
  ],

  'north-east': [
    { url: 'https://indianexpress.com/section/north-east-india/feed/', source: 'Indian Express North East' },
    { url: 'https://timesofindia.indiatimes.com/city/guwahati/rssfeedstopstories.cms', source: 'TOI Guwahati NE' },
  ],

  andaman: [{ url: 'https://news.google.com/rss/search?q=Andaman+and+Nicobar+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Andaman' }],
  andhra: [{ url: 'https://news.google.com/rss/search?q=Andhra+Pradesh+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News AP' }, { url: 'https://timesofindia.indiatimes.com/city/amaravati/rssfeedstopstories.cms', source: 'TOI AP' }],
  arunachal: [{ url: 'https://news.google.com/rss/search?q=Arunachal+Pradesh+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Arunachal' }],
  chandigarh: [{ url: 'https://news.google.com/rss/search?q=Chandigarh+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Chandigarh' }],
  chhattisgarh: [{ url: 'https://news.google.com/rss/search?q=Chhattisgarh+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Chhattisgarh' }],
  dadra: [{ url: 'https://news.google.com/rss/search?q=Dadra+and+Nagar+Haveli+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Dadra' }],
  goa: [{ url: 'https://news.google.com/rss/search?q=Goa+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Goa' }],
  jammu: [{ url: 'https://news.google.com/rss/search?q=Jammu+and+Kashmir+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News J&K' }],
  ladakh: [{ url: 'https://news.google.com/rss/search?q=Ladakh+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Ladakh' }],
  lakshadweep: [{ url: 'https://news.google.com/rss/search?q=Lakshadweep+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Lakshadweep' }],
  manipur: [{ url: 'https://news.google.com/rss/search?q=Manipur+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Manipur' }],
  meghalaya: [{ url: 'https://news.google.com/rss/search?q=Meghalaya+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Meghalaya' }],
  mizoram: [{ url: 'https://news.google.com/rss/search?q=Mizoram+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Mizoram' }],
  nagaland: [{ url: 'https://news.google.com/rss/search?q=Nagaland+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Nagaland' }],
  puducherry: [{ url: 'https://news.google.com/rss/search?q=Puducherry+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Puducherry' }],
  sikkim: [{ url: 'https://news.google.com/rss/search?q=Sikkim+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Sikkim' }],
  tripura: [{ url: 'https://news.google.com/rss/search?q=Tripura+News&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Tripura' }],

  // ─── Topic feeds ───
  economy: [
    { url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', source: 'Economic Times' },
    { url: 'https://www.thehindubusinessline.com/news/feeder/default.rss', source: 'Business Line' },
    { url: 'https://www.livemint.com/rss/markets', source: 'Livemint Markets' },
  ],

  entertainment: [
    { url: 'https://feeds.feedburner.com/ndtvmovies-latest', source: 'NDTV Movies' },
    { url: 'https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml', source: 'HT Entertainment' },
    { url: 'https://indianexpress.com/section/entertainment/feed/', source: 'Indian Express Entertainment' },
  ],

  sports: [
    { url: 'https://feeds.feedburner.com/ndtvsports-latest', source: 'NDTV Sports' },
    { url: 'https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml', source: 'HT Sports' },
    { url: 'https://indianexpress.com/section/sports/feed/', source: 'Indian Express Sports' },
  ],

  currentaffairs: [
    { url: 'https://www.livemint.com/rss/politics', source: 'Livemint Politics' },
    { url: 'https://www.thehindu.com/opinion/editorial/feeder/default.rss', source: 'The Hindu Editorial' },
    { url: 'https://indianexpress.com/section/opinion/feed/', source: 'Indian Express Opinion' },
  ],

  technology: [
    { url: 'https://feeds.feedburner.com/ndtvgadgets-latest', source: 'NDTV Gadgets' },
    { url: 'https://indianexpress.com/section/technology/feed/', source: 'Indian Express Tech' },
    { url: 'https://www.hindustantimes.com/feeds/rss/technology/rssfeed.xml', source: 'HT Tech' },
    { url: 'https://www.livemint.com/rss/technology', source: 'Livemint Tech' },
  ],

  defence: [
    { url: 'https://feeds.feedburner.com/ndtvnews-latest', source: 'NDTV Defence' },
    { url: 'https://indianexpress.com/section/india/feed/', source: 'Indian Express Defence' },
    { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', source: 'HT Defence' },
    { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu Defence' },
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'TOI Defence' },
  ],

  crime: [
    { url: 'https://feeds.feedburner.com/ndtvnews-latest', source: 'NDTV Crime' },
    { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu Law' },
    { url: 'https://www.hindustantimes.com/feeds/rss/cities/rssfeed.xml', source: 'HT Crime' },
    { url: 'https://indianexpress.com/section/cities/feed/', source: 'Indian Express Crime' },
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'TOI Crime' },
    { url: 'https://www.news18.com/commonfeeds/v1/eng/rss/india.xml', source: 'News18 Crime' },
  ],

  education: [
    { url: 'https://indianexpress.com/section/education/feed/', source: 'Indian Express Education' },
    { url: 'https://www.hindustantimes.com/feeds/rss/education/rssfeed.xml', source: 'HT Education' },
    { url: 'https://timesofindia.indiatimes.com/rssfeeds/913168846.cms', source: 'TOI Education' },
    { url: 'https://www.thehindu.com/education/feeder/default.rss', source: 'The Hindu Education' },
    { url: 'https://www.news18.com/commonfeeds/v1/eng/rss/education-career.xml', source: 'News18 Education & Career' },
    { url: 'https://feeds.feedburner.com/ndtv/education-latest', source: 'NDTV Education' },
  ],
};

module.exports = FEEDS;