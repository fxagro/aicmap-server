const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q,r6=5){for(let r=0;r<r6;r++){try{return await new Promise((ok,no)=>{const b='data='+q.split('\n').join('');const u=new URL(U);const h=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(b),'User-Agent':'curl/7.68.0','Accept':'*/*'}},re=>{let d='';re.on('data',c=>d+=c);re.on('end',()=>{try{ok(JSON.parse(d))}catch(e){no(new Error('NotJSON'))}});});h.on('error',no);h.setTimeout(120000,()=>{h.destroy();no(new Error('Timeout'));});h.write(b);h.end();})}catch(e){if(r<r6-1)await new Promise(r2=>setTimeout(r2,20000));else throw e;}}}
async function gc(nm,cc,lt,ln){const slug=sl(nm);let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[slug,cc]);if(!r.rows.length){const co=await pool.query('SELECT name FROM countries WHERE code=$1',[cc]);const n=co.rows.length?co.rows[0].name:cc;const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',[nm,slug,cc,lt,ln,n]);r={rows:[{id:ins.rows[0].id,hotel_count:0}]};}return r.rows[0];}
async function main(){
  const spots=[
    // ASIA thin countries
    ['Karachi','PK',24.8607,67.0011,30000],['Lahore','PK',31.5497,74.3436,25000],['Islamabad','PK',33.6844,73.0479,25000],
    ['Dhaka','BD',23.8103,90.4125,30000],['Chittagong','BD',22.3569,91.7832,20000],
    ['Colombo','LK',6.9271,79.8612,25000],['Kandy','LK',7.2906,80.6337,15000],['Galle','LK',6.0329,80.2168,15000],
    ['Kathmandu','NP',27.7172,85.3240,25000],['Pokhara','NP',28.2096,83.9856,20000],
    // Middle East
    ['Tehran','IR',35.6892,51.3890,30000],['Isfahan','IR',32.6546,51.6680,15000],['Shiraz','IR',29.5918,52.5837,15000],
    ['Baghdad','IQ',33.3152,44.3661,20000],['Erbil','IQ',36.1911,44.0092,15000],
    ['Damascus','SY',33.5138,36.2765,15000],['Sanaa','YE',15.3694,44.1910,15000],
    ['Amman','JO',31.9454,35.9284,20000],['Beirut','LB',33.8938,35.5018,15000],
    // AFRICA
    ['Algiers','DZ',36.7372,3.0872,25000],['Oran','DZ',35.6972,-0.6338,15000],
    ['Khartoum','SD',15.5007,32.5599,20000],['Addis Ababa','ET',9.0241,38.7469,25000],
    ['Lagos','NG',6.4541,3.3947,30000],['Abuja','NG',9.0579,7.4951,20000],
    ['Mogadishu','SO',2.0469,45.3182,15000],['Hargeisa','SO',9.5624,44.0770,10000],
    ['Tripoli','LY',32.8872,13.1913,20000],['Asmara','ER',15.3333,38.9333,10000],
    ['Bissau','GW',11.8636,-15.5847,12000],['Monrovia','LR',6.3008,-10.7970,15000],
    ['Freetown','SL',8.4657,-13.2317,15000],['Ouagadougou','BF',12.3714,-1.5197,15000],
    ['Conakry','GN',9.6412,-13.5784,15000],['Praia','CV',14.9330,-23.5133,10000],
    ['Nouakchott','MR',18.0735,-15.9582,12000],
    // AMERICA thin
    ['Caracas','VE',10.4806,-66.9036,25000],['Maracaibo','VE',10.6333,-71.6333,15000],
    ['Montevideo','UY',-34.9011,-56.1645,20000],['Punta del Este','UY',-34.9475,-54.9338,12000],
    ['Asuncion','PY',-25.2867,-57.5833,20000],['Managua','NI',12.1149,-86.2362,15000],
    ['Tegucigalpa','HN',14.0723,-87.1921,15000],['Paramaribo','SR',5.8520,-55.2038,12000],
    // EUROPE thin
    ['Minsk','BY',53.9045,27.5615,20000],['Bishkek','KG',42.8746,74.5698,15000],
    ['Dushanbe','TJ',38.5598,68.7870,15000],
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
    total+=ad;console.log('['+(i+1)+'/'+spots.length+'] '+nm+': +'+ad);
    await new Promise(r2=>setTimeout(r2,4000));
  }
  console.log('\nTOTAL ADDED: '+total);await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});