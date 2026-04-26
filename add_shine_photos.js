const { initDB, run, get, saveDB } = require('./server/db/init');

async function addPhotos() {
  await initDB();
  
  const photos = [
    { file: 'shine_2026-04-26_1.jpg', title: '精彩瞬间 1', desc: '记录美好时刻' },
    { file: 'shine_2026-04-26_2.jpg', title: '精彩瞬间 2', desc: '记录美好时刻' },
    { file: 'shine_2026-04-26_3.jpg', title: '精彩瞬间 3', desc: '记录美好时刻' },
    { file: 'shine_2026-04-26_4.jpg', title: '精彩瞬间 4', desc: '记录美好时刻' },
    { file: 'shine_2026-04-26_5.jpg', title: '精彩瞬间 5', desc: '记录美好时刻' },
    { file: 'shine_2026-04-26_6.jpg', title: '精彩瞬间 6', desc: '记录美好时刻' },
    { file: 'shine_2026-04-26_7.jpg', title: '精彩瞬间 7', desc: '记录美好时刻' },
    { file: 'shine_2026-04-26_8.jpg', title: '精彩瞬间 8', desc: '记录美好时刻' }
  ];
  
  const date = '2026-04-26';
  
  for (const photo of photos) {
    const result = run(
      'INSERT INTO shines (title, type, icon, description, date, photo) VALUES (?, ?, ?, ?, ?, ?)',
      [photo.title, '📸 照片', '📸', photo.desc, date, photo.file]
    );
    console.log(`Added: ${photo.title} (ID: ${result.lastInsertRowid})`);
  }
  
  saveDB();
  console.log('Database saved!');
}

addPhotos().catch(console.error);
