const { initDB, run, saveDB } = require('./server/db/init');

async function updateDescriptions() {
  await initDB();
  
  // 更新所有今天添加的照片描述
  const updates = [
    { file: 'shine_2026-04-26_1.jpg', title: '童年时光', desc: '吴尚融小时候的美好回忆' },
    { file: 'shine_2026-04-26_2.jpg', title: '童年时光', desc: '吴尚融小时候的美好回忆' },
    { file: 'shine_2026-04-26_3.jpg', title: '童年时光', desc: '吴尚融小时候的美好回忆' },
    { file: 'shine_2026-04-26_4.jpg', title: '童年时光', desc: '吴尚融小时候的美好回忆' },
    { file: 'shine_2026-04-26_5.jpg', title: '童年时光', desc: '吴尚融小时候的美好回忆' },
    { file: 'shine_2026-04-26_6.jpg', title: '童年时光', desc: '吴尚融小时候的美好回忆' },
    { file: 'shine_2026-04-26_7.jpg', title: '童年时光', desc: '吴尚融小时候的美好回忆' },
    { file: 'shine_2026-04-26_8.jpg', title: '童年时光', desc: '吴尚融小时候的美好回忆' }
  ];
  
  for (const update of updates) {
    run(
      'UPDATE shines SET title = ?, description = ? WHERE photo = ?',
      [update.title, update.desc, update.file]
    );
    console.log(`Updated: ${update.file}`);
  }
  
  saveDB();
  console.log('All descriptions updated!');
}

updateDescriptions().catch(console.error);
