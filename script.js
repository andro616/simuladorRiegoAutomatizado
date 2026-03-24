/*/ Estado del simulador
const estado = {
    humedad: 50,
    temperatura: 25,
    lluvia: 30,
    riegoActivo: false,
    tiempo: 0,
    humidadUmbral: 30,
    humidadObjetivo: 70,
    intensidadRiego: 5,
    velocidadEvaporacion: 0.5,
    fuenteDatos: 'manual',
    contadorHistorico: 0,
    historico: []
};

// Elementos del DOM
const elementos = {
    humiditySlider: document.getElementById('humiditySlider'),
    temperatureSlider: document.getElementById('temperatureSlider'),
    rainSlider: document.getElementById('rainSlider'),
    humidityLabel: document.getElementById('humidityLabel'),
    temperatureLabel: document.getElementById('temperatureLabel'),
    rainLabel: document.getElementById('rainLabel'),
    humidityMeter: document.getElementById('humidityMeter'),
    temperatureMeter: document.getElementById('temperatureMeter'),
    rainMeter: document.getElementById('rainMeter'),
    humidityValue: document.getElementById('humidityValue'),
    temperatureValue: document.getElementById('temperatureValue'),
    rainValue: document.getElementById('rainValue'),
    irrigationStatus: document.getElementById('irrigationStatus'),
    irrigationStatusText: document.getElementById('irrigationStatusText'),
    humidityStatus: document.getElementById('humidityStatus'),
    humidityStatusText: document.getElementById('humidityStatusText'),
    rainStatus: document.getElementById('rainStatus'),
    rainStatusText: document.getElementById('rainStatusText'),
    humidityThreshold: document.getElementById('humidityThreshold'),
    humidityTarget: document.getElementById('humidityTarget'),
    riegoIntensity: document.getElementById('riegoIntensity'),
    intensityValue: document.getElementById('intensityValue'),
    resetButton: document.getElementById('resetButton'),
    historyTableBody: document.querySelector('#historyTable tbody'),
    dataSourceRadios: document.querySelectorAll('input[name="dataSource"]')
};

// Inicializar eventos
function inicializar() {
    elementos.humiditySlider.addEventListener('input', handleHumidityChange);
    elementos.temperatureSlider.addEventListener('input', handleTemperatureChange);
    elementos.rainSlider.addEventListener('input', handleRainChange);
    elementos.humidityThreshold.addEventListener('change', handleUmbralChange);
    elementos.humidityTarget.addEventListener('change', handleObjetivoChange);
    elementos.riegoIntensity.addEventListener('input', handleIntensidadChange);
    elementos.resetButton.addEventListener('click', reiniciarSimulador);
    elementos.dataSourceRadios.forEach(radio => radio.addEventListener('change', handleDataSourceChange));

    // Iniciar el bucle de simulación
    intervalo = setInterval(actualizarSimulacion, 500);
    actualizarUI();
    registrarLectura('Sistema', 'Inicio');
}

// Manejadores de eventos
function handleHumidityChange(event) {
    if (estado.fuenteDatos === 'manual') {
        estado.humedad = parseInt(event.target.value);
        elementos.humidityLabel.textContent = estado.humedad + '%';
        actualizarUI();
    }
}

function handleTemperatureChange(event) {
    if (estado.fuenteDatos === 'manual') {
        estado.temperatura = parseInt(event.target.value);
        elementos.temperatureLabel.textContent = estado.temperatura + '°C';
        actualizarUI();
    }
}

function handleRainChange(event) {
    if (estado.fuenteDatos === 'manual') {
        estado.lluvia = parseInt(event.target.value);
        elementos.rainLabel.textContent = estado.lluvia + '%';
        actualizarUI();
    }
}

function handleUmbralChange(event) {
    estado.humidadUmbral = parseInt(event.target.value);
    actualizarUI();
}

function handleObjetivoChange(event) {
    estado.humidadObjetivo = parseInt(event.target.value);
    actualizarUI();
}

function handleIntensidadChange(event) {
    estado.intensidadRiego = parseInt(event.target.value);
    elementos.intensityValue.textContent = estado.intensidadRiego;
}

function handleDataSourceChange(event) {
    estado.fuenteDatos = event.target.value;
    if (estado.fuenteDatos === 'online') {
        elementos.humiditySlider.disabled = true;
        elementos.temperatureSlider.disabled = true;
        elementos.rainSlider.disabled = true;
    } else {
        elementos.humiditySlider.disabled = false;
        elementos.temperatureSlider.disabled = false;
        elementos.rainSlider.disabled = false;
    }
}

// Lógica de simulación
function actualizarSimulacion() {
    estado.tiempo++;
    if (estado.fuenteDatos === 'online') {
        estado.humedad = Math.max(0, Math.min(100, estado.humedad + (Math.random() * 2 - 1)));
        estado.temperatura = Math.max(0, Math.min(50, estado.temperatura + (Math.random() * 1.2 - 0.6)));
        estado.lluvia = Math.max(0, Math.min(100, estado.lluvia + (Math.random() * 3 - 1.5)));
    }

    const evaporacion = (estado.temperatura / 25) * (estado.velocidadEvaporacion / 10);
    estado.humedad = Math.max(0, estado.humedad - evaporacion);

    if (estado.humedad <= estado.humidadUmbral && !estado.riegoActivo) {
        estado.riegoActivo = true;
    }

    if (estado.riegoActivo) {
        const riegoRate = estado.intensidadRiego * 0.5;
        estado.humedad = Math.min(100, estado.humedad + riegoRate);
        if (estado.humedad >= estado.humidadObjetivo) {
            estado.riegoActivo = false;
        }
    }

    estado.humedad = Math.max(0, Math.min(100, estado.humedad));
    estado.temperatura = Math.max(0, Math.min(50, estado.temperatura));

    actualizarUI();
    registrarLectura('auto', 'Actualización');
}

// Actualizar interfaz
function actualizarUI() {
    elementos.humidityMeter.style.width = estado.humedad + '%';
    elementos.temperatureMeter.style.width = (estado.temperatura / 50) * 100 + '%';
    elementos.rainMeter.style.width = estado.lluvia + '%';

    elementos.humidityValue.textContent = Math.round(estado.humedad) + '%';
    elementos.temperatureValue.textContent = estado.temperatura + '°C';
    elementos.rainValue.textContent = Math.round(estado.lluvia) + '%';

    if (document.activeElement !== elementos.humiditySlider && estado.fuenteDatos === 'manual') {
        elementos.humiditySlider.value = Math.round(estado.humedad);
    }
    if (document.activeElement !== elementos.temperatureSlider && estado.fuenteDatos === 'manual') {
        elementos.temperatureSlider.value = estado.temperatura;
    }
    if (document.activeElement !== elementos.rainSlider && estado.fuenteDatos === 'manual') {
        elementos.rainSlider.value = Math.round(estado.lluvia);
    }

    actualizarEstadoRiego();
    actualizarEstatusHumedad();
    actualizarEstatusLluvia();
}

function actualizarEstadoRiego() {
    const statusText = elementos.irrigationStatusText;
    const statusIndicator = elementos.irrigationStatus.querySelector('.icon');
    if (estado.riegoActivo) {
        statusText.textContent = '💧 Activo';
        statusText.className = 'riego-activo';
        statusIndicator.textContent = '🔴';
    } else {
        statusText.textContent = 'Apagado';
        statusText.className = '';
        statusIndicator.textContent = '⚪';
    }
}

function actualizarEstatusHumedad() {
    const statusText = elementos.humidityStatusText;
    const statusContainer = elementos.humidityStatus.querySelector('.icon');
    let nivel = '';

    if (estado.humedad <= 20) {
        nivel = 'Crítica';
        statusText.className = 'critica';
        statusContainer.textContent = '🔴';
    } else if (estado.humedad <= estado.humidadUmbral) {
        nivel = 'Baja';
        statusText.className = 'baja';
        statusContainer.textContent = '🟠';
    } else if (estado.humedad >= 80) {
        nivel = 'Alta';
        statusText.className = 'alta';
        statusContainer.textContent = '🔵';
    } else {
        nivel = 'Normal';
        statusText.className = 'normal';
        statusContainer.textContent = '🟢';
    }

    statusText.textContent = nivel;
}

function actualizarEstatusLluvia() {
    const statusText = elementos.rainStatusText;
    let nivel = '';

    if (estado.lluvia >= 70) {
        nivel = 'Intensa';
    } else if (estado.lluvia >= 30) {
        nivel = 'Moderada';
    } else {
        nivel = 'Baja';
    }

    statusText.textContent = nivel;
}

function registrarLectura(variable, tipo) {
    const fecha = new Date().toLocaleString('es-CO');
    const registro = {
        id: ++estado.contadorHistorico,
        fecha: fecha,
        variable: variable,
        valor: tipo === 'Inicio' ? '-' : `${Math.round(estado.humedad)}% H, ${Math.round(estado.temperatura)}°C, ${Math.round(estado.lluvia)}% L`,
    };
    estado.historico.unshift(registro);
    if (estado.historico.length > 12) {
        estado.historico.pop();
    }
    actualizarTablaHistorica();
}

function actualizarTablaHistorica() {
    elementos.historyTableBody.innerHTML = '';
    estado.historico.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.fecha}</td>
            <td>${item.variable}</td>
            <td>${item.valor}</td>
        `;
        elementos.historyTableBody.appendChild(row);
    });
}

function reiniciarSimulador() {
    estado.humedad = 50;
    estado.temperatura = 25;
    estado.lluvia = 30;
    estado.riegoActivo = false;
    estado.tiempo = 0;
    estado.contadorHistorico = 0;
    estado.historico = [];

    elementos.humiditySlider.value = 50;
    elementos.temperatureSlider.value = 25;
    elementos.rainSlider.value = 30;
    elementos.humidityLabel.textContent = '50%';
    elementos.temperatureLabel.textContent = '25°C';
    elementos.rainLabel.textContent = '30%';

    actualizarUI();
    actualizarTablaHistorica();
    registrarLectura('Sistema', 'Reinicio');
    console.log('🔄 Simulador reiniciado');
}

// Iniciar simulador cuando se carga la página
let intervalo;
document.addEventListener('DOMContentLoaded', inicializar);
