const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q,r6=5){for(let r=0;r<r6;r++){try{return await new Promise((ok,no)=>{const b='data='+q.split('\n').join('');const u=new URL(U);const h=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(b),'User-Agent':'curl/7.68.0','Accept':'*/*'}},re=>{let d='';re.on('data',c=>d+=c);re.on('end',()=>{try{ok(JSON.parse(d))}catch(e){no(new Error('NotJSON'))}});});h.on('error',no);h.setTimeout(120000,()=>{h.destroy();no(new Error('Timeout'));});h.write(b);h.end();})}catch(e){if(r<r6-1)await new Promise(r2=>setTimeout(r2,20000));else throw e;}}}
async function gc(nm,lt,ln){const slug=sl(nm);let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[slug,'ID']);if(!r.rows.length){const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',[nm,slug,'ID',lt,ln,'Indonesia']);console.log('  NEW:'+nm);r={rows:[{id:ins.rows[0].id,hotel_count:0}]};}return r.rows[0];}
async function main(){
  const spots=[
    // Kalimantan
    ['Balikpapan',-1.2667,116.8333,30000],['Samarinda',-0.5000,117.1500,30000],['Banjarmasin',-3.3333,114.5833,30000],['Banjarbaru',-3.4667,114.7500,15000],['Pontianak',-0.0333,109.3333,25000],['Singkawang',0.9000,109.0000,15000],['Palangkaraya',-2.2167,113.9167,20000],['Tanjung Selor',2.8500,117.3667,10000],['Tanjung Redeb',2.1500,117.5000,10000],['Sampit',-2.5333,112.9500,12000],['Kotabaru',-3.0000,115.8333,10000],['Tarakan',3.3000,117.6333,15000],['Bontang',0.1333,117.5000,12000],['Nunukan',4.1333,117.6667,10000],
    // Sumatra
    ['Banda Aceh',5.5500,95.3167,20000],['Sabang',5.8833,95.3167,15000],['Pulau Weh',5.8333,95.3167,15000],['Medan',3.5833,98.6667,30000],['Berastagi',3.1833,98.5167,15000],['Bukittinggi',-0.3000,100.3667,15000],['Padang',-0.9500,100.3500,25000],['Payakumbuh',-0.2167,100.6333,12000],['Solok',-0.7833,100.6500,10000],['Sawahlunto',-0.6833,100.7833,10000],['Dumai',1.6667,101.4500,15000],['Pekanbaru',0.5333,101.4500,25000],['Tanjung Pinang',0.9167,104.4500,15000],['Batam',1.0833,104.0333,25000],['Tanjung Balai',2.9667,99.8000,12000],['Sibolga',1.7333,98.7833,12000],['Gunungsitoli',1.2833,97.6167,12000],['Padang Sidempuan',1.3833,99.2667,12000],['Pematang Siantar',2.9667,99.0667,15000],['Binjai',3.6000,98.5000,12000],['Tebing Tinggi',3.3333,99.1667,10000],['Kisaran',2.9833,99.6167,12000],['Rantauprapat',2.1000,99.8333,12000],['Jambi',-1.6000,103.6167,20000],['Bengkulu',-3.8000,102.2667,20000],['Palembang',-2.9833,104.7644,30000],['Lubuklinggau',-3.3000,102.8667,12000],['Baturaja',-4.1333,104.1667,10000],['Pagar Alam',-4.0167,103.2500,10000],['Lahat',-3.7833,103.5333,10000],['Prabumulih',-3.4333,104.2333,12000],['Bandar Lampung',-5.4167,105.2667,25000],['Metro',-5.1167,105.3000,10000],['Kotabumi',-4.8333,104.8833,10000],['Liwa',-5.0333,104.0833,10000],
    // Sulawesi
    ['Makassar',-5.1333,119.4167,30000],['Manado',1.4748,124.8421,30000],['Palu',-0.9000,119.8667,25000],['Gorontalo',0.5333,123.0667,20000],['Kendari',-3.9667,122.5167,20000],['Bau Bau',-5.4667,122.6167,15000],['Bitung',1.4500,125.2000,15000],['Tomohon',1.3333,124.8333,12000],['Tondano',1.3000,124.9000,10000],['Kotamobagu',0.7333,124.3167,10000],['Palopo',-2.9833,120.2000,15000],['Parepare',-4.0167,119.6333,12000],['Watampone',-4.5333,120.3333,10000],['Sengkang',-4.1500,120.0333,10000],['Pinrang',-3.7833,119.6500,10000],['Mamuju',-2.6833,118.8833,12000],['Majene',-3.5500,118.9667,10000],['Polewali',-3.4333,119.3333,10000],
    // Maluku Utara & Maluku
    ['Ternate',0.7833,127.3667,20000],['Tidore',0.6833,127.4000,15000],['Sofifi',0.7333,127.5833,10000],['Jailolo',1.0833,127.4833,10000],['Ambon',-3.7000,128.1833,30000],['Masohi',-3.3000,128.9667,10000],['Tual',-5.6333,132.7500,12000],['Saumlaki',-7.9833,131.3000,10000],
    // Papua
    ['Jayapura',-2.5333,140.7167,30000],['Sorong',-0.8667,131.2500,25000],['Manokwari',-0.8667,134.0833,25000],['Nabire',-3.3667,135.5000,15000],['Serui',-1.8833,136.2333,10000],['Biak',-1.1667,136.0833,20000],['Timika',-4.5500,136.8833,20000],['Merauke',-8.5000,140.4000,20000],['Wamena',-4.1000,138.9500,20000],['Fakfak',-2.9167,132.3000,10000],
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
    total+=ad;console.log('['+(i+1)+'/'+spots.length+'] '+nm+': +'+ad);
    await new Promise(r2=>setTimeout(r2,4000));
  }
  console.log('\n=== TOTAL ADDED: '+total+' ===');await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});