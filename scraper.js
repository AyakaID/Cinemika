const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeJadwal() {
    console.log('Memulai browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    const manualVC = [
        {
            member: "Mikaela Kusjanto",
            tanggal: "Minggu, 8.2.2026",
            jalur_sesi: "Sesi 4 (Jalur 4)",
            waktu: "16:15 - 17:30 WIB"
        },
        {
            member: "Mikaela Kusjanto",
            tanggal: "Minggu, 8.2.2026",
            jalur_sesi: "Sesi 5 (Jalur 4)",
            waktu: "17:45 - 19:00 WIB"
        },
        {
            member: "Mikaela Kusjanto",
            tanggal: "Minggu, 8.2.2026",
            jalur_sesi: "Sesi 6 (Jalur 4)",
            waktu: "19:15 - 20:30 WIB"
        },
        {
            member: "Mikaela Kusjanto",
            tanggal: "Rabu, 25.2.2026",
            jalur_sesi: "Sesi 1 (Jalur 2)",
            waktu: "15:15 - 16:15 WIB"
        },
        {
            member: "Mikaela Kusjanto",
            tanggal: "Rabu, 25.2.2026",
            jalur_sesi: "Sesi 2 (Jalur 2)",
            waktu: "16:45 - 17:45 WIB"
        },
        {
            member: "Mikaela Kusjanto",
            tanggal: "Rabu, 25.2.2026",
            jalur_sesi: "Sesi 3 (Jalur 2)",
            waktu: "19:00 - 20:00 WIB"
        }
    ];

    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log('Membuka website JKT48...');
        await page.goto('https://jkt48.com/theater/schedule?lang=id', { waitUntil: 'networkidle2' });

        const dataTheater = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.table tbody tr'));
            const schedules = [];
            let currentShow = null;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            rows.forEach(row => {
                const cols = row.querySelectorAll('td');
                if (cols.length < 2) return;

                const colTglRaw = cols[0].innerText.trim();
                const colInfo = cols[1].innerText.trim();

                if (colTglRaw.includes('.') && !colInfo.includes('TICKET')) {
                    const dateMatch = colTglRaw.match(/(\d+)\.(\d+)\.(\d+)/);
                    
                    if (dateMatch) {
                        const day = parseInt(dateMatch[1]);
                        const month = parseInt(dateMatch[2]) - 1;
                        const year = parseInt(dateMatch[3]);
                        const showDate = new Date(year, month, day);

                        if (showDate >= today) {
                            const cleanShowName = colInfo
                                .replace(/Penukaran tiket \d{2}:\d{2}/gi, '')
                                .replace(/[-\s]+$/, '')
                                .replace(/^[-\s]+/, '')
                                .trim();

                            currentShow = {
                                tanggal: colTglRaw,
                                show: cleanShowName,
                                tiket_ofc: "TBA",
                                tiket_general: "TBA",
                                tipe: colInfo.toLowerCase().includes('birthday') ? 'special' : 'regular'
                            };
                            schedules.push(currentShow);
                        } else {
                            currentShow = null; 
                        }
                    }
                } 
                else if (currentShow && colInfo.includes('TICKET')) {
                    const cleanInfo = colInfo.replace(/TICKET (OFC|GENERAL)\s*[-–—]\s*/i, '');
                    if (colInfo.includes('OFC')) {
                        currentShow.tiket_ofc = cleanInfo || "Tersedia";
                    } else if (colInfo.includes('GENERAL')) {
                        currentShow.tiket_general = cleanInfo || "Tersedia";
                    }
                }
            });
            return schedules;
        });

        const finalOutput = {
            jadwal_show: dataTheater,
            video_call: manualVC,
            event_jkt48: [],
            galeri_foto: []
        };

        if (fs.existsSync('data.json')) {
            const old = JSON.parse(fs.readFileSync('data.json', 'utf8'));
            finalOutput.galeri_foto = old.galeri_foto || [];
            finalOutput.event_jkt48 = old.event_jkt48 || [];
        }

        fs.writeFileSync('data.json', JSON.stringify(finalOutput, null, 2));
        console.log('Berhasil! Nama show telah dibersihkan dan data diperbarui.');

    } catch (error) {
        console.error('Scraping gagal:', error);
    } finally {
        await browser.close();
    }
}

scrapeJadwal();