const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q,retries=5){
  for(let r=0;r<retries;r++){
    try{return await new Promise((ok,no)=>{
      const body='data='+q.split('\n').join('');const u=new URL(U);
      const req=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body),'User-Agent':'curl/7.68.0','Accept':'*/*'}},res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{ok(JSON.parse(b))}catch(e){no(new Error('NotJSON'))}});});
      req.on('error',no);req.setTimeout(120000,()=>{req.destroy();no(new Error('Timeout'));});
      req.write(body);req.end();
    })}catch(e){if(r<retries-1){await new Promise(r2=>setTimeout(r2,20000))}else throw e;}
  }
}
async function ensureCity(nm,lt,ln){
  const slug=sl(nm);let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[slug,'ID']);
  if(!r.rows.length){const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',[nm,slug,'ID',lt,ln,'Jawa Barat']);r={rows:[{id:ins.rows[0].id,hotel_count:0}]};}
  return r.rows[0];
}
async function main(){
  const spots=[
    ['Puncak',-6.7121,106.9654,20000],
    ['Cipanas',-6.7333,107.0333,15000],
    ['Cisarua',-6.6833,106.9333,10000],
    ['Gadog',-6.6833,106.9500,8000],
    ['Megamendung',-6.6667,106.8833,10000],
    ['Bogor',-6.5978,106.7993,25000],
    ['Sentul',-6.5667,106.8333,12000],
    ['Cibinong',-6.4833,106.8500,12000],
    ['Citeureup',-6.4833,106.8833,8000],
    ['Sukaraja',-6.5833,106.8500,8000],
    ['Cileungsi',-6.4000,106.9667,10000],
    ['Gunung Putri',-6.4333,106.9167,8000],
    ['Klapanunggal',-6.4500,106.9500,8000],
  ];
  let total=0;
  for(let i=0;i<spots.length;i++){
    const[nm,lt,ln,rad]=spots[i];
    const ci=await ensureCity(nm,lt,ln);
    const q='[out:json][timeout:60];(node["tourism"="hotel"](around:'+rad+','+lt+','+ln+');way["tourism"="hotel"](around:'+rad+','+lt+','+ln+');node["tourism"="hostel"](around:'+rad+','+lt+','+ln+');way["tourism"="hostel"](around:'+rad+','+lt+','+ln+');node["tourism"="motel"](around:'+rad+','+lt+','+ln+');node["tourism"="guest_house"](around:'+rad+','+lt+','+ln+');way["tourism"="guest_house"](around:'+rad+','+lt+','+ln+'););out body;>;out skel qt;';
    let dt;
    try{dt=await fo(q);}catch(e){console.log('['+(i+1)+'] '+nm+': ERR');continue;}
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
    if(!hl.length)continue;
    let ad=0;
    for(const h of hl){
      try{const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,ci.id]);if(dp.rows.length)continue;
      await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,NOW())',[h.name,nm,'Indonesia',h.lat,h.lng,h.stars,h.rating,h.osm_id,ci.id,'osm',h.slug]);ad++;
      }catch(e){}
    }
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci.id]);
    total+=ad;console.log('['+(i+1)+'/'+spots.length+'] '+nm+': +'+ad);
    await new Promise(r2=>setTimeout(r2,4000));
  }
  console.log('\n=== TOTAL ADDED: '+total+' ===');await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});