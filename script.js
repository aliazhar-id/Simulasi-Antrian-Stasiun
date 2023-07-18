const dataAntarKedatangan = [
  186, 68, 36, 207, 98, 122, 203, 140, 131, 245, 76, 112, 171, 97, 276, 131, 229, 223, 249, 177, 29, 50, 192, 203, 92, 179, 141, 236, 202, 39, 40, 87,
  194, 249, 262, 257, 110, 18, 115, 200, 136, 128, 238, 66, 86, 128, 187, 146, 44, 80, 278, 56, 70, 120, 143, 269, 103, 233, 73, 229, 46, 234, 223,
  136, 34, 251, 240, 253, 251, 107, 15, 112, 190, 127, 48, 230, 27, 191, 127, 245, 201, 131, 167, 104, 150, 164, 213, 37, 93, 190, 20, 180, 26, 159,
  125, 180, 127, 25, 148, 220, 250, 231, 98, 253, 32, 40, 252, 121, 192, 154, 246, 215, 122, 100, 31, 261, 268, 43, 57, 107, 184, 164, 229, 166, 138,
  264, 79, 115, 177, 123, 21, 141, 210, 170, 222, 165, 168, 243, 35, 113, 262, 86, 242, 145, 44, 215, 191, 102, 154, 75,
];

const makeTableFrekuensi = (data, tableName) => {
  const n = data.length;
  const K = Math.round(1 + 3.3 * Math.log10(n));

  const max = Math.max(...dataAntarKedatangan);
  const min = Math.min(...dataAntarKedatangan);

  const R = max - min + 1;
  const C = Math.round(R / K);

  const tableElement = document.getElementsByClassName(tableName);

  let lastMin = min;

  for (let i = 1; i <= K; i++) {
    const minRange = lastMin;
    const maxRange = lastMin + C - 1;
    const frekuensi = data.filter((e) => e >= minRange && e <= maxRange).length;

    // prettier-ignore
    tableElement[0].innerHTML += 
    `<tr>
      <td>${i}</td>
      <td>${minRange}</td>
      <td>-</td>
      <td>${maxRange}</td>
      <td>${frekuensi}</td>
    </tr>`;

    lastMin = maxRange + 1;
  }
};

makeTableFrekuensi(dataAntarKedatangan, 'dataAntarKedatangan');
