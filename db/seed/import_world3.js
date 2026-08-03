const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';

// [name, slug, country_code, lat, lng, radius]
const C=[
// EUROPE
['Paris','paris','FR',48.8566,2.3522,28000],
['London','london','GB',51.5074,-0.1278,38000],
['Barcelona','barcelona','ES',41.3825,2.1769,28000],
['Madrid','madrid','ES',40.4168,-3.7038,28000],
['Rome','rome','IT',41.9028,12.4964,28000],
['Milan','milan','IT',45.4642,9.1900,26000],
['Venice','venice','IT',45.4408,12.3155,20000],
['Florence','florence','IT',43.7696,11.2558,22000],
['Naples','naples','IT',40.8518,14.2681,22000],
['Lisbon','lisbon','PT',38.7223,-9.1393,24000],
['Porto','porto','PT',41.1579,-8.6291,22000],
['Amsterdam','amsterdam','NL',52.3676,4.9041,26000],
['Berlin','berlin','DE',52.5200,13.4050,30000],
['Munich','munich','DE',48.1351,11.5820,25000],
['Hamburg','hamburg','DE',53.5511,9.9937,25000],
['Frankfurt','frankfurt','DE',50.1109,8.6821,22000],
['Cologne','cologne','DE',50.9422,6.9578,20000],
['Vienna','vienna','AT',48.2082,16.3738,24000],
['Prague','prague','CZ',50.0755,14.4378,24000],
['Budapest','budapest','HU',47.4979,19.0402,26000],
['Athens','athens','GR',37.9838,23.7275,24000],
['Dublin','dublin','IE',53.3498,-6.2603,24000],
['Copenhagen','copenhagen','DK',55.6761,12.5683,24000],
['Stockholm','stockholm','SE',59.3293,18.0686,26000],
['Oslo','oslo','NO',59.9139,10.7522,22000],
['Helsinki','helsinki','FI',60.1699,24.9384,24000],
['Zurich','zurich','CH',47.3769,8.5417,20000],
['Geneva','geneva','CH',46.2044,6.1432,20000],
['Brussels','brussels','BE',50.8503,4.3517,22000],
['Warsaw','warsaw','PL',52.2297,21.0122,24000],
['Moscow','moscow','RU',55.7558,37.6173,32000],
['Santorini','santorini','GR',36.3932,25.4615,15000],
// USA
['New York','new-york','US',40.7128,-74.0060,30000],
['Los Angeles','los-angeles','US',34.0522,-118.2437,32000],
['Chicago','chicago','US',41.8781,-87.6298,28000],
['Las Vegas','las-vegas','US',36.1699,-115.1398,25000],
['Miami','miami','US',25.7617,-80.1918,25000],
['San Francisco','san-francisco','US',37.7749,-122.4194,24000],
['Boston','boston','US',42.3601,-71.0589,24000],
['Washington','washington','US',38.9072,-77.0369,24000],
['Orlando','orlando','US',28.5383,-81.3792,25000],
['Honolulu','honolulu','US',21.3069,-157.8583,20000],
// ASIA
['Osaka','osaka','JP',34.6937,135.5023,26000],
['Kyoto','kyoto','JP',35.0116,135.7681,24000],
['Shanghai','shanghai','CN',31.2304,121.4737,32000],
['Beijing','beijing','CN',39.9042,116.4074,32000],
['Mumbai','mumbai','IN',19.0760,72.8777,28000],
['Delhi','delhi','IN',28.7041,77.1025,28000],
['Hong Kong','hong-kong','HK',22.3193,114.1694,30000],
['Seoul','seoul','KR',37.5665,126.9780,30000],
// OTHER
['Cape Town','cape-town','ZA',-33.9249,18.4241,28000],
['Cairo','cairo','EG',30.0444,31.2357,30000],
['Doha','doha','QA',25.2854,51.5310,28000],
['Sydney','sydney','AU',-33.8688,151.2093,32000],
['Melbourne','melbourne','AU',-37.8136,144.9631,30000],
['Dubai','dubai','AE',25.2048,55.2708,45000],
['Singapore','singapore','SG',1.3521,103.8198,45000],
['Istanbul','istanbul','TR',41.0082,28.9784,45000],
['Phuket','phuket','TH',7.8804,98.3923,30000],
['Tokyo','tokyo','JP',35.6762,139.6503,32000],
];

function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q,retries=5){
  for(let r=0;r<retries;r++){
    try{
      return await new Promise((ok,no)=>{
        const body='data='+q.split('\n').join('');
        const u=new URL(U);
        const req=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body),'User-Agent':'curl/7.68.0','Accept':'*/*'}},res=>{
          let b='';res.on('data',c=>b+=c);res.on('end',()=>{
            if(b.startsWith('<?xml')||b.startsWith('<!DOCTYPE')){no(new Error('HTML:'+res.statusCode));return;}
            try{ok(JSON.parse(b))}catch(e){no(new Error('NotJSON:'+b.substring(0,150)))}
          });
        });
        req.on('error',no);req.setTimeout(120000,()=>{req.destroy();no(new Error('Timeout'));});
        req.write(body);req.end();
      });
    }catch(e){
      if(r<retries-1){console.log('    Retry '+(r+1)+'/'+retries+' in 20s...');await new Promise(r2=>setTimeout(r2,20000));}
      else throw e;
    }
  }
}
async function ensureCity(nm,sl2,cc,lt,ln){
  let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[sl2,cc]);
  if(!r.rows.length){
    const co=await pool.query('SELECT name FROM countries WHERE code=$1',[cc]);
    const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',
      [nm,sl2,cc,lt,ln,co.rows.length?co.rows[0].name:cc]);
    r={rows:[{id:ins.rows[0].id,hotel_count:0}]};
    console.log('  [NEW CITY] '+nm+' ('+cc+')');
  }
  return r.rows[0];
}
async function main(){
  // Step 0: fix encoding for Japanese cities (by slug pattern, exact)
  const fixMap=[
    ['Osaka','osaka','åsaka'],
    ['Kyoto','kyoto','kyåto'],
    ['Kobe','kobe','kåbe'],
    ['Kitakyushu','kitakyushu','kitakyåshå'],
  ];
  for(const[name,slug,corrupt] of fixMap){
    const r=await pool.query('SELECT id FROM cities WHERE country_code=$1 AND slug=$2',['JP',corrupt]);
    if(r.rows.length){
      const dup=await pool.query('SELECT id FROM cities WHERE country_code=$1 AND slug=$2 AND id<>$3',['JP',slug,r.rows[0].id]);
      if(dup.rows.length){await pool.query('DELETE FROM cities WHERE id=$1',[dup.rows[0].id]);}
      await pool.query('UPDATE cities SET name=$1, slug=$2 WHERE id=$3',[name,slug,r.rows[0].id]);
    }
  }
  console.log('Encoding fix done');

  // Step 1: ensure London GB exists and move UK hotels to it (fix CA London bug)
  const lgb=await ensureCity('London','london','GB',51.5074,-0.1278);
  await pool.query('UPDATE hotels SET city_id=$1, city=\'London\', country=\'United Kingdom\' WHERE LOWER(city)=\'london\' AND (country ILIKE \'%united kingdom%\' OR country ILIKE \'%england%\' OR country ILIKE \'%uk%\')',[lgb.id]);
  await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[lgb.id]);
  console.log('London GB fixed, hotels ->', lgb.hotel_count);

  let totalAdded=0;
  for(let i=0;i<C.length;i++){
    const[nm,sl2,cc,lt,ln,rad]=C[i];
    const ci=await ensureCity(nm,sl2,cc,lt,ln);
    const ex=ci.hotel_count||0;
    const q='[out:json][timeout:60];(node["tourism"="hotel"](around:'+rad+','+lt+','+ln+');way["tourism"="hotel"](around:'+rad+','+lt+','+ln+');node["tourism"="hostel"](around:'+rad+','+lt+','+ln+');way["tourism"="hostel"](around:'+rad+','+lt+','+ln+');node["tourism"="motel"](around:'+rad+','+lt+','+ln+');node["tourism"="guest_house"](around:'+rad+','+lt+','+ln+');way["tourism"="guest_house"](around:'+rad+','+lt+','+ln+'););out body;>;out skel qt;';
    let dt;
    try{dt=await fo(q);}catch(e){console.log('['+(i+1)+'/'+C.length+'] '+nm+': ERR-'+e.message.substring(0,80));await new Promise(r=>setTimeout(r,10000));continue;}
    if(!dt.elements||!dt.elements.length){console.log('['+(i+1)+'/'+C.length+'] '+nm+': NO-DATA');continue;}
    const nd={};for(const e of dt.elements){if(e.type==='node'&&e.lat&&e.lon)nd[e.id]={lat:e.lat,lng:e.lon};}
    const hl=[],sn=new Set();
    for(const e of dt.elements){
      if(e.type!=='way'&&e.type!=='node')continue;if(!e.tags)continue;
      const nm2=e.tags.name;if(!nm2||nm2.length<2)continue;
      const nn=nm2.toLowerCase().replace(/[^a-z0-9]/g,'');if(sn.has(nn))continue;sn.add(nn);
      let la,lo;
      if(e.type==='node'){la=e.lat;lo=e.lon;}
      else if(e.nodes){for(const id of e.nodes){if(nd[id]){la=nd[id].lat;lo=nd[id].lng;break;}}}
      if(!la||!lo)continue;
      const base=sl(nm2);const cityPrefix=sl(nm);
      const dedup_slug=base.startsWith(cityPrefix)?base:cityPrefix+'-'+base;
      hl.push({name:nm2.trim(),slug:dedup_slug,lat:la,lng:lo,stars:parseInt(e.tags.stars)||4,rating:e.tags.rating?parseFloat(e.tags.rating):4.0,website:e.tags.website||null,phone:e.tags.phone||e.tags['contact:phone']||null,address:e.tags['addr:street']?e.tags['addr:street']+(e.tags['addr:housenumber']?' '+e.tags['addr:housenumber']:''):null,wifi:e.tags.internet_access==='wlan'||e.tags.wifi==='yes',parking:e.tags.parking==='yes'||e.tags.parking==='surface',pool:e.tags.pool==='yes',osm_id:e.id,city_id:ci.id});
    }
    if(!hl.length){console.log('['+(i+1)+'/'+C.length+'] '+nm+': NO-HOTELS (raw:'+dt.elements.length+')');continue;}
    let ad=0;
    for(const h of hl){
      try{
        const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,h.city_id]);
        if(dp.rows.length)continue;
        await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,website,phone,address,wifi,parking,pool,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,$12,$13,$14,$15,\'osm\',$16,NOW())',[h.name,nm,cc,h.lat,h.lng,h.stars,h.rating,h.website,h.phone,h.address,h.wifi,h.parking,h.pool,h.osm_id,h.city_id,h.slug]);
        ad++;
      }catch(e){
        if(ad<3)console.log('  INSERT ERR['+h.name+']: '+e.message.substring(0,100));
      }
    }
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci.id]);
    totalAdded+=ad;
    console.log('['+(i+1)+'/'+C.length+'] '+nm+': +'+ad+' (raw:'+hl.length+', existing:'+ex+')');
    await new Promise(r=>setTimeout(r,5000));
  }
  console.log('\n=== TOTAL ADDED: '+totalAdded+' ===');
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
