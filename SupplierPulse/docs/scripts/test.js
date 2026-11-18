const fs=require('fs');
const src=fs.readFileSync(__dirname+'/exposure.js','utf8');
const mk=(id,lat,lon,st,oh,du,lt,n,c,cr)=>({SupplierId:id,SiteLat:lat,SiteLon:lon,SiteStatus:st,OnHandUnits:oh,DailyUsage:du,LeadTimeDays:lt,SupplierName:n,Country:c,ContractRef:cr,CreatedBy:{Email:'x'}});
const $vars={httpRequest1:{output:{body:{metadata:{count:1},features:[{id:'us7000m9g4',geometry:{coordinates:[121.5976,23.8356,40]},properties:{title:'M 7.4 - 15 km S of Hualien City, Taiwan',mag:7.4,alert:'yellow',mmi:7.99,time:1712102292173,url:'u'}}]}}},
queryEntityRecords2:{output:{results:[mk('SUP-TW-01',24.78,121,'unknown',1800,150,28,'TW','Taiwan','SP-TEST-0417'),mk('SUP-VN-01',10.8,106.65,'reported_operational',4000,100,21,'VN','Vietnam','SP-TEST-0502'),mk('SUP-US-01',39.96,-83,'reported_operational',5000,120,14,'US','USA','SP-TEST-0611')]}}};
const fn=new Function('$vars',src);
console.log(JSON.stringify(fn($vars),null,1));
// failure case
$vars.httpRequest1.output.body.metadata.count=0;
try{fn($vars)}catch(e){console.log('FAIL-SAFE OK:',e.message)}
