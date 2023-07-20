(async () => {
  try {
    // Function untuk mengambil file csv dan konversi ke bentuk array agar bisa diolah
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

    // Function untuk membuat table frekuensi dalam bentuk array object, dan menyisipkannya ke table html
    const makeTableFrekuensi = async (tableName) => {
      const data = await convertCSVToArray(tableName + '.csv');
      const n = data.length;
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

      allTabelInObjArray.filter((e) => e.isData)[0].simpanganBaku = Math.sqrt(allTabelInObjArray.filter((e) => e.isData)[0].sumFiCmMinMyuPower2 / n);

      Array.from(tableElement[0].getElementsByClassName('ficm')).forEach((e, i) => {
        let node = '';
        node += `<td>${allTabelInObjArray[i].cmMinMyu.toFixed(4)}</td>`;
        node += `<td>${allTabelInObjArray[i].cmMinMyuPower2.toFixed(4)}</td>`;
        node += `<td>${allTabelInObjArray[i].fiCmMinMyuPower2.toFixed(4)}</td>`;

        e.parentNode.innerHTML += node;
      });

      tableElement[0].getElementsByClassName('sumFiCmMinMyuPower2')[0].innerText = allTabelInObjArray.filter((e) => e.isData)[0].sumFiCmMinMyuPower2;
      tableElement[0].getElementsByClassName('simpanganBaku')[0].innerText = allTabelInObjArray.filter((e) => e.isData)[0].simpanganBaku.toFixed(4);

      return allTabelInObjArray;
    };

    const tableFrekuensiAntarKedatanganObj = await makeTableFrekuensi('dataAntarKedatangan');
    const tableFrekuensiLamaPelangganObj = await makeTableFrekuensi('dataLamaPelanggan');

    // Function membuat bilagan acak LCG
    const makeBilanganAcakLCG = (n, nilaiAwal, modulus, pengali, inkremen, myu, simpanganBaku) => {
      const resultLCG = [];
      let kumulatif = 0;

      for (let i = 0; i < n; i++) {
        const Zi = (pengali * nilaiAwal + inkremen) % modulus;
        const Ui = Zi / modulus;
        const Ui1 = ((pengali * Zi + inkremen) % modulus) / modulus;
        const Z = Math.pow(-2 * Math.log(Ui), 0.5) * Math.cos(2 * Math.PI * Ui1 * (Math.PI / 180));
        const hasil = myu + simpanganBaku * Z;

        if (i !== 0) kumulatif += hasil;

        const resultI = {
          i: i + 1,
          bilAcak: Number(Ui),
          Ui1,
          Z,
          hasil,
          kumulatif: kumulatif,
        };

        resultLCG.push(resultI);
        nilaiAwal = Zi;
      }

      return resultLCG;
    };

    // Function untuk membuat bilagan acak MRNG
    const makeBilanganAcakMRNG = (n, nilaiAwal, modulus, pengali, myu, simpanganBaku) => {
      const resultMRNG = [];

      for (let i = 0; i < n; i++) {
        const Zi = (pengali * nilaiAwal) % modulus;
        const Ui = Zi / modulus;
        const Ui1 = ((pengali * Zi) % modulus) / modulus;
        const Z = Math.pow(-2 * Math.log(Ui), 0.5) * Math.cos(2 * Math.PI * Ui1 * (Math.PI / 180));
        const hasil = Number(myu) + simpanganBaku * Z;
        console.log(myu, simpanganBaku);

        const resultI = {
          i: i + 1,
          bilAcak: Number(Ui),
          Ui1,
          Z,
          hasil,
        };

        resultMRNG.push(resultI);
        nilaiAwal = Zi;
      }

      return resultMRNG;
    };

    const dataFrekuensiAntarKedatangan = tableFrekuensiAntarKedatanganObj.find((e) => e.isData);
    const bilanganAcakLCGAntarKedatangan = makeBilanganAcakLCG(
      25, // total simulasi
      1104015, // nilai awal
      1537, // modulus
      13, // pengali
      79, // inkremen
      dataFrekuensiAntarKedatangan.myu,
      dataFrekuensiAntarKedatangan.simpanganBaku
    );

    const dataFrekuensiLamaPelanggan = tableFrekuensiLamaPelangganObj.find((e) => e.isData);
    const bilanganAcakMRNGLamaPelanggan = makeBilanganAcakMRNG(
      25, // total simulasi
      1104015, // nilai awal
      1537, // modulus
      13, // pengali
      dataFrekuensiLamaPelanggan.myu,
      dataFrekuensiLamaPelanggan.simpanganBaku
    );

    const elementTabelLCGAntarKedatangan = document.querySelector('.tabelLCG');
    const elementTabelMRNGLamaPelanggan = document.querySelector('.tabelMRNG');

    // Insert bilangan acak LCG ke table html
    bilanganAcakLCGAntarKedatangan.forEach((e) => {
      elementTabelLCGAntarKedatangan.innerHTML += `
      <tr>
      <td>${e.i}</td>
      <td>${e.bilAcak.toFixed(4)}</td>
      <td>${e.hasil.toFixed(0)}</td>
      </tr>`;
    });

    // Insert bilangan acak MRNG ke table html
    bilanganAcakMRNGLamaPelanggan.forEach((e) => {
      elementTabelMRNGLamaPelanggan.innerHTML += `
      <tr>
      <td>${e.i}</td>
      <td>${e.bilAcak.toFixed(4)}</td>
      <td>${e.hasil.toFixed(0)}</td>
      </tr>`;
    });

    // Function untuk menghitung antrian pelanggan ke mesin
    const queue = [];
    const getQueue = (lamaMenukar, waktuSelesai, i) => {
      if (queue.length < 4) {
        queue.push({ lamaMenukar, waktuSelesai, i, G: waktuSelesai });
        return queue.length;
      } else {
        const min = Math.min.apply(
          Math,
          queue.map((e) => e.waktuSelesai)
        );

        const indexMinValue = queue.map((e) => Number(e.waktuSelesai)).indexOf(min);
        queue[indexMinValue] = { lamaMenukar, waktuSelesai, i, G: waktuSelesai, E: Number(queue[indexMinValue].lamaMenukar) };

        return indexMinValue + 1;
      }
    };

    // Memasukkan seluruh perhitungan diatas ke tabel simulasi
    for (let i = 0; i < bilanganAcakLCGAntarKedatangan.length; i++) {
      let node = `
      <tr>
      <td>${i}</td>
      <td>${bilanganAcakLCGAntarKedatangan[i].bilAcak.toFixed(4)}</td>
      <td>${bilanganAcakMRNGLamaPelanggan[i].bilAcak.toFixed(4)}</td>`;

      if (i === 0) {
        node += `
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        </tr>`;

        document.querySelector('#tabelSimulasi').innerHTML += node;
        continue;
      }

      node += `
      <td>${bilanganAcakLCGAntarKedatangan[i].hasil.toFixed(0)}</td>
      <td>${bilanganAcakLCGAntarKedatangan[i].kumulatif.toFixed(0)}</td>
      <td>${bilanganAcakMRNGLamaPelanggan[i].hasil.toFixed(0)}</td>
      <td>60</td>
      <td>${(bilanganAcakLCGAntarKedatangan[i].kumulatif + bilanganAcakMRNGLamaPelanggan[i].hasil + 60).toFixed(0)}</td>
      <td>${getQueue(
        Number(bilanganAcakMRNGLamaPelanggan[i].hasil.toFixed(0)),
        Number(bilanganAcakLCGAntarKedatangan[i].kumulatif + bilanganAcakMRNGLamaPelanggan[i].hasil + 60).toFixed(0),
        i
      )}</td> 
      <td>${(() => {
        const q = queue.find((e) => e.i === i);
        if (q.G > q.E) return q.G - q.E;
        return 0;
      })()}</td>
      <td>${(() => {
        const q = queue.find((e) => e.i === i);
        if (q.E > q.G) return q.E - q.G;
        return 0;
      })()}</td>
      </tr>`;

      document.querySelector('#tabelSimulasi').innerHTML += node;
    }
  } catch (err) {
    console.log(err);
  }
})();
