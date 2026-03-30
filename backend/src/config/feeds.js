// RSS Feed URLs organized by category
const FEEDS = {
  national: [
    { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', source: 'NDTV' },
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'Times of India' },
    { url: 'https://www.thehindu.com/news/feeder/default.rss', source: 'The Hindu' },
    { url: 'https://www.indiatoday.in/rss/home', source: 'India Today' },
    { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', source: 'Hindustan Times' },
  ],
  // ─── State-wise feeds ───
  tamilnadu: [
    { url: 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss', source: 'The Hindu' },
    { url: 'https://timesofindia.indiatimes.com/city/chennai/rssfeedstopstories.cms', source: 'TOI Chennai' },
  ],
  karnataka: [
    { url: 'https://www.thehindu.com/news/national/karnataka/feeder/default.rss', source: 'The Hindu' },
    { url: 'https://timesofindia.indiatimes.com/city/bengaluru/rssfeedstopstories.cms', source: 'TOI Bengaluru' },
  ],
  maharashtra: [
    { url: 'https://timesofindia.indiatimes.com/city/mumbai/rssfeedstopstories.cms', source: 'TOI Mumbai' },
  ],
  gujarat: [
    { url: 'https://timesofindia.indiatimes.com/city/ahmedabad/rssfeedstopstories.cms', source: 'TOI Ahmedabad' },
  ],
  rajasthan: [
    { url: 'https://timesofindia.indiatimes.com/city/jaipur/rssfeedstopstories.cms', source: 'TOI Jaipur' },
  ],
  'uttar-pradesh': [
    { url: 'https://timesofindia.indiatimes.com/city/lucknow/rssfeedstopstories.cms', source: 'TOI Lucknow' },
  ],
  'madhya-pradesh': [
    { url: 'https://timesofindia.indiatimes.com/city/bhopal/rssfeedstopstories.cms', source: 'TOI Bhopal' },
  ],
  'west-bengal': [
    { url: 'https://timesofindia.indiatimes.com/city/kolkata/rssfeedstopstories.cms', source: 'TOI Kolkata' },
  ],
  kerala: [
    { url: 'https://www.thehindu.com/news/national/kerala/feeder/default.rss', source: 'The Hindu' },
  ],
  telangana: [
    { url: 'https://timesofindia.indiatimes.com/city/hyderabad/rssfeedstopstories.cms', source: 'TOI Hyderabad' },
  ],
  punjab: [
    { url: 'https://timesofindia.indiatimes.com/city/chandigarh/rssfeedstopstories.cms', source: 'TOI Chandigarh' },
  ],
  haryana: [
    { url: 'https://timesofindia.indiatimes.com/city/chandigarh/rssfeedstopstories.cms', source: 'TOI Chandigarh' },
  ],
  bihar: [
    { url: 'https://timesofindia.indiatimes.com/city/patna/rssfeedstopstories.cms', source: 'TOI Patna' },
  ],
  odisha: [
    { url: 'https://timesofindia.indiatimes.com/city/bhubaneswar/rssfeedstopstories.cms', source: 'TOI Bhubaneswar' },
  ],
  assam: [
    { url: 'https://timesofindia.indiatimes.com/city/guwahati/rssfeedstopstories.cms', source: 'TOI Guwahati' },
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
  goa: [
    { url: 'https://timesofindia.indiatimes.com/city/goa/rssfeedstopstories.cms', source: 'TOI Goa' },
  ],
  andhra: [
    { url: 'https://timesofindia.indiatimes.com/city/visakhapatnam/rssfeedstopstories.cms', source: 'TOI Vizag' },
  ],
  // ─── Topic feeds ───
  economy: [
    { url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', source: 'Economic Times' },
    { url: 'https://www.moneycontrol.com/rss/latestnews.xml', source: 'Moneycontrol' },
  ],
  // Entertainment: use feeds that include og:image / media thumbnails
  entertainment: [
    { url: 'https://feeds.feedburner.com/ndtvmovies-latest', source: 'NDTV Movies' },
    { url: 'https://timesofindia.indiatimes.com/rss/4719148.cms', source: 'TOI Bollywood' },
    { url: 'https://www.indiatoday.in/rss/1206514', source: 'India Today Entertainment' },
  ],
  sports: [
    { url: 'https://feeds.feedburner.com/ndtvsports-latest', source: 'NDTV Sports' },
    { url: 'https://timesofindia.indiatimes.com/rss/7098551.cms', source: 'TOI Sports' },
  ],
  // Current Affairs: English-only PIB (Lang=3 = English) + The Hindu Opinion
  currentaffairs: [
    { url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=3&Regid=3', source: 'PIB India' },
    { url: 'https://www.thehindu.com/opinion/editorial/feeder/default.rss', source: 'The Hindu Editorial' },
    { url: 'https://www.thehindu.com/opinion/op-ed/feeder/default.rss', source: 'The Hindu Op-Ed' },
  ],
};

module.exports = FEEDS;
