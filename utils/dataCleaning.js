/**Função para remover os campos null e undefinde do objeto */
const dataCleaning = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object') dataCleaning(obj[key]);
    else if (obj[key] === undefined) delete obj[key];
  });
  return obj;
};

module.exports = dataCleaning;
