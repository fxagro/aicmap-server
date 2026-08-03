const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
// [name, slug, lat, lng, radius]
const C=[
// THAILAND
['Bangkok','bangkok',13.7563,100.5018,35000],
['Chiang Mai','chiang-mai',18.7883,98.9853,30000],
['Phuket','phuket',7.8804,98.3923,30000],
['Krabi','krabi',8.0863,98.9063,25000],
['Ko Samui','ko-samui',9.5120,100.0136,25000],
['Phatthaya','phatthaya',12.9236,100.8825,25000],
['Chiang Rai','chiang-rai',19.9105,99.8406,20000],
['Hat Yai','hat-yai',7.0084,100.4747,15000],
// MALAYSIA
['Kuala Lumpur','kuala-lumpur',3.1390,101.6869,30000],
['George Town','george-town',5.4141,100.3288,25000],
['Melaka','melaka',2.1896,102.2501,25000],
['Johor Bahru','johor-bahru',1.4927,103.7414,25000],
['Kota Kinabalu','kota-kinabalu',5.9804,116.0735,25000],
['Kuching','kuching',1.5535,110.3593,25000],
['Ipoh','ipoh',4.5975,101.0901,20000],
['Seberang Jaya','seberang-jaya',5.3960,100.4060,15000],
['Kota Bharu','kota-bharu',6.1244,102.2440,15000],
['Miri','miri',4.3995,113.9914,15000],
['Sandakan','sandakan',5.8400,118.1180,15000],
['Kuala Terengganu','kuala-terengganu',5.3302,103.1408,15000],
// SINGAPORE
['Singapore','singapore',1.3521,103.8198,45000],
// VIETNAM
['Ho Chi Minh City','ho-chi-minh-city',10.8231,106.6297,30000],
['Hanoi','hanoi',21.0285,105.8542,30000],
['Haiphong','haiphong',20.8449,106.6881,20000],
// UAE
['Dubai','dubai',25.2048,55.2708,45000],
['Abu Dhabi','abu-dhabi',24.4539,54.3773,40000],
['Sharjah','sharjah',25.3463,55.4209,20000],
// SAUDI ARABIA (umroh/haji)
['Mecca','mecca',21.3891,39.8579,40000],
['Medina','medina',24.5247,39.5692,40000],
['Riyadh','riyadh',24.7136,46.6753,40000],
['Jeddah','jeddah',21.4858,39.1925,30000],
// TURKEY
['Istanbul','istanbul',41.0082,28.9784,45000],
['Antalya','antalya',36.8969,30.7133,35000],
['Izmir','izmir',38.4237,27.1428,25000],
];
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q,retries=4){
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
        req.on('error',no);req.setTimeout(90000,()=>{req.destroy();no(new Error('Timeout'));});
        req.write(body);req.end();
      });
    }catch(e){
      if(r<retries-1){console.log('    Retry '+(r+1)+'/'+retries+' in 20s...');await new Promise(r2=>setTimeout(r2,20000));}
      else throw e;
    }
  }
}
async function main(){
  let totalAdded=0;
  for(let i=0;i<C.length;i++){
    const[nm,sl2,lt,ln,rad]=C[i];
    const cr=await pool.query(`SELECT c.id,c.hotel_count,cc.name AS country FROM cities c JOIN countries cc ON cc.code=c.country_code WHERE c.slug=$1`,[sl2]);
    if(!cr.rows.length){console.log('['+(i+1)+'/'+C.length+'] '+nm+': NO CITY');continue;}
    const ci=cr.rows[0].id,ex=cr.rows[0].hotel_count||0,country=cr.rows[0].country;
    if(ex>=80){console.log('['+(i+1)+'/'+C.length+'] '+nm+': SKIP('+ex+')');continue;}
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
      hl.push({name:nm2.trim(),slug:dedup_slug,lat:la,lng:lo,stars:parseInt(e.tags.stars)||4,rating:e.tags.rating?parseFloat(e.tags.rating):4.0,website:e.tags.website||null,phone:e.tags.phone||e.tags['contact:phone']||null,address:e.tags['addr:street']?e.tags['addr:street']+(e.tags['addr:housenumber']?' '+e.tags['addr:housenumber']:''):null,wifi:e.tags.internet_access==='wlan'||e.tags.wifi==='yes',parking:e.tags.parking==='yes'||e.tags.parking==='surface',pool:e.tags.pool==='yes',osm_id:e.id,city_id:ci});
    }
    if(!hl.length){console.log('['+(i+1)+'/'+C.length+'] '+nm+': NO-HOTELS (raw:'+dt.elements.length+')');continue;}
    let ad=0;
    for(const h of hl){
      try{
        const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,h.city_id]);
        if(dp.rows.length)continue;
        await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,website,phone,address,wifi,parking,pool,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,$12,$13,$14,$15,\'osm\',$16,NOW())',[h.name,nm,country,h.lat,h.lng,h.stars,h.rating,h.website,h.phone,h.address,h.wifi,h.parking,h.pool,h.osm_id,h.city_id,h.slug]);
        ad++;
      }catch(e){
        if(ad<3)console.log('  INSERT ERR['+h.name+']: '+e.message.substring(0,100));
      }
    }
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci]);
    totalAdded+=ad;
    console.log('['+(i+1)+'/'+C.length+'] '+nm+': +'+ad+' (raw:'+hl.length+', existing:'+ex+')');
    await new Promise(r=>setTimeout(r,4000));
  }
  console.log('\n=== TOTAL ADDED: '+totalAdded+' ===');
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
