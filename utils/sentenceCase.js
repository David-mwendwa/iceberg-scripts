const sentenceCase = (input) => {
  input = input === undefined ? null : input;
  return (
    input && input.toString().toLowerCase().replace(/(^|[.?!] *)([a-z])/g,
        (match, separator, char) => separator + char.toUpperCase()
      )
  );
};

let string = 'POR EL MEDIO DEL CUAL SE MODIFICA? EL PRESUPUESTO DE! INGRESOS Y GASTOS? DEL MUNICIPIO DE YOPAL. PARA LA VIGENCIA FISCAL COMPRENDIDA ENTRE01 DE ENERO Y AL 31 DE DICIEMBRE DE 2021.';
console.log(sentenceCase(string));
