const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const imagenNave = new Image();
imagenNave.src = 'nave.png';

const imagenCoba = new Image();
imagenCoba.src = 'coba.png';

const imagenFondo = new Image();
imagenFondo.src = 'fondo.png';

const nave = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    angle: 0,
    rotation: 0,
    thrust: {
        x: 0,
        y: 0
    },
    lasers: [],
    canShoot: true
};

let COBAEHs = [];
const numCoba = 5;
let puntaje = 0;
let puntajeMaximo = 0;
let vidas = 3;
let juegoTerminado = false;

const teclas = {};

function crearCOBAEHs(x, y, radio) {
    return {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        radius: radio || Math.random() * 30 + 15,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 50 + 50
    };
}

function crearCintaCOBAEHs() {
    for (let i = 0; i < 1; i++) {
        let lado = Math.floor(Math.random() * 4);
        let x, y;

        switch (lado) {
            case 0: 
                x = Math.random() * canvas.width;
                y = -50; 
                break;
            case 1: 
                x = canvas.width + 50;
                y = Math.random() * canvas.height;
                break;
            case 2: 
                x = Math.random() * canvas.width;
                y = canvas.height + 50;
                break;
            case 3: 
                x = -50; 
                y = Math.random() * canvas.height;
                break;
        }

        let cobaEH = {
            x: x,
            y: y,
            radius: Math.random() * 30 + 15,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 50 + 50
        };
        COBAEHs.push(cobaEH);
    }
}

function actualizar() {
    if (juegoTerminado) return;

    if (teclas['ArrowUp'] || teclas['w']) {
        nave.thrust.x += 0.1 * Math.cos(nave.angle);
        nave.thrust.y += 0.1 * Math.sin(nave.angle);
    } else {
        nave.thrust.x -= 0.05 * nave.thrust.x;
        nave.thrust.y -= 0.05 * nave.thrust.y;
    }

    if (teclas['ArrowDown'] || teclas['s']) {
        nave.thrust.x -= 0.1 * Math.cos(nave.angle);
        nave.thrust.y -= 0.1 * Math.sin(nave.angle);
    }

    if (teclas['ArrowLeft'] || teclas['a']) {
        nave.angle -= 0.1;
    }

    if (teclas['ArrowRight'] || teclas['d']) {
        nave.angle += 0.1;
    }

    nave.x += nave.thrust.x;
    nave.y += nave.thrust.y;

    if (nave.x < 0) nave.x = canvas.width;
    if (nave.x > canvas.width) nave.x = 0;
    if (nave.y < 0) nave.y = canvas.height;
    if (nave.y > canvas.height) nave.y = 0;

    for (let i = 0; i < COBAEHs.length; i++) {
        COBAEHs[i].x += COBAEHs[i].speed * Math.cos(COBAEHs[i].angle) / 60;
        COBAEHs[i].y += COBAEHs[i].speed * Math.sin(COBAEHs[i].angle) / 60;

        if (COBAEHs[i].x < 0) COBAEHs[i].x = canvas.width;
        if (COBAEHs[i].x > canvas.width) COBAEHs[i].x = 0;
        if (COBAEHs[i].y < 0) COBAEHs[i].y = canvas.height;
        if (COBAEHs[i].y > canvas.height) COBAEHs[i].y = 0;

        if (distanciaEntrePuntos(nave.x, nave.y, COBAEHs[i].x, COBAEHs[i].y) < nave.radius + COBAEHs[i].radius) {
            if (vidas > 0) {
                vidas--;
            }
            if (vidas <= 0) {
                vidas = 0;
                juegoTerminado = true;
            } else {
                reiniciarPosicionNave();
                COBAEHs.splice(i, 1);
                crearCintaCOBAEHs();
            }
        }
    }

    for (let i = nave.lasers.length - 1; i >= 0; i--) {
        nave.lasers[i].x += nave.lasers[i].xVel;
        nave.lasers[i].y += nave.lasers[i].yVel;

        if (nave.lasers[i].x < 0 || nave.lasers[i].x > canvas.width || nave.lasers[i].y < 0 || nave.lasers[i].y > canvas.height) {
            nave.lasers.splice(i, 1);
            continue;
        }
        for (let j = COBAEHs.length - 1; j >= 0; j--) {
            if (distanciaEntrePuntos(nave.lasers[i].x, nave.lasers[i].y, COBAEHs[j].x, COBAEHs[j].y) < COBAEHs[j].radius) {
                puntaje += 10;
                COBAEHs.splice(j, 1);
                nave.lasers.splice(i, 1);
                crearCintaCOBAEHs();
                crearCintaCOBAEHs();
                break;
            }
        }
    }
}

function dibujarNave(x, y, angulo) {
    context.save();
    context.translate(x, y);
    context.rotate(angulo);
    context.drawImage(imagenNave, -nave.radius, -nave.radius, nave.radius * 2, nave.radius * 2);
    context.restore();
}

function dibujarCOBAEHs() {
    for (let i = 0; i < COBAEHs.length; i++) {
        context.drawImage(imagenCoba, 
                        COBAEHs[i].x - COBAEHs[i].radius, 
                        COBAEHs[i].y - COBAEHs[i].radius, 
                        COBAEHs[i].radius * 2, 
                        COBAEHs[i].radius * 2);
    }
}

function dibujarLasers() {
    for (let i = 0; i < nave.lasers.length; i++) {
        context.fillStyle = 'turquoise';
        context.beginPath();
        context.arc(nave.lasers[i].x, nave.lasers[i].y, 4, 0, Math.PI * 2);
        context.fill();
    }
}

function dibujarHUD() {
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.fillText('Puntaje: ' + puntaje, 10, 30);
    context.fillText('Puntaje Más Alto: ' + puntajeMaximo, 10, 60);
    context.fillText('Vidas: ' + vidas, 10, 90);
}

function dibujarFinJuego() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText('¡Has perdido!', canvas.width / 2, canvas.height / 2 - 50);

    context.font = '24px Arial';
    context.fillText('Presiona "R" para reiniciar el juego', canvas.width / 2, canvas.height / 2 + 20);
}

function reiniciarPantalla() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(imagenFondo, 0, 0, canvas.width, canvas.height);

    dibujarNave(nave.x, nave.y, nave.angle);
    dibujarCOBAEHs();
    dibujarLasers();
    dibujarHUD();

    if (juegoTerminado) {
        dibujarFinJuego();
    }
}

function bucleDelJuego() {
    actualizar();
    reiniciarPantalla();
    requestAnimationFrame(bucleDelJuego);
}

function distanciaEntrePuntos(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

document.addEventListener('keydown', function(event) {
    teclas[event.key] = true;

    if (event.key === ' ') {
        dispararLaser();
    }

    if (event.key === 'r' && juegoTerminado) {
        reiniciarJuego();
    }
});

document.addEventListener('keyup', function(event) {
    teclas[event.key] = false;
});

function dispararLaser() {
    if (nave.canShoot) {
        const laserInicioX = nave.x + nave.radius * Math.cos(nave.angle);
        const laserInicioY = nave.y + nave.radius * Math.sin(nave.angle);

        nave.lasers.push({
            x: laserInicioX,
            y: laserInicioY,
            xVel: +500 * Math.cos(nave.angle) / 60, // Aumenta la velocidad
            yVel: +500 * Math.sin(nave.angle) / 60  // Aumenta la velocidad
        });

        nave.canShoot = false;
        setTimeout(() => nave.canShoot = true, 200); // Dispara más rápido
    }
}

function reiniciarJuego() {
    if (puntaje > puntajeMaximo) {
        puntajeMaximo = puntaje;
    }
    vidas = 3;
    puntaje = 0;
    nave.x = canvas.width / 2;
    nave.y = canvas.height / 2;
    nave.thrust.x = 0;
    nave.thrust.y = 0;
    nave.angle = 0;
    nave.lasers = [];
    COBAEHs = [];
    crearCintaCOBAEHs();
    juegoTerminado = false;
}

function reiniciarPosicionNave() {
    nave.x = canvas.width / 2;
    nave.y = canvas.height / 2;
    nave.thrust.x = 0;
    nave.thrust.y = 0;
    nave.angle = 0;
}

crearCintaCOBAEHs();
bucleDelJuego();
