// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initEmailJS();
    initCalculator();
    initScrollAnimations();
    initNavbar();
    initMobileMenu();
});

// Navbar Scroll Effect
function initNavbar() {
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
        });
        
        // Close menu when clicking link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }
}

// EmailJS
function initEmailJS() {
    if (window.emailjs) {
        emailjs.init('GyPtSZtmN2y7-pjA8');
    }
}

// Calculator State
let state = {
    titular: '',
    direccion: '',
    obra: '',
    rpi: {
        modalidad: '',
        precio: 0
    },
    avisoPrecio: 70000
};

function initCalculator() {
    const inputs = ['f-nombre', 'f-direccion', 'f-obra'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                const key = id.split('-')[1];
                state[key === 'nombre' ? 'titular' : key] = e.target.value;
                updateUI();
                if (key === 'direccion') updateMap(e.target.value);
            });
        }
    });

    const rpiOptions = document.querySelectorAll('.radio-card');
    rpiOptions.forEach(card => {
        card.addEventListener('click', () => {
            rpiOptions.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            state.rpi.modalidad = card.dataset.modalidad;
            state.rpi.precio = parseInt(card.dataset.precio);
            updateUI();
        });
    });
}

function updateUI() {
    // Update summary labels
    setText('s-nombre', state.titular || '—');
    setText('s-obra', state.obra || '—');
    setText('s-direccion', state.direccion ? state.direccion + ', CABA' : 'Por favor, ingresá la dirección');
    
    // Update RPI label
    if (state.rpi.precio > 0) {
        setText('s-rpi', `$${state.rpi.precio.toLocaleString('es-AR')} (${state.rpi.modalidad})`);
        const total = state.rpi.precio + state.avisoPrecio;
        setText('s-total', `$${total.toLocaleString('es-AR')}`);
    } else {
        setText('s-rpi', 'Seleccione modalidad');
        setText('s-total', '—');
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

let mapTimeout;
function updateMap(dir) {
    clearTimeout(mapTimeout);
    if (dir.length < 5) return;
    
    mapTimeout = setTimeout(() => {
        const container = document.getElementById('map-container');
        if (!container) return;
        
        const full = encodeURIComponent(dir + ', Buenos Aires, Argentina');
        container.innerHTML = `<iframe src="https://maps.google.com/maps?q=${full}&output=embed&z=17" allowfullscreen loading="lazy" style="width:100%; height:100%; border:none; border-radius:12px;"></iframe>`;
    }, 1000);
}

// Scroll Reveals
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Actions
function getSummaryText() {
    const total = state.rpi.precio > 0 ? (state.rpi.precio + state.avisoPrecio) : 0;
    return {
        titular: state.titular || 'No especificado',
        direccion: state.direccion || 'No especificada',
        obra: state.obra || 'No especificada',
        rpiMod: state.rpi.modalidad || 'No seleccionada',
        rpiPrecio: state.rpi.precio.toLocaleString('es-AR'),
        total: total.toLocaleString('es-AR')
    };
}

window.enviarWhatsApp = function() {
    const p = getSummaryText();
    if (!state.direccion) { alert('Completá la dirección.'); return; }
    if (!state.rpi.precio) { alert('Seleccioná la modalidad de RPI.'); return; }
    
    const msg = `*Solicitud de Presupuesto — Aviso de Obra CABA*\n\n`
      + `👤 *Titular:* ${p.titular}\n`
      + `📍 *Dirección:* ${p.direccion}, CABA\n`
      + `🏗️ *Obra:* ${p.obra}\n\n`
      + `━━━━━━━━━━━━━━━━━━\n`
      + `*ETAPA 1 — Informe de Dominio (RPI)*\n`
      + `• Modalidad: ${p.rpiMod}\n`
      + `• Importe: $${p.rpiPrecio}\n\n`
      + `*ETAPA 2 — Aviso de Obra GCBA*\n`
      + `• Importe: $70.000\n\n`
      + `━━━━━━━━━━━━━━━━━━\n`
      + `💰 *TOTAL ESTIMADO: $${p.total}*\n\n`
      + `_Enviado desde aviso-de-obra.com.ar_`;
    
    window.open(`https://wa.me/5491137787305?text=${encodeURIComponent(msg)}`, '_blank');
};

window.generarPDF = function() {
    // Reusing user's logic but with potential for styling updates later
    // Logic will be triggered after checking dependencies in the HTML
    if (!state.direccion || !state.rpi.precio) {
        alert('Por favor completá todos los datos antes de generar el PDF.');
        return;
    }
    
    // We'll keep the existing PDF logic in the HTML or move it here if jsPDF is available globally
    if (window.jspdf) {
        const p = getSummaryText();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        // Header - Modern Design
        doc.setFillColor(14, 165, 233); // Cyan 500
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('AVISO DE OBRA CABA', 15, 18);
        doc.setFontSize(10);
        doc.text('PRESUPUESTO DE GESTIÓN DEL TRÁMITE', 15, 27);
        doc.text(new Date().toLocaleDateString('es-AR'), 175, 27);

        // Body
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.setFontSize(14);
        doc.text('DETALLES DEL TRÁMITE', 15, 55);
        
        doc.setDrawColor(226, 232, 240);
        doc.line(15, 60, 195, 60);

        doc.setFontSize(11);
        doc.text(`TITULAR:`, 15, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(p.titular, 60, 75);

        doc.setFont('helvetica', 'bold');
        doc.text(`DIRECCIÓN:`, 15, 85);
        doc.setFont('helvetica', 'normal');
        doc.text(p.direccion + ', CABA', 60, 85);

        doc.setFont('helvetica', 'bold');
        doc.text(`OBRA:`, 15, 95);
        doc.setFont('helvetica', 'normal');
        doc.text(p.obra, 60, 95);

        // Etapas
        let y = 115;
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 50, 'F');
        
        doc.setTextColor(14, 165, 233);
        doc.setFont('helvetica', 'bold');
        doc.text('ETAPA 1: INFORME RPI', 20, y + 10);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.text(`Modalidad: ${p.rpiMod}`, 20, y + 20);
        doc.text(`Precio: $${p.rpiPrecio}`, 20, y + 30);
        doc.setFontSize(9);
        doc.text('* Se abona por anticipado para iniciar el trámite.', 20, y + 40);

        y += 60;
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 50, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(14, 165, 233);
        doc.setFont('helvetica', 'bold');
        doc.text('ETAPA 2: AVISO DE OBRA', 20, y + 10);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.text('Gestión ante el Gobierno de la Ciudad', 20, y + 20);
        doc.text('Precio: $70.000', 20, y + 30);
        doc.setFontSize(9);
        doc.text('* Se abona contra entrega del trámite aprobado (24-48hs).', 20, y + 40);

        // Total
        y += 70;
        doc.setFillColor(17, 24, 39); // Deep Black
        doc.rect(130, y, 65, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: $${p.total}`, 135, y + 10);

        // Footer
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text('Aviso de Obra CABA | www.aviso-de-obra.com.ar | ivandimiero@gmail.com', 105, 285, { align: 'center' });

        doc.save(`Presupuesto-${p.direccion.replace(/\s/g, '-')}.pdf`);
    } else {
        alert('Error: No se pudo cargar la librería de PDF.');
    }
};

window.enviarConsulta = async function() {
    const nombre = document.getElementById('c-nombre').value.trim();
    const email = document.getElementById('c-email').value.trim();
    const msg = document.getElementById('c-msg').value.trim();
    const btn = document.getElementById('btn-enviar');
    
    if (!nombre || !msg) { alert('Por favor completá nombre y mensaje.'); return; }
    
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
        await emailjs.send('service_5p9zz55', 'template_consulta', {
            from_name: nombre,
            from_email: email || 'No proporcionado',
            message: msg
        });
        alert('¡Consulta enviada con éxito!');
        document.getElementById('c-nombre').value = '';
        document.getElementById('c-email').value = '';
        document.getElementById('c-msg').value = '';
    } catch (err) {
        alert('Error al enviar: ' + err.text);
    } finally {
        btn.textContent = 'Enviar consulta →';
        btn.disabled = false;
    }
};

window.enviarWhatsAppDirecto = function() {
    const msg = encodeURIComponent("Hola! Quería consultar por un aviso de obra.");
    window.open(`https://wa.me/5491137787305?text=${msg}`, '_blank');
};

window.enviarMailDirecto = function() {
    const subject = encodeURIComponent("Consulta desde la Web - Aviso de Obra");
    window.location.href = `mailto:ivandimiero@gmail.com?subject=${subject}`;
};
