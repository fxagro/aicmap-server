const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
// Cities: [name, slug, lat, lng, radius, country_code]
const C=[
['Yogyakarta','yogyakarta',-7.8005,110.3913,15000,'ID'],
['Surakarta (Solo)','surakarta',-7.5755,110.8243,12000,'ID'],
['Mataram','mataram',-8.5833,116.1167,12000,'ID'],
['Bima','bima',-8.4656,118.7200,8000,'ID'],
['Sumbawa Besar','sumbawa-besar',-8.4894,117.4200,8000,'ID'],
['Ende','ende',-8.8431,121.6620,8000,'ID'],
['Maumere','maumere',-8.6246,122.2130,8000,'ID'],
['Kupang','kupang',-10.1772,123.6070,12000,'ID'],
['Ambon','ambon',-3.6954,128.1814,12000,'ID'],
['Ternate','ternate',0.7833,127.3833,8000,'ID'],
['Sorong','sorong',-0.8615,131.2535,10000,'ID'],
['Manokwari','manokwari',-0.8615,134.0815,8000,'ID'],
['Jayapura','jayapura',-2.5916,140.6690,10000,'ID'],
['Merauke','merauke',-8.4964,140.3956,8000,'ID'],
['Timika','timika',-4.5353,136.8920,8000,'ID'],
['Biak','biak',-1.1750,136.0820,8000,'ID'],
['Wamena','wamena',-4.0960,138.9510,6000,'ID'],
['Cirebon','cirebon',-6.7320,108.5520,10000,'ID'],
['Tasikmalaya','tasikmalaya',-7.3254,108.2130,10000,'ID'],
['Purwokerto','purwokerto',-7.4278,109.2280,8000,'ID'],
['Tegal','tegal',-6.8694,109.1256,8000,'ID'],
['Pekalongan','pekalongan',-6.8896,109.6740,8000,'ID'],
['Salatiga','salatiga',-7.3300,110.5100,8000,'ID'],
['Kudus','kudus',-6.8050,110.8400,6000,'ID'],
['Jepara','jepara',-6.5333,110.6667,8000,'ID'],
['Blora','blora',-6.9700,111.4200,6000,'ID'],
['Ngawi','ngawi',-7.4019,111.4430,6000,'ID'],
['Madiun','madiun',-7.6300,111.5200,8000,'ID'],
['Kediri','kediri',-7.8200,112.0100,8000,'ID'],
['Blitar','blitar',-8.0983,112.1680,6000,'ID'],
['Pasuruan','pasuruan',-7.6453,112.9070,6000,'ID'],
['Probolinggo','probolinggo',-7.7543,113.2150,6000,'ID'],
['Lumajang','lumajang',-8.1353,113.2250,6000,'ID'],
['Jember','jember',-8.1845,113.6680,8000,'ID'],
['Banyuwangi','banyuwangi',-8.2190,114.3690,10000,'ID'],
['Bondowoso','bondowoso',-7.9134,113.8210,6000,'ID'],
['Situbondo','situbondo',-7.7064,114.0010,6000,'ID'],
['Gresik','gresik',-7.1592,112.5550,8000,'ID'],
['Mojokerto','mojokerto',-7.4722,112.4370,6000,'ID'],
['Sidoarjo','sidoarjo',-7.4478,112.7180,8000,'ID'],
['Lamongan','lamongan',-7.1200,112.3200,6000,'ID'],
['Tuban','tuban',-6.9000,112.0500,6000,'ID'],
['Bojonegoro','bojonegoro',-7.1500,111.8800,6000,'ID'],
['Ponorogo','ponorogo',-7.8700,111.4700,6000,'ID'],
['Pacitan','pacitan',-8.1950,111.0970,6000,'ID'],
['Trenggalek','trenggalek',-8.0500,111.6670,6000,'ID'],
['Tulungagung','tulungagung',-8.1000,111.9000,6000,'ID'],
['Nganjuk','nganjuk',-7.6000,111.9000,6000,'ID'],
['Magetan','magetan',-7.6500,111.3300,6000,'ID'],
['Pamekasan','pamekasan',-7.1500,113.4800,6000,'ID'],
['Sumenep','sumenep',-7.0167,113.8667,8000,'ID'],
['Bangkalan','bangkalan',-7.0500,112.7333,6000,'ID'],
['Sukabumi','sukabumi',-6.9175,106.9270,10000,'ID'],
['Cianjur','cianjur',-6.8200,107.1400,8000,'ID'],
['Ciamis','ciamis',-7.3300,108.3500,6000,'ID'],
['Kuningan','kuningan',-6.9833,108.4833,6000,'ID'],
['Majalengka','majalengka',-6.8333,108.2333,6000,'ID'],
['Indramayu','indramayu',-6.3500,108.3167,6000,'ID'],
['Subang','subang',-6.5667,107.7667,6000,'ID'],
['Karawang','karawang',-6.3100,107.3100,6000,'ID'],
['Purwakarta','purwakarta',-6.5500,107.4500,6000,'ID'],
['Sumedang','sumedang',-6.8333,107.9333,6000,'ID'],
['Serang','serang',-6.1200,106.1500,8000,'ID'],
['Padang','padang',-0.9471,100.4172,12000,'ID'],
['Bukittinggi','bukittinggi',-0.3071,100.3700,8000,'ID'],
['Dumai','dumai',1.6667,101.4833,8000,'ID'],
['Pontianak','pontianak',-0.0263,109.3425,12000,'ID'],
['Singkawang','singkawang',0.9000,108.9833,8000,'ID'],
['Banjarmasin','banjarmasin',-3.3186,114.5944,12000,'ID'],
['Banjarbaru','banjarbaru',-3.4500,114.8333,8000,'ID'],
['Palangkaraya','palangkaraya',-2.2100,113.9200,10000,'ID'],
['Balikpapan','balikpapan',-1.2379,116.8529,12000,'ID'],
['Samarinda','samarinda',-0.4948,117.1436,12000,'ID'],
['Tarakan','tarakan',3.3000,117.6333,8000,'ID'],
['Manado','manado',1.4748,124.8421,12000,'ID'],
['Bitung','bitung',1.4748,125.1264,8000,'ID'],
['Gorontalo','gorontalo',0.5435,123.0568,10000,'ID'],
['Palu','palu',-0.8917,119.8707,10000,'ID'],
['Kendari','kendari',-3.9984,122.5133,10000,'ID'],
['Baubau','baubau',-5.4667,122.6000,6000,'ID'],
];
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q){return new Promise((ok,no)=>{const body='data='+q.split('\n').join('');const u=new URL(U);const r=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body),'User-Agent':'curl/7.68.0','Accept':'*/*'}},res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{ok(JSON.parse(b))}catch(e){no(new Error('NotJSON:'+b.substring(0,200)))}});});r.on('error',no);r.setTimeout(60000,()=>{r.destroy();no(new Error('Timeout'));});r.write(body);r.end();});}
async function main(){
  const ar=process.argv.slice(2),dr=ar.includes('--dry-run');
  let inserted=0, imported=0;
  for(const c of C){
    const[nm,sl2,lt,ln,rad,cc]=c;
    // Check if city exists
    const cr=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1',[sl2]);
    let ci;
    if(!cr.rows.length){
      // Insert city
      if(dr){console.log('[DRY] Would insert city: '+nm);continue;}
      const ins=await pool.query('INSERT INTO cities(name,slug,lat,lng,country_code,hotel_count,created_at) VALUES($1,$2,$3,$4,$5,0,NOW()) RETURNING id',[nm,sl2,lt,ln,cc]);
      ci=ins.rows[0].id;inserted++;
      console.log('[NEW] City: '+nm+' (id='+ci+')');
    }else{
      ci=cr.rows[0].id;
      if(cr.rows[0].hotel_count>=100)continue;
    }
    // Query OSM
    const q='[out:json][timeout:45];(node["tourism"="hotel"](around:'+rad+','+lt+','+ln+');way["tourism"="hotel"](around:'+rad+','+lt+','+ln+');node["tourism"="hostel"](around:'+rad+','+lt+','+ln+');node["tourism"="motel"](around:'+rad+','+lt+','+ln+');node["tourism"="guest_house"](around:'+rad+','+lt+','+ln+'););out body;>;out skel qt;';
    let dt;try{dt=await fo(q)}catch(e){console.log('[ERR] '+nm+': '+e.message);continue;}
    if(!dt.elements||!dt.elements.length)continue;
    const nd={};for(const e of dt.elements){if(e.type==='node'&&e.lat&&e.lon)nd[e.id]={lat:e.lat,lng:e.lon};}
    const hl=[],sn=new Set();
    for(const e of dt.elements){if(e.type!=='way'&&e.type!=='node')continue;if(!e.tags)continue;const nm2=e.tags.name;if(!nm2||nm2.length<2)continue;const nn=nm2.toLowerCase().replace(/[^a-z0-9]/g,'');if(sn.has(nn))continue;sn.add(nn);let la,lo;if(e.type==='node'){la=e.lat;lo=e.lon;}else if(e.nodes){for(const id of e.nodes){if(nd[id]){la=nd[id].lat;lo=nd[id].lng;break;}}}if(!la||!lo)continue;hl.push({name:nm2.trim(),slug:sl(nm2),lat:la,lng:lo,stars:parseInt(e.tags.stars)||null,rating:e.tags.rating?parseFloat(e.tags.rating):null,website:e.tags.website||null,phone:e.tags.phone||e.tags['contact:phone']||null,address:e.tags['addr:street']?e.tags['addr:street']+(e.tags['addr:housenumber']?' '+e.tags['addr:housenumber']:''):null,wifi:e.tags.internet_access==='wlan'||e.tags.wifi==='yes',parking:e.tags.parking==='yes'||e.tags.parking==='surface',pool:e.tags.pool==='yes',osm_id:e.id,city_id:ci});}
    if(!hl.length)continue;
    let ad=0;
    for(const h of hl){if(dr){ad++;continue;}try{const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,h.city_id]);if(dp.rows.length)continue;await pool.query('INSERT INTO hotels(name,slug,lat,lng,stars,rating,website,phone,address,wifi,parking,pool,osm_id,city_id,source,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,\'osm\',NOW())',[h.name,h.slug,h.lat,h.lng,h.stars,h.rating,h.website,h.phone,h.address,h.wifi,h.parking,h.pool,h.osm_id,h.city_id]);ad++;}catch(e){}}
    if(!dr&&ad>0){await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci]);imported+=ad;}
    console.log((dr?'[DRY]':'[LIVE]')+' '+nm+': +'+ad);
    await new Promise(r=>setTimeout(r,2000));
  }
  console.log('\n=== DONE ===');
  console.log('Cities inserted: '+inserted);
  console.log('Hotels imported: '+imported);
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
