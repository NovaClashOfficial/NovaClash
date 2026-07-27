<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Nova Clash | Panel</title>

  <link rel="stylesheet" href="style.css">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link
    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap"
    rel="stylesheet"
  >
</head>

<body>

  <nav class="navbar">
    <div class="nav-logo">
      NOVA CLASH ADMIN
    </div>
  </nav>

  <main class="contenedor">

    <img src="logo.png" class="logo" alt="Logo de Nova Clash">

    <h1>Panel de Administración</h1>

    <p class="descripcion">
      Controla las predicciones y carga los resultados oficiales de Octavos.
    </p>

    <hr>

    <section class="admin-seccion">

      <h2>Estado de las predicciones</h2>

      <label class="estado-predicciones">
        <input type="checkbox" id="estadoPredicciones">
        Predicciones abiertas
      </label>

      <br>

      <button id="btn-estado" type="button" onclick="guardarEstado()">
        GUARDAR ESTADO
      </button>

    </section>

    <hr>

    <section class="admin-seccion">

      <h2>Resultados de Octavos</h2>

      <p class="descripcion">
        Selecciona el ganador y el marcador real de cada partido.
        Puedes guardar resultados parciales.
      </p>

      <div id="adminPartidos"></div>

      <button
        id="btn-resultados"
        type="button"
        onclick="guardarResultados()"
      >
        GUARDAR RESULTADOS
      </button>

      <p id="mensaje-panel"></p>

    </section>

  </main>

  <script type="module" src="panel.js"></script>

</body>

</html>
