document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            const showList = document.getElementById('show-schedule');
            if (showList && data.jadwal_show) {
                const sortedShow = [...data.jadwal_show].reverse();
                
                showList.innerHTML = sortedShow.length > 0 
                    ? sortedShow.map((item, index) => `
                        <li class="schedule-item ${item.tipe === 'special' ? 'birthday-show' : ''}">
                            <div class="schedule-header" onclick="toggleDetails(${index})">
                                <span>${item.tipe === 'special' ? '🎂' : '🎭'} <strong>${item.tanggal}</strong> - ${item.show}</span>
                                <span class="arrow" id="arrow-${index}">▼</span>
                            </div>
                            <div class="schedule-details" id="details-${index}">
                                <div class="ticket-info">
                                    <p><strong>OFC:</strong> ${item.tiket_ofc}</p>
                                    <p><strong>General:</strong> ${item.tiket_general}</p>
                                </div>
                                </div>
                        </li>`).join('')
                    : '<li>Belum ada jadwal show mendatang.</li>';
            }

            const vcBody = document.getElementById('vc-body');
            if (vcBody && data.video_call) {
                vcBody.innerHTML = data.video_call.length > 0
                    ? data.video_call.map(item => `
                        <tr>
                            <td>${item.member}</td>
                            <td>${item.tanggal}</td>
                            <td>${item.jalur_sesi}</td>
                            <td>${item.waktu}</td>
                        </tr>`).join('')
                    : '<tr><td colspan="4" style="text-align:center;">Tidak ada jadwal VC.</td></tr>';
            }

            const galleryContainer = document.getElementById('containerGaleri');
            if (galleryContainer && data.galeri_foto) {
                galleryContainer.innerHTML = data.galeri_foto.map(foto => `
                    <div class="gallery-item">
                        <img src="${foto.url}" alt="${foto.caption}">
                        <p>${foto.caption}</p>
                    </div>`).join('');
            }
        })
        .catch(err => console.error('Gagal memuat data:', err));
});

function toggleDetails(index) {
    const details = document.getElementById(`details-${index}`);
    const arrow = document.getElementById(`arrow-${index}`);
    if (details) {
        const isActive = details.classList.toggle('active');
        if (arrow) {
            arrow.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
}