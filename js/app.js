const retenciones = [
  {
   codigo: "301",
    concepto: "Compra de bienes muebles",
    porcentaje: 1.75
  },
  {
    codigo: "303",
    concepto: "Honorarios profesionales personas naturales",
    porcentaje: 10
  },
  {
    codigo: "303A",
    concepto: "Servicios profesionales prestados por sociedades",
    porcentaje: 5
  },
  {
    codigo: "304",
    concepto: "Servicios donde predomina el intelecto",
    porcentaje: 10
  },
  {
    codigo: "307",
    concepto: "Servicios donde predomina la mano de obra",
    porcentaje: 3
  },
  {
    codigo: "308",
    concepto: "Utilización o aprovechamiento de imagen o renombre",
    porcentaje: 10
  },
  {
    codigo: "309",
    concepto: "Publicidad y medios de comunicación",
    porcentaje: 3
  },
  {
    codigo: "310",
    concepto: "Transporte de pasajeros y carga",
    porcentaje: 1
  },
  {
    codigo: "312",
    concepto: "Seguros y reaseguros",
    porcentaje: 1.75
  },
  {
    codigo: "314",
    concepto: "Arrendamiento de bienes inmuebles",
    porcentaje: 8
  },
  {
    codigo: "319",
    concepto: "Comisiones",
    porcentaje: 8
  },
  {
    codigo: "322",
    concepto: "Intereses y rendimientos financieros",
    porcentaje: 2.75
  },
  {
    codigo: "332",
    concepto: "Otros servicios",
    porcentaje: 2.75
  }
];

let ultimoCalculo = null;

function formatoMoneda(valor) {
    return valor.toLocaleString('es-EC', {
        style: 'currency',
        currency: 'USD'
    });
}
function guardarHistorial(registro) {
    let historial =
        JSON.parse(localStorage.getItem("historial")) || [];

    historial.push(registro);

    localStorage.setItem(
        "historial",
        JSON.stringify(historial)
    );

    mostrarHistorial();
}
function mostrarHistorial() {
    const lista =
        document.getElementById("listaHistorial");

    lista.innerHTML = "";

    let historial =
        JSON.parse(localStorage.getItem("historial")) || [];

    historial.forEach(item => {
        const li = document.createElement("li");

        li.textContent =
        `${item.fecha} | ${item.codigo} | ${item.concepto} | Neto: ${formatoMoneda(item.neto)}`;

        lista.appendChild(li);
    });
}
const selectConcepto = document.getElementById("concepto");
const infoRetencion = document.getElementById("infoRetencion");
const buscarConcepto = document.getElementById("buscarConcepto");

const tipoIVA = document.getElementById("tipoIVA");
const campoIVA = document.getElementById("iva");
const campoBase = document.getElementById("base");
function calcularIVA() {
    const base = parseFloat(campoBase.value) || 0;
    const porcentajeIVA = parseFloat(tipoIVA.value) || 0;

    const ivaCalculado = base * (porcentajeIVA / 100);

    campoIVA.value = ivaCalculado.toFixed(2);
}

// Cargar opciones
function cargarRetenciones(lista) {
    selectConcepto.innerHTML = '<option value="">Seleccione...</option>';

    lista.forEach(ret => {
        const option = document.createElement("option");
        option.value = ret.codigo;
        option.textContent = `${ret.codigo} - ${ret.concepto}`;
        selectConcepto.appendChild(option);
    });
}

cargarRetenciones(retenciones);
campoBase.addEventListener("input", calcularIVA);
tipoIVA.addEventListener("change", calcularIVA);

buscarConcepto.addEventListener("input", () => {
    const texto = buscarConcepto.value.toLowerCase();

    const filtradas = retenciones.filter(ret =>
        ret.concepto.toLowerCase().includes(texto) ||
        ret.codigo.toLowerCase().includes(texto)
    );

    cargarRetenciones(filtradas);
});

// Mostrar código y porcentaje
selectConcepto.addEventListener("change", () => {
  const seleccion = retenciones.find(
    r => r.codigo === selectConcepto.value
  );

  if (seleccion) {
    infoRetencion.innerHTML = `
      Código: ${seleccion.codigo}<br>
      Porcentaje: ${seleccion.porcentaje}%
    `;
  }
});
document
  .getElementById("btnCalcular")
  .addEventListener("click", () => {

    const base =
      parseFloat(document.getElementById("base").value) || 0;

    const iva =
      parseFloat(document.getElementById("iva").value) || 0;

    const ivaRet =
      parseFloat(document.getElementById("retIva").value) || 0;

    const seleccion = retenciones.find(
      r => r.codigo === selectConcepto.value
    );

    if (!seleccion) {
      alert("Seleccione un concepto");
      return;
    }

    const retencionIR =
      base * (seleccion.porcentaje / 100);

    const retencionIVA =
      iva * (ivaRet / 100);

    const totalFactura =
      base + iva;

    const valorNeto =
      totalFactura - retencionIR - retencionIVA;

  ultimoCalculo = {
    fecha: new Date().toLocaleString(),
    codigo: seleccion.codigo,
    concepto: seleccion.concepto,
    porcentaje: seleccion.porcentaje,
    base: base,
    iva: iva,
    retencionIR: retencionIR,
    retencionIVA: retencionIVA,
    neto: valorNeto
};      
  document.getElementById("retIR").textContent =
    formatoMoneda(retencionIR);

  document.getElementById("retIVA").textContent =
    formatoMoneda(retencionIVA);

  document.getElementById("valorNeto").textContent =
    formatoMoneda(valorNeto);
  guardarHistorial({
    fecha: new Date().toLocaleString(),
    codigo: seleccion.codigo,
    concepto: seleccion.concepto,
    neto: valorNeto
});

});
document.getElementById("btnLimpiar").addEventListener("click", () => {

    document.getElementById("base").value = "";
    campoIVA.value = "";
    tipoIVA.value = "15";
    document.getElementById("buscarConcepto").value = "";

    selectConcepto.value = "";

    infoRetencion.innerHTML = `
        Código: - <br>
        Porcentaje: -
    `;

    document.getElementById("retIR").textContent = formatoMoneda(0);
    document.getElementById("retIVA").textContent = formatoMoneda(0);
    document.getElementById("valorNeto").textContent = formatoMoneda(0);

    cargarRetenciones(retenciones);
mostrarHistorial();

});
document
.getElementById("btnEliminarHistorial")
.addEventListener("click", () => {

    localStorage.removeItem("historial");

    mostrarHistorial();

});
document.getElementById("btnPDF").addEventListener("click", () => {

    if (!ultimoCalculo) {
        alert("Primero realiza un cálculo.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("CONTADOR EC", 20, 20);

    doc.setFontSize(12);
    doc.text(`Fecha: ${ultimoCalculo.fecha}`, 20, 35);
    doc.text(`Código: ${ultimoCalculo.codigo}`, 20, 45);
    doc.text(`Concepto: ${ultimoCalculo.concepto}`, 20, 55);
    doc.text(`Porcentaje: ${ultimoCalculo.porcentaje}%`, 20, 65);
    doc.text(`Base Imponible: ${formatoMoneda(ultimoCalculo.base)}`, 20, 75);
    doc.text(`IVA: ${formatoMoneda(ultimoCalculo.iva)}`, 20, 85);
    doc.text(`Retención IR: ${formatoMoneda(ultimoCalculo.retencionIR)}`, 20, 95);
    doc.text(`Retención IVA: ${formatoMoneda(ultimoCalculo.retencionIVA)}`, 20, 105);
    doc.text(`Valor Neto: ${formatoMoneda(ultimoCalculo.neto)}`, 20, 115);

    doc.save("retencion.pdf");

});
document.getElementById("btnWhatsApp").addEventListener("click", () => {

    if (!ultimoCalculo) {
        alert("Primero realiza un cálculo.");
        return;
    }

    const mensaje = `
*CONTADOR EC*
Resumen de Retención

Fecha: ${ultimoCalculo.fecha}

Código: ${ultimoCalculo.codigo}
Concepto: ${ultimoCalculo.concepto}
Porcentaje: ${ultimoCalculo.porcentaje}%

Base: ${formatoMoneda(ultimoCalculo.base)}
IVA: ${formatoMoneda(ultimoCalculo.iva)}

Retención IR: ${formatoMoneda(ultimoCalculo.retencionIR)}
Retención IVA: ${formatoMoneda(ultimoCalculo.retencionIVA)}

Valor Neto: ${formatoMoneda(ultimoCalculo.neto)}
    `;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");

});