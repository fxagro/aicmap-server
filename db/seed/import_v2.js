const{Pool}=require('pg'),https=require('https');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
const U='https://overpass-api.de/api/interpreter';
// Only cities that exist in DB and have < 100 hotels
const C=[
['Yogyakarta','yogyakarta',-7.8005,110.3913,15000],
['Surakarta','surakarta',-7.5755,110.8243,12000],
['Mataram','mataram',-8.5833,116.1167,12000],
['Kupang','kupang',-10.1772,123.6070,12000],
['Ambon','ambon',-3.6954,128.1814,12000],
['Jayapura','jayapura',-2.5916,140.6690,10000],
['Cirebon','cirebon',-6.7320,108.5520,10000],
['Tasikmalaya','tasikmalaya',-7.3254,108.2130,10000],
['Purwokerto','purwokerto',-7.4278,109.2280,8000],
['Tegal','tegal',-6.8694,109.1256,8000],
['Pekalongan','pekalongan',-6.8896,109.6740,8000],
['Salatiga','salatiga',-7.3300,110.5100,8000],
['Kudus','kudus',-6.8050,110.8400,6000],
['Jepara','jepara',-6.5333,110.6667,8000],
['Madiun','madiun',-7.6300,111.5200,8000],
['Kediri','kediri',-7.8200,112.0100,8000],
['Blitar','blitar',-8.0983,112.1680,6000],
['Pasuruan','pasuruan',-7.6453,112.9070,6000],
['Probolinggo','probolinggo',-7.7543,113.2150,6000],
['Lumajang','lumajang',-8.1353,113.2250,6000],
['Jember','jember',-8.1845,113.6680,8000],
['Banyuwangi','banyuwangi',-8.2190,114.3690,10000],
['Bondowoso','bondowoso',-7.9134,113.8210,6000],
['Situbondo','situbondo',-7.7064,114.0010,6000],
['Gresik','gresik',-7.1592,112.5550,8000],
['Mojokerto','mojokerto',-7.4722,112.4370,6000],
['Sidoarjo','sidoarjo',-7.4478,112.7180,8000],
['Tuban','tuban',-6.9000,112.0500,6000],
['Bojonegoro','bojonegoro',-7.1500,111.8800,6000],
['Ponorogo','ponorogo',-7.8700,111.4700,6000],
['Pacitan','pacitan',-8.1950,111.0970,6000],
['Trenggalek','trenggalek',-8.0500,111.6670,6000],
['Tulungagung','tulungagung',-8.1000,111.9000,6000],
['Nganjuk','nganjuk',-7.6000,111.9000,6000],
['Magetan','magetan',-7.6500,111.3300,6000],
['Pamekasan','pamekasan',-7.1500,113.4800,6000],
['Sumenep','sumenep',-7.0167,113.8667,8000],
['Bangkalan','bangkalan',-7.0500,112.7333,6000],
['Sukabumi','sukabumi',-6.9175,106.9270,10000],
['Cianjur','cianjur',-6.8200,107.1400,8000],
['Ciamis','ciamis',-7.3300,108.3500,6000],
['Kuningan','kuningan',-6.9833,108.4833,6000],
['Majalengka','majalengka',-6.8333,108.2333,6000],
['Indramayu','indramayu',-6.3500,108.3167,6000],
['Subang','subang',-6.5667,107.7667,6000],
['Karawang','karawang',-6.3100,107.3100,6000],
['Purwakarta','purwakarta',-6.5500,107.4500,6000],
['Sumedang','sumedang',-6.8333,107.9333,6000],
['Serang','serang',-6.1200,106.1500,8000],
['Padang','padang',-0.9471,100.4172,12000],
['Bukittinggi','bukittinggi',-0.3071,100.3700,8000],
['Dumai','dumai',1.6667,101.4833,8000],
['Pontianak','pontianak',-0.0263,109.3425,12000],
['Singkawang','singkawang',0.9000,108.9833,8000],
['Banjarmasin','banjarmasin',-3.3186,114.5944,12000],
['Banjarbaru','banjarbaru',-3.4500,114.8333,8000],
['Palangkaraya','palangkaraya',-2.2100,113.9200,10000],
['Balikpapan','balikpapan',-1.2379,116.8529,12000],
['Samarinda','samarinda',-0.4948,117.1436,12000],
['Tarakan','tarakan',3.3000,117.6333,8000],
['Manado','manado',1.4748,124.8421,12000],
['Bitung','bitung',1.4748,125.1264,8000],
['Gorontalo','gorontalo',0.5435,123.0568,10000],
['Palu','palu',-0.8917,119.8707,10000],
['Kendari','kendari',-3.9984,122.5133,10000],
['Baubau','baubau',-5.4667,122.6000,6000],
];
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
async function fo(q){return new Promise((ok,no)=>{const body='data='+q.split('\n').join('');const u=new URL(U);const r=https.request({hostname:u.hostname,path:u.pathname,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body),'User-Agent':'curl/7.68.0','Accept':'*/*'}},res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>{try{ok(JSON.parse(b))}catch(e){no(new Error('NotJSON:'+b.substring(0,100)))}});});r.on('error',no);r.setTimeout(60000,()=>{r.destroy();no(new Error('Timeout'));});r.write(body);r.end();});}
async function main(){
  let totalAdded=0;
  for(let i=0;i<C.length;i++){
    const[nm,sl2,lt,ln,rad]=C[i];
    // Get city ID
    const cr=await pool.query('SELECT id,hotel_count FROM cities WHERE slug=$1',[sl2]);
    if(!cr.rows.length){console.log('['+(i+1)+'/'+C.length+'] '+nm+': NO CITY');continue;}
    const ci=cr.rows[0].id,ex=cr.rows[0].hotel_count;
    if(ex>=100){console.log('['+(i+1)+'/'+C.length+'] '+nm+': SKIP('+ex+')');continue;}
    // Query OSM
    const q='[out:json][timeout:45];(node["tourism"="hotel"](around:'+rad+','+lt+','+ln+');way["tourism"="hotel"](around:'+rad+','+lt+','+ln+');node["tourism"="hostel"](around:'+rad+','+lt+','+ln+');node["tourism"="motel"](around:'+rad+','+lt+','+ln+');node["tourism"="guest_house"](around:'+rad+','+lt+','+ln+'););out body;>;out skel qt;';
    let dt;
    try{dt=await fo(q);}catch(e){console.log('['+(i+1)+'/'+C.length+'] '+nm+': ERR-'+e.message);await new Promise(r=>setTimeout(r,5000));continue;}
    if(!dt.elements||!dt.elements.length){console.log('['+(i+1)+'/'+C.length+'] '+nm+': NO-DATA');continue;}
    // Build hotels
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
      hl.push({name:nm2.trim(),slug:sl(nm2),lat:la,lng:lo,stars:parseInt(e.tags.stars)||null,rating:e.tags.rating?parseFloat(e.tags.rating):null,website:e.tags.website||null,phone:e.tags.phone||e.tags['contact:phone']||null,address:e.tags['addr:street']?e.tags['addr:street']+(e.tags['addr:housenumber']?' '+e.tags['addr:housenumber']:''):null,wifi:e.tags.internet_access==='wlan'||e.tags.wifi==='yes',parking:e.tags.parking==='yes'||e.tags.parking==='surface',pool:e.tags.pool==='yes',osm_id:e.id,city_id:ci});
    }
    if(!hl.length){console.log('['+(i+1)+'/'+C.length+'] '+nm+': NO-HOTELS (raw:'+dt.elements.length+')');continue;}
    // Insert
    let ad=0;
    for(const h of hl){
      try{
        const dp=await pool.query('SELECT id FROM hotels WHERE osm_id=$1 OR (slug=$2 AND city_id=$3)',[h.osm_id,h.slug,h.city_id]);
        if(dp.rows.length)continue;
        await pool.query('INSERT INTO hotels(name,slug,lat,lng,stars,rating,website,phone,address,wifi,parking,pool,osm_id,city_id,source,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,\'osm\',NOW())',[h.name,h.slug,h.lat,h.lng,h.stars,h.rating,h.website,h.phone,h.address,h.wifi,h.parking,h.pool,h.osm_id,h.city_id]);
        ad++;
      }catch(e){if(ad===0}catch(e){}}catch(e){}hl.length>0)console.log('  INSERT ERR:',e.message);}
    }
    if(ad>0)await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE city_id=$1) WHERE id=$1',[ci]);
    totalAdded+=ad;
    console.log('['+(i+1)+'/'+C.length+'] '+nm+': +'+ad+' (raw:'+hl.length+', existing:'+ex+')');
    await new Promise(r=>setTimeout(r,2000));
  }
  console.log('\n=== TOTAL ADDED: '+totalAdded+' ===');
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
