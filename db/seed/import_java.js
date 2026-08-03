const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q,r6=5){for(let r=0;r<r6;r++){try{return await new Promise((ok,no)=>{const b='data='+q.split('\n').join('');const u=new URL(U);const h=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(b),'User-Agent':'curl/7.68.0','Accept':'*/*'}},re=>{let d='';re.on('data',c=>d+=c);re.on('end',()=>{try{ok(JSON.parse(d))}catch(e){no(new Error('NotJSON'))}});});h.on('error',no);h.setTimeout(120000,()=>{h.destroy();no(new Error('Timeout'));});h.write(b);h.end();})}catch(e){if(r<r6-1)await new Promise(r2=>setTimeout(r2,20000));else throw e;}}}
async function gc(nm,lt,ln){const slug=sl(nm);let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[slug,'ID']);if(!r.rows.length){const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',[nm,slug,'ID',lt,ln,'Indonesia']);console.log('  NEW:'+nm);r={rows:[{id:ins.rows[0].id,hotel_count:0}]};}return r.rows[0];}
async function main(){
  const spots=[
    // West Java remaining
    ['Sumedang',-6.8500,107.9167,15000],['Indramayu',-6.3333,108.3333,15000],['Brebes',-6.8667,109.0333,12000],['Batang',-6.9000,109.7333,12000],
    // Central Java
    ['Tegal',-6.8667,109.1333,15000],['Pekalongan',-6.8833,109.6667,15000],['Kopeng',-7.4167,110.4333,12000],['Ambarawa',-7.2667,110.4000,12000],['Salatiga',-7.3333,110.5000,15000],['Ungaran',-7.1333,110.4000,15000],['Magelang',-7.4833,110.2167,20000],['Borobudur',-7.6083,110.2042,12000],['Dieng',-7.2000,109.9167,12000],['Wonosobo',-7.3667,109.9000,15000],['Purwokerto',-7.4167,109.2333,15000],['Banyumas',-7.5167,109.2833,12000],['Cilacap',-7.7167,109.0167,20000],['Kebumen',-7.6667,109.6667,12000],['Purworejo',-7.7167,110.0167,12000],['Kudus',-6.8000,110.8333,12000],['Jepara',-6.5833,110.6667,12000],['Pati',-6.7500,111.0333,12000],['Rembang',-6.7000,111.3500,12000],['Blora',-6.9667,111.4167,12000],['Sragen',-7.4167,111.0167,10000],['Klaten',-7.7000,110.6000,10000],['Boyolali',-7.5333,110.6000,10000],['Sukoharjo',-7.6833,110.8167,10000],['Karanganyar',-7.6000,110.9500,10000],['Wonogiri',-7.8167,110.9167,10000],
    // East Java
    ['Madiun',-7.6333,111.5333,15000],['Ngawi',-7.4000,111.4500,12000],['Magetan',-7.6500,111.3333,12000],['Ponorogo',-7.8667,111.4667,15000],['Pacitan',-8.2000,111.1000,15000],['Trenggalek',-8.0500,111.7167,15000],['Tulungagung',-8.0667,111.9000,12000],['Blitar',-8.1000,112.1500,15000],['Kediri',-7.8167,112.0167,15000],['Nganjuk',-7.6000,111.9000,12000],['Jombang',-7.5500,112.2333,12000],['Mojokerto',-7.4667,112.4333,12000],['Pasuruan',-7.6500,112.9000,12000],['Probolinggo',-7.7500,113.2167,15000],['Situbondo',-7.7000,114.0000,15000],['Bondowoso',-7.9167,113.8167,15000],['Jember',-8.1667,113.7000,20000],['Lumajang',-8.1333,113.2167,15000],['Banyuwangi',-8.2167,114.3667,20000],['Bojonegoro',-7.1500,111.8833,15000],['Tuban',-6.9000,112.0500,15000],['Lamongan',-7.1167,112.4167,12000],['Gresik',-7.1667,112.6500,15000],['Sidoarjo',-7.4500,112.7167,12000],['Bangil',-7.6000,112.8167,10000],
    // Madura
    ['Bangkalan',-7.0333,112.7333,12000],['Pamekasan',-7.1667,113.4833,12000],['Sumenep',-7.0000,113.8667,12000],
  ];
  let total=0;
  for(let i=0;i<spots.length;i++){
    const[nm,lt,ln,rad]=spots[i];const ci=await gc(nm,lt,ln);
    const q='[out:json][timeout:60];(node["tourism"="hotel"](around:'+rad+','+lt+','+ln+');way["tourism"="hotel"](around:'+rad+','+lt+','+ln+');node["tourism"="hostel"](around:'+rad+','+lt+','+ln+');way["tourism"="hostel"](around:'+rad+','+lt+','+ln+');node["tourism"="motel"](around:'+rad+','+lt+','+ln+');node["tourism"="guest_house"](around:'+rad+','+lt+','+ln+');way["tourism"="guest_house"](around:'+rad+','+lt+','+ln+'););out body;>;out skel qt;';
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
    for(const h of hl){try{const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,ci.id]);if(dp.rows.length)continue;await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,NOW())',[h.name,nm,'Indonesia',h.lat,h.lng,h.stars,h.rating,h.osm_id,ci.id,'osm',h.slug]);ad++;}catch(e){}}
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci.id]);
    total+=ad;console.log('['+(i+1)+'] '+nm+': +'+ad);
    await new Promise(r2=>setTimeout(r2,4000));
  }
  console.log('\n=== TOTAL ADDED: '+total+' ===');await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});