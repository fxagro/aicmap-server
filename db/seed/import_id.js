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
          let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{ok(JSON.parse(b))}catch(e){no(new Error('NotJSON'))}});
        });req.on('error',no);req.setTimeout(120000,()=>{req.destroy();no(new Error('Timeout'));});
        req.write(body);req.end();
      });
    }catch(e){
      if(r<retries-1){console.log('  Retry '+(r+1)+'/'+retries);await new Promise(r2=>setTimeout(r2,20000));}
      else throw e;
    }
  }
}
async function ensureCity(nm,lt,ln){
  const slug=sl(nm);
  let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[slug,'ID']);
  if(!r.rows.length){
    const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',[nm,slug,'ID',lt,ln,'Indonesia']);
    r={rows:[{id:ins.rows[0].id,hotel_count:0}]};
    console.log('  [NEW CITY] '+nm);
  }
  return r.rows[0];
}
async function main(){
  // Indonesia tourist destinations: [name, lat, lng, radius_m]
  const C=[
    ['Labuan Bajo',-8.4966,119.8878,30000],
    ['Raja Ampat',-0.5,130.5,60000],
    ['Manado',1.4748,124.8421,40000],
    ['Bunaken',1.6167,124.7000,20000],
    ['Parapat',2.6628,98.9347,15000],
    ['Samosir',2.5833,98.8167,30000],
    ['Bromo',-7.9425,112.9531,25000],
    ['Ijen',-8.0583,114.2417,25000],
    ['Belitung',-2.8667,107.7000,30000],
    ['Karimunjawa',-5.8333,110.4333,20000],
    ['Derawan',2.2833,118.2500,20000],
    ['Tana Toraja',-3.0000,119.9000,30000],
    ['Wakatobi',-5.3193,123.6000,30000],
    ['Sumbawa',-8.5000,117.5000,40000],
    ['Flores',-8.5833,121.0000,50000],
    ['Alor',-8.2500,124.7500,20000],
    ['Banda Neira',-4.5225,129.9014,15000],
    ['Ternate',0.7833,127.3667,20000],
    ['Morotai',2.3667,128.4167,15000],
    ['Senggigi',-8.4833,116.0333,15000],
    ['Kuta Lombok',-8.9000,116.2833,15000],
    ['Waingapu',-9.6500,120.2667,15000],
    ['Maumere',-8.6167,122.2000,15000],
    ['Bajawa',-8.7833,120.9667,12000],
    ['Ruteng',-8.6000,120.4667,12000],
    ['Soe',-9.8500,124.2833,10000],
    ['Kupang',-10.1667,123.5833,25000],
    ['Ende',-8.8333,121.6500,12000],
    ['Larantuka',-8.3500,122.9833,10000],
    ['Kalabahi',-8.2167,124.5833,10000],
    ['Pulau Weh',5.8333,95.3167,15000],
    ['Sabang',5.8833,95.3167,15000],
    ['Pangandaran',-7.6833,108.6500,20000],
    ['Cilacap',-7.7167,109.0167,20000],
    ['Garut',-7.2167,107.9000,20000],
    ['Tasikmalaya',-7.3333,108.2000,20000],
    ['Pacitan',-8.2000,111.1000,15000],
    ['Trenggalek',-8.0500,111.7167,15000],
    ['Blitar',-8.1000,112.1500,15000],
    ['Probolinggo',-7.7500,113.2167,15000],
    ['Situbondo',-7.7000,114.0000,15000],
    ['Bondowoso',-7.9167,113.8167,15000],
    ['Jember',-8.1667,113.7000,20000],
    ['Banyuwangi',-8.2167,114.3667,20000],
    ['Gresik',-7.1667,112.6500,15000],
    ['Lamongan',-7.1167,112.4167,15000],
    ['Bojonegoro',-7.1500,111.8833,15000],
    ['Tuban',-6.9000,112.0500,15000],
    ['Madiun',-7.6333,111.5333,15000],
    ['Ngawi',-7.4000,111.4500,10000],
    ['Ponorogo',-7.8667,111.4667,15000],
    ['Magetan',-7.6500,111.3333,10000],
    ['Pamekasan',-7.1667,113.4833,12000],
    ['Sumenep',-7.0000,113.8667,12000],
    ['Bangkalan',-7.0333,112.7333,10000],
    ['Tegal',-6.8667,109.1333,12000],
    ['Pekalongan',-6.8833,109.6667,12000],
    ['Kudus',-6.8000,110.8333,10000],
    ['Pati',-6.7500,111.0333,10000],
    ['Rembang',-6.7000,111.3500,10000],
    ['Cirebon',-6.7167,108.5667,20000],
    ['Indramayu',-6.3333,108.3333,12000],
    ['Subang',-6.5667,107.7500,15000],
    ['Sumedang',-6.8500,107.9167,12000],
    ['Purwakarta',-6.5500,107.4500,10000],
    ['Serang',-6.1167,106.1500,15000],
    ['Cilegon',-6.0000,106.0167,12000],
    ['Merauke',-8.5000,140.4000,25000],
    ['Timika',-4.5500,136.8833,20000],
    ['Biak',-1.1667,136.0833,15000],
    ['Sorong',-0.8667,131.2500,20000],
    ['Manokwari',-0.8667,134.0833,20000],
    ['Jayapura',-2.5333,140.7167,20000],
    ['Wamena',-4.1000,138.9500,15000],
  ];

  let totalAdded=0;
  for(let i=0;i<C.length;i++){
    const[nm,lt,ln,rad]=C[i];
    const ci=await ensureCity(nm,lt,ln);
    const q='[out:json][timeout:60];(node["tourism"="hotel"](around:'+rad+','+lt+','+ln+');way["tourism"="hotel"](around:'+rad+','+lt+','+ln+');node["tourism"="hostel"](around:'+rad+','+lt+','+ln+');way["tourism"="hostel"](around:'+rad+','+lt+','+ln+');node["tourism"="motel"](around:'+rad+','+lt+','+ln+');node["tourism"="guest_house"](around:'+rad+','+lt+','+ln+');way["tourism"="guest_house"](around:'+rad+','+lt+','+ln+'););out body;>;out skel qt;';
    let dt;
    try{dt=await fo(q);}catch(e){console.log('['+(i+1)+'/'+C.length+'] '+nm+': ERR');continue;}
    if(!dt.elements||!dt.elements.length){console.log('['+(i+1)+'/'+C.length+'] '+nm+': 0');continue;}
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
      const base=sl(nm2);const prefix=sl(nm);
      hl.push({name:nm2.trim(),slug:base.startsWith(prefix)?base:prefix+'-'+base,lat:la,lng:lo,stars:parseInt(e.tags.stars)||3,rating:e.tags.rating?parseFloat(e.tags.rating):4.0,wifi:e.tags.internet_access==='wlan'||e.tags.wifi==='yes',parking:e.tags.parking==='yes',pool:e.tags.pool==='yes',osm_id:e.id});
    }
    if(!hl.length){console.log('['+(i+1)+'/'+C.length+'] '+nm+': 0-named');continue;}
    let ad=0;
    for(const h of hl){
      try{
        const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,ci.id]);
        if(dp.rows.length)continue;
        await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,website,phone,address,wifi,parking,pool,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,$12,$13,$14,$15,\'osm\',$16,NOW())',
          [h.name,nm,'Indonesia',h.lat,h.lng,h.stars,h.rating,null,null,null,h.wifi,h.parking,h.pool,h.osm_id,ci.id,h.slug]);
        ad++;
      }catch(e){if(ad<3)console.log('  ERR['+h.name+']: '+e.message.substring(0,80));}
    }
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci.id]);
    totalAdded+=ad;
    console.log('['+(i+1)+'/'+C.length+'] '+nm+': +'+ad);
    await new Promise(r2=>setTimeout(r2,4000));
  }
  console.log('\n=== TOTAL ADDED: '+totalAdded+' ===');
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});