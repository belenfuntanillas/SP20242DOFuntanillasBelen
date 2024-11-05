import Camion from './Camion.js';
import Auto from './Auto.js';

const tableBody = document.getElementById('tableBody');
const abmForm = document.getElementById('formABM');
const formDatos = document.getElementById('formDatos');
const tipoFiltro = document.getElementById('tipoFiltro');
const spinner = document.getElementById('spinner');
const btnAgregar = document.getElementById('btnAgregar');
const btnCancelar = document.getElementById('btnCancelar');
const abmFormElement = document.getElementById('abmForm');

let dataVehiculos = []; // Lista en memoria para almacenar las instancias de vehiculos
let editingVehiculo = null;
const apiURL = 'https://examenesutn.vercel.app/api/VehiculoAutoCamion';

window.addEventListener('load', function () {
    cargarListaDesdeAPI();

    btnAgregar.addEventListener('click', agregarVehiculo);
    btnCancelar.addEventListener('click', cancelar);
    abmFormElement.addEventListener('submit', altaElemento);
    tipoFiltro.addEventListener('change', () => renderTable(tipoFiltro.value));
});

function cargarListaDesdeAPI() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiURL, false);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();

    if (xhr.status === 200) {
        try {
            const vehiculos = JSON.parse(xhr.responseText);
            dataVehiculos = vehiculos.map(vehiculo => {
                if (vehiculo.asientos !== undefined) {
                    return new Auto(vehiculo.id, vehiculo.modelo, vehiculo.anoFabricacion, vehiculo.velMax, vehiculo.asientos, vehiculo.cantidadPuertas);
                } else {
                    return new Camion(vehiculo.id, vehiculo.modelo, vehiculo.anoFabricacion, vehiculo.velMax, vehiculo.carga, vehiculo.autonomia);
                }
            });
            renderTable();
        } catch (error) {
            alert('Error al procesar los datos recibidos.');
        }
    } else {
        alert('Error al obtener los datos. Por favor, intente de nuevo.');
    }
}

// Renderizar la tabla de vehiculos
function renderTable(filter = 'todos') {
    tableBody.innerHTML = '';
    let filteredData = dataVehiculos;

    if (filter === 'auto') {
        filteredData = dataVehiculos.filter(vehiculo => vehiculo instanceof Auto);
    } else if (filter === 'camion') {
        filteredData = dataVehiculos.filter(vehiculo => vehiculo instanceof Camion);
    }

    filteredData.forEach(vehiculo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vehiculo.id}</td>
            <td>${vehiculo.modelo}</td>
            <td>${vehiculo.anoFabricacion}</td>
            <td>${vehiculo.velMax}</td>
            <td>${vehiculo instanceof Auto ? vehiculo.asientos : 'N/A'}</td>
            <td>${vehiculo instanceof Camion ? vehiculo.carga : 'N/A'}</td>
            <td>${vehiculo instanceof Camion ? vehiculo.autonomia : 'N/A'}</td>
            <td>${vehiculo instanceof Auto ? vehiculo.cantidadPuertas : 'N/A'}</td>
            <td>
                <button class="btn-editar">Editar</button>
                <button class="btn-eliminar">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);

        row.querySelector('.btn-editar').addEventListener('click', () => modificar(vehiculo.id));
        row.querySelector('.btn-eliminar').addEventListener('click', () => eliminar(vehiculo.id));
    });
}

function mostrarFormularioABM(accion, vehiculo = {}) {
    document.getElementById('accion-titulo').textContent = accion;
    document.getElementById('id').value = vehiculo.id || '';
    document.getElementById('modelo').value = vehiculo.modelo || '';
    document.getElementById('anoFabricacion').value = vehiculo.anoFabricacion || '';
    document.getElementById('velMax').value = vehiculo.velMax || '';
    document.getElementById('asientos').value = vehiculo.asientos || '';
    document.getElementById('carga').value = vehiculo.carga || '';
    document.getElementById('autonomia').value = vehiculo.autonomia || '';
    document.getElementById('cantidadPuertas').value = vehiculo.cantidadPuertas || '';

    abmForm.style.display = 'flex';
    formDatos.style.display = 'none';
    editingVehiculo = vehiculo;
}

async function altaElemento(event) {
    event.preventDefault();

    if (!validarFormulario()) return; // Si no pasa las validaciones, se detiene aca
    spinner.classList.remove('hidden');

    let datos;
    if (document.getElementById('asientos').value !== '' && document.getElementById('cantidadPuertas').value !== '') {
        datos = {
            modelo: document.getElementById('modelo').value,
            anoFabricacion: document.getElementById('anoFabricacion').value,
            velMax: parseInt(document.getElementById('velMax').value, 10),
            asientos: parseInt(document.getElementById('asientos').value, 10),
            cantidadPuertas: parseInt(document.getElementById('cantidadPuertas').value, 10)
        };
    } else if (document.getElementById('carga').value !== '' && document.getElementById('autonomia').value !== '') {
        datos = {
            modelo: document.getElementById('modelo').value,
            anoFabricacion: document.getElementById('anoFabricacion').value,
            velMax: parseInt(document.getElementById('velMax').value, 10),
            carga: parseInt(document.getElementById('carga').value, 10),
            autonomia: document.getElementById('autonomia').value
        };
    } else {
        alert('Debe completar los campos correspondientes al tipo de vehiculo.');
        return;
    }

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            const data = await response.json();
            datos.id = data.id;
            dataVehiculos.push(datos);

            renderTable();
            abmForm.style.display = 'none';
            formDatos.style.display = 'flex';
        } else {
            alert('Error al procesar la operación');
        }
    } catch (error) {
        alert('Ocurrió un error: ' + error.message);
    } finally {
        spinner.classList.add('hidden');
    }
}

// Elimino vehiculo de la lista en memoria y actualizo la tabla
function eliminar(id) {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este vehiculo?');
    if (!confirmar) return;

    spinner.classList.remove('hidden');

    fetch(apiURL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
        .then(response => {
            if (response.ok) {
                dataVehiculos = dataVehiculos.filter(vehiculo => vehiculo.id !== id);
                renderTable();
            } else {
                alert('Error al eliminar el vehiculo.');
            }
        })
        .catch(error => alert('Ocurrió un error: ' + error.message))
        .finally(() => spinner.classList.add('hidden'));
}



function modificar(id) {
    const vehiculo = dataVehiculos.find(v => v.id === id);
    if (vehiculo) {
        document.getElementById('accion-titulo').textContent = 'Modificacion';
        document.getElementById('id').value = vehiculo.id;
        document.getElementById('modelo').value = vehiculo.modelo;
        document.getElementById('anoFabricacion').value = vehiculo.anoFabricacion;
        document.getElementById('velMax').value = vehiculo.velMax;

        // Llenar los campos específicos según el tipo de vehiculo
        if (vehiculo instanceof Auto) {
            document.getElementById('asientos').value = vehiculo.asientos || '';
            document.getElementById('carga').value = '';
            document.getElementById('autonomia').value = '';
            document.getElementById('cantidadPuertas').value = vehiculo.cantidadPuertas || '';
        } else if (vehiculo instanceof Camion) {
            document.getElementById('carga').value = vehiculo.carga || '';
            document.getElementById('autonomia').value = vehiculo.autonomia || '';
            document.getElementById('asientos').value = '';
        }

        abmFormElement.removeEventListener('submit', altaElemento);
        abmFormElement.addEventListener('submit', modificarElemento);
        formDatos.style.display = 'none';
        abmForm.style.display = 'flex';
        editingVehiculo = vehiculo;
    }
}

function modificarElemento(event) {
    event.preventDefault();

    if (!validarFormulario()) return; // Si no pasa las validaciones, se detiene aquí.
    spinner.classList.remove('hidden');

    const datos = {
        id: editingVehiculo.id,
        modelo: document.getElementById('modelo').value,
        anoFabricacion: document.getElementById('anoFabricacion').value,
        velMax: parseInt(document.getElementById('velMax').value, 10),
        asientos: parseInt(document.getElementById('asientos').value, 10) || null,
        carga: parseInt(document.getElementById('carga').value, 10) || null,
        autonomia: parseInt(document.getElementById('autonomia').value, 10) || null,
        cantidadPuertas: parseInt(document.getElementById('cantidadPuertas').value, 10) || null
    };

    fetch(`${apiURL}?id=${editingVehiculo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
        .then(response => {
            if (response.ok) {
                Object.assign(editingVehiculo, datos);
                renderTable();
                formDatos.style.display = 'flex';
                abmForm.style.display = 'none';
            } else {
                alert('No se pudo realizar la operación.');
            }
        })
        .catch(error => alert('Ocurrió un error: ' + error.message))
        .finally(() => spinner.classList.add('hidden'));
}

// valido formulario antes de guardar
function validarFormulario() {
    const modelo = document.getElementById('modelo').value;
    const anoFabricacion = parseInt(document.getElementById('anoFabricacion').value, 10);
    const velMax = parseInt(document.getElementById('velMax').value, 10);
    const asientos = parseInt(document.getElementById('asientos').value, 10);
    const carga = parseInt(document.getElementById('carga').value, 10);
    const autonomia = parseInt(document.getElementById('autonomia').value, 10);
    const cantidadPuertas = parseInt(document.getElementById('cantidadPuertas').value, 10);

    if (!modelo) {
        alert("El modelo no puede estar vacío");
        return false;
    }
    if (isNaN(anoFabricacion) || anoFabricacion <= 1985) {
        alert("El año de fabricación debe ser mayor a 1985");
        return false;
    }
    if (isNaN(velMax) || velMax <= 0) {
        alert("La velocidad máxima debe ser mayor a 0");
        return false;
    }
    if (asientos && asientos <= 2) {
        alert("La cantidad de asientos debe ser mayor a 2");
        return false;
    }
    if (carga && carga <= 0) {
        alert("La carga debe ser mayor a 0");
        return false;
    }
    if (autonomia && autonomia <= 0) {
        alert("La autonomía debe ser mayor a 0");
        return false;
    }
    if (cantidadPuertas && cantidadPuertas <= 2) {
        alert("La cantidad de puertas debe ser mayor a 2");
        return false;
    }
    return true;
}


function agregarVehiculo() {
    mostrarFormularioABM('Alta');
    // abmFormElement.addEventListener('submit', savePerson);
    // btnCancelar.addEventListener('click', cancelar);
}