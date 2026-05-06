
// ─── CANVAS BACKGROUND ───
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 1.5 + .3;
        this.vx = (Math.random() - .5) * .3;
        this.vy = (Math.random() - .5) * .3;
        this.a = Math.random() * .4 + .05;
        const cols = ['rgba(139,26,74,', 'rgba(42,157,130,', 'rgba(212,160,23,'];
        this.c = cols[Math.floor(Math.random() * cols.length)];
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.c + this.a + ')';
        ctx.fill();
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255,255,255,${.04 * (1 - d / 120)})`;
                ctx.lineWidth = .5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
}
animate();

// ─── SCROLL PROGRESS ───
window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    document.getElementById('progress-bar').style.width = (window.scrollY / total * 100) + '%';
});

// ─── COUNTER ANIMATION ───
function animateCounter(el, target) {
    let start = 0;
    const dur = 1800;
    const step = (timestamp) => {
        if (!start) start = timestamp;
        const prog = Math.min((timestamp - start) / dur, 1);
        const ease = 1 - Math.pow(1 - prog, 3);
        el.textContent = Math.floor(ease * target).toLocaleString();
        if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

const counterEls = document.querySelectorAll('[data-count]');
const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            animateCounter(e.target, parseInt(e.target.dataset.count));
            counterObs.unobserve(e.target);
        }
    });
}, { threshold: .5 });
counterEls.forEach(el => counterObs.observe(el));

// ─── PATHWAY ───
const pathwaySteps = [
    { substrate: 'GTP', arrow: '↓', gene: 'FolE (folE)', product: 'Dihidroneopterina trifosfato', type: 'normal' },
    { substrate: null, arrow: '↓', gene: 'FolB (folB)', product: '6-hidroximetil-7,8-dihidropterina', type: 'normal' },
    { substrate: null, arrow: '↓', gene: 'FolK (folK)', product: '6-hidroximetil-7,8-dihidropterina pirofosfato', note: 'PTERIDINA ACTIVADA', type: 'normal' },
    { substrate: '+ pABA ➝', arrow: '↓', gene: '★ FolP/DHPS (folP) ★', product: '7,8-dihidropteroato', note: 'PASO CLAVE — nuestro gen', type: 'key' },
    { substrate: '+ Glutamato ➝', arrow: '↓', gene: 'FolC (folC)', product: 'Dihidrofolato (DHF)', type: 'normal' },
    { substrate: null, arrow: '↓', gene: 'FolA/DHFR (folA)', product: 'Tetrahidrofolato (THF)', type: 'normal' },
    { substrate: null, arrow: '↓', gene: 'MetF/MTHFR', product: 'L-5-MTHF', note: 'ÁCIDO FÓLICO ACTIVO ✓', type: 'final' }
];

const pc = document.getElementById('pathway-container');
pathwaySteps.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'pathway-step';
    div.style.transitionDelay = (i * .08) + 's';
    const boxClass = s.type === 'key' ? 'pb-enzyme highlight-box' : s.type === 'final' ? 'pb-final' : 'pb-substrate';
    const enzymeClass = s.type === 'key' ? 'gene-tag highlight' : 'gene-tag';
    div.innerHTML = `
    ${s.substrate ? `<div style="font-size:.78rem;color:var(--muted);margin-bottom:4px">${s.substrate}</div>` : ''}
    <div class="pathway-box ${boxClass}" style="${s.type === 'key' ? 'box-shadow:0 0 20px rgba(139,26,74,.3)' : ''}">
      ${s.product}
      ${s.note ? `<div style="font-size:.7rem;color:rgba(255,255,255,.5);margin-top:4px">${s.note}</div>` : ''}
    </div>
    ${i < pathwaySteps.length - 1 ? `
      <span class="pathway-arrow">↓</span>
      <div><span class="${enzymeClass}">${s.gene}</span></div>
      <span class="pathway-arrow">↓</span>
    ` : ''}
  `;
    div.addEventListener('click', () => {
        document.querySelectorAll('.pathway-step').forEach(el => el.style.background = '');
        div.style.background = 'rgba(255,255,255,.04)';
        div.style.borderRadius = '12px';
    });
    pc.appendChild(div);
});

const pathObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            document.querySelectorAll('.pathway-step').forEach((el, i) => {
                setTimeout(() => el.classList.add('vis'), i * 100);
            });
            pathObs.unobserve(e.target);
        }
    });
}, { threshold: .1 });
if (pc) pathObs.observe(pc);

// ─── PROCESS STEPS ───
const processData = [
    {
        icon: '📦', num: '01',
        title: 'Recepción y Verificación del Plásmido pETDuet-1',
        short: 'Recepción del vector de expresión desde Addgene',
        desc: 'El plásmido pETDuet-1 se recibe desde Addgene en agar stab con E. coli DH5α. Se siembra en LB-agar con ampicilina 100 μg/mL y se incuba a 37°C por 16 horas. Solo las bacterias con el plásmido (gen AmpR) sobreviven. Una colonia positiva se transfiere a 5 mL de LB líquido + ampicilina para obtener cultivo en masa.'
    },
    {
        icon: '🧫', num: '02',
        title: 'Extracción del Plásmido — Kit QIAprep Miniprep',
        short: 'Purificación del vector con kit QIAGEN',
        desc: 'Lisis alcalina con NaOH/SDS libera el plásmido. Precipitación con acetato de potasio elimina proteínas y ADN cromosómico. Centrifugación y lavados en columna de sílice. Elución con agua libre de nucleasas. Pureza verificada por NanoDrop: A260/A280 > 1.8.'
    },
    {
        icon: '🔬', num: '03',
        title: 'Extracción y Amplificación del Gen folP por PCR',
        short: 'Amplificación del gen folP desde L. lactis',
        desc: 'El ADN genómico de Lactococcus lactis es extraído con TIANamp Bacteria DNA Kit. El gen folP (1,074 pb) es amplificado por PCR de alta fidelidad (Phusion/Q5) usando primers folP-NcoI-F y folP-NotI-R. Condiciones: 95°C 5 min; 30 ciclos [95°C 30s / 58°C 30s / 72°C 1 min]; 72°C 10 min. Verificación en gel de agarosa 1%.'
    },
    {
        icon: '✂️', num: '04',
        title: 'Digestión con Enzimas de Restricción NcoI + NotI',
        short: 'Corte direccional de vector e inserto',
        desc: 'Tanto el plásmido como el inserto folP son digeridos con NcoI y NotI (NEB) en buffer CutSmart a 37°C por 1 hora. NcoI (5\'-CCATGG-3\') incluye el codón ATG de inicio. NotI (5\'-GCGGCCGC-3\') con 8 pb garantiza máxima especificidad. Se generan extremos cohesivos compatibles para ligación direccional.'
    },
    {
        icon: '🔗', num: '05',
        title: 'Ligación — Construcción pETDuet-folP',
        short: 'Unión del gen al vector con T4 DNA Ligasa',
        desc: 'El gen folP digerido se liga al pETDuet-1 linearizado en proporción molar inserto:vector 3:1. T4 DNA Ligasa (400 U, NEB) en buffer ATP 1 mM, a 16°C por 16 horas. La ligasa sella los extremos cohesivos NcoI/NotI covalentemente. Producto: pETDuet-folP, el plásmido recombinante listo para transformación.'
    },
    {
        icon: '⚡', num: '06',
        title: 'Transformación por Electroporación en E. coli BL21(DE3)',
        short: 'Inserción del plásmido en la bacteria productora',
        desc: 'Células electrocompetentes BL21(DE3) preparadas por lavados con glicerol 10% a 4°C. Pulso eléctrico: 1.8 kV en cubetas de 1 mm. Recuperación en 1 mL medio SOC a 37°C por 1 hora. Siembra en LB-ampicilina 100 μg/mL. Eficiencia: hasta 10⁹ UFC/μg ADN. Solo las bacterias transformadas forman colonias.'
    },
    {
        icon: '✅', num: '07',
        title: 'Confirmación de Transformación Exitosa (4 niveles)',
        short: 'Verificación multi-nivel de la inserción correcta',
        desc: 'Nivel 1: Selección en LB-ampicilina. Nivel 2: PCR de colonia con primers folP-NcoI-F / folP-NotI-R (banda 1,074 pb). Nivel 3: Digestión NcoI+NotI libera inserto ~1,074 pb + vector ~6,330 pb. Nivel 4: Secuenciación Sanger comparada con NZ_CP028160.1 en BLAST para confirmar ausencia de mutaciones.'
    }
];

const container = document.getElementById('process-steps');
processData.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'route-step';
    div.innerHTML = `
    <div class="step-num" style="color:var(--muted)">${s.num}</div>
    <div class="step-content">
      <h5>${s.icon} ${s.title}</h5>
      <p>${s.short}</p>
    </div>
    <span class="step-arrow"><i class="fas fa-chevron-right"></i></span>
  `;
    div.addEventListener('click', () => {
        document.querySelectorAll('.route-step').forEach(el => el.style.background = '');
        div.style.background = 'rgba(255,255,255,.04)';
        div.style.borderRadius = '12px';
        document.getElementById('step-icon').textContent = s.icon;
        document.getElementById('step-title').textContent = `${s.num}. ${s.title}`;
        document.getElementById('step-desc').textContent = s.desc;
    });
    container.appendChild(div);
});

// Intersection for route steps
const stepObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const steps = document.querySelectorAll('.route-step');
            steps.forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 80));
            stepObs.unobserve(e.target);
        }
    });
}, { threshold: .1 });
if (container) stepObs.observe(container);

// ─── TABS ───
function switchTab(id) {
    document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.custom-tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
}

// ─── NAVBAR SCROLL EFFECT ───
window.addEventListener('scroll', () => {
    const nb = document.querySelector('.navbar');
    nb.style.background = window.scrollY > 50 ? 'rgba(15,10,20,0.95)' : 'rgba(15,10,20,0.85)';
});
