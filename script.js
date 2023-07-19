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
    const tabelInJson = {
      no: i,
      kelasInterval: {
        min: lastMin,
        max: lastMin + C,
      },
      frekuensi: data.filter((e) => e >= lastMin && e <= lastMin + C).length,
      frekuensiKumulatif: frekuensiKumulatif + data.filter((e) => e >= lastMin && e <= lastMin + C).length,
      lcl: lastMin,
      ucl: lastMin + C,
      cm: 0.5 * (lastMin + lastMin + C),
      ficm: (data.filter((e) => e >= lastMin && e <= lastMin + C).length) * (0.5 * (lastMin + lastMin + C)),
    };

    console.table(tabelInJson);

    // const minRange = lastMin;
    // const maxRange = lastMin + C - 1;
    // const maxRange = lastMin + C;
    // console.log(C);
    // console.log(
    //   data
    //     .filter((e) => e >= minRange && e <= maxRange)
    //     .sort()
    //     .reverse()
    // );


    // const frekuensi = data.filter((e) => e >= minRange && e <= maxRange).length;

    // const lcl = minRange;
    // const ucl = maxRange;
    // const cm = 0.5 * (lcl + ucl);
    // const ficm = frekuensi * cm;

    
    // prettier-ignore
    tableElement[0].innerHTML +=
    `<tr>
      <td>${tabelInJson.no}</td>
      <td>${tabelInJson.kelasInterval.min}</td>
      <td>-</td>
      <td>${tabelInJson.kelasInterval.max}</td>
      <td>${tabelInJson.frekuensi}</td>
      <td>${tabelInJson.frekuensiKumulatif}</td>
      <td>${tabelInJson.lcl}</td>
      <td>${tabelInJson.ucl}</td>
      <td>${tabelInJson.cm}</td>
      <td class="ficm">${tabelInJson.ficm}</td>
    </tr>`;

    frekuensiKumulatif += tabelInJson.frekuensi;
    lastMin = tabelInJson.kelasInterval.max + 1;
  }

  const sumFiCm = Array.from(tableElement[0].getElementsByClassName('ficm'))
    .map((e) => Number(e.innerHTML))
    .reduce((sum, value) => (sum += value), 0);

  // prettier-ignore
  tableElement[0].innerHTML +=
    `<tr>
      <td colspan="4">N</td>
      <td>${n}</td>
      <td colspan="4">∑ fi.CM</td>
      <td>${sumFiCm}</td>
    </tr>
    <tr>
      <td colspan="9">μ</td>
      <td>${sumFiCm / n}</td>
    </tr>`;
};

makeTableFrekuensi('dataAntarKedatangan');
makeTableFrekuensi('dataLamaPelanggan');
