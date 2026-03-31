import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';

// ─── Custom DivIcon factories ─────────────────────────────────────────────────────────
const nuclearIcon = L.divIcon({
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
  html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 6px #00cec9);">
    <svg viewBox="0 0 100 100" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
      <!-- Trefoil nuclear hazard symbol -->
      <circle cx="50" cy="50" r="12" fill="#00cec9"/>
      <path d="M50 38 A12 12 0 0 1 50 62 L28 99 A48 48 0 0 0 72 99 Z" fill="#00cec9" opacity="0.9"/>
      <path d="M50 38 A12 12 0 0 0 28 59 L4 22 A48 48 0 0 0 28 99 Z" fill="#00cec9" opacity="0.9" transform="rotate(120 50 50)"/>
      <path d="M50 38 A12 12 0 0 0 28 59 L4 22 A48 48 0 0 0 28 99 Z" fill="#00cec9" opacity="0.9" transform="rotate(240 50 50)"/>
      <circle cx="50" cy="50" r="10" fill="#001f1f"/>
      <circle cx="50" cy="50" r="5" fill="#00cec9"/>
    </svg>
  </div>`,
});

const militaryIcon = L.divIcon({
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -16],
  html: `<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #e74c3c);">
    <svg viewBox="0 0 100 100" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
      <!-- Five-pointed military star -->
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#e74c3c" stroke="#ff6b6b" stroke-width="2"/>
    </svg>
  </div>`,
});

const monumentIcon = L.divIcon({
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
  html: `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 5px #f1c40f);font-size:18px;line-height:1;">🏛</div>`,
});
import { useQuery } from '@tanstack/react-query';
const pv = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

// ─── Static fallback incidents ──────────────────────────────────────────────
const STATIC_INCIDENTS = [
  { id: 1, name: 'Delhi — Protest',         pos: [28.61, 77.21], type: 'alert', desc: 'Large-scale protest at India Gate. Traffic disrupted on key routes.' },
  { id: 2, name: 'Mumbai — Flood Advisory', pos: [19.07, 72.87], type: 'warn',  desc: 'Heavy rainfall expected. Low-lying area flood advisory issued.' },
  { id: 3, name: 'Bengaluru — Tech Summit', pos: [12.97, 77.59], type: 'safe',  desc: 'International Tech Summit underway at BIEC, Bengaluru.' },
  { id: 4, name: 'Chennai — Cyclone Watch', pos: [13.08, 80.27], type: 'alert', desc: 'IMD issues cyclone watch. Coastal areas on high alert.' },
  { id: 5, name: 'Jaipur — Festival',       pos: [26.92, 75.78], type: 'safe',  desc: 'Jaipur Literature Festival draws record 1.2 lakh attendees.' },
  { id: 6, name: 'Kolkata — Strike',        pos: [22.57, 88.36], type: 'warn',  desc: 'Trade union strike affects city transport.' },
  { id: 7, name: 'Patna — Flood',           pos: [25.60, 85.11], type: 'alert', desc: 'River Ganga overflows; rescue teams deployed in 12 districts.' },
  { id: 8, name: 'Hyderabad — Event',       pos: [17.38, 78.48], type: 'safe',  desc: 'CII Partnership Summit inaugurated by CM.' },
];
const TYPE = { alert: '#ef4444', warn: '#eab308', safe: '#22c55e' };
const TYPE_ICON = { alert: '🚨', warn: '⚠️', safe: '✅' };
const TYPE_LABEL = { alert: 'ALERT', warn: 'WARNING', safe: 'SAFE' };

// ─── Simplified India boundary GeoJSON for map highlighting ──────────────────
const INDIA_GEO = {
  type: 'Feature',
  properties: { name: 'India' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [68.17, 23.69], [68.86, 24.27], [70.46, 25.72], [69.62, 27.47],
      [70.26, 28.02], [71.10, 27.83], [72.18, 28.42], [72.84, 28.96],
      [73.45, 29.98], [74.42, 30.98], [75.07, 32.24], [74.62, 33.12],
      [74.15, 33.49], [73.75, 34.32], [74.24, 34.75], [75.76, 34.50],
      [76.87, 34.66], [77.84, 35.49], [78.91, 34.32], [78.81, 33.51],
      [79.21, 32.56], [79.18, 31.38], [80.09, 30.57], [80.48, 29.73],
      [81.11, 30.18], [81.53, 30.43], [82.33, 30.13], [83.34, 29.46],
      [84.23, 28.84], [85.01, 28.64], [85.82, 28.20], [86.95, 27.97],
      [88.12, 27.88], [88.73, 28.09], [88.81, 27.30], [88.14, 25.81],
      [89.83, 25.97], [89.70, 26.72], [92.10, 26.86], [92.03, 25.92],
      [91.22, 25.50], [90.59, 25.17], [92.49, 24.23], [94.16, 23.85],
      [95.12, 22.77], [93.17, 22.28], [93.06, 21.32], [92.37, 20.67],
      [92.08, 21.19], [92.24, 20.47], [90.95, 22.09], [89.18, 21.61],
      [88.93, 22.25], [88.27, 21.49], [87.03, 21.55], [86.83, 21.14],
      [85.72, 21.07], [84.20, 20.51], [83.94, 18.30], [81.50, 16.00],
      [80.27, 15.80], [80.05, 13.84], [80.19, 12.75], [79.86, 11.98],
      [79.45, 11.11], [79.17, 10.38], [78.42, 9.12], [77.94, 8.25],
      [77.54, 8.08], [76.65, 8.90], [76.25, 9.83], [75.92, 10.88],
      [75.72, 11.36], [75.40, 11.78], [74.86, 12.74], [74.62, 13.99],
      [73.88, 15.38], [73.53, 15.99], [72.82, 17.26], [72.68, 18.05],
      [72.79, 19.21], [72.58, 19.93], [72.26, 20.74], [71.66, 21.12],
      [70.61, 20.89], [69.50, 22.85], [68.97, 22.69], [68.17, 23.69],
    ]],
  },
};

// ─── Map Layer Data ─────────────────────────────────────────────────────────
const MONUMENTS = [
  { id: 'm1',  name: 'Taj Mahal',             pos: [27.1751, 78.0421], desc: 'UNESCO World Heritage Site — 17th century Mughal mausoleum in Agra, Uttar Pradesh.' },
  { id: 'm2',  name: 'Red Fort',               pos: [28.6562, 77.2410], desc: 'Mughal-era historic fortress in Delhi, site of Independence Day celebrations.' },
  { id: 'm3',  name: 'Qutub Minar',            pos: [28.5244, 77.1855], desc: 'UNESCO-listed 73m minaret built in 1193 AD in Delhi.' },
  { id: 'm4',  name: 'India Gate',             pos: [28.6129, 77.2295], desc: 'War memorial on Rajpath, New Delhi, dedicated to 82,000 soldiers.' },
  { id: 'm5',  name: 'Gateway of India',       pos: [18.9220, 72.8347], desc: 'Iconic 1924 arch monument in Mumbai overlooking the Arabian Sea.' },
  { id: 'm6',  name: 'Charminar',              pos: [17.3616, 78.4747], desc: '16th century mosque and monument — heart of Hyderabad.' },
  { id: 'm7',  name: 'Mysore Palace',          pos: [12.3052, 76.6552], desc: 'Opulent royal palace of the Wadiyar dynasty in Karnataka.' },
  { id: 'm8',  name: 'Hawa Mahal',             pos: [26.9239, 75.8267], desc: 'Palace of Winds — five-storey pink sandstone facade in Jaipur.' },
  { id: 'm9',  name: 'Konark Sun Temple',      pos: [19.8876, 86.0945], desc: 'UNESCO-listed 13th century temple shaped like a chariot in Odisha.' },
  { id: 'm10', name: 'Hampi Ruins',            pos: [15.3350, 76.4600], desc: 'UNESCO-listed ruins of the Vijayanagara Empire in Karnataka.' },
  { id: 'm11', name: 'Ajanta Caves',           pos: [20.5519, 75.7033], desc: 'UNESCO-listed 2nd century BC rock-cut Buddhist caves in Maharashtra.' },
  { id: 'm12', name: 'Ellora Caves',           pos: [20.0269, 75.1780], desc: 'UNESCO-listed caves with Hindu, Buddhist & Jain temples in Maharashtra.' },
  { id: 'm13', name: 'Khajuraho Temples',      pos: [24.8318, 79.9199], desc: 'UNESCO-listed medieval Hindu and Jain temples in Madhya Pradesh.' },
  { id: 'm14', name: 'Victoria Memorial',       pos: [22.5448, 88.3426], desc: 'Marble monument built 1906–1921 in Kolkata, now a museum.' },
  { id: 'm15', name: 'Golden Temple',           pos: [31.6200, 74.8765], desc: 'Harmandir Sahib — holiest shrine of Sikhism in Amritsar, Punjab.' },
  { id: 'm16', name: 'Meenakshi Temple',        pos: [9.9195, 78.1193],  desc: 'Ancient 14-tower Dravidian temple complex in Madurai, Tamil Nadu.' },
  { id: 'm17', name: 'Brihadeeswara Temple',    pos: [10.7828, 79.1318],  desc: 'UNESCO-listed Chola dynasty temple built in 1010 AD in Thanjavur.' },
  { id: 'm18', name: 'Sun Temple Modhera',      pos: [23.5840, 72.1310],  desc: '11th century sun temple built by Chalukya dynasty in Gujarat.' },
  { id: 'm19', name: 'Rani Ki Vav',             pos: [23.8587, 72.1010],  desc: 'UNESCO-listed 11th century stepwell in Patan, Gujarat.' },
  { id: 'm20', name: 'Sanchi Stupa',            pos: [23.4793, 77.7400],  desc: 'UNESCO-listed 3rd century BC Buddhist stupa commissioned by Emperor Ashoka.' },
  { id: 'm21', name: 'Fatehpur Sikri',          pos: [27.0940, 77.6610],  desc: 'UNESCO-listed Mughal capital city built by Akbar near Agra.' },
  { id: 'm22', name: 'Amber Fort',              pos: [26.9855, 75.8513],  desc: 'Majestic hilltop fort-palace complex near Jaipur, Rajasthan.' },
  { id: 'm23', name: 'Mehrangarh Fort',         pos: [26.2980, 73.0180],  desc: 'Towering 15th century fort overlooking Jodhpur, Rajasthan.' },
  { id: 'm24', name: 'Lotus Temple',            pos: [28.5535, 77.2588],  desc: 'Bahá\'í House of Worship — iconic petal-shaped structure in Delhi.' },
  { id: 'm25', name: 'Rashtrapati Bhavan',      pos: [28.6143, 77.1993],  desc: 'Former Viceroy\'s House — official residence of the President of India.' },
  { id: 'm26', name: 'Nalanda University Ruins',pos: [25.1358, 85.4430],  desc: 'UNESCO-listed ruins of 5th century Nalanda — world\'s first residential university.' },
  { id: 'm27', name: 'Mountain Monastery Hemis',pos: [33.9200, 77.7089],  desc: 'Largest Buddhist monastery in Ladakh, India.' },
  { id: 'm28', name: 'Varanasi Ghats',          pos: [25.3176, 83.0130],  desc: 'Ancient sacred ghats along the Ganges — one of the world\'s oldest cities.' },
  { id: 'm29', name: 'Mahabalipuram Shore Temp',pos: [12.6189, 80.1996],  desc: 'UNESCO cave temples and rathas carved by Pallava kings in Tamil Nadu.' },
  { id: 'm30', name: 'Agra Fort',               pos: [27.1795, 78.0211],  desc: 'UNESCO-listed 16th century Mughal fortress and palace complex.' },
];

const MILITARY_BASES = [
  { id: 'mb1',  name: 'INS Vikramaditya Base',   pos: [15.4589, 73.9720], desc: 'Aircraft carrier INS Vikramaditya home port at Karwar Naval Base, Goa.' },
  { id: 'mb2',  name: 'Ambala Air Force Station', pos: [30.3800, 76.7766], desc: 'IAF Western Air Command base — home of Rafale fighter jets.' },
  { id: 'mb3',  name: 'Hindon Air Force Base',    pos: [28.7010, 77.3890], desc: 'Largest IAF base in Asia, located near Ghaziabad, Uttar Pradesh.' },
  { id: 'mb4',  name: 'INS Kadamba (Karwar)',      pos: [14.8126, 74.1317], desc: 'Largest naval base in India — Project Seabird, Karnataka.' },
  { id: 'mb5',  name: 'Jodhpur Air Force Station', pos: [26.2510, 73.0490], desc: 'Key Western Sector IAF base for strike and transport aircraft.' },
  { id: 'mb6',  name: 'Eastern Naval Command',    pos: [17.6900, 83.2200], desc: 'Headquarters of Eastern Naval Command, Visakhapatnam.' },
  { id: 'mb7',  name: 'Western Naval Command',    pos: [18.9630, 72.8290], desc: 'Western Naval Command HQ, Mumbai — controls Arabian Sea operations.' },
  { id: 'mb8',  name: 'Tezpur Air Base',           pos: [26.7090, 92.7840], desc: 'IAF Eastern Command strategic base near China border, Assam.' },
  { id: 'mb9',  name: 'Sukhna Military Station',   pos: [30.7700, 76.8560], desc: 'Major Indian Army Headquarters in Chandigarh.' },
  { id: 'mb10', name: 'Pathankot Airbase',          pos: [32.2340, 75.6350], desc: 'Frontline IAF base in Punjab near Pakistan border.' },
  { id: 'mb11', name: 'Srinagar Air Base',          pos: [34.0050, 74.7760], desc: 'High-altitude IAF base for Kashmir Valley operations.' },
  { id: 'mb12', name: 'Port Blair Naval Base',      pos: [11.6695, 92.7460], desc: 'Andaman & Nicobar Command — India\'s only tri-service command.' },
  { id: 'mb13', name: 'Leh Air Base',               pos: [34.1350, 77.5460], desc: 'World\'s highest operational airport used by IAF, Ladakh.' },
  { id: 'mb14', name: 'Wellington Military Station',pos: [11.3730, 76.7970], desc: 'Defence Services Staff College, Nilgiris, Tamil Nadu.' },
  { id: 'mb15', name: 'INS Circars (Vizag)',        pos: [17.7500, 83.2980], desc: 'Primary Eastern Naval Command submarine base.' },
];

const NUCLEAR_SITES = [
  { id: 'n1',  name: 'Pokhran Test Site',        pos: [27.0060, 71.5600], desc: '☢️ Pokhran, Rajasthan — Site of 1974 Smiling Buddha & 1998 Pokhran-II nuclear tests.' },
  { id: 'n2',  name: 'BARC (Trombay)',            pos: [19.0176, 72.9144], desc: '🔬 Bhabha Atomic Research Centre — India\'s primary nuclear research facility, Mumbai.' },
  { id: 'n3',  name: 'NPCIL Tarapur',             pos: [19.8380, 72.6540], desc: '⚡ Tarapur Atomic Power Station — India\'s first and oldest nuclear power plant, Maharashtra.' },
  { id: 'n4',  name: 'Kudankulam NPP',            pos: [8.1700, 77.7060],  desc: '⚡ Kudankulam Nuclear Power Plant — Russia-India built VVER reactors in Tamil Nadu.' },
  { id: 'n5',  name: 'Kalpakkam NPP',             pos: [12.5520, 80.1710], desc: '⚡ Madras Atomic Power Station & PFBR Fast Breeder Reactor, Tamil Nadu.' },
  { id: 'n6',  name: 'Narora Atomic Power Station',pos: [28.1950, 78.3740], desc: '⚡ Two PHWR reactors in Narora, Uttar Pradesh.' },
  { id: 'n7',  name: 'Kakrapar Atomic Station',   pos: [21.2430, 73.3760], desc: '⚡ Pressurised Heavy Water Reactors in Kakrapar, Gujarat.' },
  { id: 'n8',  name: 'Rawatbhata Nuclear Station', pos: [24.9300, 75.5900], desc: '⚡ Rajasthan Atomic Power Station — largest nuclear complex by number of units.' },
  { id: 'n9',  name: 'INS Arihant (SSBN Base)',   pos: [17.6850, 83.2870], desc: '☢️ Submarine base for INS Arihant — India\'s nuclear-powered ballistic missile submarine.' },
  { id: 'n10', name: 'Uranium Corp. Jaduguda',    pos: [22.6580, 86.3480], desc: '⛏️ India\'s first uranium mining site, Jharkhand — operated by UCIL since 1967.' },
  { id: 'n11', name: 'Gorakhpur NPP (planned)',   pos: [29.4488, 75.6690], desc: '🔧 Planned NPCIL nuclear power project in Haryana (under construction).' },
  { id: 'n12', name: 'Advanced Technology Vessel', pos: [13.6550, 79.4500], desc: '🔬 INS Arihant built at Shipbuilding Centre, Visakhapatnam — naval nuclear propulsion.' },
];

// ─── Indian Festivals — All 29 States + 7 UTs ─────────────────────────────
const FESTIVALS = [
  { state: 'Karnataka',        festival: 'Mysuru Dasara',        month: 'Oct',  emoji: '🐘', color: '#FF6600',  desc: 'Grand 10-day celebration with the iconic elephant procession through Mysuru streets.' },
  { state: 'Kerala',           festival: 'Onam',                 month: 'Aug',  emoji: '🛶', color: '#22c55e',  desc: 'Harvest festival with Vallam Kali boat race, pookalam flower art, and Onasadya feast.' },
  { state: 'West Bengal',      festival: 'Durga Puja',           month: 'Oct',  emoji: '🪔', color: '#e74c3c',  desc: 'Grand pandals, dhunuchi dance, and immersion procession honoring Goddess Durga.' },
  { state: 'Tamil Nadu',       festival: 'Pongal',               month: 'Jan',  emoji: '🍚', color: '#f39c12',  desc: 'Four-day harvest festival with boiling rice, Jallikattu bull-taming, and kolam art.' },
  { state: 'Rajasthan',        festival: 'Pushkar Camel Fair',   month: 'Nov',  emoji: '🐫', color: '#e67e22',  desc: 'World\'s largest camel fair with folk performances, races, and desert celebrations.' },
  { state: 'Punjab',           festival: 'Baisakhi',             month: 'Apr',  emoji: '💃', color: '#f1c40f',  desc: 'Harvest festival marking Punjabi New Year with Bhangra, fairs, and langar.' },
  { state: 'Gujarat',          festival: 'Navratri',             month: 'Oct',  emoji: '🎶', color: '#9b59b6',  desc: 'Nine nights of Garba and Dandiya Raas dance celebrating Goddess Durga.' },
  { state: 'Assam',            festival: 'Bihu',                 month: 'Apr',  emoji: '🌾', color: '#2ecc71',  desc: 'Three Bihus celebrate harvest with Bihu dance, husori songs, and petha fights.' },
  { state: 'Maharashtra',      festival: 'Ganesh Chaturthi',     month: 'Sep',  emoji: '🐘', color: '#e74c3c',  desc: 'Grand Ganpati celebrations with massive idols, processions, and visarjan.' },
  { state: 'Goa',              festival: 'Shigmo',               month: 'Mar',  emoji: '🎭', color: '#1abc9c',  desc: 'Spring festival with colorful float parades, folk dances, and music.' },
  { state: 'Uttar Pradesh',    festival: 'Holi (Braj)',          month: 'Mar',  emoji: '🎨', color: '#e91e63',  desc: 'Legendary Lathmar Holi in Barsana with colors, flowers, and ancient traditions.' },
  { state: 'Madhya Pradesh',   festival: 'Lokrang Festival',     month: 'Jan',  emoji: '🎪', color: '#8e44ad',  desc: 'Week-long tribal art and culture showcase in Bhopal with crafts and performances.' },
  { state: 'Bihar',            festival: 'Chhath Puja',          month: 'Nov',  emoji: '🌅', color: '#FF9933',  desc: 'Ancient Vedic worship of Sun God at river ghats with fasting and offerings.' },
  { state: 'Odisha',           festival: 'Rath Yatra',           month: 'Jul',  emoji: '🛕', color: '#3498db',  desc: 'Lord Jagannath\'s chariot festival in Puri with massive wooden chariots.' },
  { state: 'Telangana',        festival: 'Bathukamma',           month: 'Oct',  emoji: '💐', color: '#e84393',  desc: 'Floral festival of Telangana women creating flower stacks and dancing.' },
  { state: 'Andhra Pradesh',   festival: 'Ugadi',                month: 'Mar',  emoji: '🌿', color: '#00b894',  desc: 'Telugu New Year with pachadi (six-taste dish), rangoli, and temple visits.' },
  { state: 'Jharkhand',        festival: 'Sarhul',               month: 'Mar',  emoji: '🌸', color: '#fd79a8',  desc: 'Tribal spring festival worshipping Sal trees with dance and sacred rituals.' },
  { state: 'Uttarakhand',      festival: 'Kumbh Mela',           month: 'Jan',  emoji: '🛕', color: '#6c5ce7',  desc: 'World\'s largest spiritual gathering at Haridwar with millions of pilgrims.' },
  { state: 'Himachal Pradesh', festival: 'Kullu Dussehra',       month: 'Oct',  emoji: '⛰️', color: '#0984e3',  desc: 'Unique week-long Dussehra with 200+ deities parading through Kullu Valley.' },
  { state: 'Meghalaya',        festival: 'Wangala',              month: 'Nov',  emoji: '🥁', color: '#00cec9',  desc: 'Garo tribe\'s 100-drum festival thanking Sun God after harvest season.' },
  { state: 'Nagaland',         festival: 'Hornbill Festival',    month: 'Dec',  emoji: '🦅', color: '#d63031',  desc: '"Festival of Festivals" showcasing all 17 Naga tribes\' traditions at Kisama.' },
  { state: 'Manipur',          festival: 'Yaoshang',             month: 'Mar',  emoji: '🏮', color: '#fdcb6e',  desc: 'Meitei Holi with thabal chongba moonlit dance and sports competitions.' },
  { state: 'Mizoram',          festival: 'Chapchar Kut',         month: 'Mar',  emoji: '🎋', color: '#55efc4',  desc: 'Spring festival after jhum clearing with bamboo dance and folk songs.' },
  { state: 'Tripura',          festival: 'Kharchi Puja',         month: 'Jul',  emoji: '🔱', color: '#a29bfe',  desc: 'Royal worship of 14 deities at Old Agartala\'s Chaturdash Devata temple.' },
  { state: 'Sikkim',           festival: 'Losar',                month: 'Feb',  emoji: '🎊', color: '#fab1a0',  desc: 'Tibetan New Year with masked Cham dance, feasts, and monastery visits.' },
  { state: 'Arunachal Pradesh',festival: 'Ziro Festival',        month: 'Sep',  emoji: '🎸', color: '#74b9ff',  desc: 'Outdoor music festival in Ziro Valley amidst Apatani tribal paddy fields.' },
  { state: 'Haryana',          festival: 'Sanjhi',               month: 'Oct',  emoji: '🎨', color: '#ffeaa7',  desc: 'Artistic festival where girls create elaborate mud and dung wall designs.' },
  { state: 'Chhattisgarh',     festival: 'Bastar Dussehra',      month: 'Oct',  emoji: '🏹', color: '#e17055',  desc: '75-day tribal Dussehra — world\'s longest festival with unique rituals.' },
  { state: 'Jammu & Kashmir',  festival: 'Hemis Festival',       month: 'Jun',  emoji: '🎭', color: '#dfe6e9',  desc: 'Masked Cham dance at Hemis Monastery celebrating Guru Padmasambhava.' },
];


// ─── Hooks ──────────────────────────────────────────────────────────────────
function useIsMobile(bp = 1024) {
  const [is, setIs] = useState(window.innerWidth < bp);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}

// ─── Festival Card ──────────────────────────────────────────────────────────
function FestivalCard({ f, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      style={{
        borderRadius: 'var(--radius)', overflow: 'hidden',
        background: `linear-gradient(135deg, ${f.color}12, ${f.color}04)`,
        border: `1px solid ${f.color}25`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Top gradient accent */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${f.color}, ${f.color}60, transparent)`,
      }} />

      <div style={{ padding: '14px 16px 16px' }}>
        {/* State + Month tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9,
            padding: '2px 8px', borderRadius: 100, letterSpacing: '0.1em',
            background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30`,
          }}>
            {f.state}
          </span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 9,
            padding: '2px 6px', borderRadius: 100, marginLeft: 'auto',
            background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            📅 {f.month}
          </span>
        </div>

        {/* Emoji + Festival Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${f.color}30, ${f.color}10)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
            border: `1px solid ${f.color}25`,
            boxShadow: `0 4px 12px ${f.color}15`,
          }}>
            {f.emoji}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 15,
            color: 'var(--text-primary)', lineHeight: 1.2, margin: 0,
          }}>
            {f.festival}
          </h3>
        </div>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          color: 'var(--text-secondary)', lineHeight: 1.5,
          margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {f.desc}
        </p>
      </div>
    </motion.div>
  );
}


// ─── AI Mini Widget ─────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '🗞 Top news', q: 'What are the top news stories in India today?' },
  { label: '📈 Markets', q: 'How are Indian markets performing today?' },
  { label: '⛈ Weather', q: 'Weather summary for major Indian cities?' },
  { label: '🏛 Politics', q: 'Latest political updates from India?' },
];

function AIWidget({ insights }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'नमस्ते! I\'m Bharat AI — ask me anything about India\'s latest news, markets, or weather.' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setSending(true);
    setMessages(p => [...p, { role: 'assistant', content: '', streaming: true }]);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      // Filter out the initial welcome message — Gemini requires first message to be 'user'
      const chatHistory = [...messages, { role: 'user', content: msg }]
        .filter(m => m.role === 'user' || messages.indexOf(m) > 0);
      const apiKey = localStorage.getItem('gemini_key') || '';
      const res = await fetch('/api/ai/chat', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-Gemini-Key': apiKey },
        body: JSON.stringify({ messages: chatHistory }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          if (line.slice(6) === '[DONE]') break;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.error) { acc += `\n⚠️ ${parsed.error}`; break; }
            if (parsed.token) {
              acc += parsed.token;
              setMessages(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: acc, streaming: true }; return n; });
            }
          } catch {}
        }
      }
      if (!acc) acc = '⚠️ No response received. The AI may be rate-limited — please try again in a moment.';
      setMessages(p => { const n = [...p]; n[n.length - 1] = { ...n[n.length - 1], content: acc, streaming: false }; return n; });
    } catch (err) {
      const errorMsg = err.name === 'AbortError'
        ? '⏱️ Request timed out — AI may be busy. Please try again.'
        : `⚠️ AI unavailable — ${err.message || 'check backend/.env for OPENROUTER_API_KEY'}`;
      setMessages(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: errorMsg }; return n; });
    }
    setSending(false);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid rgba(255,102,0,0.12)',
      background: 'rgba(8,8,18,0.98)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      height: 480, maxHeight: '70vh',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        background: 'linear-gradient(135deg, rgba(255,102,0,0.12), rgba(255,102,0,0.03))',
        borderBottom: '1px solid rgba(255,102,0,0.1)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6600, #cc4400)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 4px 14px rgba(255,102,0,0.4)',
          }}>🤖</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 13, color: '#FF6600', lineHeight: 1.2 }}>Bharat AI</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 8, color: '#565680' }}>Powered by Gemini</div>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 7,
            letterSpacing: '0.1em', color: '#22c55e',
            padding: '2px 7px', borderRadius: 100,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e' }} />
          ONLINE
        </motion.div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {messages.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 5 }}
          >
            {m.role === 'assistant' && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end',
                background: 'linear-gradient(135deg, #FF6600, #cc4400)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%', padding: '7px 11px', lineHeight: 1.5,
              fontFamily: 'var(--font-body)', fontSize: 11,
              borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              ...(m.role === 'user' ? {
                background: 'linear-gradient(135deg, #FF6600, #cc4400)',
                color: '#fff', boxShadow: '0 3px 10px rgba(255,102,0,0.25)',
              } : {
                background: 'rgba(255,255,255,0.04)',
                color: '#d0d0e8', border: '1px solid rgba(255,102,0,0.08)',
              }),
            }}>
              {m.streaming && m.content === '' ? (
                <div style={{ display: 'flex', gap: 3, padding: '2px 4px' }}>
                  {[0,1,2].map(j => (
                    <motion.div key={j} animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.12 }}
                      style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6600' }} />
                  ))}
                </div>
              ) : (
                <>{m.content}{m.streaming && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>▌</motion.span>}</>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '5px 10px', borderTop: '1px solid rgba(255,102,0,0.06)', display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
        {QUICK_PROMPTS.map(p => (
          <motion.button key={p.label} onClick={() => send(p.q)}
            whileHover={{ scale: 1.05, borderColor: '#FF6600' }}
            style={{
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 9,
              padding: '3px 8px', borderRadius: 100, cursor: 'pointer',
              background: 'rgba(255,102,0,0.04)', border: '1px solid rgba(255,102,0,0.1)',
              color: '#9090b0',
            }}>
            {p.label}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '7px 9px', display: 'flex', gap: 7, alignItems: 'center',
        borderTop: '1px solid rgba(255,102,0,0.08)', background: 'rgba(0,0,0,0.3)', flexShrink: 0,
      }}>
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about India…"
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 10, fontSize: 11,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,102,0,0.12)',
            color: '#f0f0f8', outline: 'none', fontFamily: 'var(--font-body)',
          }}
        />
        <motion.button onClick={() => send()} disabled={!input.trim() || sending}
          whileHover={input.trim() ? { scale: 1.1 } : {}} whileTap={input.trim() ? { scale: 0.9 } : {}}
          style={{
            width: 34, height: 34, borderRadius: 8, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0,
            background: input.trim() ? 'linear-gradient(135deg, #FF6600, #cc4400)' : 'rgba(255,255,255,0.04)',
            fontSize: 14,
          }}>
          {sending ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent' }} />
          ) : '➤'}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main Home Page ────────────────────────────────────────────────────────
export default function Home() {
  const [selected, setSelected] = useState(null);
  const [festivalSearch, setFestivalSearch] = useState('');
  const [showAllFestivals, setShowAllFestivals] = useState(false);
  const [layers, setLayers] = useState({ monuments: false, military: false, nuclear: false });
  const isMobile = useIsMobile();
  const toggleLayer = (key) => setLayers(p => ({ ...p, [key]: !p[key] }));

  const { data: dashboard, isLoading: loadingEvents } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: async () => {
      const key = localStorage.getItem('gemini_key') || '';
      const res = await fetch('/api/ai/dashboard', { headers: { 'X-Gemini-Key': key } });
      if (res.status === 401) return { incidents: [], events: [], insights: null, hashtags: [] };
      return res.json();
    },
    staleTime: 0, retry: 1,
  });

  const { data: cricketData } = useQuery({
    queryKey: ['cricket-live'],
    queryFn: () => fetch('/api/cricket/live').then(r => r.json()),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const INCIDENTS = dashboard?.incidents?.length > 0 ? dashboard.incidents : STATIC_INCIDENTS;
  const isLive = !!(dashboard?.incidents?.length > 0);
  const liveEvents = dashboard?.events || [];

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>

      {/* ── Section 1: Map + AI ── */}
      <div className="page" style={{ paddingBottom: 8 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
          gap: 16, alignItems: 'start',
        }}>
          {/* India Map */}
          <div className="card card-static" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '10px 16px', borderBottom: '1px solid rgba(255,102,0,0.08)',
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            }}>
              <span className="section-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>🗺️ India Live Map</span>
              {isLive && (
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, letterSpacing: '0.1em',
                    padding: '2px 8px', borderRadius: 100, background: 'rgba(255,102,0,0.12)',
                    border: '1px solid rgba(255,102,0,0.25)', color: '#FF9933' }}>
                  🤖 AI-LIVE
                </motion.span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-ui)', color: 'var(--text-muted)' }}>
                {INCIDENTS.filter(i => i.type === 'alert').length} alerts · {INCIDENTS.filter(i => i.type === 'warn').length} warnings
              </span>
            </div>

            {/* Layer Filters */}
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px', background: 'rgba(0,0,0,0.2)', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {[
                { key: 'monuments', label: '🏛 Monuments',     color: '#f1c40f' },
                { key: 'military',  label: '⚔️ Military Bases', color: '#e74c3c' },
                { key: 'nuclear',   label: '☢️ Nuclear Sites',   color: '#00cec9' },
              ].map(({ key, label, color }) => (
                <motion.button key={key}
                  onClick={() => toggleLayer(key)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '4px 12px', borderRadius: 100, border: `1px solid ${layers[key] ? color : 'rgba(255,255,255,0.1)'}`,
                    background: layers[key] ? `${color}22` : 'transparent',
                    color: layers[key] ? color : '#9090b0',
                    fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>

            <div style={{ height: isMobile ? 300 : 440, width: '100%' }}>
              <MapContainer center={[22.0, 80.0]} zoom={5}
                style={{ height: '100%', width: '100%', display: 'block' }}
                minZoom={4} maxZoom={10} zoomControl attributionControl={false}
                whenReady={(m) => setTimeout(() => m.target.invalidateSize(), 100)}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" subdomains="abcd" />
                <GeoJSON data={INDIA_GEO} style={{ fillColor: '#38bdf8', fillOpacity: 0.06, color: '#38bdf8', weight: 1, opacity: 0.3, dashArray: '5 4' }} />

                {/* Incident Markers */}
                {INCIDENTS.map(inc => (
                  <CircleMarker key={inc.id} center={inc.pos} radius={10}
                    pathOptions={{ color: TYPE[inc.type], fillColor: TYPE[inc.type], fillOpacity: 0.85, weight: 2 }}
                    eventHandlers={{ click: () => setSelected(selected?.id === inc.id ? null : inc) }}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 180 }}>
                        <div style={{ color: TYPE[inc.type], fontWeight: 700, fontSize: 13 }}>{inc.name}</div>
                        <div style={{ color: '#9090b0', fontSize: 11, marginTop: 4 }}>{inc.desc}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Live Events */}
                {liveEvents.filter(e => e.pos && Array.isArray(e.pos) && e.pos.length === 2 && e.pos[0] !== 22.0).map((ev, i) => (
                  <CircleMarker key={`ev-${i}`} center={ev.pos} radius={14}
                    pathOptions={{ color: ev.color, fillColor: ev.color, fillOpacity: 0.9, weight: 3, dashArray: '2 4' }}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderBottom: `1px solid ${ev.color}40`, paddingBottom: 6 }}>
                          <span style={{ fontSize: 20 }}>{ev.emoji}</span>
                          <div style={{ color: ev.color, fontWeight: 800, fontSize: 14 }}>{ev.festival}</div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>{ev.desc}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Monuments Layer — building emoji icon */}
                {layers.monuments && MONUMENTS.map(m => (
                  <Marker key={m.id} position={m.pos} icon={monumentIcon}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          <span>🏛</span>
                          <div style={{ color: '#f1c40f', fontWeight: 800, fontSize: 13 }}>{m.name}</div>
                        </div>
                        <div style={{ color: '#9090b0', fontSize: 11, lineHeight: 1.4 }}>{m.desc}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Military Bases Layer — Star Icon */}
                {layers.military && MILITARY_BASES.map(b => (
                  <Marker key={b.id} position={b.pos} icon={militaryIcon}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          <svg viewBox="0 0 100 100" width="16" height="16"><polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#e74c3c"/></svg>
                          <div style={{ color: '#e74c3c', fontWeight: 800, fontSize: 13 }}>{b.name}</div>
                        </div>
                        <div style={{ color: '#9090b0', fontSize: 11, lineHeight: 1.4 }}>{b.desc}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Nuclear Sites Layer — Trefoil Icon */}
                {layers.nuclear && NUCLEAR_SITES.map(n => (
                  <Marker key={n.id} position={n.pos} icon={nuclearIcon}>
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-ui)', minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          <svg viewBox="0 0 100 100" width="16" height="16">
                            <circle cx="50" cy="50" r="12" fill="#00cec9"/>
                            <path d="M50 38 A12 12 0 0 1 50 62 L28 99 A48 48 0 0 0 72 99 Z" fill="#00cec9"/>
                            <path d="M50 38 A12 12 0 0 1 50 62 L28 99 A48 48 0 0 0 72 99 Z" fill="#00cec9" transform="rotate(120 50 50)"/>
                            <path d="M50 38 A12 12 0 0 1 50 62 L28 99 A48 48 0 0 0 72 99 Z" fill="#00cec9" transform="rotate(240 50 50)"/>
                            <circle cx="50" cy="50" r="10" fill="#001f1f"/>
                            <circle cx="50" cy="50" r="5" fill="#00cec9"/>
                          </svg>
                          <div style={{ color: '#00cec9', fontWeight: 800, fontSize: 13 }}>{n.name}</div>
                        </div>
                        <div style={{ color: '#9090b0', fontSize: 11, lineHeight: 1.4 }}>{n.desc}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              </MapContainer>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 16px', borderTop: '1px solid rgba(255,102,0,0.06)', flexWrap: 'wrap' }}>
              {[['alert', 'Alert'], ['warn', 'Warning'], ['safe', 'Safe']].map(([k, l]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: TYPE[k] }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: TYPE[k], boxShadow: `0 0 6px ${TYPE[k]}` }} /> {l}
                </div>
              ))}
              {layers.monuments && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: '#f1c40f' }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f1c40f' }} /> Monument</div>}
              {layers.military  && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: '#e74c3c' }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#e74c3c' }} /> Military</div>}
              {layers.nuclear   && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: '#00cec9' }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00cec9' }} /> Nuclear</div>}
            </div>
          </div>

          {/* AI Widget */}
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'auto' : 130, height: 'fit-content' }}>
            <AIWidget insights={dashboard?.insights} />
          </div>
        </div>
      </div>

      {/* ── Section 3: Live Pulse — Topics | Hashtags | Cricket ── */}
      <div className="page" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>

          {/* 🔥 Trending Topics */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em', color: '#FF9933' }}>TRENDING NOW</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(dashboard?.insights?.trending || ['Politics', 'Economy', 'Weather', 'Sports', 'Tech', 'India']).map((topic, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 20,
                    background: 'rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.2)',
                  }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, color: 'rgba(255,153,51,0.6)' }}>{i + 1}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-primary)' }}>{topic}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* #️⃣ Trending Hashtags */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>#️⃣</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em', color: '#a29bfe' }}>HASHTAGS</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(dashboard?.hashtags || ['#India', '#Politics', '#Economy', '#Cricket', '#Monsoon', '#ISRO', '#Rupee', '#BJP']).map((tag, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }}
                  style={{
                    padding: '5px 10px', borderRadius: 20,
                    background: 'rgba(162,155,254,0.08)', border: '1px solid rgba(162,155,254,0.2)',
                  }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: '#a29bfe' }}>{tag.startsWith('#') ? tag : `#${tag}`}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 🏏 Live Cricket */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>🏏</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em', color: '#22c55e' }}>LIVE CRICKET</span>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            </div>
            {!cricketData?.matches?.length ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-ui)' }}>
                🌙 No live matches right now
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cricketData.matches.slice(0, 3).map((m, i) => {
                  const isLive = m.matchStarted && !m.matchEnded;
                  return (
                    <div key={m.id || i} style={{
                      padding: '10px 12px', borderRadius: 10,
                      background: isLive ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isLive ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.3, flex: 1 }}>
                          {m.name?.replace(' - Live', '').slice(0, 38)}{(m.name?.length || 0) > 38 ? '…' : ''}
                        </span>
                        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 8, letterSpacing: '0.1em',
                          padding: '2px 6px', borderRadius: 100, flexShrink: 0,
                          background: isLive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                          color: isLive ? '#22c55e' : 'var(--text-muted)' }}>
                          {isLive ? '● LIVE' : m.matchEnded ? 'ENDED' : 'UPCOMING'}
                        </span>
                      </div>
                      {m.score?.slice(0, 2).map((s, si) => (
                        <div key={si} style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{s.inning?.split(' Inning')?.[0]}:</strong> {s.r}/{s.w} ({s.o} ov)
                        </div>
                      ))}
                      {!m.score?.length && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>{m.status}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 4: 🎟️ Live Events & Happenings (compact) ── */}
      <div className="page" style={{ paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="section-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>🎟️ Live Events & Happenings</span>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
            {['All', 'Festivals', 'Movies', 'Concerts', 'Elections'].map(cat => (
              <motion.button key={cat} onClick={() => setFestivalSearch(festivalSearch === cat ? '' : cat)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 10, fontFamily: 'var(--font-ui)', fontWeight: 600,
                  background: festivalSearch === cat ? 'rgba(255,102,0,0.15)' : 'var(--bg-card2)',
                  color: festivalSearch === cat ? '#FF9933' : 'var(--text-secondary)',
                  border: `1px solid ${festivalSearch === cat ? 'rgba(255,102,0,0.3)' : 'var(--border)'}`,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                {cat === 'All' ? '🌟 All' : cat === 'Festivals' ? '🪔 Festivals' : cat === 'Movies' ? '🍿 Movies' : cat === 'Concerts' ? '🎸 Concerts' : '🗳️ Elections'}
              </motion.button>
            ))}
          </div>
        </div>

        {loadingEvents ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #FF6600', borderTopColor: 'transparent', margin: '0 auto 8px' }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-ui)' }}>Tracking live events...</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
            gap: 8,
          }}>
            {liveEvents.filter(f => {
              if (!festivalSearch || festivalSearch === 'All') return true;
              const txt = (f.festival + ' ' + f.desc).toLowerCase();
              if (festivalSearch === 'Movies') return txt.includes('movie') || txt.includes('film') || txt.includes('trailer') || f.emoji === '🍿' || f.emoji === '🎬';
              if (festivalSearch === 'Concerts') return txt.includes('concert') || txt.includes('tour') || txt.includes('music') || f.emoji === '🎸' || f.emoji === '🎤';
              if (festivalSearch === 'Elections') return txt.includes('election') || txt.includes('poll') || f.emoji === '🗳️';
              if (festivalSearch === 'Festivals') return txt.includes('festival') || txt.includes('puja') || f.emoji === '🪔' || f.emoji === '✨' || f.emoji === '🎆';
              return true;
            }).map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -3, scale: 1.02 }}
                style={{
                  borderRadius: 10, padding: '10px 12px',
                  background: `linear-gradient(135deg, ${f.color}10, ${f.color}04)`,
                  border: `1px solid ${f.color}22`,
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                }}>
                <div style={{ height: 2, background: `linear-gradient(90deg, ${f.color}, transparent)`, margin: '-10px -12px 8px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{f.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, letterSpacing: '0.1em',
                    padding: '1px 6px', borderRadius: 100, background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}25` }}>
                    {f.month || 'LIVE'}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 3 }}>
                  {f.festival?.slice(0, 22)}{(f.festival?.length || 0) > 22 ? '…' : ''}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {f.state || 'India'}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}



