// LifeDrop — Blood Bank Management (client-side demo, uses localStorage)
const GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const STORAGE = {
  donors:"lifedrop_donors",
  inventory:"lifedrop_inventory",
  requests:"lifedrop_requests"
};

const seedDonors = [
  {id:1,name:"Aarav Sharma",age:28,group:"O+",city:"Mumbai",phone:"9876543210",email:"aarav@example.com"},
  {id:2,name:"Priya Patel",age:32,group:"A+",city:"Delhi",phone:"9876501234",email:"priya@example.com"},
  {id:3,name:"John Cooper",age:41,group:"B-",city:"New York",phone:"5551230098",email:"john@example.com"},
  {id:4,name:"Sara Khan",age:26,group:"AB+",city:"Dubai",phone:"9711234567",email:"sara@example.com"}
];
const seedInventory = {"A+":24,"A-":8,"B+":18,"B-":5,"AB+":6,"AB-":2,"O+":32,"O-":11};
const seedRequests = [
  {id:1,patient:"Meera Iyer",group:"O-",units:2,hospital:"City Hospital",phone:"9998887777",urgency:"Critical",status:"pending"},
  {id:2,patient:"Ravi Kumar",group:"A+",units:1,hospital:"Sunrise Clinic",phone:"9998880000",urgency:"Normal",status:"approved"}
];

// ---- Storage helpers ----
const load = (k,def)=>{ try{const v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch(e){return def;} };
const save = (k,v)=>localStorage.setItem(k,JSON.stringify(v));

let donors = load(STORAGE.donors, seedDonors);
let inventory = load(STORAGE.inventory, seedInventory);
let requests = load(STORAGE.requests, seedRequests);
save(STORAGE.donors,donors); save(STORAGE.inventory,inventory); save(STORAGE.requests,requests);

// ---- Toast ----
const toast = (msg,type="success")=>{
  const el=document.getElementById("toast");
  el.textContent=msg;
  el.className=`toast show ${type}`;
  setTimeout(()=>el.className="toast",2600);
};

// ---- Render inventory ----
function renderInventory(){
  const grid=document.getElementById("inventory-grid");
  grid.innerHTML=GROUPS.map(g=>{
    const u=inventory[g]||0;
    return `<div class="inv-cell"><span class="g">${g}</span><span class="u">${u} units</span></div>`;
  }).join("");
  // Admin table
  const body=document.getElementById("inventory-body");
  body.innerHTML=GROUPS.map(g=>`
    <tr>
      <td><strong>${g}</strong></td>
      <td>${inventory[g]||0} units</td>
      <td>
        <button class="qty-btn" onclick="adjustStock('${g}',-1)">−</button>
        <button class="qty-btn" onclick="adjustStock('${g}',1)">+</button>
      </td>
    </tr>`).join("");
  document.getElementById("stat-units").textContent=Object.values(inventory).reduce((a,b)=>a+b,0);
}
window.adjustStock=(g,d)=>{
  inventory[g]=Math.max(0,(inventory[g]||0)+d);
  save(STORAGE.inventory,inventory);
  renderInventory();
};

// ---- Render donors ----
function renderDonors(){
  const body=document.getElementById("donors-body");
  body.innerHTML = donors.length? donors.map(d=>`
    <tr>
      <td>${d.name}</td><td><strong>${d.group}</strong></td>
      <td>${d.city}</td><td>${d.phone}</td>
      <td><button class="icon-btn btn-delete" onclick="deleteDonor(${d.id})">Delete</button></td>
    </tr>`).join("")
    : `<tr><td colspan="5" style="text-align:center;color:var(--muted)">No donors yet.</td></tr>`;
  document.getElementById("stat-donors").textContent=donors.length;
}
window.deleteDonor=(id)=>{
  donors=donors.filter(d=>d.id!==id);
  save(STORAGE.donors,donors); renderDonors();
  toast("Donor removed","success");
};

// ---- Render requests ----
function renderRequests(){
  const body=document.getElementById("requests-body");
  body.innerHTML = requests.length? requests.map(r=>`
    <tr>
      <td>${r.patient}</td>
      <td><strong>${r.group}</strong></td>
      <td>${r.units}</td>
      <td>${r.hospital}</td>
      <td><span class="badge ${r.urgency.toLowerCase()}">${r.urgency}</span></td>
      <td><span class="badge ${r.status}">${r.status}</span></td>
      <td>
        ${r.status==="pending"?`
          <button class="icon-btn btn-approve" onclick="setStatus(${r.id},'approved')">Approve</button>
          <button class="icon-btn btn-reject" onclick="setStatus(${r.id},'rejected')">Reject</button>`
          :`<button class="icon-btn btn-delete" onclick="deleteRequest(${r.id})">Delete</button>`}
      </td>
    </tr>`).join("")
    : `<tr><td colspan="7" style="text-align:center;color:var(--muted)">No requests yet.</td></tr>`;
  document.getElementById("stat-requests").textContent=requests.filter(r=>r.status==="approved").length;
}
window.setStatus=(id,status)=>{
  const r=requests.find(x=>x.id===id);
  if(!r) return;
  if(status==="approved"){
    if((inventory[r.group]||0) < r.units){
      toast(`Not enough ${r.group} in stock`,"error");
      return;
    }
    inventory[r.group]-=r.units;
    save(STORAGE.inventory,inventory);
  }
  r.status=status;
  save(STORAGE.requests,requests);
  renderInventory(); renderRequests();
  toast(`Request ${status}`,status==="approved"?"success":"error");
};
window.deleteRequest=(id)=>{
  requests=requests.filter(r=>r.id!==id);
  save(STORAGE.requests,requests); renderRequests();
};

// ---- Forms ----
document.getElementById("donor-form").addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  const donor={id:Date.now(),...Object.fromEntries(f)};
  donor.age=Number(donor.age);
  donors.unshift(donor);
  save(STORAGE.donors,donors);
  renderDonors();
  e.target.reset();
  toast("Thank you for registering as a donor! 🩸","success");
});

document.getElementById("request-form").addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  const req={id:Date.now(),status:"pending",...Object.fromEntries(f)};
  req.units=Number(req.units);
  requests.unshift(req);
  save(STORAGE.requests,requests);
  renderRequests();
  e.target.reset();
  toast("Request submitted. Admin will review shortly.","success");
});

document.getElementById("search-form").addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  const group=f.get("group"); const city=(f.get("city")||"").trim().toLowerCase();
  const stock=inventory[group]||0;
  const matches=donors.filter(d=>d.group===group && (!city || d.city.toLowerCase().includes(city)));
  const status = stock>10?["available","In Stock"]:stock>0?["low","Low Stock"]:["empty","Out of Stock"];
  const res=document.getElementById("search-results");
  res.innerHTML = `
    <div class="result-card">
      <h4>${group}</h4>
      <p>${stock} units available in the blood bank</p>
      <div class="status ${status[0]}">● ${status[1]}</div>
    </div>
    <div class="result-card">
      <h4>${matches.length}</h4>
      <p>Registered donors match ${group}${city?` in ${f.get("city")}`:""}</p>
      <div class="status ${matches.length?"available":"empty"}">● ${matches.length?"Donors nearby":"No donors found"}</div>
    </div>
    ${matches.slice(0,3).map(d=>`
      <div class="result-card">
        <h4 style="font-size:1.05rem;color:var(--ink)">${d.name}</h4>
        <p>${d.city} · ${d.group}</p>
        <div class="status available">📞 ${d.phone}</div>
      </div>`).join("")}
  `;
});

// ---- Tabs ----
document.querySelectorAll(".tab").forEach(t=>{
  t.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
    document.getElementById("tab-"+t.dataset.tab).classList.add("active");
  });
});

// ---- Mobile menu ----
document.querySelector(".menu-toggle").addEventListener("click",()=>{
  document.querySelector(".menu").classList.toggle("open");
});
document.querySelectorAll("[data-nav]").forEach(a=>a.addEventListener("click",()=>{
  document.querySelector(".menu").classList.remove("open");
}));

// ---- Init ----
document.getElementById("year").textContent=new Date().getFullYear();
renderInventory(); renderDonors(); renderRequests();
