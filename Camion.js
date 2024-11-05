import Vehiculo from './Vehiculo.js';
class Camion extends Vehiculo {
    constructor(id, modelo, anoFabricacion, velMax, carga, autonomia) {
        super(id, modelo, anoFabricacion, velMax);

        //if (carga <= 0) throw new Error("La carga debe ser mayor a 0");
        //if (autonomia <= 0) throw new Error("La autonomía debe ser mayor a 0");

        this.carga = carga;
        this.autonomia = autonomia;
    }

    mostrarInfo() {
        return `${super.mostrarInfo()}, Carga: ${this.carga}, Autonomía: ${this.autonomia}`;
    }
}

export default Camion;
