import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';
import { translateBatch } from '../lib/api';

const FESTIVALS = [
  {
    state: 'Karnataka', festival: 'Mysuru Dasara', month: 'Oct', emoji: '🐘', color: '#FF6600',
    desc: 'Grand 10-day celebration with the iconic elephant procession through Mysuru streets.',
    fullDesc: 'Mysuru Dasara is one of the most spectacular festivals in India, celebrated over 10 days in October. The Mysore Palace is illuminated with 100,000 bulbs every evening. The grand finale features a golden howdah on a caparisoned elephant carrying the idol of Goddess Chamundeshwari through the streets of Mysuru in a procession called Jamboo Savari.',
    traditions: ['Elephant Procession (Jamboo Savari)', 'Palace Illumination (1 lakh lights)', 'Dasara Torch Procession at night', 'Lavish cultural programs & concerts', 'Wrestlers Tournament (Garadi tradition)', 'Flower Show at Doddakere Maidan'],
    highlights: ['Mysore Palace lit up with 1,00,000 bulbs', 'Caparisoned elephant carries 750kg golden howdah', 'UNESCO Cultural Heritage of humanity', 'Attracts 6 million+ visitors every year'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Mysore_palace_illuminated.jpg/1280px-Mysore_palace_illuminated.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Jamboo_Savari_procession_-_Mysore_Dasara_2009.jpg/1280px-Jamboo_Savari_procession_-_Mysore_Dasara_2009.jpg',
    ],
  },
  {
    state: 'Kerala', festival: 'Onam', month: 'Aug', emoji: '🛶', color: '#22c55e',
    desc: 'Harvest festival with Vallam Kali boat race, pookalam flower art, and Onasadya feast.',
    fullDesc: 'Onam is Kerala\'s biggest festival celebrated across 10 days during the Chingam month. It marks the homecoming of the legendary King Mahabali. The celebrations include the magnificent Vallamkali snake boat races on the Pampa river, intricate floral carpets called Pookalams, and the grand Onasadya feast with 26 dishes served on a banana leaf.',
    traditions: ['Pookalam (floral carpet designs)', 'Vallam Kali (snake boat races)', 'Onasadya - 26-dish feast on banana leaf', 'Pulikali (Tiger dance)', 'Thiruvathira Kali dance', 'Onavillu archery tradition'],
    highlights: ['Nehru Trophy Boat Race at Alappuzha', 'Thrissur Pulikali with 200+ painted performers', 'Largest boat race in Asia', 'King Mahabali folklore celebrations'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Snake_boat_race_in_kerala.jpg/1280px-Snake_boat_race_in_kerala.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Pookalam_Onam.jpg/1280px-Pookalam_Onam.jpg',
    ],
  },
  {
    state: 'West Bengal', festival: 'Durga Puja', month: 'Oct', emoji: '🪔', color: '#e74c3c',
    desc: 'Grand pandals, dhunuchi dance, and immersion procession honoring Goddess Durga.',
    fullDesc: 'Durga Puja is West Bengal\'s most important festival, lasting five days from Shashthi to Dashami. Massive artistic pandals (temporary temples) are constructed across Kolkata and Bengal, each with a unique theme. The celebration includes dhak drumbeats, sindoor khela on Dashami where women smear each other with vermilion, and the emotional visarjan (immersion) procession.',
    traditions: ['Pandal hopping (visiting artistic temporary temples)', 'Dhunuchi dance with incense burners', 'Sindoor Khela on Dashami', 'Dhak drumming throughout nights', 'Anjali offerings at dawn', 'Bisarjan (idol immersion) procession'],
    highlights: ['50,000+ pandals across West Bengal', 'UNESCO Intangible Cultural Heritage since 2021', 'One of the world\'s largest outdoor art installations', 'Kolkata streets decorated for millions of visitors'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Durga_Puja_Pandal.jpg/1280px-Durga_Puja_Pandal.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Sindoor_Khela_Durga_Puja_%281%29.jpg/1280px-Sindoor_Khela_Durga_Puja_%281%29.jpg',
    ],
  },
  {
    state: 'Tamil Nadu', festival: 'Pongal', month: 'Jan', emoji: '🍚', color: '#f39c12',
    desc: 'Four-day harvest festival with boiling rice, Jallikattu bull-taming, and kolam art.',
    fullDesc: 'Pongal is a four-day harvest festival celebrated in January. Thai Pongal is the main day when a clay pot is boiled with freshly harvested rice and jaggery outdoors, and people shout "Pongalo Pongal!" as it overflows. Mattu Pongal celebrates cattle, and Jallikattu bull-taming events are held across rural Tamil Nadu with thousands of participants and spectators.',
    traditions: ['Boiling pongal rice in clay pot outdoors', 'Kolam (rangoli) at doorsteps', 'Jallikattu bull-taming at Alanganallur', 'Cattle decoration and Mattu Pongal', 'Sugarcane and turmeric offerings', 'Kanu Pongal — feeding birds'],
    highlights: ['Alanganallur Jallikattu draws 50,000+ crowd', 'Four-day festival of thanksgiving', 'Ancient Dravidian tradition over 2000 years old', 'UNESCO recognition sought for Jallikattu'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Pongal_festival_celebration.jpg/1280px-Pongal_festival_celebration.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Jallikattu.jpg/1280px-Jallikattu.jpg',
    ],
  },
  {
    state: 'Rajasthan', festival: 'Pushkar Camel Fair', month: 'Nov', emoji: '🐫', color: '#e67e22',
    desc: 'World\'s largest camel fair with folk performances, races, and desert celebrations.',
    fullDesc: 'The Pushkar Camel Fair is held annually near the sacred Pushkar Lake in Rajasthan. Over 50,000 camels, horses, and cattle are traded here during a week-long event. The fair is accompanied by folk music, Kalbeliya snake-charmer dances, turban tying competitions, mustache competitions, and ends with a full moon bath in the holy Pushkar lake.',
    traditions: ['Camel trading and decoration contests', 'Camel races and camel beauty contests', 'Kalbeliya folk dance performances', 'Turban tying competitions', 'Hot air balloon rides over fair grounds', 'Holy dip in Pushkar Lake on Kartik Purnima'],
    highlights: ['50,000+ camels gathered in one place', 'One of the world\'s largest livestock fairs', 'Attracts tourists from 60+ countries', 'Full moon Kartik Purnima bath tradition'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/The_Pushkar_Camel_Fair%2C_Rajasthan%2C_India.jpg/1280px-The_Pushkar_Camel_Fair%2C_Rajasthan%2C_India.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Kalbeliya_Dance_Rajasthan.jpg/1280px-Kalbeliya_Dance_Rajasthan.jpg',
    ],
  },
  {
    state: 'Punjab', festival: 'Baisakhi', month: 'Apr', emoji: '💃', color: '#f1c40f',
    desc: 'Harvest festival marking Punjabi New Year with Bhangra, fairs, and langar.',
    fullDesc: 'Baisakhi falls on April 13-14 and marks the Punjabi New Year and wheat harvest season. It also commemorates the formation of the Khalsa Panth in 1699 by Guru Gobind Singh. Massive Baisakhi melas (fairs) are held across Punjab with energetic Bhangra and Giddha performances, langar (community feast) at gurudwaras, and processions.',
    traditions: ['Bhangra and Giddha folk dance performances', 'Nagar Kirtan religious procession', 'Langar (community feast) at Gurudwaras', 'Wheat harvesting celebrations', 'Baisakhi melas and fairs', 'Golden Temple celebrations in Amritsar'],
    highlights: ['Massive celebrations at Golden Temple, Amritsar', 'Origin of Khalsa Panth in 1699', 'Biggest melas at Anandpur Sahib', 'Bhangra competitions across villages'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Baisakhi_celebration.jpg/1280px-Baisakhi_celebration.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Bhangra_performance.jpg/1280px-Bhangra_performance.jpg',
    ],
  },
  {
    state: 'Gujarat', festival: 'Navratri', month: 'Oct', emoji: '🎶', color: '#9b59b6',
    desc: 'Nine nights of Garba and Dandiya Raas dance celebrating Goddess Durga.',
    fullDesc: 'Gujarat\'s Navratri is the world\'s longest dance festival, lasting nine nights. Millions of people dressed in vibrant traditional attire perform Garba (circular dance around a central lamp) and Dandiya Raas (stick dance) in massive open-air venues. Ahmedabad, Vadodara, and Surat host the grandest events with internationally acclaimed performances.',
    traditions: ['Garba dance in circular formations', 'Dandiya Raas stick dance', 'Traditional chaniya choli attire', 'Aarti of Goddess Durga nightly', 'Fasting throughout the nine days', 'Celebrity performances at large pandals'],
    highlights: ['Guinness Record for world\'s largest dance event', 'Millions participate across Gujarat', 'Ahmedabad event draws international visitors', 'Traditional and modern fusion performances'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Garba_Gujarat_Navratri.jpg/1280px-Garba_Gujarat_Navratri.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Dandiya_Raas_dance.jpg/1280px-Dandiya_Raas_dance.jpg',
    ],
  },
  {
    state: 'Maharashtra', festival: 'Ganesh Chaturthi', month: 'Sep', emoji: '🐘', color: '#e74c3c',
    desc: 'Grand Ganpati celebrations with massive idols, processions, and visarjan.',
    fullDesc: 'Ganesh Chaturthi is Maharashtra\'s most beloved festival, celebrated for 10 days. Massive Ganpati idols are installed in homes, colonies, and large public pandals. The Lalbaugcha Raja in Mumbai draws millions of devotees. On the final day (Anant Chaturdashi), idols are carried in massive processions to be immersed in rivers or the sea amid dancing and music.',
    traditions: ['Ganpati idol installation at home and pandals', 'Daily aarti morning and evening', 'Modak (sweet) offerings to Ganesha', 'Elaborate decoration of pandals', 'Visarjan procession on Anant Chaturdashi', 'Dhol-tasha percussion performances'],
    highlights: ['Lalbaugcha Raja in Mumbai — 15 lakh daily visitors', '1.5 lakh idols in Mumbai alone', 'Started by Lokmanya Tilak as a national movement in 1893', 'Pune Kasba Ganpati is the city\'s Manacha Ganpati'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Ganesh_Chaturthi_Mumbai.jpg/1280px-Ganesh_Chaturthi_Mumbai.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Ganpati_Visarjan_Mumbai.jpg/1280px-Ganpati_Visarjan_Mumbai.jpg',
    ],
  },
  {
    state: 'Bihar', festival: 'Chhath Puja', month: 'Nov', emoji: '🌅', color: '#FF9933',
    desc: 'Ancient Vedic worship of Sun God at river ghats with fasting and offerings.',
    fullDesc: 'Chhath Puja is one of the most ancient festivals of India, dedicated to the Sun God Surya and Chhathi Maiya. It is celebrated over four days with rigorous fasting and ritual bathing. The main rituals involve standing in rivers at sunset and sunrise, offering fruits and sugarcane to the rising and setting sun. Millions gather at the Ganges ghats in Patna in a breathtaking spectacle.',
    traditions: ['Nahay Khay — ritual bath and single meal', 'Kharna — fasting from sunrise to moonrise', 'Sandhya Arghya — sunset offerings in river', 'Usha Arghya — sunrise offerings', 'Thekua and fruits as prasad offerings', 'Carrying bamboo baskets with offerings'],
    highlights: ['Millions gather at Patna Ganga ghats', 'One of the most eco-friendly festivals', 'No idol worship — direct sun worship', 'Celebrated across North India, Nepal, and diaspora worldwide'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chhath_Puja_Ganga_Ghat_Patna.jpg/1280px-Chhath_Puja_Ganga_Ghat_Patna.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Chhath_Puja_Offerings.jpg/1280px-Chhath_Puja_Offerings.jpg',
    ],
  },
  {
    state: 'Odisha', festival: 'Rath Yatra', month: 'Jul', emoji: '🛕', color: '#3498db',
    desc: 'Lord Jagannath\'s chariot festival in Puri with massive wooden chariots.',
    fullDesc: 'The Rath Yatra of Puri is one of the world\'s oldest and grandest chariot festivals, held every year in June or July. Three massive wooden chariots carrying Lord Jagannath, his brother Balabhadra, and sister Subhadra are pulled by thousands of devotees along the 3 km Grand Road to Gundicha Temple. The chariots are rebuilt every year from specific trees.',
    traditions: ['Pulling of three massive wooden chariots', 'Chhera Panhara — King sweeps chariot floor', 'Pahandi — deities brought to chariots in procession', 'Chanting of Jagannath Bhajans', 'Prasad (Mahaprasad) distribution', 'Return journey (Bahuda Yatra) after 9 days'],
    highlights: ['Chariot of Lord Jagannath is 45 feet tall', 'Over a million devotees pull the chariots', 'One of India\'s 12 Jyotirlinga equivalents in importance', 'Chariot wood sourced from specific forests of Odisha'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Puri_Rath_Yatra_Odisha.jpg/1280px-Puri_Rath_Yatra_Odisha.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Jagannath_Temple_Puri_India.jpg/1280px-Jagannath_Temple_Puri_India.jpg',
    ],
  },
  {
    state: 'Nagaland', festival: 'Hornbill Festival', month: 'Dec', emoji: '🦅', color: '#d63031',
    desc: '"Festival of Festivals" showcasing all 17 Naga tribes\' traditions at Kisama.',
    fullDesc: 'The Hornbill Festival, held every December at the Naga Heritage Village in Kisama, is called the "Festival of Festivals". It showcases the rich traditions of all 17 Naga tribes including their warrior dances, folk songs, traditional sports like wrestling and archery, handloom weaving, and unique cuisine. It also includes a Hornbill International Rock Music Contest.',
    traditions: ['Traditional Naga warrior dances', 'Naga folk songs and chanting', 'Indigenous sports — wrestling, archery, log pulling', 'Naga food festivals with smoked pork and rice beer', 'Handloom and handicraft exhibitions', 'Hornbill International Rock Music Concert'],
    highlights: ['All 17 Naga tribes represented under one roof', 'Kisama Heritage Village is a UNESCO aspirant site', 'Rock concert attracts international artists', 'Visitors can taste and try all Naga traditions'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Hornbill_Festival_Nagaland_India.jpg/1280px-Hornbill_Festival_Nagaland_India.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Naga_Warriors_Dance_Hornbill.jpg/1280px-Naga_Warriors_Dance_Hornbill.jpg',
    ],
  },
  {
    state: 'Assam', festival: 'Bihu', month: 'Apr', emoji: '🌾', color: '#2ecc71',
    desc: 'Three Bihus celebrate harvest with Bihu dance, husori songs, and petha fights.',
    fullDesc: 'Bihu is a set of three festivals celebrated throughout the year in Assam. Rongali Bihu (April) marks the Assamese New Year and spring with energetic Bihu dances by young men and women. Kongali Bihu (October) is the "sad Bihu" celebrating with earthen lamps. Bhogali Bihu (January) marks the end of harvest with community feasts called Uruka and Meji bonfires.',
    traditions: ['Bihu dance in open fields by youth', 'Husori — door-to-door folk singing', 'Making traditional Bihu sweets (pitha, laru)', 'Meji bonfire (Bhogali Bihu)', 'Uruka — eve feast with community', 'Buffalo fights (Moh-juj) celebration'],
    highlights: ['Rongali Bihu celebrated for entire month of April', 'Bihu dance recognized as India\'s classical dance form', 'Biggest Bihu celebration in Guwahati\'s Sarusajai Stadium', 'Ancient 1500-year-old Assamese tradition'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bihu_dance_Assam.jpg/1280px-Bihu_dance_Assam.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bihu_Festival_Assam_India.jpg/1280px-Bihu_Festival_Assam_India.jpg',
    ],
  },
  {
    state: 'Uttar Pradesh', festival: 'Holi (Braj)', month: 'Mar', emoji: '🎨', color: '#e91e63',
    desc: 'Legendary Lathmar Holi in Barsana with colors, flowers, and ancient traditions.',
    fullDesc: 'Braj (Mathura-Vrindavan) is the birthplace of Lord Krishna and Holi here is the most legendary in India. Lathmar Holi in Barsana sees women chase men with wooden sticks as men try to shield themselves. The festival lasts several days with Phulon Ki Holi (flowers only) at Vrindavan\'s Banke Bihari Temple, color festivals, and Holika Dahan bonfires.',
    traditions: ['Lathmar Holi — women beat men with sticks in Barsana', 'Phulon Ki Holi with flower petals at Vrindavan', 'Holika Dahan bonfire on eve of Holi', 'Abir-Gulal natural color play', 'Holi Milap — community gathering', 'Mathura temple Holi with flowers and gulal'],
    highlights: ['Barsana Lathmar Holi is 5000+ years old tradition', 'Vrindavan Holi lasts 40 days', 'Attracts thousands of foreign tourists', 'Associated with Lord Krishna-Radha love story'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Lathmar_Holi_Barsana.jpg/1280px-Lathmar_Holi_Barsana.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Holi_Colors_Vrindavan.jpg/1280px-Holi_Colors_Vrindavan.jpg',
    ],
  },
  {
    state: 'Himachal Pradesh', festival: 'Kullu Dussehra', month: 'Oct', emoji: '⛰️', color: '#0984e3',
    desc: 'Unique week-long Dussehra with 200+ deities parading through Kullu Valley.',
    fullDesc: 'Kullu Dussehra is celebrated differently from the rest of India — when other places burn Ravana effigies, Kullu holds a grand procession of 200+ local deities gathered from across Himachal Pradesh into the Kullu Dhalpur Maidan. The festival lasts 7 days with folk performances, fairs, and the famous Kullu shawl market.',
    traditions: ['200+ local deities brought in palanquins to Kullu', 'Rath Yatra of Lord Raghunath (Kullu\'s patron deity)', 'Nati folk dance by Kulluvis', 'Lankadhahan (Lanka burning) riverside ritual', 'Massive fair with Kullu shawl market', 'Traditional music with dhol and nagara'],
    highlights: ['International Festival status since 1972', '200+ deities gather in one place', 'Unique tradition not found elsewhere in India', 'Set in scenic Kullu valley with Himalayan backdrop'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Kullu_Dussehra_Himachal_Pradesh.jpg/1280px-Kullu_Dussehra_Himachal_Pradesh.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Kullu_Dhalpur_Maidan_Festival.jpg/1280px-Kullu_Dhalpur_Maidan_Festival.jpg',
    ],
  },
  {
    state: 'Goa', festival: 'Shigmo', month: 'Mar', emoji: '🎭', color: '#1abc9c',
    desc: 'Spring festival with colorful float parades, folk dances, and music.',
    fullDesc: 'Shigmo is Goa\'s version of Holi, celebrated across 14 days. It features a grand float parade (Shigmo Parade) through Panaji, Margao, and Mapusa with elaborately decorated floats depicting Hindu mythology. Folk dances like Dhalo, Romta Mel, and Fugdi are performed. Fields are covered with Shigmo flags in bright colors.',
    traditions: ['Shigmo Grand Parade with mythology floats', 'Dhalo — women\'s midnight dance', 'Romta Mel — street folk performance', 'Fugdi circle dance', 'Shigmo flags across Goan paddy fields', 'Spring rituals honoring Lord Shiva'],
    highlights: ['14-day festival across Goa', 'Grand parade attracts 10,000+ spectators', 'Blend of Hindu and Goan Konkan culture', 'Celebrates spring harvest season'],
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Shigmo_Festival_Goa.jpg/1280px-Shigmo_Festival_Goa.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Shigmo_Float_Parade_Panaji.jpg/1280px-Shigmo_Float_Parade_Panaji.jpg',
    ],
  },
];

// ─── Working image URLs for all festivals (loremflickr = real Flickr photos by tag) ───
const FESTIVAL_IMAGES = {
  'Mysuru Dasara': [
    'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=800&q=80',
    'https://loremflickr.com/800/450/mysore,palace,india,karnataka,night?lock=1',
  ],
  'Onam': [
    'https://images.unsplash.com/photo-1585559604959-a69e5c1a6bf8?w=800&q=80',
    'https://loremflickr.com/800/450/onam,pookalam,flower,kerala?lock=2',
  ],
  'Durga Puja': [
    'https://images.unsplash.com/photo-1570733577524-3a047079e80d?w=800&q=80',
    'https://loremflickr.com/800/450/durga,goddess,worship,kolkata?lock=3',
  ],
  'Pongal': [
    'https://images.unsplash.com/photo-1531514764804-59ba6e46c11d?w=800&q=80',
    'https://loremflickr.com/800/450/pongal,tamil,harvest,festival,kolam?lock=4',
  ],
  'Pushkar Camel Fair': [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
    'https://loremflickr.com/800/450/pushkar,camel,fair,rajasthan,desert?lock=5',
  ],
  'Baisakhi': [
    'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800&q=80',
    'https://loremflickr.com/800/450/golden,temple,amritsar,punjab,india?lock=6',
  ],
  'Navratri': [
    'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&q=80',
    'https://loremflickr.com/800/450/garba,navratri,gujarat,dance,india?lock=7',
  ],
  'Bihu': [
    'https://loremflickr.com/800/450/bihu,dance,assam,festival,india?lock=8',
    'https://loremflickr.com/800/450/assam,culture,traditional,northeast,india?lock=9',
  ],
  'Ganesh Chaturthi': [
    'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=800&q=80',
    'https://loremflickr.com/800/450/ganpati,visarjan,mumbai,procession,india?lock=10',
  ],
  'Chhath Puja': [
    'https://loremflickr.com/800/450/chhath,puja,ganga,river,sunset,india?lock=11',
    'https://loremflickr.com/800/450/sun,worship,river,devotee,india,ghat?lock=12',
  ],
  'Rath Yatra': [
    'https://images.unsplash.com/photo-1561361058-c24e01f8c1a4?w=800&q=80',
    'https://loremflickr.com/800/450/jagannath,temple,puri,odisha,india?lock=13',
  ],
  'Hornbill Festival': [
    'https://loremflickr.com/800/450/naga,tribal,warrior,dance,nagaland,northeast?lock=14',
    'https://loremflickr.com/800/450/hornbill,festival,tribe,india,cultural?lock=15',
  ],
  'Holi (Braj)': [
    'https://images.unsplash.com/photo-1576941089067-2de3c901c803?w=800&q=80',
    'https://loremflickr.com/800/450/holi,colors,festival,india,vrindavan?lock=16',
  ],
  'Kullu Dussehra': [
    'https://loremflickr.com/800/450/kullu,dussehra,himachal,himalaya,festival?lock=17',
    'https://loremflickr.com/800/450/himachal,pradesh,temple,deity,mountain,india?lock=18',
  ],
  'Shigmo': [
    'https://loremflickr.com/800/450/goa,festival,parade,traditional,dance,india?lock=19',
    'https://loremflickr.com/800/450/goa,culture,folk,dance,colorful,india?lock=20',
  ],
};

const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

function useIsMobile(bp = 1024) {
  const [is, setIs] = useState(window.innerWidth < bp);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}

// ─── Festival Detail Modal ──────────────────────────────────────────────────
function FestivalDetail({ f, onClose }) {


  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 820, borderRadius: 24, overflow: 'hidden',
          background: 'var(--bg-card)', border: `1px solid ${f.color}44`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px ${f.color}22`,
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Clean Gradient Header — no images */}
        <div style={{
          padding: '32px 28px 28px',
          background: `linear-gradient(135deg, ${f.color}20 0%, var(--bg-card-solid) 100%)`,
          borderBottom: `1px solid ${f.color}22`, position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16, width: 34, height: 34,
            borderRadius: '50%', border: 'none', background: 'var(--bg-card-solid)',
            color: '#94a3b8', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                width: 80, height: 80, borderRadius: 20, flexShrink: 0,
                background: `${f.color}22`, border: `2px solid ${f.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 42, boxShadow: `0 8px 28px ${f.color}30`,
              }}
            >
              {f.emoji}
            </motion.div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, padding: '3px 10px', borderRadius: 100, background: `${f.color}22`, color: f.color, border: `1px solid ${f.color}45` }}>{f.state}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#64748b' }}>📅 {f.month}</span>
              </div>
              <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{f.festival}</h2>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px 28px' }}>
          {/* About */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 3, height: 16, background: f.color, borderRadius: 2 }} />
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: f.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>About the Festival</div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0, padding: '16px 18px', borderRadius: 12, background: 'var(--bg-card-solid)', border: `1px solid ${f.color}18` }}>
              {f.fullDesc}
            </p>
          </div>

          {/* Traditions + Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: '16px 18px', borderRadius: 14, background: `${f.color}0a`, border: `1px solid ${f.color}22` }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: f.color, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>🎊 Traditions & Rituals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {(f.traditions || []).map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: f.color, fontSize: 10, marginTop: 3, flexShrink: 0 }}>▶</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--bg-card-solid)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>✨ Key Highlights</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(f.highlights || []).map((h, i) => (
                  <div key={i} style={{ padding: '9px 12px', borderRadius: 8, background: `${f.color}08`, border: `1px solid ${f.color}18`, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>

  );
}

// ─── Festival Card ──────────────────────────────────────────────────────────
function FestivalCard({ f, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius)', overflow: 'hidden',
        background: `linear-gradient(135deg, ${f.color}12, ${f.color}04)`,
        border: `1px solid ${f.color}25`,
        cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative',
      }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${f.color}, ${f.color}60, transparent)` }} />
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, padding: '2px 8px', borderRadius: 100, letterSpacing: '0.1em', background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }}>
            {f.state}
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 9, padding: '2px 6px', borderRadius: 100, marginLeft: 'auto', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
            📅 {f.month}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${f.color}30, ${f.color}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: `1px solid ${f.color}25` }}>
            {f.emoji}
          </div>
          <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.2, margin: 0 }}>
            {f.festival}
          </h3>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {f.desc}
        </p>
        <div style={{ marginTop: 10, fontFamily: 'var(--font-ui)', fontSize: 9, color: f.color, fontWeight: 700, letterSpacing: '0.05em' }}>
          Tap to explore →
        </div>
      </div>
    </motion.div>
  );
}

export default function Festivals() {
  const [festivalSearch, setFestivalSearch] = useState('');
  const [showAllFestivals, setShowAllFestivals] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { language } = useStore();
  const [translatedFestivals, setTranslatedFestivals] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => { setTranslatedFestivals({}); }, [language]);

  const handleTranslateAll = async () => {
    if (language === 'en' || isTranslating) return;
    setIsTranslating(true);
    try {
      const texts = FESTIVALS.map(f => `${f.festival}\n${f.desc}`);
      const { translations } = await translateBatch(texts, language);
      const map = {};
      translations.forEach((tx, i) => {
        const [txFestival, ...txDescParts] = tx.split('\n');
        map[FESTIVALS[i].state + FESTIVALS[i].festival] = { festival: txFestival.trim(), desc: txDescParts.join(' ').trim() };
      });
      setTranslatedFestivals(map);
    } catch (e) { console.error('Festival translation failed', e); }
    finally { setIsTranslating(false); }
  };

  const filteredFestivals = useMemo(() => {
    let ff = FESTIVALS;
    if (festivalSearch.trim()) {
      const q = festivalSearch.toLowerCase();
      ff = ff.filter(f => f.state.toLowerCase().includes(q) || f.festival.toLowerCase().includes(q));
    }
    return showAllFestivals ? ff : ff.slice(0, 8);
  }, [festivalSearch, showAllFestivals]);

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
      <div className="page" style={{ paddingTop: 8 }}>
        {/* Banner */}
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 20, border: '1px solid rgba(255,102,0,0.1)', position: 'relative' }}>
          <img src="/festivals-banner.png" alt="Indian Festivals" style={{ width: '100%', height: isMobile ? 120 : 180, objectFit: 'cover', display: 'block', filter: 'brightness(0.88) saturate(1.1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg-card) 10%, rgba(0,0,0,0.15) 50%, transparent 80%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '16px 20px' : '24px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 24 : 32, color: '#FF6600', margin: 0, textShadow: '0 2px 20px rgba(255,102,0,0.5)' }}>🎪 Festivals of India</h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: isMobile ? 11 : 14, color: 'var(--text-secondary)', margin: '4px 0 0', letterSpacing: '0.04em', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
              Click any festival to explore full details, traditions & celebrations
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, pointerEvents: 'none' }}>🔍</span>
            <input
              value={festivalSearch} onChange={e => setFestivalSearch(e.target.value)}
              placeholder="Search state or festival…"
              style={{ width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 20, fontSize: 12, background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-body)' }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 11, color: 'var(--text-muted)' }}>
            {filteredFestivals.length} festivals
          </span>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
          {filteredFestivals.map((f, i) => {
            const key = f.state + f.festival;
            const tx = translatedFestivals[key];
            const displayF = { ...f, festival: tx?.festival || f.festival, desc: tx?.desc || f.desc };
            return <FestivalCard key={key} f={displayF} index={i} onClick={() => setSelectedFestival(f)} />;
          })}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {!festivalSearch.trim() && FESTIVALS.length > 8 && (
            <motion.button onClick={() => setShowAllFestivals(!showAllFestivals)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary" style={{ padding: '8px 28px', fontSize: 13, borderRadius: 10 }}>
              {showAllFestivals ? '▲ Show Less' : `🎪 ${t('sections.viewAll', 'View All')} ${FESTIVALS.length} Festivals →`}
            </motion.button>
          )}
          {language !== 'en' && (
            <motion.button
              onClick={Object.keys(translatedFestivals).length > 0 ? () => setTranslatedFestivals({}) : handleTranslateAll}
              disabled={isTranslating}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '8px 20px', fontSize: 13, borderRadius: 10, cursor: 'pointer', border: '1px solid rgba(255,102,0,0.3)', background: Object.keys(translatedFestivals).length > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(255,102,0,0.08)', color: Object.keys(translatedFestivals).length > 0 ? '#4ade80' : '#FF9933', fontFamily: 'var(--font-ui)', fontWeight: 700 }}
            >
              {isTranslating ? '⏳ Translating…' : Object.keys(translatedFestivals).length > 0 ? '↩ Show Original' : '🌐 Translate Festivals'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Festival Detail Modal */}
      <AnimatePresence>
        {selectedFestival && (
          <FestivalDetail f={selectedFestival} onClose={() => setSelectedFestival(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
