const{Pool}=require('pg');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});

// Deterministic hash (stable per hotel id) → 0..1
function hash01(seed){
  let h=5381;
  const s=String(seed);
  for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))>>>0;
  return (h%1000)/1000;
}
function fmt(v){return 'Rp '+Math.round(v).toLocaleString('id-ID');}

// Star → base price range [min,max]
function starRange(stars){
  const s=parseInt(stars)||3;
  if(s>=7) return [8000000,35000000];
  if(s===6) return [6000000,25000000];
  if(s===5) return [3000000,25000000];
  if(s===4) return [1200000,8000000];
  if(s===3) return [450000,1800000];
  if(s===2) return [220000,650000];
  return [100000,350000];
}
// Country cost-of-living multiplier
function countryMult(code){
  if(!code) return 1.0;
  const hi=['SG','AE','QA','SA','US','GB','CH','NO','DK','SE','JP','AU','NZ','CA','FR','DE','IT','ES','NL','BE','AT'];
  const mid=['MY','TH','VN','KR','TW','HK','CN','TR','EG','JO','OM','KW','BH'];
  const low=['ID','PH','IN','PK','BD','NP','VN','LA','KH','MM'];
  if(hi.includes(code)) return 1.6;
  if(mid.includes(code)) return 1.15;
  if(low.includes(code)) return 0.85;
  return 1.0;
}

async function main(){
  // All hotels with default/flat/zero price (the OSM+seed bulk). Curated hotels (real distinct prices) untouched.
  const {rows}=await pool.query(`
    SELECT h.id, h.stars, h.rating, h.name, c.country_code
    FROM hotels h LEFT JOIN cities c ON c.id=h.city_id
    WHERE h.price_idr=0 OR h.price_idr=800000 OR h.price_idr IS NULL
  `);
  console.log('Repricing', rows.length, 'hotels...');
  let n=0;
  for(const h of rows){
    const [min,max]=starRange(h.stars);
    const r=hash01(h.id+'_price');
    const ratingBoost=(parseFloat(h.rating)||4.0)-4.0; // -1..+2
    const starsBoost=(parseInt(h.stars)||3)-3;
    let price=(min+r*(max-min))*(1+ratingBoost*0.12+starsBoost*0.08);
    price*=countryMult(h.country_code);
    price=Math.round(price/1000)*1000; // round to 1000
    if(price<50000) price=50000;
    await pool.query('UPDATE hotels SET price_idr=$1, price_formatted=$2 WHERE id=$3',[price,fmt(price),h.id]);
    n++;
    if(n%3000===0) console.log('  ...'+n);
  }
  console.log('=== DONE: '+n+' priced ===');
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
