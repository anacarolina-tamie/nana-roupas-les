export function gerarCPF() {
  const r = (n) => Math.floor(Math.random() * n);
  const f = (n, m) => Math.floor(n % m);

  const n1 = r(10);
  const n2 = r(10);
  const n3 = r(10);
  const n4 = r(10);
  const n5 = r(10);
  const n6 = r(10);
  const n7 = r(10);
  const n8 = r(10);
  const n9 = r(10);

  // Cálculo do primeiro dígito verificador
  let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
  d1 = 11 - f(d1, 11);
  if (d1 >= 10) d1 = 0;

  // Cálculo do segundo dígito verificador
  let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
  d2 = 11 - f(d2, 11);
  if (d2 >= 10) d2 = 0;

  // Retorna apenas os números (11 dígitos)
  return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
}