const slugify = (str) => {
  str = str === undefined ? null : str.toLowerCase();
  str = str.replace(/\s+d?e\s+/g, '-').replace(/\s+\(/g, '-').replace(/\s+/g, '-').replace(/[\(\)]/g, '');
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

console.log(slugify('Veículos aéreos não tripulados (Drones)'))
console.log(slugify('Proteção de Género e Intelectual'));