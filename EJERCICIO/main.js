// Clase que representa un dulce
var Dulce = /** @class */ (function () {
    function Dulce(nombre, precio, stock) {
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
    }
    // Método para vender un dulce (reduce el stock)
    Dulce.prototype.vender = function () {
        if (this.stock > 0) {
            this.stock--;
            return true;
        }
        return false;
    };
    return Dulce;
}());
// Clase principal de la máquina expendedora
var MaquinaDulces = /** @class */ (function () {
    function MaquinaDulces() {
        this.dulces = [];
        this.ventasTotales = 0;
        this.ventasPorProducto = new Map();
        this.dineroInsertado = 0;
        this.carrito = [];
    }
    // Agrega un dulce a la máquina
    MaquinaDulces.prototype.agregarDulce = function (dulce) {
        this.dulces.push(dulce);
        this.ventasPorProducto.set(dulce.nombre, 0);
    };
    // Devuelve la lista de dulces disponibles
    MaquinaDulces.prototype.listarDulces = function () {
        return this.dulces;
    };
    // Inserta dinero en la máquina
    MaquinaDulces.prototype.insertarDinero = function (monto) {
        this.dineroInsertado += monto;
    };
    // Agrega un dulce al carrito
    MaquinaDulces.prototype.agregarAlCarrito = function (indice) {
        var dulce = this.dulces[indice];
        if (!dulce)
            return "Dulce no válido.";
        if (dulce.stock <= 0)
            return "Producto agotado.";
        var item = this.carrito.find(function (i) { return i.producto.nombre === dulce.nombre; });
        if (item) {
            item.cantidad++;
        }
        else {
            this.carrito.push({ producto: dulce, cantidad: 1 });
        }
        return "".concat(dulce.nombre, " agregado al carrito.");
    };
    // Elimina un dulce del carrito (por índice)
    MaquinaDulces.prototype.quitarDelCarrito = function (indice) {
        if (this.carrito[indice]) {
            if (this.carrito[indice].cantidad > 1) {
                this.carrito[indice].cantidad--;
            }
            else {
                this.carrito.splice(indice, 1);
            }
        }
    };
    // Finaliza la compra, descuenta stock y dinero, y muestra resumen
    MaquinaDulces.prototype.finalizarCompra = function () {
        var total = this.carrito.reduce(function (suma, item) { return suma + item.producto.precio * item.cantidad; }, 0);
        if (total > this.dineroInsertado) {
            return "Fondos insuficientes. Total: $".concat(total, ", Disponibles: $").concat(this.dineroInsertado);
        }
        var mensaje = "Compra realizada:\n";
        var resumen = new Map();
        for (var _i = 0, _a = this.carrito; _i < _a.length; _i++) {
            var item = _a[_i];
            for (var i = 0; i < item.cantidad; i++) {
                if (item.producto.vender()) {
                    this.ventasPorProducto.set(item.producto.nombre, (this.ventasPorProducto.get(item.producto.nombre) || 0) + 1);
                    resumen.set(item.producto.nombre, (resumen.get(item.producto.nombre) || 0) + 1);
                    this.ventasTotales += item.producto.precio;
                    this.dineroInsertado -= item.producto.precio;
                }
            }
        }
        resumen.forEach(function (cantidad, nombre) {
            mensaje += "- ".concat(nombre, ": ").concat(cantidad, " unidad(es)\n");
        });
        mensaje += "Cambio: $".concat(this.dineroInsertado);
        this.carrito = [];
        this.dineroInsertado = 0;
        return mensaje;
    };
    // Devuelve el dinero insertado
    MaquinaDulces.prototype.obtenerDineroInsertado = function () {
        return this.dineroInsertado;
    };
    // Devuelve los ítems del carrito
    MaquinaDulces.prototype.obtenerItemsCarrito = function () {
        return this.carrito;
    };
    // Devuelve el reporte de ventas
    MaquinaDulces.prototype.obtenerReporte = function () {
        var reporte = "Ventas totales: $".concat(this.ventasTotales, "\nVentas por producto:\n");
        this.ventasPorProducto.forEach(function (v, k) {
            reporte += "- ".concat(k, ": ").concat(v, " vendidos\n");
        });
        return reporte;
    };
    return MaquinaDulces;
}());
// Lógica de la interfaz web
// Instancia la máquina y agrega dulces
var maquina = new MaquinaDulces();
maquina.agregarDulce(new Dulce("Sabritas", 20, 10));
maquina.agregarDulce(new Dulce("Chocolate", 15, 5));
maquina.agregarDulce(new Dulce("Doritos", 18, 15));
var divListaDulces = document.getElementById("candyList");
var spanDinero = document.getElementById("currentMoney");
var preReporte = document.getElementById("report");
var divCarrito = document.getElementById("cart");
// Renderiza la lista de dulces disponibles
function renderizarDulces() {
    divListaDulces.innerHTML = "";
    maquina.listarDulces().forEach(function (dulce, indice) {
        var div = document.createElement("div");
        div.className = "candy";
        div.innerHTML = "\n      <strong>".concat(dulce.nombre, "</strong><br>\n      Precio: $").concat(dulce.precio, " - Stock: ").concat(dulce.stock, "<br>\n      <button onclick=\"agregarAlCarrito(").concat(indice, ")\">Agregar al carrito</button>\n    ");
        divListaDulces.appendChild(div);
    });
    spanDinero.textContent = maquina.obtenerDineroInsertado().toString();
}
// Renderiza el carrito de compras
function renderizarCarrito() {
    divCarrito.innerHTML = "";
    maquina.obtenerItemsCarrito().forEach(function (item, indice) {
        var div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = "\n      ".concat(item.producto.nombre, " (x").concat(item.cantidad, ")\n      <button onclick=\"quitarDelCarrito(").concat(indice, ")\">Quitar</button>\n    ");
        divCarrito.appendChild(div);
    });
}
// Función para insertar dinero
window.insertMoney = function () {
    var input = document.getElementById("moneyInput");
    var monto = parseInt(input.value);
    if (monto > 0) {
        maquina.insertarDinero(monto);
        input.value = "";
        renderizarDulces();
    }
};
// Función para agregar un dulce al carrito
window.agregarAlCarrito = function (indice) {
    maquina.agregarAlCarrito(indice);
    renderizarCarrito();
};
// Función para quitar un dulce del carrito
window.quitarDelCarrito = function (indice) {
    maquina.quitarDelCarrito(indice);
    renderizarCarrito();
};
// Función para finalizar la compra
window.finalizePurchase = function () {
    alert(maquina.finalizarCompra());
    renderizarDulces();
    renderizarCarrito();
};
// Función para mostrar el reporte de ventas
window.showReport = function () {
    preReporte.textContent = maquina.obtenerReporte();
};
renderizarDulces();
renderizarCarrito();
