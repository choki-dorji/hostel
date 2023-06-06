const { exec } = require('child_process');
const cron = require('node-cron')
const path = require('path')

function backupData() {
    const backupDir = path.join(__dirname, "backup"); // Specify the directory where the backup will be saved
    const command = `mongodump --out ${backupDir}`;
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup failed: ${error}`);
      } else {
        console.log(`Backup successful!`);
      }
    });
}

const startSchedule = () => {
    cron.schedule('30 18 * * *',() => {
        backupData();
    }, {})
}
module.exports={
    startSchedule
}