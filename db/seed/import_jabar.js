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
      if(r<retries-1){console.log('  Retry');await new Promise(r2=>setTimeout(r2,20000));}
      else throw e;
    }
  }
}
async function getOrCreate(name,slug,lt,ln){
  let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[slug,'ID']);
  if(!r.rows.length){
    const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',[name,slug,'ID',lt,ln,'Jawa Barat']);
    console.log('  NEW CITY: '+name);
    r={rows:[{id:ins.rows[0].id,hotel_count:0}]};
  }
  return r.rows[0];
}
async function main(){
  const spots=[
    ['Lembang',-6.8117,107.6183,12000],
    ['Pangalengan',-7.1833,107.5833,12000],
    ['Ciwidey',-7.1000,107.4333,12000],
    ['Cipanas',-6.7333,107.0333,15000],
    ['Puncak',-6.7121,106.9654,10000],
    ['Pelabuhan Ratu',-6.9833,106.5500,15000],
    ['Sindangbarang',-7.4167,107.1667,10000],
    ['Rancabuaya',-7.5833,107.3000,10000],
    ['Cianjur',-6.8200,107.1400,15000],
    ['Sukabumi',-6.9175,106.9270,20000],
    ['Garut',-7.2024,107.8163,20000],
    ['Tasikmalaya',-7.3333,108.2000,20000],
    ['Ciamis',-7.3333,108.3500,15000],
    ['Banjar',-7.3667,108.5333,12000],
    ['Cilacap',-7.7167,109.0167,20000],
    ['Pangandaran',-7.6833,108.6500,20000],
    ['Baturaden',-7.3000,109.2167,10000],
    ['Banyumas',-7.5167,109.2833,12000],
    ['Wonosobo',-7.3667,109.9000,15000],
    ['Dieng',-7.2000,109.9167,10000],
    ['Magelang',-7.4833,110.2167,15000],
    ['Borobudur',-7.6083,110.2042,10000],
    ['Kopeng',-7.4167,110.4333,10000],
    ['Salatiga',-7.3333,110.5000,12000],
    ['Ambarawa',-7.2667,110.4000,10000],
    ['Bandungan',-7.2167,110.3833,10000],
    ['Ungaran',-7.1333,110.4000,12000],
    ['Kendal',-6.9333,110.4000,12000],
    ['Pekalongan',-6.8833,109.6667,12000],
    ['Batang',-6.9000,109.7333,10000],
    ['Tegal',-6.8667,109.1333,12000],
    ['Brebes',-6.8667,109.0333,10000],
    ['Indramayu',-6.3333,108.3333,12000],
    ['Cirebon',-6.7167,108.5667,20000],
    ['Majalengka',-6.8333,108.2167,12000],
    ['Kuningan',-6.9833,108.4833,12000],
    ['Subang',-6.5667,107.7500,15000],
    ['Purwakarta',-6.5500,107.4500,12000],
    ['Karawang',-6.3100,107.3100,15000],
    ['Bekasi',-6.2333,107.0000,15000],
    ['Depok',-6.4050,106.8173,15000],
  ];
  let total=0;
  for(let i=0;i<spots.length;i++){
    const[nm,lt,ln,rad]=spots[i];
    const ci=await getOrCreate(nm,sl(nm),lt,ln);
    const q='[out:json][timeout:60];(node["tourism"="hotel"](around:'+rad+','+lt+','+ln+');way["tourism"="hotel"](around:'+rad+','+lt+','+ln+');node["tourism"="hostel"](around:'+rad+','+lt+','+ln+');way["tourism"="hostel"](around:'+rad+','+lt+','+ln+'););out body;>;out skel qt;';
    let dt;
    try{dt=await fo(q);}catch(e){console.log('['+(i+1)+'] '+nm+': ERR');continue;}
    if(!dt.elements||!dt.elements.length){console.log('['+(i+1)+'] '+nm+': 0');continue;}
    const nd={};for(const e of dt.elements){if(e.type==='node'&&e.lat&&e.lon)nd[e.id]={lat:e.lat,lng:e.lon};}
    const hl=[],sn=new Set();
    for(const e of dt.elements){
      if(e.type!=='way'&&e.type!=='node')continue;if(!e.tags)continue;
      const nm2=e.tags.name;if(!nm2||nm2.length<2)continue;
      if(sn.has(nm2.toLowerCase().replace(/[^a-z0-9]/g,'')))continue;sn.add(nm2.toLowerCase().replace(/[^a-z0-9]/g,''));
      let la,lo;
      if(e.type==='node'){la=e.lat;lo=e.lon;}
      else if(e.nodes){for(const id of e.nodes){if(nd[id]){la=nd[id].lat;lo=nd[id].lng;break;}}}
      if(!la||!lo)continue;
      const base=sl(nm2);const prefix=sl(nm);
      hl.push({name:nm2.trim(),slug:base.startsWith(prefix)?base:prefix+'-'+base,lat:la,lng:lo,stars:parseInt(e.tags.stars)||3,rating:e.tags.rating?parseFloat(e.tags.rating):4.0,osm_id:e.id});
    }
    if(!hl.length)continue;
    let ad=0;
    for(const h of hl){
      try{
        const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,ci.id]);
        if(dp.rows.length)continue;
        await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,NOW())',
          [h.name,nm,'Indonesia',h.lat,h.lng,h.stars,h.rating,h.osm_id,ci.id,'osm',h.slug]);
        ad++;
      }catch(e){}
    }
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci.id]);
    total+=ad;
    console.log('['+(i+1)+'/'+spots.length+'] '+nm+': +'+ad);
    await new Promise(r2=>setTimeout(r2,4000));
  }
  console.log('\n=== TOTAL ADDED: '+total+' ===');
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});