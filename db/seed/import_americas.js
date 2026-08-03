const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q,r6=5){for(let r=0;r<r6;r++){try{return await new Promise((ok,no)=>{const b='data='+q.split('\n').join('');const u=new URL(U);const h=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(b),'User-Agent':'curl/7.68.0','Accept':'*/*'}},re=>{let d='';re.on('data',c=>d+=c);re.on('end',()=>{try{ok(JSON.parse(d))}catch(e){no(new Error('NotJSON'))}});});h.on('error',no);h.setTimeout(120000,()=>{h.destroy();no(new Error('Timeout'));});h.write(b);h.end();})}catch(e){if(r<r6-1)await new Promise(r2=>setTimeout(r2,20000));else throw e;}}}
async function gc(nm,cc,lt,ln){const slug=sl(nm);let r=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1 AND country_code=$2',[slug,cc]);if(!r.rows.length){const co=await pool.query('SELECT name FROM countries WHERE code=$1',[cc]);const n=co.rows.length?co.rows[0].name:cc;const ins=await pool.query('INSERT INTO cities(name,slug,country_code,lat,lng,region,hotel_count) VALUES($1,$2,$3,$4,$5,$6,0) RETURNING id',[nm,slug,cc,lt,ln,n]);console.log('  NEW:'+nm);r={rows:[{id:ins.rows[0].id,hotel_count:0}]};}return r.rows[0];}
async function main(){
  const spots=[
    // CARIBBEAN (tons of 0 hotel countries!)
    ['Havana','CU',23.1136,-82.3666,20000],['Varadero','CU',23.1568,-81.2514,12000],['Santiago de Cuba','CU',20.0247,-75.8218,10000],
    ['Nassau','BS',25.0343,-77.3963,15000],['Paradise Island','BS',25.0833,-77.3167,8000],['Freeport','BS',26.5333,-78.7000,10000],
    ['Aruba','AW',12.5211,-69.9683,15000],['Bermuda','BM',32.3078,-64.7505,15000],['Grand Cayman','KY',19.3133,-81.2546,12000],
    ['Providenciales','TC',21.7895,-72.2321,10000],['Willemstad','CW',12.1084,-68.9335,10000],['Philipsburg','SX',18.0260,-63.0458,8000],
    ['San Juan','PR',18.4655,-66.1057,20000],['Ponce','PR',18.0111,-66.6141,10000],['Punta Cana','DO',18.5820,-68.4051,15000],['Santo Domingo','DO',18.4861,-69.9312,20000],['Puerto Plata','DO',19.7958,-70.6946,12000],
    ['Port-au-Prince','HT',18.5944,-72.3074,15000],['Cap-Haitien','HT',19.7518,-72.1987,10000],['Kingston','JM',17.9714,-76.7936,12000],['Montego Bay','JM',18.4762,-77.8939,10000],['Negril','JM',18.2678,-78.3457,8000],
    ['St Johns','AG',17.1274,-61.8468,10000],['Bridgetown','BB',13.0976,-59.6165,10000],['Castries','LC',14.0101,-60.9875,8000],['St Georges','GD',12.0561,-61.7488,8000],['Basseterre','KN',17.3026,-62.7177,8000],['Port of Spain','TT',10.6600,-61.5086,10000],
    // CENTRAL AMERICA
    ['Panama City','PA',8.9824,-79.5199,20000],['Bocas del Toro','PA',9.3392,-82.2488,10000],['San José','CR',9.9281,-84.0907,20000],['Manuel Antonio','CR',9.4056,-84.1565,8000],['Managua','NI',12.1149,-86.2362,15000],['Granada','NI',11.9344,-85.9560,10000],['Tegucigalpa','HN',14.0723,-87.1921,15000],['Roatan','HN',16.3175,-86.5372,10000],['San Salvador','SV',13.6929,-89.2182,15000],['Guatemala City','GT',14.6349,-90.5069,20000],['Antigua Guatemala','GT',14.5586,-90.7333,10000],['Belize City','BZ',17.5046,-88.1962,10000],
    // SOUTH AMERICA - severely thin
    ['Caracas','VE',10.4806,-66.9036,20000],['Maracaibo','VE',10.6333,-71.6333,15000],['Isla Margarita','VE',11.0427,-63.8584,10000],
    ['Montevideo','UY',-34.9011,-56.1645,20000],['Punta del Este','UY',-34.9475,-54.9338,12000],['Colonia','UY',-34.4712,-57.8415,8000],
    ['Asunción','PY',-25.2867,-57.5833,15000],['Ciudad del Este','PY',-25.5096,-54.6055,10000],
    ['Georgetown','GY',6.8013,-58.1551,12000],['Paramaribo','SR',5.8520,-55.2038,12000],
    ['Quito','EC',-0.1807,-78.4678,20000],['Guayaquil','EC',-2.2038,-79.8972,20000],['Galápagos','EC',-0.5000,-90.5000,30000],['Cuenca','EC',-2.9006,-79.0045,10000],
    ['La Paz','BO',-16.5000,-68.1500,20000],['Sucre','BO',-19.0333,-65.2627,10000],['Santa Cruz','BO',-17.7833,-63.1833,15000],['Uyuni','BO',-20.4667,-66.8333,10000],
    // ARGENTINA + CHILE + others
    ['Buenos Aires','AR',-34.6037,-58.3816,30000],['Cordoba','AR',-31.4201,-64.1888,15000],['Mendoza','AR',-32.8895,-68.8458,12000],['Bariloche','AR',-41.1335,-71.3103,10000],['Ushuaia','AR',-54.8019,-68.3030,8000],['Salta','AR',-24.7829,-65.4122,10000],
    ['Santiago','CL',-33.4489,-70.6693,25000],['Valparaiso','CL',-33.0472,-71.6127,12000],['San Pedro de Atacama','CL',-22.9087,-68.1997,8000],
    ['Bogotá','CO',4.7110,-74.0721,20000],['Medellín','CO',6.2442,-75.5812,20000],['Cartagena','CO',10.3997,-75.5144,15000],['Santa Marta','CO',11.2408,-74.1990,10000],
    ['Lima','PE',-12.0464,-77.0428,25000],['Cusco','PE',-13.5178,-71.9781,20000],['Arequipa','PE',-16.3989,-71.5350,15000],['Lima (Miraflores)','PE',-12.0464,-77.0428,25000],
    // MAJOR US CITIES
    ['Seattle','US',47.6062,-122.3321,25000],['San Diego','US',32.7157,-117.1611,25000],['Philadelphia','US',39.9526,-75.1652,15000],['Atlanta','US',33.7490,-84.3880,20000],['Denver','US',39.7392,-104.9903,20000],['Portland','US',45.5152,-122.6784,15000],['Austin','US',30.2672,-97.7431,20000],['Dallas','US',32.7767,-96.7970,20000],['Houston','US',29.7604,-95.3698,20000],['Phoenix','US',33.4484,-112.0740,15000],['Detroit','US',42.3314,-83.0458,12000],['Minneapolis','US',44.9778,-93.2650,12000],['Nashville','US',36.1627,-86.7816,12000],['Savannah','US',32.0809,-81.0912,10000],['Asheville','US',35.5951,-82.5515,10000],['Portland ME','US',43.6591,-70.2568,8000],
    // CANADA
    ['Banff','CA',51.1784,-115.5708,10000],['Whistler','CA',50.1163,-122.9574,10000],['Quebec','CA',46.8139,-71.2080,12000],['Niagara Falls','CA',43.0896,-79.0849,10000],['Halifax','CA',44.6488,-63.5752,10000],['Victoria','CA',48.4284,-123.3656,10000],['Kelowna','CA',49.8880,-119.4960,10000],['Jasper','CA',52.8737,-118.0814,8000],
    // MEXICO
    ['Cancún','MX',21.1619,-86.8515,20000],['Mexico City','MX',19.4326,-99.1332,25000],['Guadalajara','MX',20.6597,-103.3496,15000],['Monterrey','MX',25.6866,-100.3161,15000],['Puebla','MX',19.0414,-98.2063,10000],
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
    total+=ad;console.log('['+(i+1)+'] '+nm+': +'+ad);
    await new Promise(r2=>setTimeout(r2,4000));
  }
  console.log('\nTOTAL ADDED: '+total);await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});