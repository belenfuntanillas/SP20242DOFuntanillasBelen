
class Vehiculo {
    constructor(id, modelo, anoFabricacion, velMax) {
        //if (id <= 0) throw new Error("El ID debe ser un número único mayor a 0");
        //if (!modelo) throw new Error("El modelo no puede estar vacío");
        //if (anoFabricacion <= 1985) throw new Error("El año de fabricación debe ser mayor a 1985");
        //if (velMax <= 0) throw new Error("La velocidad máxima debe ser mayor a 0");

        this.id = id;
        this.modelo = modelo;
        this.anoFabricacion = anoFabricacion;
        this.velMax = velMax;
    }

    mostrarInfo() {
        return `ID: ${this.id}, Modelo: ${this.modelo}, Año de Fabricación: ${this.anoFabricacion}, Velocidad Máxima: ${this.velMax}`;
    }
}

export default Vehiculo;
