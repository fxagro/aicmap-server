const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';

// Query 1: Main Bali island - massive radius from central point
// Query 2: Nusa Islands (Lembongan, Penida, Ceningan)
const QUERIES=[
  {name:'Bali Main',lat:-8.65,lng:115.20,rad:50000},   // 50km radius covers whole island
  {name:'Bali East',lat:-8.45,lng:115.60,rad:20000},   // East coast
  {name:'Bali North',lat:-8.15,lng:115.05,rad:15000},  // North coast
  {name:'Bali West',lat:-8.35,lng:114.50,rad:15000},   // West Bali
  {name:'Nusa Islands',lat:-8.70,lng:115.55,rad:15000}, // Nusa Lembongan/Penida
];

function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}

async function fetchOverpass(q,retries=3){
  for(let r=0;r<retries;r++){
    try{
      return await new Promise((ok,no)=>{
        const body='data='+q.split('\n').join('');
        const u=new URL(U);
        const req=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body),'User-Agent':'curl/7.68.0','Accept':'*/*'}},res=>{
          let b='';res.on('data',c=>b+=c);res.on('end',()=>{
            if(b.startsWith('<?xml')||b.startsWith('<!DOCTYPE')){no(new Error('HTML:'+res.statusCode));return;}
            try{ok(JSON.parse(b))}catch(e){no(new Error('NotJSON:'+b.substring(0,200)))}
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

// Find nearest city from list
function findNearestCity(lat,lng,cities){
  let best=null,bestDist=Infinity;
  for(const c of cities){
    const d=Math.sqrt(Math.pow(lat-c.lat,2)+Math.pow(lng-c.lng,2));
    if(d<bestDist){bestDist=d;best=c;}
  }
  // Max ~15km from city center
  return bestDist<0.15?best:null;
}

async function main(){
  // Load all Bali cities
  const cr=await pool.query("SELECT id,name,slug,lat,lng FROM cities WHERE country_code='ID' AND lat BETWEEN -9.0 AND -8.0 AND lng BETWEEN 114.0 AND 116.0");
  const baliCities=cr.rows;
  console.log('Loaded '+baliCities.length+' Bali cities');

  // Check existing hotels
  const exRes=await pool.query("SELECT count(*) as cnt FROM hotels h JOIN cities c ON h.city_id=c.id WHERE c.lat BETWEEN -9.0 AND -8.0 AND c.lng BETWEEN 114.0 AND 116.0");
  console.log('Existing Bali hotels: '+exRes.rows[0].cnt);

  const allHotels=new Map(); // osm_id -> hotel object
  const allNodes=new Map(); // node_id -> {lat,lng}

  for(const q of QUERIES){
    console.log('\n--- Fetching: '+q.name+' ---');
    const query='[out:json][timeout:90];(node["tourism"="hotel"](around:'+q.rad+','+q.lat+','+q.lng+');way["tourism"="hotel"](around:'+q.rad+','+q.lat+','+q.lng+');node["tourism"="hostel"](around:'+q.rad+','+q.lat+','+q.lng+');node["tourism"="motel"](around:'+q.rad+','+q.lat+','+q.lng+');node["tourism"="guest_house"](around:'+q.rad+','+q.lat+','+q.lng+');node["tourism"="apartment"](around:'+q.rad+','+q.lat+','+q.lng+');node["tourism"="chalet"](around:'+q.rad+','+q.lat+','+q.lng+'););out body;>;out skel qt;';

    let dt;
    try{dt=await fetchOverpass(query);}catch(e){console.log('  ERR: '+e.message.substring(0,100));continue;}
    if(!dt.elements||!dt.elements.length){console.log('  NO DATA');continue;}

    // Index nodes
    for(const e of dt.elements){
      if(e.type==='node'&&e.lat&&e.lon)allNodes.set(e.id,{lat:e.lat,lng:e.lon});
    }

    let added=0;
    for(const e of dt.elements){
      if(e.type!=='way'&&e.type!=='node')continue;if(!e.tags)continue;
      const nm=e.tags.name;if(!nm||nm.length<2)continue;
      if(allHotels.has(e.id))continue; // dedup across queries

      let la,lo;
      if(e.type==='node'){la=e.lat;lo=e.lon;}
      else if(e.nodes){
        // Get center of way
        let sumLat=0,sumLng=0,cnt=0;
        for(const id of e.nodes){
          const nd=allNodes.get(id);
          if(nd){sumLat+=nd.lat;sumLng+=nd.lng;cnt++;}
        }
        if(cnt>0){la=sumLat/cnt;lo=sumLng/cnt;}
      }
      if(!la||!lo)continue;

      // Find nearest Bali city
      const city=findNearestCity(la,lo,baliCities);
      if(!city)continue;

      const base=sl(nm);
      const cityPrefix=sl(city.name);
      const slug=base.startsWith(cityPrefix)?base:cityPrefix+'-'+base;

      allHotels.set(e.id,{
        name:nm.trim(),slug,lat:la,lng:lo,
        stars:parseInt(e.tags.stars)||4,
        rating:e.tags.rating?parseFloat(e.tags.rating):4.0,
        website:e.tags.website||null,
        phone:e.tags.phone||e.tags['contact:phone']||null,
        address:e.tags['addr:street']?e.tags['addr:street']+(e.tags['addr:housenumber']?' '+e.tags['addr:housenumber']:''):null,
        wifi:e.tags.internet_access==='wlan'||e.tags.wifi==='yes',
        parking:e.tags.parking==='yes'||e.tags.parking==='surface',
        pool:e.tags.pool==='yes',
        osm_id:e.id,
        city_id:city.id,
        city_name:city.name
      });
      added++;
    }
    console.log('  Found: '+added+' hotels (total unique: '+allHotels.size+')');
    await new Promise(r=>setTimeout(r,3000));
  }

  console.log('\n=== TOTAL UNIQUE: '+allHotels.size+' ===');
  console.log('=== INSERTING ===');

  let totalInserted=0;
  const cityCounts={};

  for(const [osm_id,h] of allHotels){
    try{
      const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,h.city_id]);
      if(dp.rows.length)continue;
      await pool.query('INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,website,phone,address,wifi,parking,pool,osm_id,city_id,source,slug,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,$9,$10,$11,$12,$13,$14,$15,\'osm\',$16,NOW())',[h.name,h.city_name,'Indonesia',h.lat,h.lng,h.stars,h.rating,h.website,h.phone,h.address,h.wifi,h.parking,h.pool,h.osm_id,h.city_id,h.slug]);
      totalInserted++;
      if(!cityCounts[h.city_name])cityCounts[h.city_name]=0;
      cityCounts[h.city_name]++;
    }catch(e){
      // Skip silently
    }
  }

  // Update hotel_count for all Bali cities
  for(const cid of Object.keys(cityCounts)){
    await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=(SELECT id FROM cities WHERE name=$1 AND country_code=\'ID\' LIMIT 1)',[cid]);
  }
  // Also update existing cities
  await pool.query("UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE hotels.city_id=cities.id) WHERE country_code='ID' AND lat BETWEEN -9.0 AND -8.0 AND lng BETWEEN 114.0 AND 116.0");

  console.log('\n=== INSERTED: '+totalInserted+' ===');
  console.log('=== BY CITY ===');
  const sorted=Object.entries(cityCounts).sort((a,b)=>b[1]-a[1]);
  for(const[c,cnt] of sorted.slice(0,20)){
    console.log('  '+c+': +'+cnt);
  }

  // Final count
  const final=await pool.query("SELECT count(*) as cnt FROM hotels h JOIN cities c ON h.city_id=c.id WHERE c.lat BETWEEN -9.0 AND -8.0 AND c.lng BETWEEN 114.0 AND 116.0");
  console.log('\n=== TOTAL BALI HOTELS: '+final.rows[0].cnt+' ===');

  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
