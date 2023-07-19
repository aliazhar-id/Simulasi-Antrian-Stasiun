const convertCSVToArray = async (filename) => {
  return new Promise((resolve, reject) => {
    fetch(filename)
      .then((response) => response.text())
      .then((data) => {
        const rows = data.split('\n');
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

  const allTabelInObjArray = [];

  for (let i = 1; i <= K; i++) {
    const tabelInObj = {
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
      ficm: data.filter((e) => e >= lastMin && e <= lastMin + C).length * (0.5 * (lastMin + lastMin + C)),
    };

    allTabelInObjArray.push(tabelInObj);

    // console.table(tabelInObj);

    // prettier-ignore
    tableElement[0].innerHTML +=
    `<tr>
      <td>${tabelInObj.no}</td>
      <td>${tabelInObj.kelasInterval.min}</td>
      <td>-</td>
      <td>${tabelInObj.kelasInterval.max}</td>
      <td>${tabelInObj.frekuensi}</td>
      <td>${tabelInObj.frekuensiKumulatif}</td>
      <td>${tabelInObj.lcl}</td>
      <td>${tabelInObj.ucl}</td>
      <td>${tabelInObj.cm}</td>
      <td class="ficm">${tabelInObj.ficm}</td>
    </tr>`;

    frekuensiKumulatif += tabelInObj.frekuensi;
    lastMin = tabelInObj.kelasInterval.max + 1;
  }

  const sumFiCm = Array.from(tableElement[0].getElementsByClassName('ficm'))
    .map((e) => Number(e.innerHTML))
    .reduce((sum, value) => (sum += value), 0);

  const myu = sumFiCm / n;

  allTabelInObjArray.push({ isData: true, sumFiCm, myu });

  // prettier-ignore
  tableElement[0].innerHTML +=
    `<tr>
      <td colspan="4">N</td>
      <td>${n}</td>
      <td colspan="4">∑ fi.CM</td>
      <td>${sumFiCm}</td>
      <td colspan="2">∑ Fi . (CM - μ)^2</td>
      <td class="sumFiCmMinMyuPower2"></td>
    </tr>
    <tr>
      <td colspan="9">μ</td>
      <td>${myu}</td>
      <td colspan="2">σ</td>
      <td class="simpanganBaku"></td>
    </tr>`;

  allTabelInObjArray.filter((e) => e.no).forEach((e) => (e.cmMinMyu = e.cm - allTabelInObjArray.find((e) => e.myu).myu));
  allTabelInObjArray.filter((e) => e.no).forEach((e) => (e.cmMinMyuPower2 = Math.pow(e.cmMinMyu, 2)));
  allTabelInObjArray.filter((e) => e.no).forEach((e) => (e.fiCmMinMyuPower2 = e.frekuensi * e.cmMinMyuPower2));
  allTabelInObjArray
    .filter((e) => e.isData)
    .forEach(
      (e) =>
        (e.sumFiCmMinMyuPower2 = allTabelInObjArray
          .filter((e) => e.no)
          .map((e) => e.fiCmMinMyuPower2)
          .reduce((sum, value) => (sum += value), 0))
    );

  allTabelInObjArray.filter((e) => e.isData)[0].simpanganBaku = allTabelInObjArray.filter((e) => e.isData)[0].sumFiCmMinMyuPower2 / n;

  Array.from(tableElement[0].getElementsByClassName('ficm')).forEach((e, i) => {
    let node = '';
    node += `<td>${allTabelInObjArray[i].cmMinMyu.toFixed(4)}</td>`;
    node += `<td>${allTabelInObjArray[i].cmMinMyuPower2.toFixed(4)}</td>`;
    node += `<td>${allTabelInObjArray[i].fiCmMinMyuPower2.toFixed(4)}</td>`;

    e.parentNode.innerHTML += node;
  });

  tableElement[0].getElementsByClassName('sumFiCmMinMyuPower2')[0].innerText = allTabelInObjArray.filter((e) => e.isData)[0].sumFiCmMinMyuPower2;
  tableElement[0].getElementsByClassName('simpanganBaku')[0].innerText = allTabelInObjArray.filter((e) => e.isData)[0].simpanganBaku.toFixed(4);
};

makeTableFrekuensi('dataAntarKedatangan');
makeTableFrekuensi('dataLamaPelanggan');
