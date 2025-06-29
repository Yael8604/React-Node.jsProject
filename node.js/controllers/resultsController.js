const path = require('path');
const fs = require('fs');

const getResults = (req, res) => {

  const filePath = path.join(__dirname, '../mockResults.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('שגיאה בקריאת קובץ JSON:', err);
      return res.status(500).json({ error: 'שגיאה בטעינת הנתונים' });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error('שגיאת ניתוח JSON:', parseError);
      res.status(500).json({ error: 'שגיאה בפענוח הנתונים' });
    }
  });
};

module.exports = { getResults  };
