const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q,r6=5){for(let r=0;r<r6;r++){try{return await new Promise((ok,no)=>{const b='data='+q.split('\n').join('');const u=new URL(U);const h=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(b),'User-Agent':'curl/7.68.0','Accept':'*/*'}},re=>{let d='';re.on('data',c=>d+=c);re.on('end',()=>{try{ok(JSON.parse(d))}catch(e){no(new Error('NotJSON'))}});});h.on('error',no);h.setTimeout(120000,()=>{h.destroy();no(new Error('Timeout'));});h.write(b);h.end();})}catch(e){if(r<r6-1)await new Promise(r2=>setTimeout(r2,20000));else throw e;}}}
async function gc(nm,cc,lt,ln){const slug=sl(nm);let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[slug,cc]);if(!r.rows.length){const co=await pool.query('SELECT name FROM countries WHERE code=$1',[cc]);const n=co.rows.length?co.rows[0].name:cc;const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',[nm,slug,cc,lt,ln,n]);console.log('  NEW:'+nm);r={rows:[{id:ins.rows[0].id,hotel_count:0}]};}return r.rows[0];}
async function main(){
  const spots=[
    // SWISS ALPS
    ['Davos','CH',46.8027,9.8360,12000],['St Moritz','CH',46.4908,9.8355,10000],['Zermatt','CH',46.0207,7.7491,8000],['Interlaken','CH',46.6863,7.8632,10000],['Grindelwald','CH',46.6243,8.0413,8000],['Lugano','CH',46.0037,8.9511,10000],['Locarno','CH',46.1695,8.7902,10000],['Montreux','CH',46.4312,6.9107,8000],['Lausanne','CH',46.5197,6.6323,15000],['Basel','CH',47.5596,7.5886,12000],['Bern','CH',46.9480,7.4474,12000],['Lucerne','CH',47.0502,8.3093,12000],
    // POLAND
    ['Krakow','PL',50.0647,19.9450,25000],['Gdansk','PL',54.3520,18.6466,20000],['Wroclaw','PL',51.1079,17.0385,20000],['Poznan','PL',52.4064,16.9252,20000],['Lodz','PL',51.7592,19.4560,15000],['Szczecin','PL',53.4285,14.5528,15000],['Torun','PL',53.0138,18.5984,12000],['Zakopane','PL',49.2992,19.9496,10000],
    // ITALY
    ['Verona','IT',45.4384,10.9916,15000],['Bologna','IT',44.4949,11.3426,15000],['Genoa','IT',44.4056,8.9463,15000],['Turin','IT',45.0703,7.6869,15000],['Palermo','IT',38.1157,13.3615,15000],['Catania','IT',37.5079,15.0896,12000],['Bari','IT',41.1171,16.8719,12000],['Pisa','IT',43.7228,10.4017,10000],['Siena','IT',43.3186,11.3306,10000],['Bolzano','IT',46.4983,11.3548,10000],['Como','IT',45.8082,9.0852,10000],['Rimini','IT',44.0594,12.5653,10000],['Lecce','IT',40.3516,18.1716,10000],['Capri','IT',40.5509,14.2426,8000],['Taormina','IT',37.8516,15.2853,8000],
    // SPAIN
    ['Seville','ES',37.3891,-5.9845,20000],['Malaga','ES',36.7213,-4.4214,15000],['Granada','ES',37.1773,-3.5986,12000],['Cordoba','ES',37.8882,-4.7794,12000],['San Sebastian','ES',43.3183,-1.9812,12000],['Ibiza','ES',38.9067,1.4206,15000],['Mallorca','ES',39.5696,2.6502,25000],['Tenerife','ES',28.2916,-16.6291,25000],['Las Palmas','ES',28.1235,-15.4363,15000],['Fuerteventura','ES',28.3587,-14.0538,15000],['Lanzarote','ES',29.0469,-13.5899,12000],['Menorca','ES',39.9496,4.1104,12000],
    // GREECE
    ['Mykonos','GR',37.4467,25.3289,12000],['Crete','GR',35.2401,24.8093,30000],['Rhodes','GR',36.4341,28.2176,15000],['Corfu','GR',39.6243,19.9217,15000],['Thessaloniki','GR',40.6401,22.9444,15000],['Santorini','GR',36.3932,25.4615,12000],['Paros','GR',37.0855,25.1485,10000],['Naxos','GR',37.1017,25.3792,10000],['Zakynthos','GR',37.7882,20.8983,10000],['Kos','GR',36.8933,27.2877,10000],
    // BALKAN
    ['Dubrovnik','HR',42.6507,18.0944,12000],['Split','HR',43.5081,16.4402,12000],['Hvar','HR',43.1725,16.4411,8000],['Mostar','BA',43.3438,17.8078,12000],['Kotor','ME',42.4247,18.7712,10000],['Novi Sad','RS',45.2671,19.8335,12000],['Skopje','MK',41.9973,21.4280,12000],['Ohrid','MK',41.1231,20.8016,10000],['Tirana','AL',41.3275,19.8187,12000],['Bled','SI',46.3667,14.1136,8000],['Maribor','SI',46.5547,15.6459,10000],
    // BULGARIA + ROMANIA
    ['Plovdiv','BG',42.1354,24.7453,15000],['Varna','BG',43.2141,27.9147,12000],['Burgas','BG',42.5048,27.4626,10000],['Veliko Tarnovo','BG',43.0786,25.6273,10000],['Cluj-Napoca','RO',46.7712,23.6236,12000],['Brasov','RO',45.6578,25.6012,10000],['Sibiu','RO',45.7983,24.1256,10000],['Timisoara','RO',45.7489,21.2087,10000],['Constanta','RO',44.1811,28.6363,10000],
    // NORDIC + BALTIC
    ['Tromso','NO',69.6496,18.9560,12000],['Bergen','NO',60.3913,5.3221,15000],['Stavanger','NO',58.9700,5.7331,10000],['Gothenburg','SE',57.7089,11.9746,15000],['Malmo','SE',55.6050,13.0038,15000],['Aarhus','DK',56.1629,10.2039,12000],['Odense','DK',55.4038,10.4024,10000],['Tartu','EE',58.3780,26.7290,10000],['Kaunas','LT',54.8985,23.9036,10000],['Liepaja','LV',56.5047,21.0109,10000],
    // UK + IRELAND
    ['Edinburgh','GB',55.9533,-3.1883,15000],['Manchester','GB',53.4808,-2.2426,12000],['Liverpool','GB',53.4084,-2.9916,12000],['Birmingham','GB',52.4862,-1.8904,12000],['Glasgow','GB',55.8642,-4.2518,12000],['Bristol','GB',51.4545,-2.5879,12000],['Brighton','GB',50.8225,-0.1372,10000],['Oxford','GB',51.7520,-1.2577,10000],['Cambridge','GB',52.2053,0.1218,10000],['Bath','GB',51.3811,-2.3590,8000],['Galway','IE',53.2707,-9.0568,10000],['Cork','IE',51.8969,-8.4863,10000],['Limerick','IE',52.6680,-8.6305,10000],
    // OTHER FAMOUS
    ['Reykjavik','IS',64.1466,-21.9426,15000],['Akureyri','IS',65.6835,-18.0878,8000],['Bergamo','IT',45.6983,9.6773,10000],['Bruges','BE',51.2093,3.2247,8000],['Ghent','BE',51.0543,3.7174,10000],['Antwerp','BE',51.2194,4.4025,10000],['Rotterdam','NL',51.9244,4.4777,12000],['Utrecht','NL',52.0907,5.1214,10000],['Maastricht','NL',50.8514,5.6910,8000],['Grenoble','FR',45.1885,5.7245,10000],['Nice','FR',43.7102,7.2620,15000],['Cannes','FR',43.5513,7.0128,10000],['Strasbourg','FR',48.5734,7.7521,10000],['Bordeaux','FR',44.8378,-0.5792,15000],['Lyon','FR',45.7640,4.8357,15000],['Marseille','FR',43.2965,5.3698,15000],['Toulouse','FR',43.6047,1.4442,12000],['Nantes','FR',47.2184,-1.5536,10000],['Salzburg','AT',47.8095,13.0550,10000],['Innsbruck','AT',47.2692,11.4041,10000],['Graz','AT',47.0707,15.4395,10000],['Klagenfurt','AT',46.6365,14.3122,8000],['Krk','HR',45.0262,14.5746,8000],['Zadar','HR',44.1194,15.2314,8000],['Rovinj','HR',45.0812,13.6387,8000],
  ];
  let total=0;
  for(let i=0;i<spots.length;i++){
    const[nm,cc,lt,ln,rad]=spots[i];const ci=await gc(nm,cc,lt,ln);
    const q='[out:json][timeout:90];(node["tourism"="hotel"](around:'+rad+','+lt+','+ln+');way["tourism"="hotel"](around:'+rad+','+lt+','+ln+');node["tourism"="hostel"](around:'+rad+','+lt+','+ln+');way["tourism"="hostel"](around:'+rad+','+lt+','+ln+'););out body;>;out skel qt;';
    let dt;try{dt=await fo(q);}catch(e){console.log('['+(i+1)+'] '+nm+': ERR');continue;}
    if(!dt.elements||!dt.elements.length){console.log('['+(i+1)+'] '+nm+': 0');continue;}
    const nd={};for(const e of dt.elements){if(e.type==='node'&&e.lat&&e.lon)nd[e.id]={lat:e.lat,lng:e.lon};}
    const hl=[],sn=new Set();
    for(const e of dt.elements){
      if(e.type!=='way'&&e.type!=='node')continue;if(!e.tags)continue;
      const nm2=e.tags.name;if(!nm2||nm2.length<2)continue;
      if(sn.has(nm2.toLowerCase().replace(/[^a-z0-9]/g,'')))continue;sn.add(nm2.toLowerCase().replace(/[^a-z0-9]/g,''));
      let la,lo;if(e.type==='node'){la=e.lat;lo=e.lon;}else if(e.nodes){for(const id of e.nodes){if(nd[id]){la=nd[id].lat;lo=nd[id].lng;break;}}}
      if(!la||!lo)continue;
      hl.push({name:nm2.trim(),slug:sl(nm2).startsWith(sl(nm))?sl(nm2):sl(nm)+'-'+sl(nm2),lat:la,lng:lo,stars:parseInt(e.tags.stars)||3,rating:e.tags.rating?parseFloat(e.tags.rating):4.0,osm_id:e.id});
    }
    if(!hl.length)continue;let ad=0;
    for(const h of hl){try{const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,ci.id]);if(dp.rows.length)continue;await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,NOW())',[h.name,nm,cc,h.lat,h.lng,h.stars,h.rating,h.osm_id,ci.id,'osm',h.slug]);ad++;}catch(e){}}
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci.id]);
    total+=ad;console.log('['+(i+1)+'] '+nm+': +'+ad);
    await new Promise(r2=>setTimeout(r2,4000));
  }
  console.log('\n=== TOTAL ADDED: '+total+' ===');await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});