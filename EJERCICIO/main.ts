// Clase que representa un dulce
class Dulce {
  constructor(
    public nombre: string,
    public precio: number,
    public stock: number
  ) {}

  // Método para vender un dulce (reduce el stock)
  vender(): boolean {
    if (this.stock > 0) {
      this.stock--;
      return true;
    }
    return false;
  }
}

// Interfaz para los ítems del carrito
interface ItemCarrito {
  producto: Dulce;
  cantidad: number;
}

// Clase principal de la máquina expendedora
class MaquinaDulces {
  private dulces: Dulce[] = [];
  private ventasTotales: number = 0;
  private ventasPorProducto: Map<string, number> = new Map();
  public dineroInsertado: number = 0;
  public carrito: ItemCarrito[] = [];

  // Agrega un dulce a la máquina
  agregarDulce(dulce: Dulce) {
    this.dulces.push(dulce);
    this.ventasPorProducto.set(dulce.nombre, 0);
  }

  // Devuelve la lista de dulces disponibles
  listarDulces(): Dulce[] {
    return this.dulces;
  }

  // Inserta dinero en la máquina
  insertarDinero(monto: number) {
    this.dineroInsertado += monto;
  }

  // Agrega un dulce al carrito
  agregarAlCarrito(indice: number): string {
    const dulce = this.dulces[indice];
    if (!dulce) return "Dulce no válido.";
    if (dulce.stock <= 0) return "Producto agotado.";
    const item = this.carrito.find((i) => i.producto.nombre === dulce.nombre);
    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({ producto: dulce, cantidad: 1 });
    }
    return `${dulce.nombre} agregado al carrito.`;
  }

  // Elimina un dulce del carrito (por índice)
  quitarDelCarrito(indice: number): void {
    if (this.carrito[indice]) {
      if (this.carrito[indice].cantidad > 1) {
        this.carrito[indice].cantidad--;
      } else {
        this.carrito.splice(indice, 1);
      }
    }
  }

  // Finaliza la compra, descuenta stock y dinero, y muestra resumen
  finalizarCompra(): string {
    const total = this.carrito.reduce(
      (suma, item) => suma + item.producto.precio * item.cantidad,
      0
    );
    if (total > this.dineroInsertado) {
      return `Fondos insuficientes. Total: $${total}, Disponibles: $${this.dineroInsertado}`;
    }

    let mensaje = "Compra realizada:\n";
    const resumen: Map<string, number> = new Map();

    for (const item of this.carrito) {
      for (let i = 0; i < item.cantidad; i++) {
        if (item.producto.vender()) {
          this.ventasPorProducto.set(
            item.producto.nombre,
            (this.ventasPorProducto.get(item.producto.nombre) || 0) + 1
          );
          resumen.set(
            item.producto.nombre,
            (resumen.get(item.producto.nombre) || 0) + 1
          );
          this.ventasTotales += item.producto.precio;
          this.dineroInsertado -= item.producto.precio;
        }
      }
    }

    resumen.forEach((cantidad, nombre) => {
      mensaje += `- ${nombre}: ${cantidad} unidad(es)\n`;
    });

    mensaje += `Cambio: $${this.dineroInsertado}`;
    this.carrito = [];
    this.dineroInsertado = 0;
    return mensaje;
  }

  // Devuelve el dinero insertado
  obtenerDineroInsertado(): number {
    return this.dineroInsertado;
  }

  // Devuelve los ítems del carrito
  obtenerItemsCarrito(): ItemCarrito[] {
    return this.carrito;
  }

  // Devuelve el reporte de ventas
  obtenerReporte(): string {
    let reporte = `Ventas totales: $${this.ventasTotales}\nVentas por producto:\n`;
    this.ventasPorProducto.forEach((v, k) => {
      reporte += `- ${k}: ${v} vendidos\n`;
    });
    return reporte;
  }
}

// Lógica de la interfaz web

// Instancia la máquina y agrega dulces
const maquina = new MaquinaDulces();
maquina.agregarDulce(new Dulce("Sabritas", 20, 10));
maquina.agregarDulce(new Dulce("Chocolate", 15, 5));
maquina.agregarDulce(new Dulce("Doritos", 18, 15));

const divListaDulces = document.getElementById("candyList")!;
const spanDinero = document.getElementById("currentMoney")!;
const preReporte = document.getElementById("report")!;
const divCarrito = document.getElementById("cart")!;

// Renderiza la lista de dulces disponibles
function renderizarDulces() {
  divListaDulces.innerHTML = "";
  maquina.listarDulces().forEach((dulce, indice) => {
    const div = document.createElement("div");
    div.className = "candy";
    div.innerHTML = `
      <strong>${dulce.nombre}</strong><br>
      Precio: $${dulce.precio} - Stock: ${dulce.stock}<br>
      <button onclick="agregarAlCarrito(${indice})">Agregar al carrito</button>
    `;
    divListaDulces.appendChild(div);
  });
  spanDinero.textContent = maquina.obtenerDineroInsertado().toString();
}

// Renderiza el carrito de compras
function renderizarCarrito() {
  divCarrito.innerHTML = "";
  maquina.obtenerItemsCarrito().forEach((item, indice) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      ${item.producto.nombre} (x${item.cantidad})
      <button onclick="quitarDelCarrito(${indice})">Quitar</button>
    `;
    divCarrito.appendChild(div);
  });
}

// Función para insertar dinero
(window as any).insertMoney = () => {
  const input = document.getElementById("moneyInput") as HTMLInputElement;
  const monto = parseInt(input.value);
  if (monto > 0) {
    maquina.insertarDinero(monto);
    input.value = "";
    renderizarDulces();
  }
};

// Función para agregar un dulce al carrito
(window as any).agregarAlCarrito = (indice: number) => {
  maquina.agregarAlCarrito(indice);
  renderizarCarrito();
};

// Función para quitar un dulce del carrito
(window as any).quitarDelCarrito = (indice: number) => {
  maquina.quitarDelCarrito(indice);
  renderizarCarrito();
};

// Función para finalizar la compra
(window as any).finalizePurchase = () => {
  alert(maquina.finalizarCompra());
  renderizarDulces();
  renderizarCarrito();
};

// Función para mostrar el reporte de ventas
(window as any).showReport = () => {
  preReporte.textContent = maquina.obtenerReporte();
};

renderizarDulces();
renderizarCarrito();
