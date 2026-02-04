document.addEventListener('DOMContentLoaded', function () {
    // Smooth scroll for nav links and set active class
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(function (a) {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const id = a.getAttribute('href').slice(1);
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            navLinks.forEach(function (x) { x.classList.remove('active'); });
            a.classList.add('active');
        });
    });

    // Toggle card active state on click
    document.querySelectorAll('.card').forEach(function (card) {
        card.addEventListener('click', function () {
            card.classList.toggle('active');
        });
    });

    // Highlight nav based on visible section
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(function (a) {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { observer.observe(s); });
    // Load Mikaela schedule and gallery
    loadMikaelaData();
});

function loadMikaelaData() {
    fetch('mikaela_schedule.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            // populate shows
            const showList = document.getElementById('show-schedule');
            if (showList && data.shows) {
                showList.innerHTML = '';
                data.shows.forEach(function (s) {
                    const li = document.createElement('li');
                    li.innerHTML = '<strong>' + (s.display || s.date) + '</strong> (' + (s.day || '') + ') — ' + s.title + ' • <em>Jam: ' + (s.time || '-') + ' WIB</em>';
                    showList.appendChild(li);
                });
            }

            // populate events
            const eventList = document.getElementById('event-schedule');
            if (eventList && data.events) {
                eventList.innerHTML = '';
                data.events.forEach(function (e) {
                    const li = document.createElement('li');
                    li.innerHTML = '<strong>' + (e.display || e.date) + '</strong> (' + (e.day || '') + ') — ' + e.title + ' • <em>Jam: ' + (e.time || '-') + ' WIB</em>';
                    eventList.appendChild(li);
                });
            }

            // populate vc table
            const vcBody = document.getElementById('vc-body');
            if (vcBody && data.vc_sessions) {
                vcBody.innerHTML = '';
                data.vc_sessions.forEach(function (v) {
                    const tr = document.createElement('tr');
                    const memberTd = document.createElement('td'); memberTd.textContent = v.member;
                    const dateTd = document.createElement('td'); 
                    dateTd.textContent = (v.day ? v.day + ', ' : '') + formatDateDisplay(v.date);
                    const jalurSesiTd = document.createElement('td');
                    jalurSesiTd.textContent = 'Jalur ' + (v.jalur || '-') + ', Sesi ' + (v.sesi || '-');
                    const timeTd = document.createElement('td'); timeTd.textContent = v.time;
                    tr.appendChild(memberTd); tr.appendChild(dateTd); tr.appendChild(jalurSesiTd); tr.appendChild(timeTd);
                    vcBody.appendChild(tr);
                });
            }

            // populate gallery
            const gallery = document.getElementById('gallery');
            if (gallery && data.gallery) {
                gallery.innerHTML = '';
                data.gallery.forEach(function (src, idx) {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = 'Mikaela foto ' + (idx + 1);
                    gallery.appendChild(img);
                });
            }
        })
        .catch(function (err) {
            console.warn('Gagal memuat mikaela_schedule.json:', err);
        });
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr + 'T00:00:00');
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return d.toLocaleDateString('id-ID', options);
    } catch (e) {
        return dateStr;
    }
};
