const convertCSVToArray = async (filename) => {
  return new Promise((resolve, reject) => {
    fetch(filename)
      .then((response) => response.text())
      .then((data) => {
        const rows = data.split('\n');
        // const dataArray = [];

        // rows.forEach((row) => {
        //   const columns = row.split(';');
        //   dataArray.push(columns);
        // });

        // console.log(dataArray);
        // console.log(rows);
        resolve(rows[0].split(';'));
      })
      .catch((error) => {
        console.log(error);
        reject();
      });
  });
};

const dataAntarKedatangan = convertCSVToArray('dataAntarKedatangan.csv');
const dataLamaPelanggan = convertCSVToArray('dataLamaPelanggan.csv');

const makeTableFrekuensi = async (tableName) => {
  const data = await convertCSVToArray(tableName + '.csv');
  // console.log(data);
  const n = data.length;
  console.log(n);
  const K = Math.round(1 + 3.3 * Math.log10(n));
  const max = Math.max(...data);
  const min = Math.min(...data);
  const R = max - min + 1;
  const C = Math.round(R / K);

  const tableElement = document.getElementsByClassName(tableName);

  let lastMin = min;
  let frekuensiKumulatif = 0;

  for (let i = 1; i <= K; i++) {
    const minRange = lastMin;
    // const maxRange = lastMin + C - 1;
    const maxRange = lastMin + C;
    // console.log(C);
    // console.log(
    //   data
    //     .filter((e) => e >= minRange && e <= maxRange)
    //     .sort()
    //     .reverse()
    // );
    const frekuensi = data.filter((e) => e >= minRange && e <= maxRange).length;

    const lcl = minRange;
    const ucl = maxRange;
    const cm = 0.5 * (lcl + ucl);
    const ficm = frekuensi * cm;
    // prettier-ignore
    tableElement[0].innerHTML +=
    `<tr>
      <td>${i}</td>
      <td>${minRange}</td>
      <td>-</td>
      <td>${maxRange}</td>
      <td>${frekuensi}</td>
      <td>${frekuensiKumulatif + frekuensi}</td>
      <td>${lcl}</td>
      <td>${ucl}</td>
      <td>${cm}</td>
      <td class="ficm">${ficm}</td>
    </tr>`;

    frekuensiKumulatif += frekuensi;
    lastMin = maxRange + 1;
  }

  const sumFiCm = Array.from(tableElement[0].getElementsByClassName('ficm'))
    .map((e) => Number(e.innerHTML))
    .reduce((sum, value) => (sum += value), 0);

  // prettier-ignore
  tableElement[0].innerHTML +=
    `<tr>
      <td colspan="4">N</td>
      <td>${frekuensiKumulatif}</td>
      <td colspan="4">∑ fi.CM</td>
      <td>${sumFiCm}</td>
    </tr>
    <tr>
      <td colspan="9">μ</td>
      <td>${sumFiCm / frekuensiKumulatif}</td>
    </tr>`;
};

makeTableFrekuensi('dataAntarKedatangan');
makeTableFrekuensi('dataLamaPelanggan');
