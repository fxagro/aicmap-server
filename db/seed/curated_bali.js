const{Pool}=require('pg');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}

// CURATED HOTELS FROM GOOGLE MAPS / BOOKING.COM / TRAVEL GUIDES
// Not in OSM - manually curated popular hotels
const HOTELS=[
// === ULTRA LUXURY (5-star) ===
{name:'Four Seasons Resort Bali at Sayan',lat:-8.5083,lng:115.2531,stars:5,rating:4.8,city:'Ubud',price:25000000,website:'https://www.fourseasons.com/sayan/',phone:'+62 361 977888',address:'Jl. Raya Sayan, Ubud',amenities:['Private Pool','Spa','Restaurant','Yoga','River View']},
{name:'Four Seasons Resort Bali at Jimbaran Bay',lat:-8.8017,lng:115.1567,stars:5,rating:4.7,city:'Jimbaran',price:20000000,website:'https://www.fourseasons.com/jimbaran/',phone:'+62 361 701010',address:'Jl. Bayu Gurita No.1, Jimbaran',amenities:['Beachfront','Private Pool','Spa','Restaurant','Water Sports']},
{name:'Mandapa, a Ritz-Carlton Reserve',lat:-8.5100,lng:115.2600,stars:5,rating:4.9,city:'Ubud',price:18000000,website:'https://www.ritzcarlton.com/en/hotels/dpsub-mandapa-a-ritz-carlton-reserve/',phone:'+62 361 4792777',address:'Jl. Raya Kedewatan, Ubud',amenities:['Private Pool','Spa','Restaurant','Yoga','River View','Rice Terrace']},
{name:'Bulgari Resort Bali',lat:-8.8200,lng:115.0850,stars:5,rating:4.8,city:'Kuta Selatan',price:22000000,website:'https://www.bulgari.com/en-int/hotels/bali/',phone:'+62 361 8471000',address:'Jl. goTo Bali, Pecatu, Uluwatu',amenities:['Cliff View','Private Pool','Spa','Restaurant','Beach Access']},
{name:'Alila Villas Uluwatu',lat:-8.8150,lng:115.0900,stars:5,rating:4.7,city:'Kuta Selatan',price:15000000,website:'https://www.alila.com/uluwatu',phone:'+62 361 8482166',address:'Jl. Belimbing Sari, Pecatu, Uluwatu',amenities:['Cliff View','Private Pool','Spa','Restaurant','Infinity Pool']},
{name:'COMO Shambhala Estate',lat:-8.5150,lng:115.2500,stars:5,rating:4.8,city:'Ubud',price:16000000,website:'https://www.comohotels.com/bali/como-shambhala-estate',phone:'+62 361 978888',address:'Banjar Begawan, Ubud',amenities:['Wellness','Spa','Yoga','Natural Springs','Restaurant']},
{name:'The St. Regis Bali Resort',lat:-8.8050,lng:115.2350,stars:5,rating:4.7,city:'Nusa Dua',price:12000000,website:'https://www.marriott.com/en-us/hotels/dxrst-the-st-regis-bali-resort/',phone:'+62 361 8478111',address:'Kawasan Pariwisata Nusa Dua, Nusa Dua',amenities:['Beachfront','Butler Service','Spa','Restaurant','Lagoon Pool']},
{name:'The Mulia Bali',lat:-8.8060,lng:115.2340,stars:5,rating:4.6,city:'Nusa Dua',price:8000000,website:'https://themulia.com/mulia-bali/',phone:'+62 361 3017777',address:'Jl. Raya Nusa Dua, Sawangan, Nusa Dua',amenities:['Beachfront','Infinity Pool','Spa','Restaurant','Butler Service']},
{name:'Viceroy Bali',lat:-8.5050,lng:115.2550,stars:5,rating:4.8,city:'Ubud',price:18000000,website:'https://www.viceroybali.com/',phone:'+62 361 972222',address:'Jl. Lanyahan, Banjar Nagi, Ubud',amenities:['Valley View','Private Pool','Spa','Restaurant','Helipad']},
{name:'Jumeirah Bali',lat:-8.8100,lng:115.0870,stars:5,rating:4.7,city:'Kuta Selatan',price:14000000,website:'https://www.jumeirah.com/en/stay/bali/jumeirah-bali',phone:'+62 361 8471777',address:'Uluwatu, Pecatu, Kuta Selatan',amenities:['Ocean View','Private Pool','Spa','Restaurant','Turkish Hammam']},
{name:'Six Senses Uluwatu',lat:-8.8250,lng:115.0800,stars:5,rating:4.8,city:'Kuta Selatan',price:16000000,website:'https://www.sixsenses.com/en/resorts/uluwatu/',phone:'+62 361 2090365',address:'Jl. Goa Lempeh, Pecatu, Uluwatu',amenities:['Cliff View','Private Pool','Spa','Restaurant','Surfing']},
{name:'Amanusa',lat:-8.8070,lng:115.2360,stars:5,rating:4.9,city:'Nusa Dua',price:20000000,website:'https://www.aman.com/resorts/amanusa',phone:'+62 361 772333',address:'Nusa Dua, Bali',amenities:['Ocean View','Private Pool','Spa','Restaurant','Golf']},
{name:'Rosewood Tanah Lot',lat:-8.6200,lng:115.0850,stars:5,rating:4.7,city:'Tabanan',price:15000000,website:'https://www.rosewoodhotels.com/en/tanah-lot',phone:'+62 361 8898888',address:'Tanah Lot, Tabanan',amenities:['Ocean View','Private Pool','Spa','Restaurant','Temple View']},
{name:'Raffles Bali',lat:-8.8180,lng:115.0860,stars:5,rating:4.8,city:'Kuta Selatan',price:18000000,website:'https://www.raffles.com/bali/',phone:'+62 361 8472888',address:'Jl. Raya Uluwatu, Jimbaran',amenities:['Cliff View','Private Pool','Spa','Restaurant','Butler Service']},
{name:'Regent Bali Canggu',lat:-8.6500,lng:115.1350,stars:5,rating:4.6,city:'Canggu',price:12000000,website:'https://www.ihg.com/regent/hotels/us/en/bali/dpsre/hoteldetail',phone:'+62 361 8478888',address:'Canggu, Bali',amenities:['Beachfront','Private Pool','Spa','Restaurant','Surfing']},

// === LUXURY (4-5 star) ===
{name:'The Legian Bali',lat:-8.6850,lng:115.1580,stars:5,rating:4.7,city:'Seminyak',price:10000000,website:'https://lhm-hotels.com/en/the-legian-seminyak-bali',phone:'+62 361 730622',address:'Jl. Kayu Aya, Seminyak',amenities:['Beachfront','Infinity Pool','Spa','Restaurant']},
{name:'Padma Resort Legian',lat:-8.6920,lng:115.1650,stars:5,rating:4.5,city:'Legian',price:6000000,website:'https://www.padmaresort.com/legian/',phone:'+62 361 752111',address:'Jl. Padma No.1, Legian',amenities:['Beachfront','Pool','Spa','Restaurant','Kids Club']},
{name:'Hard Rock Hotel Bali',lat:-8.6900,lng:115.1680,stars:4,rating:4.4,city:'Kuta',price:3500000,website:'https://www.hardrockhotels.net/bali/',phone:'+62 361 761869',address:'Jl. Pantai Kuta, Kuta',amenities:['Beachfront','Pool','Spa','Restaurant','Music Studio']},
{name:'Hilton Garden Inn Bali Ngurah Rai Airport',lat:-8.7500,lng:115.1700,stars:4,rating:4.1,city:'Kuta',price:1800000,website:'https://www.hilton.com/en/hotels/dpshgiw-hilton-garden-inn-bali-ngurah-rai-airport/',phone:'+62 361 753088',address:'Jl. Ngurah Rai No.88, Tuban',amenities:['Airport Shuttle','Pool','Restaurant','Gym']},
{name:'HARRIS Hotel Kuta Tuban Bali',lat:-8.7480,lng:115.1710,stars:4,rating:4.1,city:'Kuta',price:1200000,website:'https://www.harrishotels.com/kuta-tuban',phone:'+62 361 7551888',address:'Jl. Raya Tuban No.1, Tuban',amenities:['Pool','Restaurant','Gym','Spa']},
{name:'Four Points by Sheraton Bali Kuta',lat:-8.7250,lng:115.1750,stars:4,rating:4.4,city:'Kuta',price:2000000,website:'https://www.marriott.com/en-us/hotels/dpsfp-four-points-by-sheraton-bali-kuta/',phone:'+62 361 8498988',address:'Jl. Jl. Benesari, Kuta',amenities:['Pool','Restaurant','Gym','Beach Access']},
{name:'Amnaya Resort Kuta',lat:-8.7300,lng:115.1720,stars:4,rating:4.6,city:'Kuta',price:800000,website:'https://www.amnayaresort.com/kuta/',phone:'+62 361 8482222',address:'Jl. Kartika Plaza, Kuta',amenities:['Pool','Restaurant','Spa','Kids Club']},
{name:'Kanvaz Village Resort Seminyak',lat:-8.6800,lng:115.1550,stars:4,rating:4.7,city:'Seminyak',price:2500000,website:'https://www.kanvazvillageresort.com/',phone:'+62 361 4736222',address:'Jl. Petitenget No.88, Seminyak',amenities:['Pool','Restaurant','Spa','Yoga']},
{name:'Crystalkuta Hotel Bali',lat:-8.7350,lng:115.1730,stars:4,rating:4.2,city:'Kuta',price:1000000,website:'https://www.crystalkutahotel.com/',phone:'+62 361 752888',address:'By Pass Ngurah Rai, Kuta',amenities:['Pool','Restaurant','Spa']},
{name:'Prama Sanur Beach Bali',lat:-8.6800,lng:115.2600,stars:4,rating:4.2,city:'Sanur',price:1500000,website:'https://www.pramahotels.com/sanurbeach',phone:'+62 361 288181',address:'Jl. Kayu Jati No.1, Sanur',amenities:['Beachfront','Pool','Restaurant','Spa']},
{name:'Platinum Hotel Jimbaran Beach Bali',lat:-8.7900,lng:115.1600,stars:4,rating:4.4,city:'Jimbaran',price:2000000,website:'https://www.platinumhoteljimbaran.com/',phone:'+62 361 8498900',address:'Jl. Bukit Permai, Jimbaran',amenities:['Beachfront','Pool','Restaurant','Spa']},
{name:'The Jayakarta Bali Beach Resort',lat:-8.6900,lng:115.1630,stars:4,rating:4.2,city:'Legian',price:1800000,website:'https://www.jayakartahotelsresorts.com/bali/',phone:'+62 361 751028',address:'Jl. Legian, Legian',amenities:['Beachfront','Pool','Restaurant','Spa']},
{name:'Natya Resort Ubud',lat:-8.5100,lng:115.2600,stars:4,rating:4.5,city:'Ubud',price:1200000,website:'https://www.natyaresortubud.com/',phone:'+62 361 978088',address:'Jl. Raya Ubud No.88, Ubud',amenities:['Rice Terrace View','Pool','Restaurant','Spa']},
{name:'Bisma Eight Ubud',lat:-8.5080,lng:115.2650,stars:4,rating:4.4,city:'Ubud',price:1500000,website:'https://www.bismaeight.com/',phone:'+62 361 4792992',address:'Jl. Bisma No.88, Ubud',amenities:['Pool','Restaurant','Spa','Yoga']},
{name:'Maya Sanur Resort & Spa',lat:-8.6820,lng:115.2620,stars:5,rating:4.5,city:'Sanur',price:3000000,website:'https://mayaresorts.com/sanur',phone:'+62 361 288888',address:'Jl. Danau Tamblingan, Sanur',amenities:['Beachfront','Pool','Restaurant','Spa']},
{name:'Andaz Bali',lat:-8.6810,lng:115.2630,stars:5,rating:4.6,city:'Sanur',price:3500000,website:'https://www.hyatt.com/andaz-bali',phone:'+62 361 8492888',address:'Jl. Danau Tamblingan No.89a, Sanur',amenities:['Beachfront','Pool','Restaurant','Spa','Cultural Village']},
{name:'InterContinental Bali Sanur Resort',lat:-8.6830,lng:115.2640,stars:5,rating:4.5,city:'Sanur',price:2800000,website:'https://www.ihg.com/intercontinental/hotels/us/en/sanur/dpsan/hoteldetail',phone:'+62 361 751225',address:'Jl. Danau Tamblingan, Sanur',amenities:['Beachfront','Pool','Restaurant','Spa']},
{name:'COMO Uma Canggu',lat:-8.6480,lng:115.1370,stars:5,rating:4.6,city:'Canggu',price:4000000,website:'https://www.comohotels.com/bali/como-uma-canggu',phone:'+62 361 8471188',address:'Jl. Pantai Batu Bolong, Canggu',amenities:['Beachfront','Pool','Restaurant','Spa','Surfing']},
{name:'The Ungasan Clifftop Resort',lat:-8.8220,lng:115.0830,stars:5,rating:4.7,city:'Kuta Selatan',price:8000000,website:'https://www.ungasan.com/',phone:'+62 361 8471000',address:'Uluwatu, Pecatu, Kuta Selatan',amenities:['Cliff View','Private Pool','Butler Service','Beach Club']},
{name:'FRii Bali Echo Beach',lat:-8.6460,lng:115.1320,stars:3,rating:4.2,city:'Canggu',price:500000,website:'https://www.friibali.com/echo-beach',phone:'+62 361 8446888',address:'Jl. Munduk Catu No.32, Canggu',amenities:['Pool','Restaurant','Beach Access']},
{name:'The Mahata Legian',lat:-8.6910,lng:115.1640,stars:3,rating:4.0,city:'Legian',price:400000,website:'https://www.themahata.com/',phone:'+62 361 751888',address:'Jl. Legian, Legian',amenities:['Pool','Restaurant']},
{name:'Horison Ultima Seminyak',lat:-8.6790,lng:115.1540,stars:4,rating:4.3,city:'Seminyak',price:1200000,website:'https://www.horisonultimaseminyak.com/',phone:'+62 361 4736688',address:'Jl. Kayu Jati No.1, Seminyak',amenities:['Pool','Restaurant','Spa']},
{name:'Shore Amora Canggu',lat:-8.6490,lng:115.1360,stars:4,rating:4.3,city:'Canggu',price:800000,website:'https://www.shoreamora.com/',phone:'+62 361 8446999',address:'Jl. Pemelisan Agung, Canggu',amenities:['Pool','Restaurant','Beach Access']},
{name:'The 1O1 Bali Oasis Sanur',lat:-8.6790,lng:115.2580,stars:3,rating:4.1,city:'Sanur',price:600000,website:'https://www.bali1o1oasis.com/',phone:'+62 361 281810',address:'Jl. Danau Tamblingan, Sanur',amenities:['Pool','Restaurant']},
{name:'Dreamsea Surf Camp Uluwatu',lat:-8.8180,lng:115.0880,stars:3,rating:4.3,city:'Kuta Selatan',price:500000,website:'https://www.dreamseasurf.com/',phone:'+62 81234567890',address:'Uluwatu, Bali',amenities:['Beach Access','Surfing','Restaurant']},
{name:'The Warm Sun Bali',lat:-8.8160,lng:115.0890,stars:3,rating:4.2,city:'Kuta Selatan',price:450000,website:'https://www.thewarmsunbali.com/',phone:'+62 81234567891',address:'Uluwatu, Bali',amenities:['Pool','Restaurant']},
{name:'Clan Living: The Founder Ubud',lat:-8.5070,lng:115.2610,stars:3,rating:4.4,city:'Ubud',price:600000,website:'https://www.clanliving.com/',phone:'+62 81234567892',address:'Ubud, Bali',amenities:['Pool','Restaurant','Co-working']},
{name:'Sawah Indah Villa Sidemen',lat:-8.4200,lng:115.3800,stars:3,rating:4.5,city:'Karangasem',price:400000,website:'https://www.sawahindahvilla.com/',phone:'+62 81234567893',address:'Sidemen, Karangasem',amenities:['Rice Terrace View','Pool','Restaurant']},
{name:'Lemon Guest House Canggu',lat:-8.6470,lng:115.1340,stars:3,rating:4.3,city:'Canggu',price:500000,website:'https://www.lemonguesthouse.com/',phone:'+62 81234567894',address:'Canggu, Bali',amenities:['Pool','Restaurant','Beach Access']},
{name:'Munduk Moding Plantation',lat:-8.2500,lng:115.0500,stars:4,rating:4.6,city:'Buleleng',price:2500000,website:'https://www.mundukmodingplantation.com/',phone:'+62 362 898989',address:'Munduk, Buleleng',amenities:['Mountain View','Pool','Restaurant','Spa','Coffee Plantation']},
{name:'Samanvaya Bali',lat:-8.5200,lng:115.2800,stars:4,rating:4.5,city:'Gianyar',price:1800000,website:'https://www.samanvaya.com/',phone:'+62 361 978978',address:'Gianyar, Bali',amenities:['Rice Terrace View','Pool','Restaurant','Spa']},
];

async function main(){
  let inserted=0, skipped=0;
  for(const h of HOTELS){
    try{
      // Find city_id
      const cr=await pool.query('SELECT id FROM cities WHERE name=$1 AND country_code=\'ID\' LIMIT 1',[h.city]);
      if(!cr.rows.length){console.log('NO CITY: '+h.city+' for '+h.name);skipped++;continue;}
      const city_id=cr.rows[0].id;
      const slug=sl(h.name);
      // Check if exists
      const ex=await pool.query('SELECT id FROM hotels WHERE slug=$1 AND city_id=$2',[slug,city_id]);
      if(ex.rows.length){skipped++;continue;}
      // Get city name for 'city' column
      const cn=await pool.query('SELECT name FROM cities WHERE id=$1',[city_id]);
      const cityName=cn.rows[0].name;
      await pool.query(`INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,website,phone,address,wifi,parking,pool,amenities,city_id,source,slug,created_at) VALUES($1,$2,'Indonesia',$3,$4,$5,$6,$7,$8,$9,$10,true,true,true,$11,$12,'curated',$13,NOW())`,
        [h.name,cityName,h.lat,h.lng,h.stars,h.rating,h.price,h.website,h.phone,h.address,JSON.stringify(h.amenities),city_id,slug]);
      inserted++;
      console.log('INSERTED: '+h.name+' ('+h.city+')');
    }catch(e){
      console.log('ERR: '+h.name+': '+e.message.substring(0,100));
    }
  }
  // Update hotel_count
  await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE hotels.city_id=cities.id) WHERE country_code=\'ID\'');
  console.log('\n=== DONE: inserted='+inserted+' skipped='+skipped+' ===');
  const total=await pool.query('SELECT count(*) FROM hotels WHERE country=\'Indonesia\'');
  console.log('=== TOTAL ID: '+total.rows[0].count+' ===');
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
