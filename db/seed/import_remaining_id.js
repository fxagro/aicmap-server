const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q,r6=5){for(let r=0;r<r6;r++){try{return await new Promise((ok,no)=>{const b='data='+q.split('\n').join('');const u=new URL(U);const h=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(b),'User-Agent':'curl/7.68.0','Accept':'*/*'}},re=>{let d='';re.on('data',c=>d+=c);re.on('end',()=>{try{ok(JSON.parse(d))}catch(e){no(new Error('NotJSON'))}});});h.on('error',no);h.setTimeout(120000,()=>{h.destroy();no(new Error('Timeout'));});h.write(b);h.end();})}catch(e){if(r<r6-1)await new Promise(r2=>setTimeout(r2,20000));else throw e;}}}
async function gc(nm,lt,ln){const slug=sl(nm);let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[slug,'ID']);if(!r.rows.length){const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',[nm,slug,'ID',lt,ln,'Indonesia']);console.log('  NEW:'+nm);r={rows:[{id:ins.rows[0].id,hotel_count:0}]};}return r.rows[0];}
async function main(){
  const spots=[
    // Danau Toba & Sumut
    ['Samosir',2.5833,98.8167,35000],['Parapat',2.6628,98.9347,25000],['Balige',2.3333,99.0667,15000],['Siborongborong',2.2167,98.9833,12000],['Tarutung',2.0167,98.9667,12000],['Sidikalang',2.7500,98.3167,12000],
    // Papua
    ['Jayapura',-2.5333,140.7167,30000],['Sentani',-2.5667,140.5167,15000],['Biak',-1.1667,136.0833,20000],['Timika',-4.5500,136.8833,25000],['Merauke',-8.5000,140.4000,25000],['Sorong',-0.8667,131.2500,25000],['Manokwari',-0.8667,134.0833,25000],['Wamena',-4.1000,138.9500,20000],['Nabire',-3.3667,135.5000,15000],
    // Maluku
    ['Ambon',-3.7000,128.1833,30000],['Ternate',0.7833,127.3667,20000],['Banda Neira',-4.5225,129.9014,18000],
    // NTT
    ['Kupang',-10.1667,123.5833,30000],['Waingapu',-9.6500,120.2667,20000],['Maumere',-8.6167,122.2000,20000],['Ende',-8.8333,121.6500,18000],['Bajawa',-8.7833,120.9667,15000],['Ruteng',-8.6000,120.4667,15000],['Soe',-9.8500,124.2833,15000],['Larantuka',-8.3500,122.9833,15000],['Kalabahi',-8.2167,124.5833,15000],['Alor',-8.2500,124.7500,20000],['Atambua',-9.1000,124.8833,12000],['Kefamenanu',-9.4500,124.4833,10000],
    // Sulawesi
    ['Manado',1.4748,124.8421,30000],['Gorontalo',0.5333,123.0667,20000],['Palu',-0.9000,119.8667,20000],['Kendari',-3.9667,122.5167,20000],['Bau Bau',-5.4667,122.6167,15000],['Ternate',0.7833,127.3667,20000],['Bitung',1.4500,125.2000,15000],['Tomohon',1.3333,124.8333,12000],['Tondano',1.3000,124.9000,10000],
    // Kota besar yang masih kosong
    ['Cimanggis',-6.4000,106.8500,12000],['Ciputat',-6.3000,106.7500,12000],['Pondokaren',-6.2667,106.7833,10000],
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
      const nn=nm2.toLowerCase().replace(/[^a-z0-9]/g,'');if(sn.has(nn))continue;sn.add(nn);
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