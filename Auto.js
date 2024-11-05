import Vehiculo from './Vehiculo.js';

class Auto extends Vehiculo {
    constructor(id, modelo, anoFabricacion, velMax, cantidadPuertas, asientos) {
        super(id, modelo, anoFabricacion, velMax);

        // if (cantidadPuertas <= 2) throw new Error("La cantidad de puertas debe ser mayor a 2");
        // if (asientos <= 2) throw new Error("La cantidad de asientos debe ser mayor a 2");

        this.cantidadPuertas = cantidadPuertas;
        this.asientos = asientos;
    }

    mostrarInfo() {
        return `${super.mostrarInfo()}, Puertas: ${this.cantidadPuertas}, Asientos: ${this.asientos}`;
    }
}

export default Auto;
