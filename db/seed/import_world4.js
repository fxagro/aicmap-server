const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';

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
  }
  return r.rows[0];
}
async function main() {
  // Grab ALL countries from DB that need hotels (skip tiny unpopulated islands)
  const skip=['AQ','BV','HM','TF','GS','UM','PN','SJ','TK','NU','NF','CC','CX','IO','SH','PM','MF','BL','MS','GG','JE','IM','FO','AX','AW','BQ','CW','SX','KY','VG','VI','TC','AI','BM','GI','LI','MC','SM','VA','FK','GS','EH','PS','KP'];
  const {rows:countries}=await pool.query(
    `SELECT code,name,slug,lat,lng,region,population,capital FROM countries
     WHERE code NOT IN (SELECT DISTINCT country_code FROM cities WHERE hotel_count>0)
     AND code != ALL($1)
     AND population IS NOT NULL
     ORDER BY population DESC`,[skip]
  );
  console.log('Countries to process:', countries.length);

  let totalAdded=0;
  for(let i=0;i<countries.length;i++){
    const c=countries[i];
    const cityName=c.capital||c.name;
    const rad=Math.max(50000,Math.min(200000,Math.sqrt(c.population||1000000)*0.5));
    const query='[out:json][timeout:90];(node["tourism"="hotel"](around:'+rad+','+c.lat+','+c.lng+');way["tourism"="hotel"](around:'+rad+','+c.lat+','+c.lng+');node["tourism"="hostel"](around:'+rad+','+c.lat+','+c.lng+');way["tourism"="hostel"](around:'+rad+','+c.lat+','+c.lng+');node["tourism"="motel"](around:'+rad+','+c.lat+','+c.lng+');node["tourism"="guest_house"](around:'+rad+','+c.lat+','+c.lng+');way["tourism"="guest_house"](around:'+rad+','+c.lat+','+c.lng+'););out body;>;out skel qt;';
    let dt;
    try{dt=await fo(query);}catch(e){console.log('['+(i+1)+'/'+countries.length+'] '+c.name+': ERR-'+e.message.substring(0,80));await new Promise(r2=>setTimeout(r2,10000));continue;}
    if(!dt.elements||!dt.elements.length){console.log('['+(i+1)+'/'+countries.length+'] '+c.name+': 0');continue;}
    const nd={};for(const e of dt.elements){if(e.type==='node'&&e.lat&&e.lon)nd[e.id]={lat:e.lat,lng:e.lon};}
    const hl=[],sn=new Set();
    for(const e of dt.elements){
      if(e.type!=='way'&&e.type!=='node')continue;if(!e.tags)continue;
      const nm=e.tags.name;if(!nm||nm.length<2)continue;
      const nn=nm.toLowerCase().replace(/[^a-z0-9]/g,'');if(sn.has(nn))continue;sn.add(nn);
      let la,lo;
      if(e.type==='node'){la=e.lat;lo=e.lon;}
      else if(e.nodes){for(const id of e.nodes){if(nd[id]){la=nd[id].lat;lo=nd[id].lng;break;}}}
      if(!la||!lo)continue;
      const base=sl(nm);const cityPrefix=sl(cityName);
      const dedup_slug=base.startsWith(cityPrefix)?base:cityPrefix+'-'+base;
      hl.push({name:nm.trim(),slug:dedup_slug,lat:la,lng:lo,stars:parseInt(e.tags.stars)||3,rating:e.tags.rating?parseFloat(e.tags.rating):4.0,wifi:e.tags.internet_access==='wlan'||e.tags.wifi==='yes',parking:e.tags.parking==='yes'||e.tags.parking==='surface',pool:e.tags.pool==='yes',osm_id:e.id});
    }
    if(!hl.length){console.log('['+(i+1)+'/'+countries.length+'] '+c.name+': 0-named');continue;}
    // Assign all to a single city (capital) for this country
    const ci=await ensureCity(cityName,sl(cityName),c.code,c.lat,c.lng);
    let ad=0;
    for(const h of hl){
      try{
        const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,ci.id]);
        if(dp.rows.length)continue;
        await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,website,phone,address,wifi,parking,pool,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,$12,$13,$14,$15,\'osm\',$16,NOW())',
          [h.name,cityName,c.name,h.lat,h.lng,h.stars,h.rating,null,null,null,h.wifi,h.parking,h.pool,h.osm_id,ci.id,h.slug]);
        ad++;
      }catch(e){if(ad<3)console.log('  ERR['+h.name+']: '+e.message.substring(0,80));}
    }
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci.id]);
    totalAdded+=ad;
    console.log('['+(i+1)+'/'+countries.length+'] '+c.name+': +'+ad);
    await new Promise(r2=>setTimeout(r2,5000));
  }
  // Second pass: also import for major cities in countries that already have some hotels
  const {rows:under}=await pool.query(
    `SELECT c.id AS cid, c.name, c.slug, c.country_code, c.lat, c.lng, c.hotel_count, cc.name AS country, cc.lat AS clat, cc.lng AS clng
     FROM cities c JOIN countries cc ON cc.code=c.country_code
     WHERE c.hotel_count=0 AND c.population IS NOT NULL AND c.population>200000
     AND c.country_code IN (SELECT DISTINCT country_code FROM cities WHERE hotel_count>0)
     ORDER BY c.population DESC LIMIT 200`
  );
  console.log('\nSecond pass: '+under.length+' major empty cities');
  for(let i=0;i<under.length;i++){
    const c=under[i];
    const rad=Math.max(20000,Math.min(80000,Math.sqrt(c.population||500000)*0.3));
    const query='[out:json][timeout:60];(node["tourism"="hotel"](around:'+rad+','+c.lat+','+c.lng+');way["tourism"="hotel"](around:'+rad+','+c.lat+','+c.lng+');node["tourism"="hostel"](around:'+rad+','+c.lat+','+c.lng+');way["tourism"="hostel"](around:'+rad+','+c.lat+','+c.lng+'););out body;>;out skel qt;';
    let dt;
    try{dt=await fo(query);}catch(e){console.log('['+(i+1)+'/'+under.length+'] '+c.name+': ERR');continue;}
    if(!dt.elements||!dt.elements.length)continue;
    const nd={};for(const e of dt.elements){if(e.type==='node'&&e.lat&&e.lon)nd[e.id]={lat:e.lat,lng:e.lon};}
    const hl=[],sn=new Set();
    for(const e of dt.elements){
      if(e.type!=='way'&&e.type!=='node')continue;if(!e.tags)continue;
      const nm=e.tags.name;if(!nm||nm.length<2)continue;
      const nn=nm.toLowerCase().replace(/[^a-z0-9]/g,'');if(sn.has(nn))continue;sn.add(nn);
      let la,lo;
      if(e.type==='node'){la=e.lat;lo=e.lon;}
      else if(e.nodes){for(const id of e.nodes){if(nd[id]){la=nd[id].lat;lo=nd[id].lng;break;}}}
      if(!la||!lo)continue;
      const base=sl(nm);const cityPrefix=sl(c.name);
      const dedup_slug=base.startsWith(cityPrefix)?base:cityPrefix+'-'+base;
      hl.push({name:nm.trim(),slug:dedup_slug,lat:la,lng:lo,stars:parseInt(e.tags.stars)||3,rating:e.tags.rating?parseFloat(e.tags.rating):4.0,wifi:e.tags.internet_access==='wlan',parking:e.tags.parking==='yes',pool:e.tags.pool==='yes',osm_id:e.id});
    }
    if(!hl.length)continue;
    let ad=0;
    for(const h of hl){
      try{
        const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,c.cid]);
        if(dp.rows.length)continue;
        await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,website,phone,address,wifi,parking,pool,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,$12,$13,$14,$15,\'osm\',$16,NOW())',
          [h.name,c.name,c.country,h.lat,h.lng,h.stars,h.rating,null,null,null,h.wifi,h.parking,h.pool,h.osm_id,c.cid,h.slug]);
        ad++;
      }catch(e){}
    }
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[c.cid]);
    totalAdded+=ad;
    console.log('['+(i+1)+'/'+under.length+'] '+c.name+': +'+ad);
    await new Promise(r2=>setTimeout(r2,5000));
  }
  console.log('\n=== TOTAL ADDED: '+totalAdded+' ===');
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});