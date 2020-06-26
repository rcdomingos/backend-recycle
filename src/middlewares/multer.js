const multer = require('multer');
const path = require('path');

const getExtension = (arquivo) => {
  return arquivo.slice(arquivo.lastIndexOf('.'));
};

module.exports = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', '..', 'uploads', 'images'));
    },
    filename: (req, file, cb) => {
      // file.key = `${Date.now().toString()}-${file.originalname}`;
      file.key = req.params.id + getExtension(file.originalname);

      cb(null, file.key);
    },
  }),
};
