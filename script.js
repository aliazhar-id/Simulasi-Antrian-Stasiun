const dataAntarKedatangan = [
  258, 121, 225, 169, 295, 135, 142, 73, 220, 243, 238, 227, 257, 251, 101, 286, 112, 288, 104, 236, 174, 247, 168, 290, 95, 192, 272, 271, 100, 288,
  281, 292, 219, 195, 201, 283, 135, 262, 119, 280, 163, 156, 203, 264, 152, 134, 275, 172, 182, 220, 280, 156,
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

  for (let i = 1; i < K; i++) {
    const minRange = lastMin;
    const maxRange = lastMin + C;
    const frekuensi = data.filter((e) => e > minRange && e < maxRange).length;

    // prettier-ignore
    tableElement[0].innerHTML += 
    `<tr>
      <td>${i}</td>
      <td>${minRange}</td>
      <td>-</td>
      <td>${maxRange}</td>
      <td>${frekuensi}</td>
    </tr>`;

    lastMin = lastMin + C + 1;
  }
};

makeTableFrekuensi(dataAntarKedatangan, 'dataAntarKedatangan');
