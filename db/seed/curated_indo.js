const{Pool}=require('pg');
const pool=new Pool({connectionString:'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'});
function sl(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}

const HOTELS=[
// === JAKARTA ===
{name:'The Ritz-Carlton Jakarta Mega Kuningan',lat:-6.2297,lng:106.8560,stars:5,rating:4.6,city:'Jakarta',price:8500000,website:'https://www.ritzcarlton.com/jakarta',phone:'+62 21 25518888',address:'Jl. DR Ide Anak Agung Gde Agung Kav E.1.2, Mega Kuningan',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'Grand Hyatt Jakarta',lat:-6.1940,lng:106.8240,stars:5,rating:4.5,city:'Jakarta',price:7500000,website:'https://www.hyatt.com/jakarta',phone:'+62 21 39123456',address:'Jl. M.H. Thamrin, Jakarta Pusat',amenities:['Spa','Restaurant','Pool','Gym','City View']},
{name:'Hotel Indonesia Kempinski Jakarta',lat:-6.1930,lng:106.8230,stars:5,rating:4.5,city:'Jakarta',price:8000000,website:'https://www.kempinski.com/jakarta',phone:'+62 21 23583800',address:'Jl. MH Thamrin No.1, Jakarta Pusat',amenities:['Spa','Restaurant','Pool','Gym','Bundaran HI View']},
{name:'Mandarin Oriental Jakarta',lat:-6.2180,lng:106.8200,stars:5,rating:4.6,city:'Jakarta',price:9000000,website:'https://www.mandarinoriental.com/jakarta',phone:'+62 21 39838888',address:'Jl. MH Thamrin, Jakarta Pusat',amenities:['Spa','Restaurant','Pool','Gym','City View']},
{name:'The Langham Jakarta',lat:-6.2300,lng:106.8550,stars:5,rating:4.7,city:'Jakarta',price:10000000,website:'https://www.langhamhotels.com/jakarta',phone:'+62 21 27088888',address:'Jl. Jenderal Sudirman Kav. 10-11, Jakarta Pusat',amenities:['Spa','Restaurant','Pool','Gym','Afternoon Tea']},
{name:'Four Seasons Hotel Jakarta',lat:-6.2280,lng:106.8540,stars:5,rating:4.7,city:'Jakarta',price:12000000,website:'https://www.fourseasons.com/jakarta',phone:'+62 21 22771888',address:'Jl. Jenderal Sudirman Kav. 10-11, Jakarta Pusat',amenities:['Spa','Restaurant','Pool','Gym','All Suite']},
{name:'The Westin Jakarta',lat:-6.2250,lng:106.8400,stars:5,rating:4.5,city:'Jakarta',price:6000000,website:'https://www.westin.com/jakarta',phone:'+62 21 23583800',address:'Jl. H.R. Rasuna Said, Jakarta Selatan',amenities:['Spa','Restaurant','Pool','Gym','City View']},
{name:'Raffles Jakarta',lat:-6.2290,lng:106.8555,stars:5,rating:4.6,city:'Jakarta',price:11000000,website:'https://www.raffles.com/jakarta',phone:'+62 21 29880888',address:'Ciputra World 1, Jl. Prof. Dr. Satrio, Jakarta Selatan',amenities:['Spa','Restaurant','Pool','Gym','Butler Service']},
{name:'The Orient Jakarta Royal Hideaway',lat:-6.1750,lng:106.8450,stars:5,rating:4.5,city:'Jakarta',price:7000000,website:'https://www.barcelo.com/orient-jakarta',phone:'+62 21 3456789',address:'Jl. Cut Meutia No.10, Jakarta Pusat',amenities:['Spa','Restaurant','Pool','Gym','Heritage']},
{name:'Pan Pacific Jakarta',lat:-6.2270,lng:106.8530,stars:5,rating:4.5,city:'Jakarta',price:6500000,website:'https://www.panpacific.com/jakarta',phone:'+62 21 27088800',address:'Jl. Thamrin, Jakarta Pusat',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'Pullman Jakarta Central Park',lat:-6.1780,lng:106.7900,stars:5,rating:4.3,city:'Jakarta',price:3500000,website:'https://www.pullman.com/jakarta',phone:'+62 21 22535555',address:'Jl. Letjen S. Parman Kav. 28, Jakarta Barat',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'Holiday Inn & Suites Jakarta Gajah Mada',lat:-6.1450,lng:106.8300,stars:4,rating:4.3,city:'Jakarta',price:1200000,website:'https://www.ihg.com/holidayinn/hotels/jakarta',phone:'+62 21 22688888',address:'Jl. Gajah Mada No.99, Jakarta Barat',amenities:['Restaurant','Pool','Gym']},
{name:'Fraser Residence Menteng Jakarta',lat:-6.1850,lng:106.8500,stars:4,rating:4.2,city:'Jakarta',price:1500000,website:'https://www.fraserhospitality.com/jakarta',phone:'+62 21 3100888',address:'Jl. Cut Meutia No.16, Jakarta Pusat',amenities:['Restaurant','Pool','Gym','Apartment']},
{name:'Ascott Jakarta',lat:-6.2100,lng:106.8200,stars:4,rating:4.1,city:'Jakarta',price:2000000,website:'https://www.the-ascott.com/jakarta',phone:'+62 21 57988888',address:'Jl. Rasuna Said Kav. C-36, Jakarta Selatan',amenities:['Restaurant','Pool','Gym','Apartment']},
{name:'ASHLEY NEWAIR Menteng',lat:-6.1860,lng:106.8480,stars:4,rating:4.4,city:'Jakarta',price:800000,website:'https://www.ashleyhotel.com/menteng',phone:'+62 21 3910888',address:'Jl. Teuku Cik Ditiro No.4, Jakarta Pusat',amenities:['Restaurant','Pool','Gym','Air Purifier']},
{name:'Sutasoma Hotel',lat:-6.2600,lng:106.7900,stars:4,rating:4.0,city:'Jakarta',price:900000,website:'https://www.sutasomahotel.com',phone:'+62 21 7500888',address:'Jl. TB Simatupang No.101, Jakarta Selatan',amenities:['Restaurant','Pool','Gym']},

// === BANDUNG ===
{name:'G.H. Universal Hotel Bandung',lat:-6.8800,lng:107.6100,stars:5,rating:4.8,city:'Bandung',price:4500000,website:'https://www.ghuniversal.com',phone:'+62 22 2011111',address:'Jl. Dr. Setiabudhi No.229, Bandung',amenities:['Spa','Restaurant','Pool','Gym','Renaissance Architecture']},
{name:'The Trans Luxury Hotel Bandung',lat:-6.9200,lng:107.5900,stars:5,rating:4.5,city:'Bandung',price:3500000,website:'https://www.thetranshotels.com/bandung',phone:'+62 22 8421000',address:'Jl. Gatot Subroto No.289, Bandung',amenities:['Spa','Restaurant','Pool','Gym','Shopping Access']},
{name:'The Papandayan Hotel Bandung',lat:-6.8900,lng:107.6200,stars:5,rating:4.4,city:'Bandung',price:2500000,website:'https://www.thepapandayan.com',phone:'+62 22 7310700',address:'Jl. Gatot Subroto No.83, Bandung',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'InterContinental Bandung Dago Pakar',lat:-6.8600,lng:107.6300,stars:5,rating:4.5,city:'Bandung',price:3000000,website:'https://www.ihg.com/intercontinental/bandung',phone:'+62 22 87801000',address:'Jl. Ir. H. Juanda No.96, Bandung',amenities:['Spa','Restaurant','Pool','Gym','Mountain View']},
{name:'Le Meridien Bandung',lat:-6.8950,lng:107.6150,stars:5,rating:4.3,city:'Bandung',price:2200000,website:'https://www.lemeridien.com/bandung',phone:'+62 22 84355555',address:'Jl. Lingkar Barat No.21, Bandung',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'Hilton Bandung',lat:-6.9100,lng:107.6050,stars:5,rating:4.4,city:'Bandung',price:2800000,website:'https://www.hilton.com/bandung',phone:'+62 22 84212345',address:'Jl. HOS. Cokroaminoto No.41-43, Bandung',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'Novotel Bandung',lat:-6.9000,lng:107.6000,stars:4,rating:4.1,city:'Bandung',price:1200000,website:'https://www.novotel.com/bandung',phone:'+62 22 4212000',address:'Jl. Cihampelas No.23-25, Bandung',amenities:['Restaurant','Pool','Gym']},
{name:'Mercure Bandung City Centre',lat:-6.8980,lng:107.6120,stars:4,rating:4.0,city:'Bandung',price:1000000,website:'https://www.mercure.com/bandung',phone:'+62 22 4209800',address:'Jl. Lengkong Besar No.17, Bandung',amenities:['Restaurant','Pool','Gym']},
{name:'Aryaduta Bandung',lat:-6.8920,lng:107.6080,stars:4,rating:4.1,city:'Bandung',price:1100000,website:'https://www.aryaduta.com/bandung',phone:'+62 22 4211000',address:'Jl. Sumatera No.51, Bandung',amenities:['Restaurant','Pool','Gym']},
{name:'Savoy Homann Bidakara Bandung',lat:-6.8930,lng:107.6070,stars:4,rating:4.0,city:'Bandung',price:900000,website:'https://www.savoyhomann.com',phone:'+62 22 2316079',address:'Jl. Asia Afrika No.112, Bandung',amenities:['Restaurant','Pool','Gym','Historic']},

// === YOGYAKARTA ===
{name:'Melia Purosani Yogyakarta',lat:-7.7900,lng:110.3700,stars:5,rating:4.4,city:'Yogyakarta',price:2000000,website:'https://www.melia.com/yogyakarta',phone:'+62 274 589888',address:'Jl. Suryatmajran No.1, Yogyakarta',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'The Ritz-Carlton Yogyakarta',lat:-7.7850,lng:110.3800,stars:5,rating:4.6,city:'Yogyakarta',price:4000000,website:'https://www.ritzcarlton.com/yogyakarta',phone:'+62 274 888888',address:'Jl. Mataram, Yogyakarta',amenities:['Spa','Restaurant','Pool','Gym','Temple View']},
{name:'Hyatt Regency Yogyakarta',lat:-7.7950,lng:110.3750,stars:5,rating:4.3,city:'Yogyakarta',price:2500000,website:'https://www.hyatt.com/yogyakarta',phone:'+62 274 881234',address:'Jl. Palagan Tentara Pelajar, Yogyakarta',amenities:['Spa','Restaurant','Pool','Gym','Golf']},
{name:'Jogja Plaza Hotel',lat:-7.7920,lng:110.3680,stars:4,rating:4.0,city:'Yogyakarta',price:800000,website:'https://www.jogjaplazahotel.com',phone:'+62 274 588666',address:'Jl. Jendral Sudirman No.21, Yogyakarta',amenities:['Restaurant','Pool','Gym']},
{name:'Royal Ambarrukmo Yogyakarta',lat:-7.7820,lng:110.3950,stars:5,rating:4.4,city:'Yogyakarta',price:1800000,website:'https://www.royalambarrukmo.com',phone:'+62 274 488488',address:'Jl. Laksda Adisucipto No.52, Yogyakarta',amenities:['Spa','Restaurant','Pool','Gym','Heritage']},
{name:'Amanjiwo Resort',lat:-7.6073,lng:110.2066,stars:5,rating:4.8,city:'Yogyakarta',price:15000000,website:'https://www.aman.com/resorts/amanjiwo',phone:'+62 274 417171',address:'Borobudur, Magelang, Yogyakarta',amenities:['Spa','Restaurant','Pool','Gym','Temple View','Private Pool']},
{name:'Plataran Borobudur Resort',lat:-7.6100,lng:110.2100,stars:5,rating:4.5,city:'Yogyakarta',price:5000000,website:'https://www.plataran.com/borobudur',phone:'+62 274 895171',address:'Jl. Borobudur Ngadiharjo, Magelang',amenities:['Spa','Restaurant','Pool','Gym','Temple View']},
{name:'Phoenix Hotel Yogyakarta',lat:-7.7910,lng:110.3690,stars:4,rating:4.1,city:'Yogyakarta',price:700000,website:'https://www.phoenixhotelyogyakarta.com',phone:'+62 274 566666',address:'Jl. Jendral Sudirman No.9, Yogyakarta',amenities:['Restaurant','Pool','Gym']},
{name:'Hotel Tentrem Yogyakarta',lat:-7.7940,lng:110.3720,stars:5,rating:4.5,city:'Yogyakarta',price:3000000,website:'https://www.tentremyogyakarta.com',phone:'+62 274 891010',address:'Jl. Pemuda No.15-16, Yogyakarta',amenities:['Spa','Restaurant','Pool','Gym','Luxury']},
{name:'Sheraton Mustika Yogyakarta',lat:-7.7800,lng:110.3980,stars:5,rating:4.2,city:'Yogyakarta',price:1500000,website:'https://www.sheraton.com/yogyakarta',phone:'+62 274 488588',address:'Jl. Laksda Adisucipto No.47, Yogyakarta',amenities:['Spa','Restaurant','Pool','Gym']},

// === LOMBOK ===
{name:'The Lombok Lotus Resort',lat:-8.6500,lng:116.3200,stars:5,rating:4.5,city:'Mataram',price:3500000,website:'https://www.lomboklotus.com',phone:'+62 371 888888',address:'Senggigi, Lombok',amenities:['Beachfront','Spa','Restaurant','Pool']},
{name:'Selong Belanak Beach Resort',lat:-8.7800,lng:116.2800,stars:5,rating:4.4,city:'Mataram',price:4000000,website:'https://www.selongbelanak.com',phone:'+62 371 888999',address:'Selong Belanak, Lombok',amenities:['Beachfront','Private Pool','Spa','Restaurant']},
{name:'Qunci Villas Resort Lombok',lat:-8.5700,lng:116.3100,stars:5,rating:4.3,city:'Mataram',price:2500000,website:'https://www.quncivillas.com',phone:'+62 371 765001',address:'Senggigi Beach, Lombok',amenities:['Beachfront','Pool','Spa','Restaurant']},
{name:'Kuta Komodo Resort Lombok',lat:-8.9100,lng:116.2900,stars:4,rating:4.0,city:'Mataram',price:1200000,website:'https://www.kutakomodo.com',phone:'+62 371 888777',address:'Kuta Beach, Lombok',amenities:['Beachfront','Pool','Restaurant']},
{name:'Novotel Lombok',lat:-8.6200,lng:116.3200,stars:4,rating:4.1,city:'Mataram',price:1000000,website:'https://www.novotel.com/lombok',phone:'+62 371 888666',address:'Senggigi, Lombok',amenities:['Beachfront','Pool','Restaurant','Gym']},
{name:'Sheraton Senggigi Beach Resort',lat:-8.5600,lng:116.3000,stars:5,rating:4.2,city:'Mataram',price:2000000,website:'https://www.sheraton.com/senggigi',phone:'+62 371 765001',address:'Senggigi Beach, Lombok',amenities:['Beachfront','Pool','Spa','Restaurant']},
{name:'The Oberoi Beach Resort Lombok',lat:-8.5500,lng:116.2900,stars:5,rating:4.6,city:'Mataram',price:6000000,website:'https://www.oberoihotels.com/lombok',phone:'+62 371 765001',address:'Mangsit Beach, Lombok',amenities:['Beachfront','Private Pool','Spa','Restaurant']},
{name:'Amanwana Resort',lat:-8.5500,lng:116.2800,stars:5,rating:4.8,city:'Mataram',price:15000000,website:'https://www.aman.com/resorts/amanwana',phone:'+62 371 765001',address:'Moyo Island, Sumbawa, NTT',amenities:['Beachfront','Private Pool','Spa','Restaurant','Island']},

// === SUMATRA ===
{name:'The Westin Hotel Medan',lat:3.5900,lng:98.6800,stars:5,rating:4.3,city:'Medan',price:1500000,website:'https://www.westin.com/medan',phone:'+62 61 4568888',address:'Jl. Putri Hijau No.10, Medan',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'Hotel Aryaduta Medan',lat:3.5920,lng:98.6780,stars:5,rating:4.1,city:'Medan',price:1200000,website:'https://www.aryaduta.com/medan',phone:'+62 61 4555666',address:'Jl. Putri Hijau No.13, Medan',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'JW Marriott Hotel Medan',lat:3.5880,lng:98.6820,stars:5,rating:4.5,city:'Medan',price:2000000,website:'https://www.marriott.com/medan',phone:'+62 61 4555888',address:'Jl. Kapten Pattimura No.22, Medan',amenities:['Spa','Restaurant','Pool','Gym']},
{name:'Sofitel Bali Nusa Dua Beach Resort',lat:-8.8080,lng:115.2320,stars:5,rating:4.4,city:'Nusa Dua',price:4000000,website:'https://www.sofitel.com/nusa-dua',phone:'+62 361 8492888',address:'Nusa Dua Beach, Bali',amenities:['Beachfront','Pool','Spa','Restaurant']},
{name:'Raffles Bali',lat:-8.8180,lng:115.0860,stars:5,rating:4.8,city:'Kuta Selatan',price:18000000,website:'https://www.raffles.com/bali',phone:'+62 361 8472888',address:'Jl. Raya Uluwatu, Jimbaran, Bali',amenities:['Cliff View','Private Pool','Spa','Restaurant','Butler Service']},
];

async function main(){
  let inserted=0, skipped=0;
  for(const h of HOTELS){
    try{
      const cr=await pool.query('SELECT id FROM cities WHERE name=$1 AND country_code=\'ID\' LIMIT 1',[h.city]);
      if(!cr.rows.length){console.log('NO CITY: '+h.city+' for '+h.name);skipped++;continue;}
      const city_id=cr.rows[0].id;
      const slug=sl(h.name);
      const ex=await pool.query('SELECT id FROM hotels WHERE slug=$1 AND city_id=$2',[slug,city_id]);
      if(ex.rows.length){skipped++;continue;}
      const cn=await pool.query('SELECT name FROM cities WHERE id=$1',[city_id]);
      const cityName=cn.rows[0].name;
      await pool.query(`INSERT INTO hotels(name,city,country,lat,lng,stars,rating,price_idr,price_formatted,website,phone,address,wifi,parking,pool,amenities,city_id,source,slug,created_at) VALUES($1,$2,'Indonesia',$3,$4,$5,$6,$7,$8,$9,$10,$11,true,true,true,$12,$13,'curated',$14,NOW())`,
        [h.name,cityName,h.lat,h.lng,h.stars,h.rating,h.price,'Rp '+h.price.toLocaleString('id-ID'),h.website,h.phone,h.address,JSON.stringify(h.amenities),city_id,slug]);
      inserted++;
      console.log('INSERTED: '+h.name+' ('+h.city+')');
    }catch(e){
      console.log('ERR: '+h.name+': '+e.message.substring(0,100));
    }
  }
  await pool.query('UPDATE cities SET hotel_count=(SELECT count(*) FROM hotels WHERE hotels.city_id=cities.id) WHERE country_code=\'ID\'');
  console.log('\n=== DONE: inserted='+inserted+' skipped='+skipped+' ===');
  const total=await pool.query('SELECT count(*) FROM hotels WHERE country=\'Indonesia\'');
  console.log('=== TOTAL ID: '+total.rows[0].count+' ===');
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
